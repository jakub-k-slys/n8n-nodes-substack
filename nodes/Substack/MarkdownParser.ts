/**
 * Simple markdown parser for Substack notes
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

		const lines = markdown.split('\n');
		let i = 0;

		while (i < lines.length) {
			const line = lines[i];
			
			if (!line.trim()) {
				// Skip empty lines
				i++;
				continue;
			}

			if (this.isHeading(line)) {
				this.processHeading(line, noteBuilder);
			} else if (this.isUnorderedListItem(line)) {
				i = this.processUnorderedList(lines, i, noteBuilder);
				continue; // i is already incremented in processUnorderedList
			} else if (this.isOrderedListItem(line)) {
				i = this.processOrderedList(lines, i, noteBuilder);
				continue; // i is already incremented in processOrderedList
			} else {
				// Regular paragraph
				this.processParagraph(line, noteBuilder);
			}
			
			i++;
		}

		return noteBuilder;
	}

	/**
	 * Check if line is a heading
	 */
	private static isHeading(line: string): boolean {
		return /^#{1,6}\s+/.test(line.trim());
	}

	/**
	 * Check if line is an unordered list item
	 */
	private static isUnorderedListItem(line: string): boolean {
		return /^[\s]*[-*+]\s+/.test(line);
	}

	/**
	 * Check if line is an ordered list item
	 */
	private static isOrderedListItem(line: string): boolean {
		return /^[\s]*\d+\.\s+/.test(line);
	}

	/**
	 * Process heading and add to note builder
	 */
	private static processHeading(line: string, noteBuilder: any): void {
		const headingText = line.replace(/^#{1,6}\s+/, '').trim();
		const paragraphBuilder = noteBuilder.paragraph();
		paragraphBuilder.bold(headingText);
	}

	/**
	 * Process unordered list starting from current line
	 */
	private static processUnorderedList(lines: string[], startIndex: number, noteBuilder: any): number {
		let i = startIndex;
		
		while (i < lines.length && this.isUnorderedListItem(lines[i])) {
			const listItemText = lines[i].replace(/^[\s]*[-*+]\s+/, '').trim();
			const paragraphBuilder = noteBuilder.paragraph();
			
			paragraphBuilder.text('• ');
			this.processInlineText(listItemText, paragraphBuilder);
			
			i++;
		}
		
		return i; // Return the next line to process
	}

	/**
	 * Process ordered list starting from current line
	 */
	private static processOrderedList(lines: string[], startIndex: number, noteBuilder: any): number {
		let i = startIndex;
		let listNumber = 1;
		
		while (i < lines.length && this.isOrderedListItem(lines[i])) {
			const listItemText = lines[i].replace(/^[\s]*\d+\.\s+/, '').trim();
			const paragraphBuilder = noteBuilder.paragraph();
			
			paragraphBuilder.text(`${listNumber}. `);
			this.processInlineText(listItemText, paragraphBuilder);
			
			i++;
			listNumber++;
		}
		
		return i; // Return the next line to process
	}

	/**
	 * Process regular paragraph
	 */
	private static processParagraph(line: string, noteBuilder: any): void {
		const paragraphBuilder = noteBuilder.paragraph();
		this.processInlineText(line.trim(), paragraphBuilder);
	}

	/**
	 * Process inline formatting (bold, italic, code, links)
	 */
	private static processInlineText(text: string, paragraphBuilder: any): void {
		let currentIndex = 0;
		
		while (currentIndex < text.length) {
			// Find the next formatting marker
			const remainingText = text.slice(currentIndex);
			
			// Look for patterns - order matters for precedence
			const linkMatch = remainingText.match(/\[([^\]]+)\]\(([^)]+)\)/);
			const boldMatch = remainingText.match(/\*\*([^*]+)\*\*/);
			const codeMatch = remainingText.match(/`([^`]+)`/);
			const italicMatch = remainingText.match(/\*([^*]+)\*/);
			
			// Find which marker comes first
			const markers = [];
			
			if (linkMatch) {
				markers.push({ 
					match: linkMatch, 
					type: 'link', 
					start: currentIndex + remainingText.indexOf(linkMatch[0]),
					length: linkMatch[0].length,
					content: linkMatch[1],
					url: linkMatch[2]
				});
			}
			
			if (boldMatch) {
				markers.push({ 
					match: boldMatch, 
					type: 'bold', 
					start: currentIndex + remainingText.indexOf(boldMatch[0]),
					length: boldMatch[0].length,
					content: boldMatch[1]
				});
			}
			
			if (codeMatch) {
				markers.push({ 
					match: codeMatch, 
					type: 'code', 
					start: currentIndex + remainingText.indexOf(codeMatch[0]),
					length: codeMatch[0].length,
					content: codeMatch[1]
				});
			}
			
			if (italicMatch) {
				// Only add italic if it's not part of a bold pattern
				const italicStart = remainingText.indexOf(italicMatch[0]);
				const isBoldConflict = boldMatch && Math.abs(remainingText.indexOf(boldMatch[0]) - italicStart) < 3;
				
				if (!isBoldConflict) {
					markers.push({ 
						match: italicMatch, 
						type: 'italic', 
						start: currentIndex + italicStart,
						length: italicMatch[0].length,
						content: italicMatch[1]
					});
				}
			}
			
			if (markers.length === 0) {
				// No more formatting, add remaining text
				paragraphBuilder.text(text.slice(currentIndex));
				break;
			}
			
			// Sort by start position
			markers.sort((a, b) => a.start - b.start);
			const nextMarker = markers[0];
			
			// Add text before the marker
			if (nextMarker.start > currentIndex) {
				paragraphBuilder.text(text.slice(currentIndex, nextMarker.start));
			}
			
			// Process the marker
			switch (nextMarker.type) {
				case 'bold':
					paragraphBuilder.bold(nextMarker.content);
					break;
				case 'italic':
					paragraphBuilder.italic(nextMarker.content);
					break;
				case 'code':
					paragraphBuilder.code(nextMarker.content);
					break;
				case 'link':
					paragraphBuilder.text(`${nextMarker.content} (${nextMarker.url})`);
					break;
			}
			
			currentIndex = nextMarker.start + nextMarker.length;
		}
	}
}