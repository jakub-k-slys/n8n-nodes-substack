// Mock for marked library to handle ES module import issues
module.exports = {
	marked: {
		lexer: jest.fn().mockImplementation((markdown) => {
			// Simple mock that returns tokens based on markdown input
			if (!markdown.trim()) return [];
			
			const tokens = [];
			
			// Split by paragraphs and process each one
			const paragraphs = markdown.split('\n\n').filter(p => p.trim());
			
			for (const paragraph of paragraphs) {
				const trimmed = paragraph.trim();
				
				// Skip HR, comments, and other non-content elements
				if (trimmed.startsWith('---') || trimmed.startsWith('<!--') || trimmed === '') {
					continue;
				}
				
				// If this paragraph contains multiple lines with headings or list items, process each line separately
				if (trimmed.includes('\n') && (trimmed.match(/^#+/gm) || trimmed.match(/^[-*\d]/gm))) {
					const lines = trimmed.split('\n');
					for (const line of lines) {
						const lineText = line.trim();
						if (!lineText) continue;
						
						if (lineText.startsWith('#')) {
							// Heading
							const text = lineText.replace(/^#+\s*/, '');
							if (text.trim()) { // Only add if there's actual text content
								tokens.push({
									type: 'heading',
									text: text,
									tokens: [{ type: 'text', text: text }]
								});
							}
						} else if (lineText.startsWith('-') || lineText.startsWith('*') || /^\d+\./.test(lineText)) {
							// Single list item
							const text = lineText.replace(/^[-*\d+.]\s*/, '').trim();
							if (text) { // Only add if there's actual text content
								tokens.push({
									type: 'list',
									items: [{
										text: text,
										tokens: [{
											tokens: [{ type: 'text', text: text }]
										}]
									}],
									ordered: /^\d+\./.test(lineText)
								});
							} else {
								// Empty list marker - treat as paragraph (like real marked would)
								tokens.push({
									type: 'paragraph',
									text: lineText,
									tokens: [{ type: 'text', text: lineText }]
								});
							}
						}
					}
				} else if (trimmed.startsWith('#')) {
					// Heading
					const text = trimmed.replace(/^#+\s*/, '');
					if (text.trim()) { // Only add if there's actual text content
						tokens.push({
							type: 'heading',
							text: text,
							tokens: [{ type: 'text', text: text }]
						});
					}
				} else if (trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+\./.test(trimmed)) {
					// List
					const items = trimmed.split('\n').map(line => {
						const text = line.replace(/^[-*\d+.]\s*/, '').trim();
						return {
							text: text,
							tokens: text ? [{
								tokens: [{ type: 'text', text: text }]
							}] : []
						};
					}).filter(item => item.text); // Only include items with actual text
					
					if (items.length > 0) { // Only add list if it has valid items
						tokens.push({
							type: 'list',
							items: items,
							ordered: /^\d+\./.test(trimmed)
						});
					} else {
						// All list items were empty - treat as paragraph (like real marked would)
						tokens.push({
							type: 'paragraph',
							text: trimmed,
							tokens: [{ type: 'text', text: trimmed }]
						});
					}
				} else {
					// Regular paragraph
					const inlineTokens = [];
					
					// Simple parsing for inline elements
					let remaining = trimmed;
					let position = 0;
					
					while (position < remaining.length) {
						// Bold text
						const boldMatch = remaining.substring(position).match(/^\*\*([^*]+)\*\*/);
						if (boldMatch) {
							if (boldMatch.index > 0) {
								inlineTokens.push({
									type: 'text',
									text: remaining.substring(position, position + boldMatch.index)
								});
							}
							inlineTokens.push({
								type: 'strong',
								text: boldMatch[1]
							});
							position += boldMatch.index + boldMatch[0].length;
							continue;
						}
						
						// Italic text
						const italicMatch = remaining.substring(position).match(/^\*([^*]+)\*/);
						if (italicMatch) {
							if (italicMatch.index > 0) {
								inlineTokens.push({
									type: 'text',
									text: remaining.substring(position, position + italicMatch.index)
								});
							}
							inlineTokens.push({
								type: 'em',
								text: italicMatch[1]
							});
							position += italicMatch.index + italicMatch[0].length;
							continue;
						}
						
						// Code text
						const codeMatch = remaining.substring(position).match(/^`([^`]+)`/);
						if (codeMatch) {
							if (codeMatch.index > 0) {
								inlineTokens.push({
									type: 'text',
									text: remaining.substring(position, position + codeMatch.index)
								});
							}
							inlineTokens.push({
								type: 'codespan',
								text: codeMatch[1]
							});
							position += codeMatch.index + codeMatch[0].length;
							continue;
						}
						
						// Link
						const linkMatch = remaining.substring(position).match(/^\[([^\]]+)\]\(([^)]+)\)/);
						if (linkMatch) {
							if (linkMatch.index > 0) {
								inlineTokens.push({
									type: 'text',
									text: remaining.substring(position, position + linkMatch.index)
								});
							}
							inlineTokens.push({
								type: 'link',
								text: linkMatch[1],
								href: linkMatch[2]
							});
							position += linkMatch.index + linkMatch[0].length;
							continue;
						}
						
						// Regular text - find next special character or end
						const nextSpecial = remaining.substring(position).search(/[\*`\[]/);
						if (nextSpecial === -1) {
							// No more special characters, take rest of string
							inlineTokens.push({
								type: 'text',
								text: remaining.substring(position)
							});
							break;
						} else {
							// Take text up to next special character
							if (nextSpecial > 0) {
								inlineTokens.push({
									type: 'text',
									text: remaining.substring(position, position + nextSpecial)
								});
								position += nextSpecial;
							} else {
								// Special character at current position but no match found, treat as regular text
								inlineTokens.push({
									type: 'text',
									text: remaining.charAt(position)
								});
								position += 1;
							}
						}
					}
					
					if (inlineTokens.length > 0) { // Only add paragraph if it has content
						tokens.push({
							type: 'paragraph',
							text: trimmed,
							tokens: inlineTokens
						});
					}
				}
			}
			
			return tokens;
		})
	}
};