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
				
				try {
					formattedPosts.push({
						id: post.id,
						title: post.title || '',
						subtitle: (post as any).rawData?.subtitle || '', // Access original subtitle from rawData
						url: SubstackUtils.formatUrl(publicationAddress, `/p/${post.id}`),
						postDate: (post as any).rawData?.post_date || (post.publishedAt && !isNaN(post.publishedAt.getTime()) ? post.publishedAt.toISOString() : new Date().toISOString()),
						type: (post as any).rawData?.type || 'newsletter', // Access original type from rawData
						published: (post as any).rawData?.published ?? true, // Access original published status
						paywalled: (post as any).rawData?.paywalled ?? false, // Access original paywalled status
						description: (post as any).rawData?.description || post.body || '', // Use original description if available
					});
				} catch (error) {
					// Skip malformed posts but continue processing
					console.warn(`Skipped malformed post: ${error.message}`);
				}
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
