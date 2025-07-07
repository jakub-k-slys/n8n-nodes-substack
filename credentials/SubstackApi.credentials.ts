import {
	IAuthenticateGeneric,
	ICredentialTestFunctions,
	ICredentialType,
	ICredentialsDecrypted,
	IDataObject,
	INodeCredentialTestResult,
	INodeProperties,
} from 'n8n-workflow';
import { SubstackClient } from 'substack-api'

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

	methods = {
		credentialTest: {
			async test(this: ICredentialTestFunctions, credential: ICredentialsDecrypted): Promise<INodeCredentialTestResult> {
				const credentials = credential.data as IDataObject;
				const substackClient = new SubstackClient({
					hostname: credentials.publicationAddress as string,
					apiKey: credentials.apiKey as string,
				});

				try {
					const isValid = await substackClient.testConnectivity();
					if (!isValid) {
						throw new Error('Invalid credentials');
					}
					return {
						status: 'OK',
						message: 'Connection successful!',
					};
				} catch (error) {
					return {
						status: 'Error',
						message: error.message,
					};
				}
			},
		},
	};
}
