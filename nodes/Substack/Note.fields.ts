import { INodeProperties } from 'n8n-workflow';

export const noteFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                              note:create                                  */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Body',
		name: 'body',
		type: 'string',
		default: '',
		description: 'The content of the note. Must contain at least one paragraph with actual content. Markdown formatting is supported in Advanced mode.',
		displayOptions: {
			show: {
				resource: ['note'],
				operation: ['create'],
			},
		},
		required: true,
		typeOptions: {
			rows: 4,
		},
		placeholder: 'Write your note content here... (Advanced mode supports Markdown: **bold**, *italic*, # headings, [links](url), - lists)',
	},
	{
		displayName: 'Content Type',
		name: 'contentType',
		type: 'options',
		default: 'simple',
		description: 'Choose how to format the content',
		displayOptions: {
			show: {
				resource: ['note'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'Simple Text',
				value: 'simple',
				description: 'Plain text content with structured validation',
			},
			{
				name: 'Advanced (Markdown)',
				value: 'advanced',
				description: 'Supports Markdown formatting: **bold**, *italic*, # headings, - lists, [links](URL). Builder prevents invalid notes.',
			},
		],
	},
	{
		displayName: 'Visibility',
		name: 'visibility',
		type: 'options',
		default: 'everyone',
		description: 'Who can see this note',
		displayOptions: {
			show: {
				resource: ['note'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'Everyone',
				value: 'everyone',
				description: 'Public note visible to everyone',
			},
			{
				name: 'Subscribers',
				value: 'subscribers',
				description: 'Visible only to subscribers',
			},
		],
	},
	/* -------------------------------------------------------------------------- */
	/*                              note:get                                     */
	/* -------------------------------------------------------------------------- */
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
	/* -------------------------------------------------------------------------- */
	/*                              note:getNotesBySlug                          */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Slug',
		name: 'slug',
		type: 'string',
		default: '',
		description: 'The publication slug (subdomain)',
		displayOptions: {
			show: {
				resource: ['note'],
				operation: ['getNotesBySlug'],
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
				resource: ['note'],
				operation: ['getNotesBySlug'],
			},
		},
		typeOptions: {
			minValue: 1,
		},
	},
	/* -------------------------------------------------------------------------- */
	/*                              note:getNotesById                            */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'number',
		default: 0,
		description: 'The user ID to get notes for',
		displayOptions: {
			show: {
				resource: ['note'],
				operation: ['getNotesById'],
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
				resource: ['note'],
				operation: ['getNotesById'],
			},
		},
		typeOptions: {
			minValue: 1,
		},
	},
	/* -------------------------------------------------------------------------- */
	/*                              note:getNoteById                             */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Note ID',
		name: 'noteId',
		type: 'string',
		default: '',
		description: 'The ID of the note to retrieve',
		displayOptions: {
			show: {
				resource: ['note'],
				operation: ['getNoteById'],
			},
		},
		required: true,
	},
];
