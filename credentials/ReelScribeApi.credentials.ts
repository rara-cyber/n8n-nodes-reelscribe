import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class ReelScribeApi implements ICredentialType {
	name = 'reelScribeApi';
	displayName = 'ReelScribe API';
	documentationUrl = 'https://reelscribe.app/docs/api';
	icon: Icon = 'file:../nodes/ReelScribe/reelscribe.svg';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'Your ReelScribe API key (starts with rs_). Generate one from your ReelScribe dashboard under Settings > API Keys.',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://www.reelscribe.app',
			required: true,
			description: 'ReelScribe API base URL. Only change this for self-hosted instances.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/v1/credits',
			method: 'GET',
		},
	};
}
