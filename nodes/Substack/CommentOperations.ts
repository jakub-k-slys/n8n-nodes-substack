import { IExecuteFunctions } from 'n8n-workflow';
import { SubstackClient } from 'substack-api';
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
			
			// Apply default limit of 100 if not specified
			let limit = 100;
			if (limitParam !== '' && limitParam !== null && limitParam !== undefined) {
				limit = Number(limitParam);
			}

			// Get the post first, then get its comments
			const post = await client.postForId(postId.toString());
			const commentsIterable = await post.comments();
			const formattedComments: ISubstackComment[] = [];

			// Iterate through async iterable comments with limit
			let count = 0;
			for await (const comment of commentsIterable) {
				if (count >= limit) break;
				
				formattedComments.push({
					id: comment.id,
					body: comment.body,
					createdAt: comment.createdAt.toISOString(),
					parentPostId: postId, // Use the provided postId since it's not in the comment object
					author: {
						id: comment.author.id,
						name: comment.author.name,
						isAdmin: comment.author.isAdmin || false,
					},
				});
				count++;
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