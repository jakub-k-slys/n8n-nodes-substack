import { ISubstackNote, ISubstackPost, ISubstackComment, ISubstackFollowing } from '../types';
import { SubstackUtils } from '../SubstackUtils';
import TurndownService from 'turndown';

export class DataFormatters {
	/**
	 * Format a note object from the Substack API
	 */
	static formatNote(note: any, publicationAddress: string): ISubstackNote {
		return {
			noteId: note.id?.toString() || 'unknown',
			body: note.body || '',
			url: SubstackUtils.formatUrl(publicationAddress, `/p/${note.id || 'unknown'}`),
			date: DataFormatters.formatDate(note.publishedAt || new Date()),
			status: 'published',
			userId: note.author?.id?.toString() || 'unknown',
			likes: note.likesCount || 0,
			type: 'note',
		};
	}

	/**
	 * Format a post object from the Substack API
	 */
	static formatPost(post: any, publicationAddress: string): ISubstackPost {
		const htmlBody = post.htmlBody || '';
		const turndownService = new TurndownService();
		const markdown = htmlBody ? turndownService.turndown(htmlBody) : '';

		return {
			id: post.id,
			title: post.title || '',
			subtitle: post.subtitle || '',
			slug: post.slug,
			url: post.url || SubstackUtils.formatUrl(publicationAddress, `/p/${post.slug || post.id}`),
			postDate: DataFormatters.formatDate(post.publishedAt || new Date()),
			type: 'newsletter',
			published: true,
			paywalled: false,
			description: post.truncatedBody || post.body || '',
			htmlBody: htmlBody,
			markdown: markdown,
		};
	}

	/**
	 * Format a comment object from the Substack API
	 */
	static formatComment(comment: any, parentPostId?: number): ISubstackComment {
		return {
			id: comment.id,
			body: comment.body,
			isAdmin: comment.isAdmin || false,
			parentPostId: parentPostId || 0,
		};
	}

	/**
	 * Format a profile object from the Substack API
	 */
	static formatProfile(profile: any): any {
		return {
			id: profile.id,
			name: profile.name,
			handle: profile.handle || profile.slug,
			bio: profile.bio,
		};
	}

	/**
	 * Format a followee object for the following list
	 */
	static formatFollowing(followee: any, returnType: string): ISubstackFollowing {
		if (returnType === 'ids') {
			return {
				id: followee.id,
			};
		}

		return {
			id: followee.id,
			name: followee.name,
			handle: followee.handle || followee.slug,
			bio: followee.bio,
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
