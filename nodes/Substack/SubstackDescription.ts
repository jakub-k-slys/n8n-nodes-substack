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

// When the resource `comment` is selected, this `operation` parameter will be shown.
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
				name: 'Get Many',
				value: 'getAll',
				description: 'Get comments for a specific post',
				action: 'Get many comments',
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
		// eslint-disable-next-line n8n-nodes-base/node-param-default-wrong-for-limit
		default: '',
		// eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-limit
		description: 'Max number of results to return. Defaults to 100 if not specified.',
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
];

export const postFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                                post:getAll                                */
	/* -------------------------------------------------------------------------- */
	...getAllOperation,
];

// Here we define what to show when the 'getAll' operation is selected for comments.
const getCommentsOperation: INodeProperties[] = [
	{
		displayName: 'Post ID',
		name: 'postId',
		type: 'number',
		default: '',
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
		// eslint-disable-next-line n8n-nodes-base/node-param-default-wrong-for-limit
		default: '',
		// eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-limit
		description: 'Max number of results to return. Defaults to 100 if not specified.',
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
];

export const commentFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                                comment:getAll                             */
	/* -------------------------------------------------------------------------- */
	...getCommentsOperation,
];

// Here we define what to show when the 'create' operation is selected.
const createOperation: INodeProperties[] = [
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
		// eslint-disable-next-line n8n-nodes-base/node-param-default-wrong-for-limit
		default: '',
		// eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-limit
		description: 'Max number of results to return. Defaults to 100 if not specified.',
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

// When the resource `follow` is selected, this `operation` parameter will be shown.
export const followOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['follow'],
			},
		},
		options: [
			{
				name: 'Get Following',
				value: 'getFollowing',
				description: 'Get users that you follow',
				action: 'Get following',
			},
		],
		default: 'getFollowing',
	},
];

// Here we define what to show when the 'getFollowing' operation is selected.
const getFollowingOperation: INodeProperties[] = [
	{
		displayName: 'Return Type',
		name: 'returnType',
		type: 'options',
		options: [
			{
				name: 'Full Profiles',
				value: 'profiles',
				description: 'Return complete profile information',
			},
			{
				name: 'User IDs Only',
				value: 'ids',
				description: 'Return only user IDs',
			},
		],
		default: 'profiles',
		description: 'Choose what information to return about the users you follow',
		displayOptions: {
			show: {
				resource: ['follow'],
				operation: ['getFollowing'],
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		// eslint-disable-next-line n8n-nodes-base/node-param-default-wrong-for-limit
		default: '',
		// eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-limit
		description: 'Max number of results to return. Defaults to 100 if not specified.',
		displayOptions: {
			show: {
				resource: ['follow'],
				operation: ['getFollowing'],
			},
		},
		typeOptions: {
			minValue: 1,
		},
	},
];

export const followFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                               follow:getFollowing                         */
	/* -------------------------------------------------------------------------- */
	...getFollowingOperation,
];
