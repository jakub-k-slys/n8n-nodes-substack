import { IExecuteFunctions } from 'n8n-workflow';
import { SubstackClient } from 'substack-api';
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

			// Get own profile first
			const ownProfile = await client.ownProfile();
			const followeesIterable = await ownProfile.followees();
			
			// Iterate through async iterable followees with limit
			let count = 0;
			for await (const followee of followeesIterable) {
				if (count >= limit) break;
				
				if (returnType === 'ids') {
					// Get followees and extract IDs only
					followingData.push({
						id: followee.id,
					});
				} else {
					// Get full profiles (default)
					followingData.push({
						id: followee.id,
						name: followee.name,
						handle: followee.slug, // Use slug as handle
						bio: followee.bio,
						subscriberCount: 0, // Not available in new API structure
						subscriberCountString: '', // Not available in new API structure
						primaryPublication: undefined, // Not available in new API structure
					});
				}
				count++;
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