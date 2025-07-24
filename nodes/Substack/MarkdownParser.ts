const marked = require('marked');

/**
 * Markdown parser for Substack notes using the marked library
 * Supports: headings, bold, italic, code, links, lists
 */
export class MarkdownParser {
	/**
	 * Parse markdown text and apply it to a NoteBuilder
	 */
	static parseMarkdownToNote(markdown: string, noteBuilder: any): any {
		if (!markdown.trim()) {
			throw new Error('Note body cannot be empty');
		}

		// Parse markdown into tokens using marked
		const tokens = marked.lexer(markdown);
		
		// Process each token and convert to NoteBuilder calls
		this.processTokens(tokens, noteBuilder);

		return noteBuilder;
	}

	/**
	 * Process marked tokens and convert to NoteBuilder calls
	 */
	private static processTokens(tokens: any[], noteBuilder: any): void {
		for (const token of tokens) {
			switch (token.type) {
				case 'heading':
					this.processHeading(token, noteBuilder);
					break;
				case 'paragraph':
					this.processParagraph(token, noteBuilder);
					break;
				case 'list':
					this.processList(token, noteBuilder);
					break;
				case 'space':
					// Skip empty space tokens
					break;
				default:
					// Handle other token types as paragraphs
					if (token.text) {
						const paragraphBuilder = noteBuilder.paragraph();
						paragraphBuilder.text(token.text);
					}
					break;
			}
		}
	}

	/**
	 * Process heading token
	 */
	private static processHeading(token: any, noteBuilder: any): void {
		const paragraphBuilder = noteBuilder.paragraph();
		// Process inline tokens within the heading
		if (token.tokens && token.tokens.length > 0) {
			this.processInlineTokens(token.tokens, paragraphBuilder, true);
		} else {
			paragraphBuilder.bold(token.text || '');
		}
	}

	/**
	 * Process paragraph token
	 */
	private static processParagraph(token: any, noteBuilder: any): void {
		const paragraphBuilder = noteBuilder.paragraph();
		
		// Process inline tokens within the paragraph
		if (token.tokens && token.tokens.length > 0) {
			this.processInlineTokens(token.tokens, paragraphBuilder);
		} else {
			paragraphBuilder.text(token.text || '');
		}
	}

	/**
	 * Process list token
	 */
	private static processList(token: any, noteBuilder: any): void {
		if (!token.items) return;

		token.items.forEach((item: any, index: number) => {
			const paragraphBuilder = noteBuilder.paragraph();
			
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
					this.processInlineTokens(firstToken.tokens, paragraphBuilder);
				} else if (firstToken && firstToken.text) {
					paragraphBuilder.text(firstToken.text);
				}
			} else if (item.text) {
				paragraphBuilder.text(item.text);
			}
		});
	}

	/**
	 * Process inline tokens (bold, italic, code, links, text)
	 */
	private static processInlineTokens(tokens: any[], paragraphBuilder: any, isHeading: boolean = false): void {
		for (const token of tokens) {
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
					// Format links as "text (url)"
					paragraphBuilder.text(`${token.text} (${token.href})`);
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