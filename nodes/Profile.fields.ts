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
		default: '',
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
		// eslint-disable-next-line n8n-nodes-base/node-param-default-wrong-for-limit
		default: '',
		// eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-limit
		description: 'Max number of results to return. Defaults to 100 if not specified.',
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