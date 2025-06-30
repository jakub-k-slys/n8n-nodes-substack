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
			const options: any = {};
			if (limitParam !== '' && limitParam !== null && limitParam !== undefined) {
				options.limit = Number(limitParam);
			} else {
				options.limit = 100;
			}

			// Get own profile and retrieve posts using the new entity model
			const ownProfile = await client.ownProfile();
			const formattedPosts: ISubstackPost[] = [];

			// Iterate through async iterable posts
			for await (const post of ownProfile.posts(options)) {
				formattedPosts.push({
					id: post.id,
					title: post.title || '',
					subtitle: '', // Not available in new API entity
					url: SubstackUtils.formatUrl(publicationAddress, `/p/${post.id}`),
					postDate: post.publishedAt.toISOString(),
					type: 'newsletter', // Default type for posts
					published: true, // Posts from entity are published
					paywalled: false, // Not available in new API entity
					description: post.body ? post.body.substring(0, 200) + '...' : '',
				});
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
