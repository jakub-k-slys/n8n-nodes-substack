import { ISubstackNote, ISubstackPost, ISubstackComment } from '../types';
import { SubstackUtils } from '../SubstackUtils';

export class DataFormatters {
	/**
	 * Format a note object from the Substack API
	 */
	static formatNote(note: any, publicationAddress: string): ISubstackNote {
		return {
			noteId: (note as any).rawData?.comment?.id?.toString() || note.id?.toString() || 'unknown',
			body: note.body || '',
			url: SubstackUtils.formatUrl(
				publicationAddress,
				`/p/${(note as any).rawData?.comment?.id || note.id || 'unknown'}`,
			),
			date: DataFormatters.formatDate(
				(note as any).rawData?.context?.timestamp || 
				note.publishedAt || 
				new Date()
			),
			status: 'published',
			userId: note.author?.id?.toString() || 'unknown',
			likes: note.likesCount || 0,
			restacks: (note as any).rawData?.comment?.restacks || 0,
			type: 'note',
			entityKey: (note as any).rawData?.entity_key || note.id,
		};
	}

	/**
	 * Format a post object from the Substack API
	 */
	static formatPost(post: any, publicationAddress: string): ISubstackPost {
		return {
			id: post.id,
			title: post.title || '',
			subtitle: (post as any).rawData?.subtitle || '',
			url: SubstackUtils.formatUrl(publicationAddress, `/p/${post.id}`),
			postDate: DataFormatters.formatDate(
				(post as any).rawData?.post_date || 
				post.publishedAt || 
				new Date()
			),
			type: (post as any).rawData?.type || 'newsletter',
			published: (post as any).rawData?.published ?? true,
			paywalled: (post as any).rawData?.paywalled ?? false,
			description: (post as any).rawData?.description || post.body || '',
		};
	}

	/**
	 * Format a comment object from the Substack API
	 */
	static formatComment(comment: any, parentPostId?: number): ISubstackComment {
		return {
			id: comment.id,
			body: comment.body,
			createdAt: (comment as any).rawData?.created_at || comment.createdAt.toISOString(),
			parentPostId: parentPostId || (comment as any).rawData?.parent_post_id || 0,
			author: {
				id: comment.author.id,
				name: comment.author.name,
				isAdmin: comment.author.isAdmin || false,
			},
		};
	}

	/**
	 * Format date with fallback to current date for invalid dates
	 */
	static formatDate(date: any): string {
		if (date && !isNaN(new Date(date).getTime())) {
			return new Date(date).toISOString();
		}
		return new Date().toISOString();
	}
}