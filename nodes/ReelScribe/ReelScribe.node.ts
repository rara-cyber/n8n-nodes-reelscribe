import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	INode,
} from 'n8n-workflow';
import { NodeApiError, sleep } from 'n8n-workflow';

const TERMINAL_STATUSES = ['completed', 'failed', 'cancelled'] as const;

/**
 * Normalize an Instagram URL by stripping the username prefix.
 * e.g. instagram.com/username/reel/CODE → instagram.com/reel/CODE
 */
function normalizeInstagramUrl(url: string): string {
	const match = url.match(
		/instagram\.com\/(?:[\w.-]+\/)?(?:(reel|reels|p|tv)\/([A-Za-z0-9_-]+))/i,
	);
	if (match) {
		const pathType = match[1].toLowerCase() === 'reels' ? 'reel' : match[1].toLowerCase();
		return `https://www.instagram.com/${pathType}/${match[2]}/`;
	}
	return url;
}

interface RetryConfig {
	maxRetries: number;
	initialDelay: number;
	respectRetryAfter: boolean;
}

const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

const RETRYABLE_ERROR_CODES = new Set(['ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED', 'ENOTFOUND']);

function getErrorStatusCode(error: any): number | undefined {
	return error.statusCode ?? error.httpCode ?? error.response?.status ?? error.code;
}

function getErrorCode(error: any): string | undefined {
	return error.cause?.code ?? error.code;
}

function getRetryAfterDelay(error: any): number | undefined {
	const header =
		error.response?.headers?.['retry-after'] ??
		error.headers?.['retry-after'];
	if (!header) return undefined;

	const seconds = Number(header);
	if (!isNaN(seconds)) {
		return Math.min(seconds * 1000, 60000);
	}

	const date = Date.parse(header);
	if (!isNaN(date)) {
		const delay = date - Date.now();
		return delay > 0 ? Math.min(delay, 60000) : undefined;
	}

	return undefined;
}

function getErrorMessage(statusCode: number | undefined, errorCode: string | undefined, attempt: number, maxRetries: number): string {
	switch (statusCode) {
		case 429:
			return 'Rate limited by reelscribe.app.';
		case 401:
			return 'Authentication failed. Check your API key in the reelscribe.app credentials.';
		case 403:
			return 'Access denied. Your API key may lack permissions for this operation.';
		case 404:
			return 'Resource not found. The requested transcription or endpoint does not exist.';
		case 500:
		case 502:
		case 503:
			return `reelscribe.app is temporarily unavailable (HTTP ${statusCode}). Retried ${attempt} of ${maxRetries} times.`;
		case 504:
			return `Gateway timeout from reelscribe.app. The service may be under heavy load. Retried ${attempt} of ${maxRetries} times.`;
		default:
			if (errorCode && RETRYABLE_ERROR_CODES.has(errorCode)) {
				return `Network error (${errorCode}). Retried ${attempt} of ${maxRetries} times.`;
			}
			return `Request failed${statusCode ? ` (HTTP ${statusCode})` : ''}.`;
	}
}

async function requestWithRetry(
	context: IExecuteFunctions,
	node: INode,
	options: IHttpRequestOptions,
	retryConfig: RetryConfig,
	itemIndex: number,
): Promise<IDataObject> {
	const { maxRetries, initialDelay, respectRetryAfter } = retryConfig;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			const response = await context.helpers.httpRequestWithAuthentication.call(
				context,
				'reelScribeApi',
				options,
			);
			return response as IDataObject;
		} catch (error: any) {
			const statusCode = getErrorStatusCode(error);
			const errorCode = getErrorCode(error);

			const isRetryable =
				(statusCode !== undefined && RETRYABLE_STATUS_CODES.has(statusCode)) ||
				(errorCode !== undefined && RETRYABLE_ERROR_CODES.has(errorCode));

			if (!isRetryable || attempt >= maxRetries) {
				const message = getErrorMessage(statusCode, errorCode, attempt, maxRetries);
				throw new NodeApiError(node, { message }, { itemIndex });
			}

			let delay: number;
			if (statusCode === 429 && respectRetryAfter) {
				const retryAfter = getRetryAfterDelay(error);
				delay = retryAfter ?? initialDelay * Math.pow(2, attempt);
			} else {
				delay = initialDelay * Math.pow(2, attempt);
			}

			// Add 0-20% jitter
			delay += delay * Math.random() * 0.2;

			await sleep(delay);
		}
	}

	// Should not reach here, but satisfy TypeScript
	throw new NodeApiError(node, { message: 'Unexpected retry loop exit' }, { itemIndex });
}

export class ReelScribe implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'reelscribe.app',
		name: 'reelScribe',
		icon: 'file:reelscribe.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description:
			'Transcribe Instagram Reels, TikTok videos, and YouTube content with reelscribe.app',
		defaults: { name: 'reelscribe.app' },
		usableAsTool: true,
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				displayName: 'reelscribe.app API',
				name: 'reelScribeApi',
				required: true,
			},
		],
		properties: [
			// ------------------------------------------------------------------
			// Operation selector
			// ------------------------------------------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Transcribe',
						value: 'transcribe',
						description: 'Submit a video URL for transcription',
						action: 'Transcribe a video',
					},
					{
						name: 'Get Transcription',
						value: 'getTranscription',
						description: 'Get a transcription by ID or request ID',
						action: 'Get a transcription',
					},
					{
						name: 'List Transcriptions',
						value: 'listTranscriptions',
						description: 'List all transcriptions',
						action: 'List transcriptions',
					},
					{
						name: 'Get Credits',
						value: 'getCredits',
						description: 'Check your credit balance and subscription info',
						action: 'Get credit balance',
					},
				],
				default: 'transcribe',
			},

			// ------------------------------------------------------------------
			// Transcribe
			// ------------------------------------------------------------------
			{
				displayName: 'Video URL',
				name: 'url',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { operation: ['transcribe'] } },
				description:
					'The Instagram Reel, TikTok video, or YouTube video URL to transcribe',
				placeholder: 'https://www.instagram.com/reel/ABC123/',
			},
			{
				displayName: 'Wait for Completion',
				name: 'waitForCompletion',
				type: 'boolean',
				default: true,
				displayOptions: { show: { operation: ['transcribe'] } },
				description:
					'Whether to wait for the transcription to complete before returning the result. When disabled, the node returns immediately with a request ID.',
			},
			{
				displayName: 'Resume URL',
				name: 'resumeUrl',
				type: 'string',
				default: '',
				displayOptions: {
					show: { operation: ['transcribe'], waitForCompletion: [false] },
				},
				description:
					'Optional webhook URL to receive the transcription result when processing completes. Must be HTTPS.',
				placeholder: 'https://your-server.com/webhook/reelscribe',
			},
			{
				displayName: 'Polling Interval (Seconds)',
				name: 'pollingInterval',
				type: 'number',
				default: 5,
				typeOptions: { minValue: 1 },
				displayOptions: {
					show: { operation: ['transcribe'], waitForCompletion: [true] },
				},
				description: 'How often to check for transcription completion (in seconds)',
			},
			{
				displayName: 'Timeout (Seconds)',
				name: 'timeout',
				type: 'number',
				default: 300,
				typeOptions: { minValue: 10 },
				displayOptions: {
					show: { operation: ['transcribe'], waitForCompletion: [true] },
				},
				description: 'Maximum time to wait for the transcription to complete (in seconds)',
			},

			// ------------------------------------------------------------------
			// Get Transcription
			// ------------------------------------------------------------------
			{
				displayName: 'Lookup By',
				name: 'lookupBy',
				type: 'options',
				options: [
					{ name: 'Transcription ID', value: 'id' },
					{ name: 'Request ID', value: 'requestId' },
				],
				default: 'requestId',
				displayOptions: { show: { operation: ['getTranscription'] } },
				description: 'How to look up the transcription',
			},
			{
				displayName: 'Transcription ID',
				name: 'transcriptionId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: { operation: ['getTranscription'], lookupBy: ['id'] },
				},
				description: 'The Convex document ID of the transcription',
			},
			{
				displayName: 'Request ID',
				name: 'requestId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: { operation: ['getTranscription'], lookupBy: ['requestId'] },
				},
				description:
					'The request ID returned from the transcribe operation',
			},

			// ------------------------------------------------------------------
			// List Transcriptions
			// ------------------------------------------------------------------
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: { show: { operation: ['listTranscriptions'] } },
				options: [
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						options: [
							{ name: 'All', value: '' },
							{ name: 'Cancelled', value: 'cancelled' },
							{ name: 'Completed', value: 'completed' },
							{ name: 'Failed', value: 'failed' },
							{ name: 'Processing', value: 'processing' },
							{ name: 'Submitted', value: 'submitted' },
						],
						default: '',
						description: 'Filter by transcription status',
					},
					{
						displayName: 'Video URL',
						name: 'url',
						type: 'string',
						default: '',
						description: 'Search transcriptions by video URL',
					},
				],
			},

			// ------------------------------------------------------------------
			// Error Handling (all operations)
			// ------------------------------------------------------------------
			{
				displayName: 'Error Handling',
				name: 'errorHandling',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				description: 'Configure retry behavior for transient API errors (rate limits, server errors)',
				options: [
					{
						displayName: 'Max Retries',
						name: 'maxRetries',
						type: 'number',
						default: 3,
						typeOptions: { minValue: 0 },
						description: 'Maximum retry attempts for retryable errors (429, 5xx, network timeouts). Set to 0 to disable retries.',
					},
					{
						displayName: 'Initial Delay (Ms)',
						name: 'initialDelay',
						type: 'number',
						default: 1000,
						typeOptions: { minValue: 100 },
						description: 'Base delay in milliseconds before the first retry. Doubles with each subsequent attempt (exponential backoff).',
					},
					{
						displayName: 'Respect Retry-After Header',
						name: 'respectRetryAfter',
						type: 'boolean',
						default: true,
						description: 'Whether to honor the Retry-After header on 429 responses instead of using calculated backoff',
					},
				],
			},

		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const results: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('reelScribeApi');
		const baseUrl = credentials.baseUrl as string;

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const errorHandling = this.getNodeParameter('errorHandling', i, {}) as IDataObject;
				const retryConfig: RetryConfig = {
					maxRetries: (errorHandling.maxRetries as number) ?? 3,
					initialDelay: (errorHandling.initialDelay as number) ?? 1000,
					respectRetryAfter: (errorHandling.respectRetryAfter as boolean) ?? true,
				};

				let method: IHttpRequestMethods = 'GET';
				let url = '';
				let body: IDataObject | undefined;
				let qs: IDataObject | undefined;

				switch (operation) {
					case 'transcribe': {
						let videoUrl = this.getNodeParameter('url', i) as string;
						const waitForCompletion = this.getNodeParameter('waitForCompletion', i, true) as boolean;

						// Normalize Instagram URLs (strip username prefix)
						if (videoUrl.toLowerCase().includes('instagram.com')) {
							videoUrl = normalizeInstagramUrl(videoUrl);
						}

						method = 'POST';
						url = `${baseUrl}/v1/transcribe`;
						body = { url: videoUrl };

						if (!waitForCompletion) {
							const resumeUrl = this.getNodeParameter('resumeUrl', i, '') as string;
							if (resumeUrl) {
								body.resumeUrl = resumeUrl;
							}
							break;
						}

						// Submit the transcription
						const submitResponse = await requestWithRetry(
							this,
							this.getNode(),
							{ method, url, body, json: true },
							retryConfig,
							i,
						);

						// Handle duplicate — API returns the existing transcription directly
						if (submitResponse.duplicate) {
							results.push({ json: submitResponse });
							continue;
						}

						const requestId = submitResponse.requestId as string;
						if (!requestId) {
							throw new NodeApiError(
								this.getNode(),
								{ message: 'No requestId returned from transcribe endpoint' },
								{ itemIndex: i },
							);
						}

						// Poll until completed, failed, or timeout
						const pollingInterval = (this.getNodeParameter('pollingInterval', i, 5) as number) * 1000;
						const timeout = (this.getNodeParameter('timeout', i, 300) as number) * 1000;
						const startTime = Date.now();
						let finalResponse: IDataObject | undefined;
						let consecutiveErrors = 0;
						const maxConsecutiveErrors = 5;

						// Small delay before first poll to let the record be created
						await sleep(2000);

						while (Date.now() - startTime < timeout) {
							try {
								const pollResponse = await requestWithRetry(
									this,
									this.getNode(),
									{
										method: 'GET',
										url: `${baseUrl}/v1/transcriptions`,
										qs: { requestId },
										json: true,
										timeout: 30000,
									},
									retryConfig,
									i,
								);

								consecutiveErrors = 0;

								const status = pollResponse.status as string;
								if ((TERMINAL_STATUSES as readonly string[]).includes(status)) {
									finalResponse = pollResponse;
									break;
								}
							} catch (pollError) {
								consecutiveErrors++;
								if (consecutiveErrors >= maxConsecutiveErrors) {
									throw new NodeApiError(
										this.getNode(),
										{ message: `Polling failed after ${maxConsecutiveErrors} consecutive errors: ${(pollError as Error).message}` },
										{ itemIndex: i },
									);
								}
								// 404 is expected briefly after submission — keep polling
							}

							await sleep(pollingInterval);
						}

						if (!finalResponse) {
							throw new NodeApiError(
								this.getNode(),
								{ message: `Transcription timed out after ${timeout / 1000} seconds. The transcription may still be processing — use "Get Transcription" with requestId "${requestId}" to check.` },
								{ itemIndex: i },
							);
						}

						results.push({ json: finalResponse });
						continue;
					}

					case 'getTranscription': {
						method = 'GET';
						url = `${baseUrl}/v1/transcriptions`;
						const lookupBy = this.getNodeParameter('lookupBy', i) as string;
						qs = {};
						if (lookupBy === 'id') {
							qs.id = this.getNodeParameter('transcriptionId', i) as string;
						} else {
							qs.requestId = this.getNodeParameter('requestId', i) as string;
						}
						break;
					}

					case 'listTranscriptions': {
						method = 'GET';
						url = `${baseUrl}/v1/transcriptions`;
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
						qs = {};
						if (filters.status) {
							qs.status = filters.status;
						}
						if (filters.url) {
							qs.url = filters.url;
						}
						break;
					}

					case 'getCredits': {
						method = 'GET';
						url = `${baseUrl}/v1/credits`;
						break;
					}

				}

				const options: IHttpRequestOptions = {
					method,
					url,
					json: true,
				};

				if (body) {
					options.body = body;
				}
				if (qs && Object.keys(qs).length > 0) {
					options.qs = qs;
				}

				const response = await requestWithRetry(
					this,
					this.getNode(),
					options,
					retryConfig,
					i,
				);

				results.push({ json: response });
			} catch (error) {
				if (this.continueOnFail()) {
					results.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeApiError(this.getNode(), { message: (error as Error).message }, {
					itemIndex: i,
				});
			}
		}

		return [results];
	}
}
