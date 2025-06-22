import { INodeProperties } from 'n8n-workflow';

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
		],
		default: 'create',
	},
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

export const noteFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                                note:create                                 */
	/* -------------------------------------------------------------------------- */
	...createOperation,
];