import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

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
							{ name: 'Submitted', value: 'submitted' },
							{ name: 'Processing', value: 'processing' },
							{ name: 'Completed', value: 'completed' },
							{ name: 'Failed', value: 'failed' },
							{ name: 'Cancelled', value: 'cancelled' },
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
						const submitResponse = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'reelScribeApi',
							{ method, url, body, json: true },
						) as IDataObject;

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
						await new Promise((resolve) => setTimeout(resolve, 2000));

						while (Date.now() - startTime < timeout) {
							try {
								const pollResponse = await this.helpers.httpRequestWithAuthentication.call(
									this,
									'reelScribeApi',
									{
										method: 'GET',
										url: `${baseUrl}/v1/transcriptions`,
										qs: { requestId },
										json: true,
										timeout: 30000,
									},
								) as IDataObject;

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

							await new Promise((resolve) => setTimeout(resolve, pollingInterval));
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

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'reelScribeApi',
					options,
				);

				results.push({ json: response as IDataObject });
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
