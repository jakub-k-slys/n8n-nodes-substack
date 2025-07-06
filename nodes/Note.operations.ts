import { INodeProperties } from 'n8n-workflow';

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
				name: 'Get Notes From Profile by Slug',
				value: 'getNotesBySlug',
				description: 'Get notes from a profile by its publication slug',
				action: 'Get notes by slug',
			},
			{
				name: 'Get Notes From Profile by ID',
				value: 'getNotesById',
				description: 'Get notes from a profile by its user ID',
				action: 'Get notes by ID',
			},
			{
				name: 'Get Note by ID',
				value: 'getNoteById',
				description: 'Get a specific note by its ID',
				action: 'Get note by ID',
			},
		],
		default: 'getNotesBySlug',
	},
];