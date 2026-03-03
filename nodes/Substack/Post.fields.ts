import { INodeProperties } from 'n8n-workflow';

export const postFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                              post:getAll                                  */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		description: 'Max number of results to return',
		displayOptions: {
			show: {
				resource: ['post'],
				operation: ['getAll'],
			},
		},
		typeOptions: {
			minValue: 1,
		},
	},
	/* -------------------------------------------------------------------------- */
	/*                              post:getPostsBySlug                          */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Slug',
		name: 'slug',
		type: 'string',
		default: '',
		description: 'The publication slug (subdomain)',
		displayOptions: {
			show: {
				resource: ['post'],
				operation: ['getPostsBySlug'],
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
				resource: ['post'],
				operation: ['getPostsBySlug'],
			},
		},
		typeOptions: {
			minValue: 1,
		},
	},
	/* -------------------------------------------------------------------------- */
	/*                              post:getPostById                             */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Post ID',
		name: 'postId',
		type: 'string',
		default: '',
		description: 'The ID of the post to retrieve',
		displayOptions: {
			show: {
				resource: ['post'],
				operation: ['getPostById'],
			},
		},
		required: true,
	},
];
