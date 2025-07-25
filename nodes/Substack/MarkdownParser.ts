import { marked } from 'marked';

/**
 * Markdown parser for Substack notes using the marked library
 * Supports: headings, bold, italic, code, links, lists
 */
export class MarkdownParser {
	/**
	 * Parse markdown text and apply it to a NoteBuilder using structured approach
	 */
	static parseMarkdownToNoteStructured(markdown: string, noteBuilder: any): any {
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
		this.processTokensStructured(tokens, noteBuilder);

		return noteBuilder;
	}

	/**
	 * Legacy method for backward compatibility
	 */
	static parseMarkdownToNote(markdown: string, noteBuilder: any): any {
		return this.parseMarkdownToNoteStructured(markdown, noteBuilder);
	}

	/**
	 * Process marked tokens and convert to structured NoteBuilder calls
	 */
	private static processTokensStructured(tokens: any[], noteBuilder: any): void {
		for (const token of tokens) {
			switch (token.type) {
				case 'heading':
					this.processHeadingStructured(token, noteBuilder);
					break;
				case 'paragraph':
					this.processParagraphStructured(token, noteBuilder);
					break;
				case 'list':
					this.processListStructured(token, noteBuilder);
					break;
				case 'space':
					// Skip empty space tokens
					break;
				default:
					// Handle other token types as paragraphs
					if (token.text) {
						const paragraphBuilder = noteBuilder.newNode().paragraph();
						paragraphBuilder.text(token.text);
					}
					break;
			}
		}
	}

	/**
	 * Process heading token using structured approach
	 */
	private static processHeadingStructured(token: any, noteBuilder: any): void {
		const paragraphBuilder = noteBuilder.newNode().paragraph();
		// Process inline tokens within the heading
		if (token.tokens && token.tokens.length > 0) {
			this.processInlineTokensStructured(token.tokens, paragraphBuilder, true);
		} else if (token.text) {
			paragraphBuilder.bold(token.text);
		}
	}

	/**
	 * Process paragraph token using structured approach
	 */
	private static processParagraphStructured(token: any, noteBuilder: any): void {
		// Skip completely empty paragraphs
		const hasContent = (token.tokens && token.tokens.some((t: any) => t.text)) ||
						   (token.text);
		
		if (!hasContent) {
			return;
		}
		
		const paragraphBuilder = noteBuilder.newNode().paragraph();
		
		// Process inline tokens within the paragraph
		if (token.tokens && token.tokens.length > 0) {
			this.processInlineTokensStructured(token.tokens, paragraphBuilder);
		} else if (token.text) {
			paragraphBuilder.text(token.text);
		}
	}

	/**
	 * Process list token using structured approach (convert to separate paragraphs)
	 */
	private static processListStructured(token: any, noteBuilder: any): void {
		if (!token.items) return;

		token.items.forEach((item: any, index: number) => {
			// Skip completely empty list items
			const hasContent = (item.tokens && item.tokens.some((t: any) => t.text)) ||
							   (item.text);
			
			if (!hasContent) {
				return;
			}
			
			const paragraphBuilder = noteBuilder.newNode().paragraph();
			
			// Add list marker
			if (token.ordered) {
				paragraphBuilder.text(`${index + 1}. `);
			} else {
				paragraphBuilder.text('• ');
			}
			
			// Process list item content
			if (item.tokens && item.tokens.length > 0) {
				// Process the first paragraph token from the list item
				const firstToken = item.tokens[0];
				if (firstToken && firstToken.tokens) {
					this.processInlineTokensStructured(firstToken.tokens, paragraphBuilder);
				} else if (firstToken && firstToken.text) {
					paragraphBuilder.text(firstToken.text);
				}
			} else if (item.text) {
				paragraphBuilder.text(item.text);
			}
		});
	}

	/**
	 * Process inline tokens (bold, italic, code, links, text) using structured approach
	 */
	private static processInlineTokensStructured(tokens: any[], paragraphBuilder: any, isHeading: boolean = false): void {
		for (const token of tokens) {
			// Skip completely empty tokens
			if (!token.text) {
				continue;
			}
			
			switch (token.type) {
				case 'text':
					if (isHeading) {
						paragraphBuilder.bold(token.text);
					} else {
						paragraphBuilder.text(token.text);
					}
					break;
				case 'strong':
					paragraphBuilder.bold(token.text);
					break;
				case 'em':
					paragraphBuilder.italic(token.text);
					break;
				case 'codespan':
					paragraphBuilder.code(token.text);
					break;
				case 'link':
					// Format links properly - add link text first, then URL in parentheses
					if (token.text) {
						paragraphBuilder.text(`${token.text} (${token.href})`);
					} else {
						paragraphBuilder.text(token.href);
					}
					break;
				default:
					// Fallback for unknown inline tokens
					if (token.text) {
						if (isHeading) {
							paragraphBuilder.bold(token.text);
						} else {
							paragraphBuilder.text(token.text);
						}
					}
					break;
			}
		}
	}
}