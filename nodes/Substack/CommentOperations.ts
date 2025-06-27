import { IExecuteFunctions } from 'n8n-workflow';
import { Substack as SubstackClient } from 'substack-api';
import { ISubstackComment, IStandardResponse } from './types';
import { SubstackUtils } from './SubstackUtils';

export class CommentOperations {
	static async getAll(
		executeFunctions: IExecuteFunctions,
		client: SubstackClient,
		publicationAddress: string,
		itemIndex: number,
	): Promise<IStandardResponse> {
		try {
			const postId = executeFunctions.getNodeParameter('postId', itemIndex) as number;
			const limitParam = executeFunctions.getNodeParameter('limit', itemIndex, '') as number | string;
			
			// Prepare options - only include limit if it's specified
			const options: any = {};
			if (limitParam !== '' && limitParam !== null && limitParam !== undefined) {
				options.limit = Number(limitParam);
			}

			const comments = client.getComments(postId, options);
			const formattedComments: ISubstackComment[] = [];

			// Iterate through async iterable comments
			for await (const comment of comments) {
				formattedComments.push({
					id: comment.id,
					body: comment.body,
					createdAt: comment.created_at,
					parentPostId: comment.parent_post_id,
					author: {
						id: comment.author.id,
						name: comment.author.name,
						isAdmin: comment.author.is_admin,
					},
				});
			}

			return {
				success: true,
				data: formattedComments,
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