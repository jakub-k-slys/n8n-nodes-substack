import { marked } from 'marked';
import type { OwnProfile } from 'substack-api';

/**
 * Markdown parser for Substack notes using the marked library
 * Supports: headings, bold, italic, code, links, lists
 */
export class MarkdownParser {
	/**
	 * Parse markdown text and apply it to a NoteBuilder using structured approach
	 */
	static parseMarkdownToNoteStructured(markdown: string, noteBuilder: ReturnType<OwnProfile['newNote']>): ReturnType<OwnProfile['newNote']> {
		if (!markdown.trim()) {
			throw new Error('Note body cannot be empty - at least one paragraph with content is required');
		}

		// Parse markdown into tokens using marked
		const tokens = marked.lexer(markdown);
		
		// Validate that we have at least one meaningful token
		const meaningfulTokens = tokens.filter(token => 
			token.type === 'paragraph' || 
			token.type === 'heading' || 
			token.type === 'list'
		);
		
		if (meaningfulTokens.length === 0) {
			throw new Error('Note must contain at least one paragraph with actual content');
		}
		
		// Process each token and convert to structured NoteBuilder calls
		const contentTracker = { meaningfulNodesCreated: 0 };
		this.processTokensStructured(tokens, noteBuilder, contentTracker);
		
		// Validate that we actually created some meaningful content
		if (contentTracker.meaningfulNodesCreated === 0) {
			throw new Error('Note must contain at least one paragraph with actual content');
		}

		return noteBuilder;
	}

	/**
	 * Legacy method for backward compatibility
	 */
	static parseMarkdownToNote(markdown: string, noteBuilder: ReturnType<OwnProfile['newNote']>): ReturnType<OwnProfile['newNote']> {
		return this.parseMarkdownToNoteStructured(markdown, noteBuilder);
	}

	/**
	 * Process marked tokens and convert to structured NoteBuilder calls
	 */
	private static processTokensStructured(tokens: any[], noteBuilder: ReturnType<OwnProfile['newNote']>, contentTracker: any): void {
		for (const token of tokens) {
			switch (token.type) {
				case 'heading':
					this.processHeadingStructured(token, noteBuilder, contentTracker);
					break;
				case 'paragraph':
					this.processParagraphStructured(token, noteBuilder, contentTracker);
					break;
				case 'list':
					this.processListStructured(token, noteBuilder, contentTracker);
					break;
				case 'space':
					// Skip empty space tokens
					break;
				default:
					// Handle other token types as paragraphs
					if (token.text) {
						let paragraphBuilder = noteBuilder.paragraph();
						paragraphBuilder = paragraphBuilder.text(token.text);
						contentTracker.meaningfulNodesCreated++;
					}
					break;
			}
		}
	}

	/**
	 * Process heading token using structured approach
	 */
	private static processHeadingStructured(token: any, noteBuilder: ReturnType<OwnProfile['newNote']>, contentTracker: any): void {
		// Skip completely empty headings
		const hasContent = (token.tokens && token.tokens.some((t: any) => t.text && t.text.trim())) ||
						   (token.text && token.text.trim());
		
		if (!hasContent) {
			return;
		}
		
		let paragraphBuilder = noteBuilder.paragraph();
		// Process inline tokens within the heading
		if (token.tokens && token.tokens.length > 0) {
			paragraphBuilder = this.processInlineTokensStructured(token.tokens, paragraphBuilder, true);
		} else if (token.text) {
			paragraphBuilder = paragraphBuilder.bold(token.text);
		}
		contentTracker.meaningfulNodesCreated++;
	}

	/**
	 * Process paragraph token using structured approach
	 */
	private static processParagraphStructured(token: any, noteBuilder: ReturnType<OwnProfile['newNote']>, contentTracker: any): void {
		// Skip completely empty paragraphs
		const hasContent = (token.tokens && token.tokens.some((t: any) => t.text && t.text.trim())) ||
						   (token.text && token.text.trim());
		
		if (!hasContent) {
			return;
		}
		
		// Skip paragraphs that only contain list markers or similar formatting-only content
		const text = token.text ? token.text.trim() : '';
		const isOnlyListMarker = /^([-*+]|\d+\.)\s*$/.test(text);
		
		if (isOnlyListMarker) {
			return;
		}
		
		let paragraphBuilder = noteBuilder.paragraph();
		
		// Process inline tokens within the paragraph
		if (token.tokens && token.tokens.length > 0) {
			paragraphBuilder = this.processInlineTokensStructured(token.tokens, paragraphBuilder);
		} else if (token.text) {
			paragraphBuilder = paragraphBuilder.text(token.text);
		}
		contentTracker.meaningfulNodesCreated++;
	}

	/**
	 * Process list token using structured approach (convert to separate paragraphs)
	 */
	private static processListStructured(token: any, noteBuilder: ReturnType<OwnProfile['newNote']>, contentTracker: any): void {
		if (!token.items) return;

		token.items.forEach((item: any, index: number) => {
			// Skip completely empty list items
			const hasContent = (item.tokens && item.tokens.some((t: any) => t.text && t.text.trim())) ||
							   (item.text && item.text.trim());
			
			if (!hasContent) {
				return;
			}
			
			// Check if we have meaningful content before creating a paragraph
			let actualContent = '';
			
			// Determine what content we would add
			if (item.tokens && item.tokens.length > 0) {
				const firstToken = item.tokens[0];
				if (firstToken && firstToken.tokens) {
					// Check if any inline tokens have non-empty text
					const meaningfulInlineTokens = firstToken.tokens.filter((t: any) => t.text && t.text.trim());
					if (meaningfulInlineTokens.length > 0) {
						actualContent = meaningfulInlineTokens.map((t: any) => t.text.trim()).join('');
					}
				} else if (firstToken && firstToken.text && firstToken.text.trim()) {
					actualContent = firstToken.text.trim();
				}
			} else if (item.text && item.text.trim()) {
				actualContent = item.text.trim();
			}
			
			// Only create paragraph if we have actual content
			if (!actualContent) {
				return; // Skip this list item entirely
			}
			
			let paragraphBuilder = noteBuilder.paragraph();
			
			// Add list marker
			if (token.ordered) {
				paragraphBuilder = paragraphBuilder.text(`${index + 1}. `);
			} else {
				paragraphBuilder = paragraphBuilder.text('• ');
			}
			
			// Process list item content
			if (item.tokens && item.tokens.length > 0) {
				// Process the first paragraph token from the list item
				const firstToken = item.tokens[0];
				if (firstToken && firstToken.tokens) {
					paragraphBuilder = this.processInlineTokensStructured(firstToken.tokens, paragraphBuilder);
				} else if (firstToken && firstToken.text) {
					paragraphBuilder = paragraphBuilder.text(firstToken.text);
				}
			} else if (item.text) {
				paragraphBuilder = paragraphBuilder.text(item.text);
			}
			contentTracker.meaningfulNodesCreated++;
		});
	}

	/**
	 * Process inline tokens (bold, italic, code, links, text) using structured approach
	 * Returns the final paragraph builder after chaining all method calls
	 */
	private static processInlineTokensStructured(tokens: any[], paragraphBuilder: ReturnType<ReturnType<OwnProfile['newNote']>['paragraph']>, isHeading: boolean = false): ReturnType<ReturnType<OwnProfile['newNote']>['paragraph']> {
		let currentBuilder = paragraphBuilder;
		
		for (const token of tokens) {
			// Skip completely empty tokens
			if (!token.text || !token.text.trim()) {
				continue;
			}
			
			switch (token.type) {
				case 'text':
					if (isHeading) {
						currentBuilder = currentBuilder.bold(token.text);
					} else {
						currentBuilder = currentBuilder.text(token.text);
					}
					break;
				case 'strong':
					currentBuilder = currentBuilder.bold(token.text);
					break;
				case 'em':
					currentBuilder = currentBuilder.italic(token.text);
					break;
				case 'codespan':
					currentBuilder = currentBuilder.code(token.text);
					break;
				case 'link':
					// Format links properly - add link text first, then URL in parentheses
					if (token.text) {
						currentBuilder = currentBuilder.text(`${token.text} (${token.href})`);
					} else {
						currentBuilder = currentBuilder.text(token.href);
					}
					break;
				default:
					// Fallback for unknown inline tokens
					if (token.text) {
						if (isHeading) {
							currentBuilder = currentBuilder.bold(token.text);
						} else {
							currentBuilder = currentBuilder.text(token.text);
						}
					}
					break;
			}
		}
		
		return currentBuilder;
	}
}