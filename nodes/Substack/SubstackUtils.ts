import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import { SubstackClient } from 'substack-api';
import { IErrorResponse, IStandardResponse } from './types';

export class SubstackUtils {
	static async initializeClient(executeFunctions: IExecuteFunctions) {
		const credentials = await executeFunctions.getCredentials('substackApi');
		const { publicationAddress, apiKey } = credentials;

		if (!apiKey) {
			throw new NodeOperationError(executeFunctions.getNode(), 'API key is required');
		}

		const hostname = this.extractHostname(publicationAddress as string, executeFunctions);

		const client = new SubstackClient({
			publicationUrl: hostname,
			token: apiKey as string,
		});

		return {
			client,
			publicationAddress: publicationAddress as string,
		};
	}

	static formatUrl(publicationAddress: string, path: string): string {
		const cleanPath = path.startsWith('/') ? path : `/${path}`;
		const cleanAddress = publicationAddress.replace(/\/+$/, '');

		// Properly encode the path to handle special characters
		const encodedPath = cleanPath
			.split('/')
			.map((segment) => (segment ? encodeURIComponent(segment) : ''))
			.join('/');

		return `${cleanAddress}${encodedPath}`;
	}

	static formatErrorResponse({ message, node, itemIndex }: IErrorResponse): IStandardResponse {
		return {
			success: false,
			data: null,
			error: message,
			metadata: {
				status: 'error',
			},
		};
	}

	/**
	 * Extract hostname from publication URL with proper validation
	 */
	private static extractHostname(url: string, executeFunctions: IExecuteFunctions): string {
		try {
			// Handle both full URLs and just hostnames
			const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
			const urlObj = new URL(cleanUrl);
			const hostname = urlObj.hostname;

			if (!hostname.includes('.')) {
				throw new Error('Invalid hostname format');
			}

			return hostname;
		} catch (error) {
			throw new NodeOperationError(
				executeFunctions.getNode(),
				`Invalid publication URL provided: ${url}`,
			);
		}
	}

}
