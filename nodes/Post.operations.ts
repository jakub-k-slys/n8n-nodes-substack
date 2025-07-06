import { INodeProperties } from 'n8n-workflow';

export const postOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['post'],
			},
		},
		options: [
			{
				name: 'Get Posts From Profile by Slug',
				value: 'getPostsBySlug',
				description: 'Get posts from a profile by its publication slug',
				action: 'Get posts by slug',
			},
			{
				name: 'Get Posts From Profile by ID',
				value: 'getPostsById',
				description: 'Get posts from a profile by its user ID',
				action: 'Get posts by ID',
			},
			{
				name: 'Get Post by ID',
				value: 'getPostById',
				description: 'Get a specific post by its ID',
				action: 'Get post by ID',
			},
		],
		default: 'getPostsBySlug',
	},
];