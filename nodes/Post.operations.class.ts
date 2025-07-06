import { IExecuteFunctions } from 'n8n-workflow';
import { SubstackClient } from 'substack-api';
import { ISubstackPost, IStandardResponse } from './Substack/types';
import { SubstackUtils } from './Substack/SubstackUtils';

export class PostOperations {
	static async getPostsBySlug(
		executeFunctions: IExecuteFunctions,
		client: SubstackClient,
		publicationAddress: string,
		itemIndex: number,
	): Promise<IStandardResponse> {
		try {
			const slug = executeFunctions.getNodeParameter('slug', itemIndex) as string;
			const limitParam = executeFunctions.getNodeParameter('limit', itemIndex, '') as number | string;
			
			// Apply default limit of 100 if not specified
			let limit = 100;
			if (limitParam !== '' && limitParam !== null && limitParam !== undefined) {
				limit = Number(limitParam);
			}

			// Get posts from profile by slug using client.profileForSlug(slug).posts()
			const profile = await client.profileForSlug(slug);
			const postsIterable = await profile.posts();
			const formattedPosts: ISubstackPost[] = [];

			// Iterate through async iterable posts with limit
			let count = 0;
			for await (const post of postsIterable) {
				if (count >= limit) break;
				
				try {
					formattedPosts.push({
						id: post.id,
						title: post.title || '',
						subtitle: (post as any).rawData?.subtitle || '',
						url: SubstackUtils.formatUrl(publicationAddress, `/p/${post.id}`),
						postDate: (post as any).rawData?.post_date || (post.publishedAt && !isNaN(post.publishedAt.getTime()) ? post.publishedAt.toISOString() : new Date().toISOString()),
						type: (post as any).rawData?.type || 'newsletter',
						published: (post as any).rawData?.published ?? true,
						paywalled: (post as any).rawData?.paywalled ?? false,
						description: (post as any).rawData?.description || post.body || '',
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

	static async getPostsById(
		executeFunctions: IExecuteFunctions,
		client: SubstackClient,
		publicationAddress: string,
		itemIndex: number,
	): Promise<IStandardResponse> {
		try {
			const userId = executeFunctions.getNodeParameter('userId', itemIndex) as number;
			const limitParam = executeFunctions.getNodeParameter('limit', itemIndex, '') as number | string;
			
			// Apply default limit of 100 if not specified
			let limit = 100;
			if (limitParam !== '' && limitParam !== null && limitParam !== undefined) {
				limit = Number(limitParam);
			}

			// Get posts from profile by ID using client.profileForId(id).posts()
			const profile = await client.profileForId(userId);
			const postsIterable = await profile.posts();
			const formattedPosts: ISubstackPost[] = [];

			// Iterate through async iterable posts with limit
			let count = 0;
			for await (const post of postsIterable) {
				if (count >= limit) break;
				
				try {
					formattedPosts.push({
						id: post.id,
						title: post.title || '',
						subtitle: (post as any).rawData?.subtitle || '',
						url: SubstackUtils.formatUrl(publicationAddress, `/p/${post.id}`),
						postDate: (post as any).rawData?.post_date || (post.publishedAt && !isNaN(post.publishedAt.getTime()) ? post.publishedAt.toISOString() : new Date().toISOString()),
						type: (post as any).rawData?.type || 'newsletter',
						published: (post as any).rawData?.published ?? true,
						paywalled: (post as any).rawData?.paywalled ?? false,
						description: (post as any).rawData?.description || post.body || '',
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

	static async getPostById(
		executeFunctions: IExecuteFunctions,
		client: SubstackClient,
		publicationAddress: string,
		itemIndex: number,
	): Promise<IStandardResponse> {
		try {
			const postId = executeFunctions.getNodeParameter('postId', itemIndex) as string;

			// Get post by ID using client.postForId(postId)
			const post = await client.postForId(postId);
			
			const formattedPost: ISubstackPost = {
				id: post.id,
				title: post.title || '',
				subtitle: (post as any).rawData?.subtitle || '',
				url: SubstackUtils.formatUrl(publicationAddress, `/p/${post.id}`),
				postDate: (post as any).rawData?.post_date || (post.publishedAt && !isNaN(post.publishedAt.getTime()) ? post.publishedAt.toISOString() : new Date().toISOString()),
				type: (post as any).rawData?.type || 'newsletter',
				published: (post as any).rawData?.published ?? true,
				paywalled: (post as any).rawData?.paywalled ?? false,
				description: (post as any).rawData?.description || post.body || '',
			};

			return {
				success: true,
				data: formattedPost,
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