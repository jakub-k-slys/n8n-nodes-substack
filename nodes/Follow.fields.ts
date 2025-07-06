import { INodeProperties } from 'n8n-workflow';

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