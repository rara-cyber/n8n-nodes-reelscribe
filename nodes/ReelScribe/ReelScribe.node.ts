import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IRequestOptions,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export class ReelScribe implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ReelScribe',
		name: 'reelScribe',
		icon: 'file:reelscribe.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description:
			'Transcribe Instagram Reels, TikTok videos, and YouTube content with ReelScribe',
		defaults: { name: 'ReelScribe' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				displayName: 'ReelScribe API',
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
					{
						name: 'Get Settings',
						value: 'getSettings',
						description: 'Get current user settings',
						action: 'Get settings',
					},
					{
						name: 'Update Settings',
						value: 'updateSettings',
						description: 'Update user settings',
						action: 'Update settings',
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
				displayName: 'Resume URL',
				name: 'resumeUrl',
				type: 'string',
				default: '',
				displayOptions: { show: { operation: ['transcribe'] } },
				description:
					'Optional webhook URL to receive the transcription result when processing completes. Must be HTTPS.',
				placeholder: 'https://your-server.com/webhook/reelscribe',
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

			// ------------------------------------------------------------------
			// Update Settings
			// ------------------------------------------------------------------
			{
				displayName: 'Auto-Prune Storage',
				name: 'autoPruneStorage',
				type: 'boolean',
				default: true,
				displayOptions: { show: { operation: ['updateSettings'] } },
				description:
					'Whether to automatically delete the oldest transcription when storage limit is reached',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const results: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const credentials = await this.getCredentials('reelScribeApi');
				const baseUrl = credentials.baseUrl as string;

				let method: IHttpRequestMethods = 'GET';
				let url = '';
				let body: IDataObject | undefined;
				let qs: IDataObject | undefined;

				switch (operation) {
					case 'transcribe': {
						method = 'POST';
						url = `${baseUrl}/v1/transcribe`;
						const videoUrl = this.getNodeParameter('url', i) as string;
						const resumeUrl = this.getNodeParameter('resumeUrl', i, '') as string;
						body = { url: videoUrl };
						if (resumeUrl) {
							body.resumeUrl = resumeUrl;
						}
						break;
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

					case 'getSettings': {
						method = 'GET';
						url = `${baseUrl}/v1/settings`;
						break;
					}

					case 'updateSettings': {
						method = 'PATCH';
						url = `${baseUrl}/v1/settings`;
						body = {
							autoPruneStorage: this.getNodeParameter(
								'autoPruneStorage',
								i,
							) as boolean,
						};
						break;
					}
				}

				const options: IRequestOptions = {
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
				throw new NodeApiError(this.getNode(), error as IDataObject, {
					itemIndex: i,
				});
			}
		}

		return [results];
	}
}
