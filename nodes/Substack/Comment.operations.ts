import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { SubstackClient } from 'substack-api';
import { IStandardResponse } from './types';
import { DataFormatters } from './shared/DataFormatters';
import { OperationUtils } from './shared/OperationUtils';
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
		const postId = OperationUtils.parseNumericParam(
			executeFunctions.getNodeParameter('postId', itemIndex),
			'postId',
		);
		const limitParam = executeFunctions.getNodeParameter('limit', itemIndex, '');
		const limit = OperationUtils.parseLimit(limitParam);

		const post = await client.postForId(postId);
		const commentsIterable = await post.comments();
		const results = await OperationUtils.executeAsyncIterable(
			commentsIterable,
			limit,
			(comment: any, publicationAddress: string) => DataFormatters.formatComment(comment, postId),
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

async function getCommentById(
	executeFunctions: IExecuteFunctions,
	client: SubstackClient,
	publicationAddress: string,
	itemIndex: number,
): Promise<IStandardResponse> {
	try {
		const commentId = OperationUtils.parseNumericParam(
			executeFunctions.getNodeParameter('commentId', itemIndex),
			'commentId',
		);

		const comment = await client.commentForId(commentId);
		const result = DataFormatters.formatComment(comment);

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
