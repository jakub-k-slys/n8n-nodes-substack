import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { SubstackClient } from 'substack-api';
import { ISubstackComment, IStandardResponse } from './types';
import { SubstackUtils } from './SubstackUtils';

export enum CommentOperation {
	GetAll = 'getAll',
	GetCommentById = 'getCommentById',
}

export const commentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		default: 'getAll',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['comment'],
			},
		},
		options: [
			{
				name: 'Get All Comments',
				value: CommentOperation.GetAll,
				description: 'Get all comments for a specific post',
				action: 'Get all comments',
			},
			{
				name: 'Get Comment by ID',
				value: CommentOperation.GetCommentById,
				description: 'Get a specific comment by its ID',
				action: 'Get comment by ID',
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
		const postIdParam = executeFunctions.getNodeParameter('postId', itemIndex) as number | string;
		const postId = typeof postIdParam === 'string' ? parseInt(postIdParam, 10) : postIdParam;
		
		// Validate postId
		if (!postId || isNaN(postId)) {
			throw new Error('Invalid postId: must be a valid number');
		}
		const limitParam = executeFunctions.getNodeParameter('limit', itemIndex, '') as number | string;

		// Apply default limit of 100 if not specified
		let limit = 100;
		if (limitParam !== '' && limitParam !== null && limitParam !== undefined) {
			limit = Number(limitParam);
		}

		// Get the post first, then get its comments
		const post = await client.postForId(postId);
		const commentsIterable = await post.comments();
		const formattedComments: ISubstackComment[] = [];

		// Iterate through async iterable comments with limit
		let count = 0;
		for await (const comment of commentsIterable) {
			if (count >= limit) break;

			formattedComments.push({
				id: comment.id,
				body: comment.body,
				createdAt: (comment as any).rawData?.created_at || comment.createdAt.toISOString(),
				parentPostId: postId, // Use the provided postId since it's not in the comment object
				author: {
					id: comment.author.id,
					name: comment.author.name,
					isAdmin: comment.author.isAdmin || false,
				},
			});
			count++;
		}

		return {
			success: true,
			data: formattedComments,
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

async function getCommentById(
	executeFunctions: IExecuteFunctions,
	client: SubstackClient,
	publicationAddress: string,
	itemIndex: number,
): Promise<IStandardResponse> {
	try {
		const commentId = executeFunctions.getNodeParameter('commentId', itemIndex) as string;

		// Get comment by ID using client.commentForId(id) - convert string to number
		const comment = await client.commentForId(parseInt(commentId, 10));

		const formattedComment: ISubstackComment = {
			id: comment.id,
			body: comment.body,
			createdAt: (comment as any).rawData?.created_at || comment.createdAt.toISOString(),
			parentPostId: (comment as any).rawData?.parent_post_id || 0, // May not be available
			author: {
				id: comment.author.id,
				name: comment.author.name,
				isAdmin: comment.author.isAdmin || false,
			},
		};

		return {
			success: true,
			data: formattedComment,
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

export const commentOperationHandlers: Record<
	CommentOperation,
	(
		executeFunctions: IExecuteFunctions,
		client: SubstackClient,
		publicationAddress: string,
		itemIndex: number,
	) => Promise<IStandardResponse>
> = {
	[CommentOperation.GetAll]: getAll,
	[CommentOperation.GetCommentById]: getCommentById,
};
