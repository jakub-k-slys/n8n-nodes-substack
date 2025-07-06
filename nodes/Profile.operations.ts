import { INodeProperties } from 'n8n-workflow';

export const profileOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['profile'],
			},
		},
		options: [
			{
				name: 'Get Own Profile',
				value: 'getOwnProfile',
				description: 'Get your own profile information',
				action: 'Get own profile',
			},
			{
				name: 'Get Profile by Slug',
				value: 'getProfileBySlug',
				description: 'Get a profile by its publication slug',
				action: 'Get profile by slug',
			},
			{
				name: 'Get Profile by ID',
				value: 'getProfileById',
				description: 'Get a profile by its user ID',
				action: 'Get profile by ID',
			},
			{
				name: 'Get Followees',
				value: 'getFollowees',
				description: 'Get users that you follow',
				action: 'Get followees',
			},
		],
		default: 'getOwnProfile',
	},
];