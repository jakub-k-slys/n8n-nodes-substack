import { INodeProperties } from 'n8n-workflow';

export const profileFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                            profile:getProfileBySlug                       */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Slug',
		name: 'slug',
		type: 'string',
		default: '',
		description: 'The publication slug (subdomain)',
		displayOptions: {
			show: {
				resource: ['profile'],
				operation: ['getProfileBySlug'],
			},
		},
		required: true,
	},
	/* -------------------------------------------------------------------------- */
	/*                            profile:getProfileById                         */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'number',
		default: 0,
		description: 'The user ID to get profile for',
		displayOptions: {
			show: {
				resource: ['profile'],
				operation: ['getProfileById'],
			},
		},
		required: true,
	},
	/* -------------------------------------------------------------------------- */
	/*                            profile:getFollowees                           */
	/* -------------------------------------------------------------------------- */
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
				resource: ['profile'],
				operation: ['getFollowees'],
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		description: 'Max number of results to return',
		displayOptions: {
			show: {
				resource: ['profile'],
				operation: ['getFollowees'],
			},
		},
		typeOptions: {
			minValue: 1,
		},
	},
];
