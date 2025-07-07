import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { SubstackClient } from 'substack-api';
import { ISubstackPost, IStandardResponse } from './Substack/types';
import { SubstackUtils } from './Substack/SubstackUtils';

export enum PostOperation {
	GetAll = 'getAll',
	GetPostsBySlug = 'getPostsBySlug',
	GetPostsById = 'getPostsById',
	GetPostById = 'getPostById',
}

export const postOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		default: PostOperation.GetAll,
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['post'],
			},
		},
		options: [
			{
				name: 'Get All Posts',
				value: PostOperation.GetAll,
				description: 'Get all posts from own profile',
				action: 'Get all posts',
			},
			{
				name: 'Get Posts From Profile by Slug',
				value: PostOperation.GetPostsBySlug,
				description: 'Get posts from a profile by its publication slug',
				action: 'Get posts by slug',
			},
			{
				name: 'Get Posts From Profile by ID',
				value: PostOperation.GetPostsById,
				description: 'Get posts from a profile by its user ID',
				action: 'Get posts by ID',
			},
			{
				name: 'Get Post by ID',
				value: PostOperation.GetPostById,
				description: 'Get a specific post by its ID',
				action: 'Get post by ID',
			},
		],
	},
];

async function getAll(
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

async function getPostsBySlug(
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

async function getPostsById(
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

async function getPostById(
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

export const postOperationHandlers: Record<PostOperation, (
	executeFunctions: IExecuteFunctions,
	client: SubstackClient,
	publicationAddress: string,
	itemIndex: number,
) => Promise<IStandardResponse>> = {
	[PostOperation.GetAll]: getAll,
	[PostOperation.GetPostsBySlug]: getPostsBySlug,
	[PostOperation.GetPostsById]: getPostsById,
	[PostOperation.GetPostById]: getPostById,
};