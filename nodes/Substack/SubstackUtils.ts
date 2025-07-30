import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import { SubstackClient } from 'substack-api';
import { IErrorResponse, IStandardResponse } from './types';

interface CachedClient {
	client: SubstackClient;
	timestamp: number;
}

export class SubstackUtils {
	private static readonly DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
	private static clientCache = new Map<string, CachedClient>();

	static async initializeClient(executeFunctions: IExecuteFunctions) {
		const credentials = await executeFunctions.getCredentials('substackApi');
		const { publicationAddress, apiKey } = credentials;

		if (!apiKey) {
			throw new NodeOperationError(executeFunctions.getNode(), 'API key is required');
		}

		const hostname = this.extractHostname(publicationAddress as string, executeFunctions);
		const cacheKey = `${hostname}:${apiKey}`;
		
		// Check cache with TTL
		const cached = this.clientCache.get(cacheKey);
		if (cached && this.isCacheValid(cached.timestamp)) {
			return { 
				client: cached.client, 
				publicationAddress: publicationAddress as string 
			};
		}

		// Create new client and cache with timestamp
		const client = new SubstackClient({
			hostname,
			apiKey: apiKey as string,
		});
		
		this.clientCache.set(cacheKey, { 
			client, 
			timestamp: Date.now() 
		});

		return { 
			client, 
			publicationAddress: publicationAddress as string 
		};
	}

	static formatUrl(publicationAddress: string, path: string): string {
		const cleanPath = path.startsWith('/') ? path : `/${path}`;
		const cleanAddress = publicationAddress.replace(/\/+$/, '');
		
		// Properly encode the path to handle special characters
		const encodedPath = cleanPath.split('/').map(segment => 
			segment ? encodeURIComponent(segment) : ''
		).join('/');
		
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
				`Invalid publication URL provided: ${url}`
			);
		}
	}

	/**
	 * Check if cached client is still valid based on TTL
	 */
	private static isCacheValid(timestamp: number): boolean {
		return (Date.now() - timestamp) < this.DEFAULT_CACHE_TTL;
	}

	/**
	 * Clear expired entries from cache (optional cleanup method)
	 */
	static clearExpiredCache(): void {
		for (const [key, cached] of this.clientCache.entries()) {
			if (!this.isCacheValid(cached.timestamp)) {
				this.clientCache.delete(key);
			}
		}
	}

	/**
	 * Get current cache statistics (useful for debugging)
	 */
	static getCacheStats(): { size: number; entries: string[] } {
		return {
			size: this.clientCache.size,
			entries: Array.from(this.clientCache.keys())
		};
	}
}