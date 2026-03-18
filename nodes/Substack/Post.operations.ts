import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { SubstackClient } from 'substack-api';
import { IStandardResponse } from './types';
import { DataFormatters } from './shared/DataFormatters';
import { OperationUtils } from './shared/OperationUtils';
import { SubstackUtils } from './SubstackUtils';

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
		default: 'getAll',
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
		const limitParam = executeFunctions.getNodeParameter('limit', itemIndex, '');
		const limit = OperationUtils.parseLimit(limitParam);

		const ownProfile = await client.ownProfile();
		const postsIterable = await ownProfile.posts();
		const results = await OperationUtils.executeAsyncIterable(
			postsIterable,
			limit,
			DataFormatters.formatPost,
			publicationAddress,
		);

		return {
			success: true,
			data: results,
			metadata: { status: 'success' },
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
		const limitParam = executeFunctions.getNodeParameter('limit', itemIndex, '');
		const limit = OperationUtils.parseLimit(limitParam);

		const profile = await client.profileForSlug(slug);
		const postsIterable = await profile.posts();
		const results = await OperationUtils.executeAsyncIterable(
			postsIterable,
			limit,
			DataFormatters.formatPost,
			publicationAddress,
		);

		return {
			success: true,
			data: results,
			metadata: { status: 'success' },
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
		const userId = OperationUtils.parseNumericParam(
			executeFunctions.getNodeParameter('userId', itemIndex),
			'userId',
		);
		const limitParam = executeFunctions.getNodeParameter('limit', itemIndex, '');
		const limit = OperationUtils.parseLimit(limitParam);

		const profile = await client.profileForId(userId);
		const postsIterable = await profile.posts();
		const results = await OperationUtils.executeAsyncIterable(
			postsIterable,
			limit,
			DataFormatters.formatPost,
			publicationAddress,
		);

		return {
			success: true,
			data: results,
			metadata: { status: 'success' },
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
		const postId = OperationUtils.parseNumericParam(
			executeFunctions.getNodeParameter('postId', itemIndex),
			'postId',
		);

		const post = await client.postForId(postId);
		const result = DataFormatters.formatPost(post, publicationAddress);

		return {
			success: true,
			data: result,
			metadata: { status: 'success' },
		};
	} catch (error) {
		return SubstackUtils.formatErrorResponse({
			message: error.message,
			node: executeFunctions.getNode(),
			itemIndex,
		});
	}
}

export const postOperationHandlers: Record<
	PostOperation,
	(
		executeFunctions: IExecuteFunctions,
		client: SubstackClient,
		publicationAddress: string,
		itemIndex: number,
	) => Promise<IStandardResponse>
> = {
	[PostOperation.GetAll]: getAll,
	[PostOperation.GetPostsBySlug]: getPostsBySlug,
	[PostOperation.GetPostsById]: getPostsById,
	[PostOperation.GetPostById]: getPostById,
};
