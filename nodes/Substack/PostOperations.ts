import { IExecuteFunctions } from 'n8n-workflow';
import { SubstackClient } from 'substack-api';
import { ISubstackPost, IStandardResponse } from './types';
import { SubstackUtils } from './SubstackUtils';

export class PostOperations {
	static async getAll(
		executeFunctions: IExecuteFunctions,
		client: SubstackClient,
		publicationAddress: string,
		itemIndex: number,
	): Promise<IStandardResponse> {
		try {
			const limitParam = executeFunctions.getNodeParameter('limit', itemIndex, '') as number | string;
			
			// Apply default limit of 100 if not specified
			let limit = 100;
			if (limitParam !== '' && limitParam !== null && limitParam !== undefined) {
				limit = Number(limitParam);
			}

			// Get own profile first, then get posts
			const ownProfile = await client.ownProfile();
			const postsIterable = await ownProfile.posts();
			const formattedPosts: ISubstackPost[] = [];

			// Iterate through async iterable posts with limit
			let count = 0;
			for await (const post of postsIterable) {
				if (count >= limit) break;
				
				formattedPosts.push({
					id: post.id,
					title: post.title || '',
					subtitle: '', // Not available in the new API
					url: SubstackUtils.formatUrl(publicationAddress, `/p/${post.id}`),
					postDate: post.publishedAt?.toISOString() || new Date().toISOString(),
					type: 'newsletter', // Default type since not available in new API
					published: true, // Assuming published if it's returned
					paywalled: false, // Not available in new API
					description: post.body ? post.body.substring(0, 200) + '...' : '', // Use beginning of body as description
				});
				count++;
			}

			return {
				success: true,
				data: formattedPosts,
				metadata: {
					status: 'success',
				},
			};
		} catch (error) {
			return SubstackUtils.formatErrorResponse({
				message: error.message,
				node: executeFunctions.getNode(),
				itemIndex,
			});
		}
	}
}
