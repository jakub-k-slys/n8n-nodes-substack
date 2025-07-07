import { IExecuteFunctions, INode, NodeOperationError } from 'n8n-workflow';
import { SubstackClient } from 'substack-api';
import { IErrorResponse, IStandardResponse } from './types';

// Cache for SubstackClient instances to reuse across executions
const clientCache = new Map<string, SubstackClient>();

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

		// Create cache key from hostname and apiKey
		const cacheKey = `${hostname}:${apiKey}`;

		// Check if we have a cached client
		let client = clientCache.get(cacheKey);
		if (!client) {
			// Initialize Substack client and cache it
			client = new SubstackClient({
				hostname,
				apiKey: apiKey as string,
			});
			clientCache.set(cacheKey, client);
		}

		return { client, publicationAddress: publicationAddress as string };
	}

	static formatUrl(publicationAddress: string, path: string): string {
		// Ensure path starts with / and remove any trailing slashes from publicationAddress
		const cleanPath = path.startsWith('/') ? path : `/${path}`;
		const cleanAddress = publicationAddress.replace(/\/+$/, '');
		return `${cleanAddress}${cleanPath}`;
	}

	static validateResponse(response: any): IStandardResponse {
		if (!response) {
			return {
				success: false,
				data: null,
				error: 'Empty response received',
			};
		}

		return {
			success: true,
			data: response,
			metadata: {
				date: response.date,
				status: response.status,
			},
		};
	}

	static handleError(error: Error | NodeOperationError, node: INode, itemIndex: number): never {
		// If it's already a NodeOperationError, just throw it
		if (error instanceof NodeOperationError) {
			throw error;
		}

		// Otherwise, create a new NodeOperationError with the error message
		throw new NodeOperationError(node, error.message, {
			itemIndex,
		});
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
}
