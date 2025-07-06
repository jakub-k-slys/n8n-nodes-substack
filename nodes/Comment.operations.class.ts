import { IExecuteFunctions } from 'n8n-workflow';
import { SubstackClient } from 'substack-api';
import { ISubstackComment, IStandardResponse } from './Substack/types';
import { SubstackUtils } from './Substack/SubstackUtils';

export class CommentOperations {
	static async getCommentById(
		executeFunctions: IExecuteFunctions,
		client: SubstackClient,
		publicationAddress: string,
		itemIndex: number,
	): Promise<IStandardResponse> {
		try {
			const commentId = executeFunctions.getNodeParameter('commentId', itemIndex) as string;

			// Get comment by ID using client.commentForId(id)
			const comment = await client.commentForId(commentId);
			
			const formattedComment: ISubstackComment = {
				id: comment.id,
				body: comment.body,
				createdAt: (comment as any).rawData?.created_at || comment.createdAt.toISOString(),
				parentPostId: (comment as any).rawData?.parent_post_id || 0, // May not be available
				author: {
					id: comment.author.id,
					name: comment.author.name,
					isAdmin: comment.author.isAdmin || false,
				},
			};

			return {
				success: true,
				data: formattedComment,
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