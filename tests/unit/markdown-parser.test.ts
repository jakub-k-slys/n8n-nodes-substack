import { MarkdownParser } from '../../nodes/Substack/MarkdownParser';

describe('MarkdownParser', () => {
	let mockNoteBuilder: any;
	let mockParagraphBuilder: any;

	beforeEach(() => {
		// Create mock paragraph builder
		mockParagraphBuilder = {
			text: jest.fn().mockReturnThis(),
			bold: jest.fn().mockReturnThis(),
			italic: jest.fn().mockReturnThis(),
			code: jest.fn().mockReturnThis(),
			paragraph: jest.fn().mockReturnThis(),
		};

		// Create mock note builder
		mockNoteBuilder = {
			paragraph: jest.fn().mockReturnValue(mockParagraphBuilder),
			publish: jest.fn().mockResolvedValue({ id: '12345' }),
		};
	});

	it('should throw error for empty markdown', () => {
		expect(() => {
			MarkdownParser.parseMarkdownToNote('', mockNoteBuilder);
		}).toThrow('Note body cannot be empty');

		expect(() => {
			MarkdownParser.parseMarkdownToNote('   ', mockNoteBuilder);
		}).toThrow('Note body cannot be empty');
	});

	it('should parse simple text paragraph', () => {
		const markdown = 'This is a simple paragraph.';
		
		MarkdownParser.parseMarkdownToNote(markdown, mockNoteBuilder);

		expect(mockNoteBuilder.paragraph).toHaveBeenCalled();
		expect(mockParagraphBuilder.text).toHaveBeenCalledWith('This is a simple paragraph.');
	});

	it('should parse headings as bold text', () => {
		const markdown = '## Hello World';
		
		MarkdownParser.parseMarkdownToNote(markdown, mockNoteBuilder);

		expect(mockNoteBuilder.paragraph).toHaveBeenCalled();
		expect(mockParagraphBuilder.bold).toHaveBeenCalledWith('Hello World');
	});

	it('should parse bold text', () => {
		const markdown = 'This is **bold text**.';
		
		MarkdownParser.parseMarkdownToNote(markdown, mockNoteBuilder);

		expect(mockNoteBuilder.paragraph).toHaveBeenCalled();
		expect(mockParagraphBuilder.text).toHaveBeenCalledWith('This is ');
		expect(mockParagraphBuilder.bold).toHaveBeenCalledWith('bold text');
		expect(mockParagraphBuilder.text).toHaveBeenCalledWith('.');
	});

	it('should parse italic text', () => {
		const markdown = 'This is *italic text*.';
		
		MarkdownParser.parseMarkdownToNote(markdown, mockNoteBuilder);

		expect(mockNoteBuilder.paragraph).toHaveBeenCalled();
		expect(mockParagraphBuilder.text).toHaveBeenCalledWith('This is ');
		expect(mockParagraphBuilder.italic).toHaveBeenCalledWith('italic text');
		expect(mockParagraphBuilder.text).toHaveBeenCalledWith('.');
	});

	it('should parse code text', () => {
		const markdown = 'This is `code text`.';
		
		MarkdownParser.parseMarkdownToNote(markdown, mockNoteBuilder);

		expect(mockNoteBuilder.paragraph).toHaveBeenCalled();
		expect(mockParagraphBuilder.text).toHaveBeenCalledWith('This is ');
		expect(mockParagraphBuilder.code).toHaveBeenCalledWith('code text');
		expect(mockParagraphBuilder.text).toHaveBeenCalledWith('.');
	});

	it('should parse links', () => {
		const markdown = 'Check out [n8n](https://n8n.io) for automation.';
		
		MarkdownParser.parseMarkdownToNote(markdown, mockNoteBuilder);

		expect(mockNoteBuilder.paragraph).toHaveBeenCalled();
		expect(mockParagraphBuilder.text).toHaveBeenCalledWith('Check out ');
		expect(mockParagraphBuilder.text).toHaveBeenCalledWith('n8n (https://n8n.io)');
		expect(mockParagraphBuilder.text).toHaveBeenCalledWith(' for automation.');
	});

	it('should parse unordered lists', () => {
		const markdown = `- First item
- Second item
- Third item`;
		
		MarkdownParser.parseMarkdownToNote(markdown, mockNoteBuilder);

		// Should create 3 paragraphs for the list items
		expect(mockNoteBuilder.paragraph).toHaveBeenCalledTimes(3);
		expect(mockParagraphBuilder.text).toHaveBeenCalledWith('• ');
		expect(mockParagraphBuilder.text).toHaveBeenCalledWith('First item');
		expect(mockParagraphBuilder.text).toHaveBeenCalledWith('Second item');
		expect(mockParagraphBuilder.text).toHaveBeenCalledWith('Third item');
	});

	it('should parse ordered lists', () => {
		const markdown = `1. First item
2. Second item
3. Third item`;
		
		MarkdownParser.parseMarkdownToNote(markdown, mockNoteBuilder);

		// Should create 3 paragraphs for the list items
		expect(mockNoteBuilder.paragraph).toHaveBeenCalledTimes(3);
		expect(mockParagraphBuilder.text).toHaveBeenCalledWith('1. ');
		expect(mockParagraphBuilder.text).toHaveBeenCalledWith('2. ');
		expect(mockParagraphBuilder.text).toHaveBeenCalledWith('3. ');
	});

	it('should parse text with bold, italic and link', () => {
		const markdown = 'This is a note with **bold**, *italic*, and a [link](https://n8n.io).';
		
		MarkdownParser.parseMarkdownToNote(markdown, mockNoteBuilder);

		expect(mockNoteBuilder.paragraph).toHaveBeenCalled();
		expect(mockParagraphBuilder.text).toHaveBeenCalledWith('This is a note with ');
		expect(mockParagraphBuilder.bold).toHaveBeenCalledWith('bold');
		expect(mockParagraphBuilder.text).toHaveBeenCalledWith(', ');
		expect(mockParagraphBuilder.italic).toHaveBeenCalledWith('italic');
		expect(mockParagraphBuilder.text).toHaveBeenCalledWith(', and a ');
		expect(mockParagraphBuilder.text).toHaveBeenCalledWith('link (https://n8n.io)');
		expect(mockParagraphBuilder.text).toHaveBeenCalledWith('.');
	});

	it('should parse complex markdown with multiple formats', () => {
		const markdown = `## Hello from n8n

This is a note with **bold**, *italic*, and a [link](https://n8n.io).

- First bullet point
- Second bullet point

1. Numbered item
2. Another numbered item`;
		
		MarkdownParser.parseMarkdownToNote(markdown, mockNoteBuilder);

		// Should handle all the different elements
		expect(mockNoteBuilder.paragraph).toHaveBeenCalled();
		expect(mockParagraphBuilder.bold).toHaveBeenCalledWith('Hello from n8n');
		expect(mockParagraphBuilder.bold).toHaveBeenCalledWith('bold');
		expect(mockParagraphBuilder.italic).toHaveBeenCalledWith('italic');
		
		// Check that the link was processed
		expect(mockParagraphBuilder.text).toHaveBeenCalledWith('This is a note with ');
		expect(mockParagraphBuilder.text).toHaveBeenCalledWith(', ');
		expect(mockParagraphBuilder.text).toHaveBeenCalledWith(', and a ');
		expect(mockParagraphBuilder.text).toHaveBeenCalledWith('link (https://n8n.io)');
		expect(mockParagraphBuilder.text).toHaveBeenCalledWith('.');
		
		// Check list markers
		expect(mockParagraphBuilder.text).toHaveBeenCalledWith('• ');
		expect(mockParagraphBuilder.text).toHaveBeenCalledWith('1. ');
	});
});