import { INodeProperties } from 'n8n-workflow';

export const commentFields: INodeProperties[] = [
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