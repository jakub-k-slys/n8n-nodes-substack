import { INodeProperties } from 'n8n-workflow';

export const commentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['comment'],
			},
		},
		options: [
			{
				name: 'Get Comment by ID',
				value: 'getCommentById',
				description: 'Get a specific comment by its ID',
				action: 'Get comment by ID',
			},
		],
		default: 'getCommentById',
	},
];