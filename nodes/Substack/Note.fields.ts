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
		description: 'The content of the note. Supports Markdown formatting.',
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
		placeholder:
			'Write your note content here... (Supports Markdown: **bold**, *italic*, # headings, [links](url), - lists)',
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
	{
		displayName: 'Attachment',
		name: 'attachment',
		type: 'options',
		default: 'none',
		description: 'Add an attachment to the note',
		displayOptions: {
			show: {
				resource: ['note'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'None',
				value: 'none',
				description: 'No attachment',
			},
			{
				name: 'Link',
				value: 'link',
				description: 'Attach a link to the note',
			},
		],
	},
	{
		displayName: 'Link URL',
		name: 'linkUrl',
		type: 'string',
		default: '',
		description: 'URL to attach to the note',
		displayOptions: {
			show: {
				resource: ['note'],
				operation: ['create'],
				attachment: ['link'],
			},
		},
		required: true,
		placeholder: 'https://example.com',
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
