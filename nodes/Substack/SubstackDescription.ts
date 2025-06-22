import { INodeProperties } from 'n8n-workflow';

// When the resource `post` is selected, this `operation` parameter will be shown.
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
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many posts from the publication',
				action: 'Get many posts',
				routing: {
					request: {
						method: 'GET',
						url: '/api/v1/posts',
					},
				},
			},
		],
		default: 'getAll',
	},
];

// When the resource `note` is selected, this `operation` parameter will be shown.
export const noteOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['note'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new Substack note',
				action: 'Create a note',
				routing: {
					request: {
						method: 'POST',
						url: '/api/v1/notes',
					},
					output: {
						postReceive: [
							{
								type: 'set',
								properties: {
									value: '={{ { "title": $response.body.title || $parameter.title, "success": true, "noteId": $response.body.id, "url": $response.body.url } }}',
								},
							},
						],
					},
				},
			},
		],
		default: 'create',
	},
];

// Here we define what to show when the 'getAll' operation is selected for posts.
const getAllOperation: INodeProperties[] = [
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
		routing: {
			send: {
				property: 'limit',
				type: 'query',
			},
		},
		typeOptions: {
			minValue: 1,
		},
	},
	{
		displayName: 'Offset',
		name: 'offset',
		type: 'number',
		default: 0,
		description: 'Number of posts to skip (for pagination)',
		displayOptions: {
			show: {
				resource: ['post'],
				operation: ['getAll'],
			},
		},
		routing: {
			send: {
				property: 'offset',
				type: 'query',
			},
		},
		typeOptions: {
			minValue: 0,
		},
	},
];

export const postFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                                post:getAll                                */
	/* -------------------------------------------------------------------------- */
	...getAllOperation,
];

// Here we define what to show when the 'create' operation is selected.
const createOperation: INodeProperties[] = [
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		default: '',
		placeholder: 'Note title',
		description: 'The headline of the note',
		displayOptions: {
			show: {
				resource: ['note'],
				operation: ['create'],
			},
		},
		routing: {
			send: {
				property: 'title',
				type: 'body',
			},
		},
		required: true,
	},
	{
		displayName: 'Body',
		name: 'body',
		type: 'string',
		typeOptions: {
			rows: 5,
		},
		default: '',
		placeholder: 'Note content...',
		description: 'The content of the note (plain text or HTML)',
		displayOptions: {
			show: {
				resource: ['note'],
				operation: ['create'],
			},
		},
		routing: {
			send: {
				property: 'body',
				type: 'body',
			},
		},
		required: true,
	},
];

export const noteFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                                note:create                                 */
	/* -------------------------------------------------------------------------- */
	...createOperation,
];