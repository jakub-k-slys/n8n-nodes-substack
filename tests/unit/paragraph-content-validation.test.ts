import { MarkdownParser } from '../../nodes/Substack/MarkdownParser';

describe('Builder Pattern Content Validation Bug - Issue #94', () => {
	let mockNoteBuilder: any;
	let mockParagraphBuilder: any;

	beforeEach(() => {
		// Create mock paragraph builder that tracks whether content was added
		mockParagraphBuilder = {
			text: jest.fn().mockReturnThis(),
			bold: jest.fn().mockReturnThis(),
			italic: jest.fn().mockReturnThis(),
			code: jest.fn().mockReturnThis(),
			// Track if any content was actually added
			_hasContent: false,
		};

		// Override methods to track content addition
		mockParagraphBuilder.text = jest.fn().mockImplementation((content: string) => {
			if (content && content.trim()) {
				mockParagraphBuilder._hasContent = true;
			}
			return mockParagraphBuilder;
		});

		mockParagraphBuilder.bold = jest.fn().mockImplementation((content: string) => {
			if (content && content.trim()) {
				mockParagraphBuilder._hasContent = true;
			}
			return mockParagraphBuilder;
		});

		mockParagraphBuilder.italic = jest.fn().mockImplementation((content: string) => {
			if (content && content.trim()) {
				mockParagraphBuilder._hasContent = true;
			}
			return mockParagraphBuilder;
		});

		mockParagraphBuilder.code = jest.fn().mockImplementation((content: string) => {
			if (content && content.trim()) {
				mockParagraphBuilder._hasContent = true;
			}
			return mockParagraphBuilder;
		});

		// Create mock note builder
		mockNoteBuilder = {
			paragraph: jest.fn().mockReturnValue(mockParagraphBuilder),
			publish: jest.fn().mockResolvedValue({ id: '12345' }),
		};
	});

	describe('Reproducing the paragraph content validation issue', () => {
		it('should throw error when markdown creates paragraphs but they have no actual content', () => {
			// This markdown will create paragraph tokens but with no meaningful text
			const problematicMarkdown = `
				
				
			`;
			
			expect(() => {
				MarkdownParser.parseMarkdownToNoteStructured(problematicMarkdown, mockNoteBuilder);
			}).toThrow('Note body cannot be empty - at least one paragraph with content is required');
		});

		it('should throw error when markdown has only empty formatting elements', () => {
			// This markdown creates structure but no content
			const emptyFormattingMarkdown = `****    **`;
			
			expect(() => {
				MarkdownParser.parseMarkdownToNoteStructured(emptyFormattingMarkdown, mockNoteBuilder);
			}).toThrow('Note must contain at least one paragraph with actual content');
		});

		it('should throw error when markdown creates paragraph with only whitespace text', () => {
			// This could potentially create a paragraph().text('   ') which would fail in Substack API
			const whitespaceMarkdown = `   
			
				   `;
			
			expect(() => {
				MarkdownParser.parseMarkdownToNoteStructured(whitespaceMarkdown, mockNoteBuilder);
			}).toThrow('Note body cannot be empty - at least one paragraph with content is required');
		});

		it('should handle mixed content where some paragraphs are empty but at least one has content', () => {
			// This should succeed because it has at least one meaningful paragraph
			const mixedMarkdown = `
			
			This is actual content.
			
			   
			`;
			
			// Should not throw
			expect(() => {
				MarkdownParser.parseMarkdownToNoteStructured(mixedMarkdown, mockNoteBuilder);
			}).not.toThrow();
			
			// Should have created at least one paragraph with content
			expect(mockNoteBuilder.paragraph).toHaveBeenCalled();
			expect(mockParagraphBuilder.text).toHaveBeenCalledWith('This is actual content.');
		});

		it('should prevent creation of paragraphs that would cause Substack API to fail', () => {
			// Test various scenarios that could create "empty" paragraphs
			const scenarios = [
				'', // completely empty
				'   ', // whitespace only
				'\n\n\n', // newlines only
				'\t\t', // tabs only
			];

			scenarios.forEach(markdown => {
				// Reset the mock
				jest.clearAllMocks();
				mockParagraphBuilder._hasContent = false;

				// These should all throw before creating any paragraphs
				expect(() => {
					MarkdownParser.parseMarkdownToNoteStructured(markdown, mockNoteBuilder);
				}).toThrow();

				// No paragraphs should have been created
				expect(mockNoteBuilder.paragraph).not.toHaveBeenCalled();
			});
		});
	});

	describe('Validation after processing', () => {
		it('should validate that created paragraphs actually have content', () => {
			// Test with markdown that might slip through initial validation but create empty paragraphs
			const validMarkdown = 'This has actual content.';
			
			// Should work fine
			expect(() => {
				MarkdownParser.parseMarkdownToNoteStructured(validMarkdown, mockNoteBuilder);
			}).not.toThrow();
			
			// Should have created paragraph with actual content
			expect(mockNoteBuilder.paragraph).toHaveBeenCalled();
			expect(mockParagraphBuilder._hasContent).toBe(true);
		});
	});
});