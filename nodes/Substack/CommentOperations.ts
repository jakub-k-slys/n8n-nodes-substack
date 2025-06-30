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
			const postId = executeFunctions.getNodeParameter('postId', itemIndex) as string;
			const limitParam = executeFunctions.getNodeParameter('limit', itemIndex, '') as number | string;
			
			// Apply default limit of 100 if not specified
			const options: any = {};
			if (limitParam !== '' && limitParam !== null && limitParam !== undefined) {
				options.limit = Number(limitParam);
			} else {
				options.limit = 100;
			}

			// Get the specific post and its comments using the new entity model
			const post = await client.postForId(postId);
			const formattedComments: ISubstackComment[] = [];

			// Iterate through async iterable comments
			for await (const comment of post.comments(options)) {
				formattedComments.push({
					id: comment.id,
					body: comment.body,
					createdAt: comment.createdAt.toISOString(),
					parentPostId: parseInt(postId),
					author: {
						id: comment.author.id,
						name: comment.author.name,
						isAdmin: comment.author.isAdmin || false,
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