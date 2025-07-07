import { INodeProperties } from 'n8n-workflow';

export const noteFields: INodeProperties[] = [
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