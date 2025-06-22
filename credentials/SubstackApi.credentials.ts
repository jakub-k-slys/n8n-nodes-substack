import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SubstackApi implements ICredentialType {
	name = 'substackApi';
	displayName = 'Substack API';
	documentationUrl = 'https://substack.com/api';
	properties: INodeProperties[] = [
		{
			displayName: 'Publication Address',
			name: 'publicationAddress',
			type: 'string',
			default: '',
			placeholder: 'myblog.substack.com',
			description: 'The full Substack domain of your publication',
			required: true,
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
			baseURL:
				'={{$credentials?.publicationAddress ? "https://" + $credentials.publicationAddress : "https://substack.com"}}',
			url: '/api/v1/feed/following',
		},
	};
}
