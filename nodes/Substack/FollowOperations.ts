import { IExecuteFunctions } from 'n8n-workflow';
import { Substack as SubstackClient } from 'substack-api';
import { ISubstackFollowing, IStandardResponse } from './types';
import { SubstackUtils } from './SubstackUtils';

export class FollowOperations {
	static async getFollowing(
		executeFunctions: IExecuteFunctions,
		client: SubstackClient,
		publicationAddress: string,
		itemIndex: number,
	): Promise<IStandardResponse> {
		try {
			const returnType = executeFunctions.getNodeParameter('returnType', itemIndex, 'profiles') as string;
			const limitParam = executeFunctions.getNodeParameter('limit', itemIndex, '') as number | string;
			
			// Apply default limit of 100 if not specified
			let limit = 100;
			if (limitParam !== '' && limitParam !== null && limitParam !== undefined) {
				limit = Number(limitParam);
			}

			let followingData: ISubstackFollowing[] = [];

			if (returnType === 'ids') {
				// Get following IDs only
				const followingIds = await client.getFollowingIds();
				
				// Apply limit to the results
				const limitedIds = limit ? followingIds.slice(0, limit) : followingIds;
				
				followingData = limitedIds.map(id => ({
					id,
				}));
			} else {
				// Get full profiles (default)
				const followingProfiles = await client.getFollowingProfiles();
				
				// Apply limit to the results
				const limitedProfiles = limit ? followingProfiles.slice(0, limit) : followingProfiles;
				
				followingData = limitedProfiles.map(profile => ({
					id: profile.id,
					name: profile.name,
					handle: profile.handle,
					bio: profile.bio,
					subscriberCount: typeof profile.subscriberCount === 'string' ? 
						parseInt(profile.subscriberCount) || 0 : profile.subscriberCount,
					subscriberCountString: profile.subscriberCountString,
					primaryPublication: profile.primaryPublication ? {
						id: profile.primaryPublication.id,
						name: profile.primaryPublication.name,
						subdomain: profile.primaryPublication.subdomain,
					} : undefined,
				}));
			}

			return {
				success: true,
				data: followingData,
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
}