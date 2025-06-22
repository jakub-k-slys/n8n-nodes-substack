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
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve notes from the publication',
				action: 'Get notes',
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
		required: true,
	},
];

// Here we define what to show when the 'get' operation is selected.
const getOperation: INodeProperties[] = [
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		description: 'Max number of results to return',
		displayOptions: {
			show: {
				resource: ['note'],
				operation: ['get'],
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
		description: 'Number of notes to skip',
		displayOptions: {
			show: {
				resource: ['note'],
				operation: ['get'],
			},
		},
		typeOptions: {
			minValue: 0,
		},
	},
];

export const noteFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                                note:create                                 */
	/* -------------------------------------------------------------------------- */
	...createOperation,
	/* -------------------------------------------------------------------------- */
	/*                                note:get                                    */
	/* -------------------------------------------------------------------------- */
	...getOperation,
];