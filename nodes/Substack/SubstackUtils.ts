import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import { Substack as SubstackClient } from 'substack-api';

export class SubstackUtils {
	static async initializeClient(executeFunctions: IExecuteFunctions) {
		// Get credentials
		const credentials = await executeFunctions.getCredentials('substackApi');
		const { publicationAddress, apiKey } = credentials;

		if (!apiKey) {
			throw new NodeOperationError(executeFunctions.getNode(), 'API key is required');
		}

		// Extract hostname from the full URL
		const url = publicationAddress as string;
		const hostname = url
			.replace(/^https?:\/\//, '') // Remove protocol
			.replace(/\/.*$/, ''); // Remove path

		if (!hostname.includes('.')) {
			throw new NodeOperationError(executeFunctions.getNode(), 'Invalid publication URL provided');
		}

		// Initialize Substack client
		const client = new SubstackClient({
			hostname,
			apiKey: apiKey as string,
		});

		return { client, publicationAddress: publicationAddress as string };
	}
}
