import { INodeProperties } from 'n8n-workflow';

export const commentFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                              comment:getAll                               */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Post ID',
		name: 'postId',
		type: 'number',
		default: 0,
		description: 'The ID of the post to get comments for',
		displayOptions: {
			show: {
				resource: ['comment'],
				operation: ['getAll'],
			},
		},
		required: true,
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		description: 'Max number of results to return',
		displayOptions: {
			show: {
				resource: ['comment'],
				operation: ['getAll'],
			},
		},
		typeOptions: {
			minValue: 1,
		},
	},
	/* -------------------------------------------------------------------------- */
	/*                              comment:getCommentById                       */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Comment ID',
		name: 'commentId',
		type: 'string',
		default: '',
		description: 'The ID of the comment to retrieve',
		displayOptions: {
			show: {
				resource: ['comment'],
				operation: ['getCommentById'],
			},
		},
		required: true,
	},
];