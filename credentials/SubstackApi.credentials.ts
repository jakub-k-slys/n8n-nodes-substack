import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SubstackApi implements ICredentialType {
	name = 'substackApi';
	displayName = 'Substack API';
	documentationUrl = 'https://substack-api.readthedocs.io';
	properties: INodeProperties[] = [
		{
			displayName: 'Publication Address',
			name: 'publicationAddress',
			type: 'string',
			default: '',
			placeholder: 'https://myblog.substack.com',
			description: 'The full URL of your Substack publication (must include http:// or https://)',
			required: true,
			validateType: 'url',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			default: '',
			typeOptions: {
				password: true,
			},
			description: 'The private API token for authentication',
			required: true,
		},
	];

	// This allows the credential to be used by other parts of n8n
	// stating how this credential is injected as part of the request
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{"Bearer " + $credentials.apiKey}}',
			},
		},
	};

	// The block below tells how this credential can be tested
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.publicationAddress}}',
			url: '/api/v1/posts',
		},
	};
}
