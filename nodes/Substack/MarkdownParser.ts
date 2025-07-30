import { marked } from 'marked';
import type { OwnProfile } from 'substack-api';

// Configure marked library
marked.setOptions({
	gfm: true,
	breaks: false
});

// Helper function to decode HTML entities
function decodeHtmlEntities(text: string): string {
	const entityMap: Record<string, string> = {
		'&#39;': "'",
		'&quot;': '"',
		'&amp;': '&',
		'&lt;': '<',
		'&gt;': '>',
		'&nbsp;': ' '
	};
	
	return text.replace(/&#?\w+;/g, (entity) => entityMap[entity] || entity);
}

/**
 * Markdown parser for Substack notes using the marked library
 * Supports: headings, bold, italic, code, links, lists
 */
export class MarkdownParser {
	/**
	 * Parse markdown text and apply it to a NoteBuilder using structured approach
	 * Returns the final ParagraphBuilder with all content applied (handles immutable builders)
	 */
	static parseMarkdownToNoteStructured(markdown: string, noteBuilder: ReturnType<OwnProfile['newNote']>): ReturnType<ReturnType<OwnProfile['newNote']>['paragraph']> {
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
		
		// Process each token and convert to structured ParagraphBuilder calls
		// Track the current builder as it gets updated with each immutable operation
		const contentTracker = { meaningfulNodesCreated: 0 };
		let currentBuilder: ReturnType<ReturnType<OwnProfile['newNote']>['paragraph']> | null = null;
		currentBuilder = this.processTokensStructured(tokens, noteBuilder, contentTracker);
		
		// Validate that we actually created some meaningful content
		if (contentTracker.meaningfulNodesCreated === 0) {
			throw new Error('Note must contain at least one paragraph with actual content');
		}

		if (!currentBuilder) {
			throw new Error('Failed to create note content');
		}

		return currentBuilder;
	}

	/**
	 * Legacy method for backward compatibility
	 */
	static parseMarkdownToNote(markdown: string, noteBuilder: ReturnType<OwnProfile['newNote']>): ReturnType<ReturnType<OwnProfile['newNote']>['paragraph']> {
		return this.parseMarkdownToNoteStructured(markdown, noteBuilder);
	}

	/**
	 * Process marked tokens and convert to structured ParagraphBuilder calls
	 * Returns the final ParagraphBuilder with all content applied (handles immutable builders)
	 */
	private static processTokensStructured(tokens: any[], noteBuilder: ReturnType<OwnProfile['newNote']>, contentTracker: any): ReturnType<ReturnType<OwnProfile['newNote']>['paragraph']> | null {
		let currentBuilder: ReturnType<ReturnType<OwnProfile['newNote']>['paragraph']> | null = null;
		
		for (const token of tokens) {
			let newBuilder: ReturnType<ReturnType<OwnProfile['newNote']>['paragraph']> | null = null;
			
			switch (token.type) {
				case 'heading':
					newBuilder = this.processHeadingStructured(token, noteBuilder, currentBuilder, contentTracker);
					break;
				case 'paragraph':
					newBuilder = this.processParagraphStructured(token, noteBuilder, currentBuilder, contentTracker);
					break;
				case 'list':
					newBuilder = this.processListStructured(token, noteBuilder, currentBuilder, contentTracker);
					break;
				case 'space':
					// Skip empty space tokens
					break;
				default:
					// Handle other token types as paragraphs
					if (token.text) {
						const decodedText = decodeHtmlEntities(token.text);
						if (currentBuilder) {
							newBuilder = currentBuilder.paragraph().text(decodedText);
						} else {
							newBuilder = noteBuilder.paragraph().text(decodedText);
						}
						contentTracker.meaningfulNodesCreated++;
					}
					break;
			}
			
			// Only update currentBuilder if we got a valid new builder
			if (newBuilder) {
				currentBuilder = newBuilder;
			}
		}
		
		return currentBuilder;
	}

	/**
	 * Process heading token using structured approach
	 * Returns the final ParagraphBuilder with content applied (handles immutable builders)
	 */
	private static processHeadingStructured(token: any, noteBuilder: ReturnType<OwnProfile['newNote']>, currentBuilder: ReturnType<ReturnType<OwnProfile['newNote']>['paragraph']> | null, contentTracker: any): ReturnType<ReturnType<OwnProfile['newNote']>['paragraph']> | null {
		// Skip completely empty headings
		const hasContent = (token.tokens && token.tokens.some((t: any) => t.text && t.text.trim())) ||
						   (token.text && token.text.trim());
		
		if (!hasContent) {
			// Return current builder without creating new paragraphs for empty headings
			return currentBuilder;
		}
		
		// Create new paragraph properly: if we have currentBuilder, call paragraph() on it, otherwise start from noteBuilder
		let paragraphBuilder = currentBuilder ? currentBuilder.paragraph() : noteBuilder.paragraph();
		
		// Process inline tokens within the heading
		if (token.tokens && token.tokens.length > 0) {
			paragraphBuilder = this.processInlineTokensStructured(token.tokens, paragraphBuilder, true);
		} else if (token.text) {
			paragraphBuilder = paragraphBuilder.bold(decodeHtmlEntities(token.text));
		}
		contentTracker.meaningfulNodesCreated++;
		
		return paragraphBuilder;
	}

	/**
	 * Process paragraph token using structured approach
	 * Returns the final ParagraphBuilder with content applied (handles immutable builders)
	 */
	private static processParagraphStructured(token: any, noteBuilder: ReturnType<OwnProfile['newNote']>, currentBuilder: ReturnType<ReturnType<OwnProfile['newNote']>['paragraph']> | null, contentTracker: any): ReturnType<ReturnType<OwnProfile['newNote']>['paragraph']> | null {
		// Skip completely empty paragraphs
		const hasContent = (token.tokens && token.tokens.some((t: any) => t.text && t.text.trim())) ||
						   (token.text && token.text.trim());
		
		if (!hasContent) {
			// Return current builder without creating new paragraphs for empty content
			return currentBuilder;
		}
		
		// Skip paragraphs that only contain list markers or similar formatting-only content
		const text = token.text ? token.text.trim() : '';
		const normalizedText = text.replace(/\s+/g, ' ').trim();
		
		// Check for various empty-content patterns
		const isOnlyListMarkers = /^([-*+]|(\d+\.))+(\s*([-*+]|(\d+\.)))*$/.test(normalizedText);
		const isEmptyListMarkers = normalizedText === '- * 1.' || /^[-*+\d.\s]+$/.test(normalizedText);
		
		if (isOnlyListMarkers || isEmptyListMarkers) {
			return currentBuilder;
		}
		
		// Create new paragraph properly: if we have currentBuilder, call paragraph() on it, otherwise start from noteBuilder
		let paragraphBuilder = currentBuilder ? currentBuilder.paragraph() : noteBuilder.paragraph();
		
		// Process inline tokens within the paragraph
		if (token.tokens && token.tokens.length > 0) {
			paragraphBuilder = this.processInlineTokensStructured(token.tokens, paragraphBuilder);
		} else if (token.text) {
			paragraphBuilder = paragraphBuilder.text(decodeHtmlEntities(token.text));
		}
		contentTracker.meaningfulNodesCreated++;
		
		return paragraphBuilder;
	}

	/**
	 * Process list token using structured approach (convert to separate paragraphs)
	 * Returns the final ParagraphBuilder with content applied (handles immutable builders)
	 */
	private static processListStructured(token: any, noteBuilder: ReturnType<OwnProfile['newNote']>, currentBuilder: ReturnType<ReturnType<OwnProfile['newNote']>['paragraph']> | null, contentTracker: any): ReturnType<ReturnType<OwnProfile['newNote']>['paragraph']> | null {
		if (!token.items) return currentBuilder;

		let finalBuilder = currentBuilder;
		let listItemNumber = 1; // Track ordered list numbering separately

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
			
			// Create each list item as a separate paragraph properly
			// For the first item, use finalBuilder, otherwise create new paragraph from the previous one
			let paragraphBuilder = finalBuilder ? finalBuilder.paragraph() : noteBuilder.paragraph();
			
			// Add list marker
			if (token.ordered) {
				paragraphBuilder = paragraphBuilder.text(`${listItemNumber}. `);
				listItemNumber++; // Increment for next item
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
					paragraphBuilder = paragraphBuilder.text(decodeHtmlEntities(firstToken.text));
				}
			} else if (item.text) {
				paragraphBuilder = paragraphBuilder.text(decodeHtmlEntities(item.text));
			}
			contentTracker.meaningfulNodesCreated++;
			
			// Track the final paragraph builder (the last one created)
			finalBuilder = paragraphBuilder;
		});
		
		return finalBuilder;
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
					const decodedText = decodeHtmlEntities(token.text);
					if (isHeading) {
						currentBuilder = currentBuilder.bold(decodedText);
					} else {
						currentBuilder = currentBuilder.text(decodedText);
					}
					break;
				case 'strong':
					currentBuilder = currentBuilder.bold(decodeHtmlEntities(token.text));
					break;
				case 'em':
					currentBuilder = currentBuilder.italic(decodeHtmlEntities(token.text));
					break;
				case 'codespan':
					currentBuilder = currentBuilder.code(decodeHtmlEntities(token.text));
					break;
				case 'link':
					// Format links properly - add link text first, then URL in parentheses
					if (token.text) {
						const decodedLinkText = decodeHtmlEntities(token.text);
						currentBuilder = currentBuilder.text(`${decodedLinkText} (${token.href})`);
					} else {
						currentBuilder = currentBuilder.text(token.href);
					}
					break;
				default:
					// Fallback for unknown inline tokens
					if (token.text) {
						const decodedFallbackText = decodeHtmlEntities(token.text);
						if (isHeading) {
							currentBuilder = currentBuilder.bold(decodedFallbackText);
						} else {
							currentBuilder = currentBuilder.text(decodedFallbackText);
						}
					}
					break;
			}
		}
		
		return currentBuilder;
	}
}