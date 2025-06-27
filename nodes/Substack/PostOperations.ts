import { IExecuteFunctions } from 'n8n-workflow';
import { Substack as SubstackClient } from 'substack-api';
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
			const limit = executeFunctions.getNodeParameter('limit', itemIndex, 50) as number;

			const posts = client.getPosts({ limit });
			const formattedPosts: ISubstackPost[] = [];

			// Iterate through async iterable posts
			for await (const post of posts) {
				formattedPosts.push({
					id: post.id,
					title: post.title || '',
					subtitle: post.subtitle,
					url: SubstackUtils.formatUrl(publicationAddress, `/p/${post.id}`),
					postDate: post.post_date,
					type: post.type,
					published: post.published,
					paywalled: post.paywalled,
					description: post.description,
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
