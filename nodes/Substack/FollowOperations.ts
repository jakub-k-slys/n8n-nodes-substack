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
			let count = 0;

			// Use the new client.followees() async iterator
			for await (const profile of client.followees()) {
				if (count >= limit) break;

				if (returnType === 'ids') {
					// Return only IDs
					followingData.push({
						id: profile.id,
					});
				} else {
					// Return full profiles (default)
					followingData.push({
						id: profile.id,
						name: profile.name,
						handle: profile.slug,
						bio: profile.bio,
						subscriberCount: 0, // Not available in new API
						subscriberCountString: '0',
						primaryPublication: undefined, // Could be extracted if needed
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