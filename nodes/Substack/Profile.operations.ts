import { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { SubstackClient } from 'substack-api';
import { IStandardResponse } from './types';
import { SubstackUtils } from './SubstackUtils';
import { DataFormatters } from './shared/DataFormatters';
import { OperationUtils } from './shared/OperationUtils';

export enum ProfileOperation {
	GetOwnProfile = 'getOwnProfile',
	GetProfileBySlug = 'getProfileBySlug',
	GetProfileById = 'getProfileById',
	GetFollowees = 'getFollowees',
}

export const profileOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		default: 'getOwnProfile',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['profile'],
			},
		},
		options: [
			{
				name: 'Get Own Profile',
				value: ProfileOperation.GetOwnProfile,
				description: 'Get your own profile information',
				action: 'Get own profile',
			},
			{
				name: 'Get Profile by Slug',
				value: ProfileOperation.GetProfileBySlug,
				description: 'Get a profile by its publication slug',
				action: 'Get profile by slug',
			},
			{
				name: 'Get Profile by ID',
				value: ProfileOperation.GetProfileById,
				description: 'Get a profile by its user ID',
				action: 'Get profile by ID',
			},
			{
				name: 'Get Followees',
				value: ProfileOperation.GetFollowees,
				description: 'Get users that you follow',
				action: 'Get followees',
			},
		],
	},
];

async function getOwnProfile(
	executeFunctions: IExecuteFunctions,
	client: SubstackClient,
	publicationAddress: string,
	itemIndex: number,
): Promise<IStandardResponse> {
	try {
		const profile = await client.ownProfile();
		const profileData = DataFormatters.formatProfile(profile);

		return {
			success: true,
			data: profileData,
			metadata: {
				status: 'success',
			},
		};
	} catch (error) {
		return SubstackUtils.formatErrorResponse({
			message: error.message,
			node: executeFunctions.getNode(),
			itemIndex,
		});
	}
}

async function getProfileBySlug(
	executeFunctions: IExecuteFunctions,
	client: SubstackClient,
	publicationAddress: string,
	itemIndex: number,
): Promise<IStandardResponse> {
	try {
		const slug = executeFunctions.getNodeParameter('slug', itemIndex) as string;
		const profile = await client.profileForSlug(slug);
		const profileData = DataFormatters.formatProfile(profile);

		return {
			success: true,
			data: profileData,
			metadata: {
				status: 'success',
			},
		};
	} catch (error) {
		return SubstackUtils.formatErrorResponse({
			message: error.message,
			node: executeFunctions.getNode(),
			itemIndex,
		});
	}
}

async function getProfileById(
	executeFunctions: IExecuteFunctions,
	client: SubstackClient,
	publicationAddress: string,
	itemIndex: number,
): Promise<IStandardResponse> {
	try {
		const userId = OperationUtils.parseNumericParam(
			executeFunctions.getNodeParameter('userId', itemIndex),
			'userId',
		);
		const profile = await client.profileForId(userId);
		const profileData = DataFormatters.formatProfile(profile);

		return {
			success: true,
			data: profileData,
			metadata: {
				status: 'success',
			},
		};
	} catch (error) {
		return SubstackUtils.formatErrorResponse({
			message: error.message,
			node: executeFunctions.getNode(),
			itemIndex,
		});
	}
}

async function getFollowees(
	executeFunctions: IExecuteFunctions,
	client: SubstackClient,
	publicationAddress: string,
	itemIndex: number,
): Promise<IStandardResponse> {
	try {
		const returnType = executeFunctions.getNodeParameter(
			'returnType',
			itemIndex,
			'profiles',
		) as string;
		const limitParam = executeFunctions.getNodeParameter('limit', itemIndex, '');
		const limit = OperationUtils.parseLimit(limitParam);

		const ownProfile = await client.ownProfile();
		const followeesIterable = await ownProfile.followees();
		const results = await OperationUtils.executeAsyncIterable(
			followeesIterable,
			limit,
			(followee: any) => DataFormatters.formatFollowing(followee, returnType),
		);

		return {
			success: true,
			data: results,
			metadata: {
				status: 'success',
			},
		};
	} catch (error) {
		return SubstackUtils.formatErrorResponse({
			message: error.message,
			node: executeFunctions.getNode(),
			itemIndex,
		});
	}
}

export const profileOperationHandlers: Record<
	ProfileOperation,
	(
		executeFunctions: IExecuteFunctions,
		client: SubstackClient,
		publicationAddress: string,
		itemIndex: number,
	) => Promise<IStandardResponse>
> = {
	[ProfileOperation.GetOwnProfile]: getOwnProfile,
	[ProfileOperation.GetProfileBySlug]: getProfileBySlug,
	[ProfileOperation.GetProfileById]: getProfileById,
	[ProfileOperation.GetFollowees]: getFollowees,
};
