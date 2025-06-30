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
			const postId = executeFunctions.getNodeParameter('postId', itemIndex) as number | string;
		const postIdString = postId.toString();
			const limitParam = executeFunctions.getNodeParameter('limit', itemIndex, '') as number | string;
			
			// Apply default limit of 100 if not specified
			const options: any = {};
			if (limitParam !== '' && limitParam !== null && limitParam !== undefined) {
				options.limit = Number(limitParam);
			} else {
				options.limit = 100;
			}

			// Get the specific post and its comments using the new entity model
			const post = await client.postForId(postIdString);
			console.log('Got post:', post);
			const formattedComments: ISubstackComment[] = [];

			// Iterate through async iterable comments
			let commentCount = 0;
			try {
				const commentsIterable = post.comments(options);
				console.log('Comments iterable created:', commentsIterable);
				
				for await (const comment of commentsIterable) {
					console.log('Got comment:', comment);
					commentCount++;
					formattedComments.push({
						id: comment.id,
						body: comment.body,
						createdAt: comment.createdAt ? comment.createdAt.toISOString() : new Date().toISOString(),
						parentPostId: parseInt(postIdString),
						author: {
							id: comment.author.id,
							name: comment.author.name,
							isAdmin: comment.author.isAdmin || false,
						},
					});
				}
			} catch (iterError) {
				console.log('Error during iteration:', iterError);
			}
			console.log('Total comments processed:', commentCount);

			return {
				success: true,
				data: formattedComments,
				metadata: {
					status: 'success',
				},
			};
		} catch (error) {
			console.log('Error in CommentOperations:', error);
			return SubstackUtils.formatErrorResponse({
				message: error.message,
				node: executeFunctions.getNode(),
				itemIndex,
			});
		}
	}
}