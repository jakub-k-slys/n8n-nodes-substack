import { MarkdownParser } from '../../nodes/Substack/MarkdownParser';

// Import real substack-api
const { SubstackClient, OwnProfile } = jest.requireActual('substack-api');

// Mock only SubstackClient constructor
jest.mock('substack-api', () => ({
	...jest.requireActual('substack-api'),
	SubstackClient: jest.fn(),
}));

describe('MarkdownParser - Real NoteBuilder', () => {
	let capturedPayload: any = null;
	let mockSubstackClient: any;
	let mockHttpClient: any;

	beforeEach(() => {
		jest.clearAllMocks();
		capturedPayload = null;

		// Create mocked HTTP client to capture payloads
		mockHttpClient = {
			post: jest.fn().mockImplementation(async (url: string, data: any) => {
				capturedPayload = data;
				return {
					id: 12345,
					body: 'Test note body',
					status: 'published',
					user_id: 67890,
					date: new Date().toISOString(),
				};
			}),
			get: jest.fn(),
			put: jest.fn(),
			delete: jest.fn(),
		};

		// Create real SubstackClient instance for internal use by builders
		const realClient = new SubstackClient({
			hostname: 'test.substack.com',
			apiKey: 'test-key'
		});

		// Replace the client's post method with our mock
		realClient.post = mockHttpClient.post;
		realClient.get = mockHttpClient.get;
		realClient.put = mockHttpClient.put;
		realClient.delete = mockHttpClient.delete;

		// Create REAL OwnProfile with mocked data but real behavior
		const realOwnProfile = new OwnProfile({
			id: 12345,
			name: 'Test User',
			handle: 'testuser'
		}, realClient);

		// Mock the OwnProfile class - this has to be mocked as you specified
		const mockOwnProfile = {
			id: 12345,
			name: 'Test User',
			newNote: realOwnProfile.newNote.bind(realOwnProfile) // REAL newNote method
		};

		// Mock SubstackClient - only this is mocked
		mockSubstackClient = {
			ownProfile: jest.fn().mockResolvedValue(mockOwnProfile),
		};

		// Apply the mock
		require('substack-api').SubstackClient.mockImplementation(() => mockSubstackClient);
	});

	// Helper to create expected JSON
	const createExpectedJson = (content: any[]) => ({
		bodyJson: {
			type: 'doc',
			attrs: { schemaVersion: 'v1' },
			content
		},
		tabId: 'for-you', // Real NoteBuilder uses 'for-you'
		surface: 'feed',
		replyMinimumRole: 'everyone'
	});

	describe('Basic Text Formatting', () => {
		it('should parse simple text paragraph with REAL NoteBuilder', async () => {
			const markdown = 'This is a simple paragraph.';
			const expectedJson = createExpectedJson([
				{
					type: 'paragraph',
					content: [
						{
							type: 'text',
							text: 'This is a simple paragraph.'
						}
					]
				}
			]);

			const profile = await mockSubstackClient.ownProfile();
			const noteBuilder = profile.newNote();
			
			const result = MarkdownParser.parseMarkdownToNoteStructured(markdown, noteBuilder);
			await result.publish();

			expect(capturedPayload).toMatchObject(expectedJson);
		});

		it('should parse bold text', async () => {
			const markdown = 'This is **bold text**.';
			const expectedJson = createExpectedJson([
				{
					type: 'paragraph',
					content: [
						{
							type: 'text',
							text: 'This is '
						},
						{
							type: 'text',
							text: 'bold text',
							marks: [{ type: 'bold' }]
						},
						{
							type: 'text',
							text: '.'
						}
					]
				}
			]);

			const profile = await mockSubstackClient.ownProfile();
			const noteBuilder = profile.newNote();
			
			const result = MarkdownParser.parseMarkdownToNoteStructured(markdown, noteBuilder);
			await result.publish();

			expect(capturedPayload).toMatchObject(expectedJson);
		});

		it('should parse italic text', async () => {
			const markdown = 'This is *italic text*.';
			const expectedJson = createExpectedJson([
				{
					type: 'paragraph',
					content: [
						{
							type: 'text',
							text: 'This is '
						},
						{
							type: 'text',
							text: 'italic text',
							marks: [{ type: 'italic' }]
						},
						{
							type: 'text',
							text: '.'
						}
					]
				}
			]);

			const profile = await mockSubstackClient.ownProfile();
			const noteBuilder = profile.newNote();
			
			const result = MarkdownParser.parseMarkdownToNoteStructured(markdown, noteBuilder);
			await result.publish();

			expect(capturedPayload).toMatchObject(expectedJson);
		});

		it('should parse code spans', async () => {
			const markdown = 'This is `inline code` in text.';
			const expectedJson = createExpectedJson([
				{
					type: 'paragraph',
					content: [
						{
							type: 'text',
							text: 'This is '
						},
						{
							type: 'text',
							text: 'inline code',
							marks: [{ type: 'code' }]
						},
						{
							type: 'text',
							text: ' in text.'
						}
					]
				}
			]);

			const profile = await mockSubstackClient.ownProfile();
			const noteBuilder = profile.newNote();
			
			const result = MarkdownParser.parseMarkdownToNoteStructured(markdown, noteBuilder);
			await result.publish();

			expect(capturedPayload).toMatchObject(expectedJson);
		});

		it('should parse mixed formatting in single paragraph', async () => {
			const markdown = 'This is **bold**, *italic*, and `code` text.';
			const expectedJson = createExpectedJson([
				{
					type: 'paragraph',
					content: [
						{
							type: 'text',
							text: 'This is '
						},
						{
							type: 'text',
							text: 'bold',
							marks: [{ type: 'bold' }]
						},
						{
							type: 'text',
							text: ', '
						},
						{
							type: 'text',
							text: 'italic',
							marks: [{ type: 'italic' }]
						},
						{
							type: 'text',
							text: ', and '
						},
						{
							type: 'text',
							text: 'code',
							marks: [{ type: 'code' }]
						},
						{
							type: 'text',
							text: ' text.'
						}
					]
				}
			]);

			const profile = await mockSubstackClient.ownProfile();
			const noteBuilder = profile.newNote();
			
			const result = MarkdownParser.parseMarkdownToNoteStructured(markdown, noteBuilder);
			await result.publish();

			expect(capturedPayload).toMatchObject(expectedJson);
		});
	});

	describe('Headings', () => {
		it('should parse headings as bold text', async () => {
			const markdown = '## Main Heading';
			const expectedJson = createExpectedJson([
				{
					type: 'paragraph',
					content: [
						{
							type: 'text',
							text: 'Main Heading',
							marks: [{ type: 'bold' }]
						}
					]
				}
			]);

			const profile = await mockSubstackClient.ownProfile();
			const noteBuilder = profile.newNote();
			
			const result = MarkdownParser.parseMarkdownToNoteStructured(markdown, noteBuilder);
			await result.publish();

			expect(capturedPayload).toMatchObject(expectedJson);
		});

		it('should handle multiple heading levels', async () => {
			const markdown = `# H1 Heading
## H2 Heading  
### H3 Heading
#### H4 Heading`;

			const expectedJson = createExpectedJson([
				{
					type: 'paragraph',
					content: [
						{
							type: 'text',
							text: 'H1 Heading',
							marks: [{ type: 'bold' }]
						}
					]
				},
				{
					type: 'paragraph',
					content: [
						{
							type: 'text',
							text: 'H2 Heading',
							marks: [{ type: 'bold' }]
						}
					]
				},
				{
					type: 'paragraph',
					content: [
						{
							type: 'text',
							text: 'H3 Heading',
							marks: [{ type: 'bold' }]
						}
					]
				},
				{
					type: 'paragraph',
					content: [
						{
							type: 'text',
							text: 'H4 Heading',
							marks: [{ type: 'bold' }]
						}
					]
				}
			]);

			const profile = await mockSubstackClient.ownProfile();
			const noteBuilder = profile.newNote();
			
			const result = MarkdownParser.parseMarkdownToNoteStructured(markdown, noteBuilder);
			await result.publish();

			expect(capturedPayload).toMatchObject(expectedJson);
		});
	});

	describe('Multiple Paragraphs', () => {
		it('should parse multiple paragraphs correctly', async () => {
			const markdown = `## Heading

First paragraph with **bold** text.

Second paragraph with *italic* text.`;

			const expectedJson = createExpectedJson([
				{
					type: 'paragraph',
					content: [
						{
							type: 'text',
							text: 'Heading',
							marks: [{ type: 'bold' }]
						}
					]
				},
				{
					type: 'paragraph',
					content: [
						{
							type: 'text',
							text: 'First paragraph with '
						},
						{
							type: 'text',
							text: 'bold',
							marks: [{ type: 'bold' }]
						},
						{
							type: 'text',
							text: ' text.'
						}
					]
				},
				{
					type: 'paragraph',
					content: [
						{
							type: 'text',
							text: 'Second paragraph with '
						},
						{
							type: 'text',
							text: 'italic',
							marks: [{ type: 'italic' }]
						},
						{
							type: 'text',
							text: ' text.'
						}
					]
				}
			]);

			const profile = await mockSubstackClient.ownProfile();
			const noteBuilder = profile.newNote();
			
			const result = MarkdownParser.parseMarkdownToNoteStructured(markdown, noteBuilder);
			await result.publish();

			expect(capturedPayload).toMatchObject(expectedJson);
		});
	});

	describe('Links', () => {
		it('should parse links', async () => {
			const markdown = 'Check out [n8n](https://n8n.io) for automation.';
			const expectedJson = createExpectedJson([
				{
					type: 'paragraph',
					content: [
						{
							type: 'text',
							text: 'Check out '
						},
						{
							type: 'text',
							text: 'n8n (https://n8n.io)'
						},
						{
							type: 'text',
							text: ' for automation.'
						}
					]
				}
			]);

			const profile = await mockSubstackClient.ownProfile();
			const noteBuilder = profile.newNote();
			
			const result = MarkdownParser.parseMarkdownToNoteStructured(markdown, noteBuilder);
			await result.publish();

			expect(capturedPayload).toMatchObject(expectedJson);
		});

		it('should parse multiple links in one paragraph', async () => {
			const markdown = 'Visit [n8n](https://n8n.io) and [Substack](https://substack.com) today.';
			const expectedJson = createExpectedJson([
				{
					type: 'paragraph',
					content: [
						{
							type: 'text',
							text: 'Visit '
						},
						{
							type: 'text',
							text: 'n8n (https://n8n.io)'
						},
						{
							type: 'text',
							text: ' and '
						},
						{
							type: 'text',
							text: 'Substack (https://substack.com)'
						},
						{
							type: 'text',
							text: ' today.'
						}
					]
				}
			]);

			const profile = await mockSubstackClient.ownProfile();
			const noteBuilder = profile.newNote();
			
			const result = MarkdownParser.parseMarkdownToNoteStructured(markdown, noteBuilder);
			await result.publish();

			expect(capturedPayload).toMatchObject(expectedJson);
		});
	});

	describe('Lists', () => {
		it('should parse unordered lists', async () => {
			const markdown = `- First item
- Second item
- Third item`;

			const expectedJson = createExpectedJson([
				{
					type: 'paragraph',
					content: [
						{ type: 'text', text: '• ' },
						{ type: 'text', text: 'First item' }
					]
				},
				{
					type: 'paragraph',
					content: [
						{ type: 'text', text: '• ' },
						{ type: 'text', text: 'Second item' }
					]
				},
				{
					type: 'paragraph',
					content: [
						{ type: 'text', text: '• ' },
						{ type: 'text', text: 'Third item' }
					]
				}
			]);

			const profile = await mockSubstackClient.ownProfile();
			const noteBuilder = profile.newNote();
			
			const result = MarkdownParser.parseMarkdownToNoteStructured(markdown, noteBuilder);
			await result.publish();

			expect(capturedPayload).toMatchObject(expectedJson);
		});

		it('should parse ordered lists', async () => {
			const markdown = `1. First item
2. Second item
3. Third item`;

			const expectedJson = createExpectedJson([
				{
					type: 'paragraph',
					content: [
						{ type: 'text', text: '1. ' },
						{ type: 'text', text: 'First item' }
					]
				},
				{
					type: 'paragraph',
					content: [
						{ type: 'text', text: '2. ' },
						{ type: 'text', text: 'Second item' }
					]
				},
				{
					type: 'paragraph',
					content: [
						{ type: 'text', text: '3. ' },
						{ type: 'text', text: 'Third item' }
					]
				}
			]);

			const profile = await mockSubstackClient.ownProfile();
			const noteBuilder = profile.newNote();
			
			const result = MarkdownParser.parseMarkdownToNoteStructured(markdown, noteBuilder);
			await result.publish();

			expect(capturedPayload).toMatchObject(expectedJson);
		});

		it('should parse lists with inline formatting', async () => {
			const markdown = `- First **bold** item
- Second *italic* item
- Third \`code\` item`;

			const expectedJson = createExpectedJson([
				{
					type: 'paragraph',
					content: [
						{ type: 'text', text: '• ' },
						{ type: 'text', text: 'First ' },
						{ type: 'text', text: 'bold', marks: [{ type: 'bold' }] },
						{ type: 'text', text: ' item' }
					]
				},
				{
					type: 'paragraph',
					content: [
						{ type: 'text', text: '• ' },
						{ type: 'text', text: 'Second ' },
						{ type: 'text', text: 'italic', marks: [{ type: 'italic' }] },
						{ type: 'text', text: ' item' }
					]
				},
				{
					type: 'paragraph',
					content: [
						{ type: 'text', text: '• ' },
						{ type: 'text', text: 'Third ' },
						{ type: 'text', text: 'code', marks: [{ type: 'code' }] },
						{ type: 'text', text: ' item' }
					]
				}
			]);

			const profile = await mockSubstackClient.ownProfile();
			const noteBuilder = profile.newNote();
			
			const result = MarkdownParser.parseMarkdownToNoteStructured(markdown, noteBuilder);
			await result.publish();

			expect(capturedPayload).toMatchObject(expectedJson);
		});

		it('should skip empty list items but process valid ones', async () => {
			const markdown = `- First item
- 
- Third item`;

			const expectedJson = createExpectedJson([
				{
					type: 'paragraph',
					content: [
						{ type: 'text', text: '• ' },
						{ type: 'text', text: 'First item' }
					]
				},
				{
					type: 'paragraph',
					content: [
						{ type: 'text', text: '• ' },
						{ type: 'text', text: 'Third item' }
					]
				}
			]);

			const profile = await mockSubstackClient.ownProfile();
			const noteBuilder = profile.newNote();
			
			const result = MarkdownParser.parseMarkdownToNoteStructured(markdown, noteBuilder);
			await result.publish();

			expect(capturedPayload).toMatchObject(expectedJson);
		});
	});

	describe('Complex Documents', () => {
		it('should parse complex document with all supported elements', async () => {
			const markdown = `# Main Title

This is a paragraph with **bold**, *italic*, \`code\`, and a [link](https://example.com).

## Section Header

Here's an unordered list:
- First item with **formatting**
- Second item with *emphasis*

And an ordered list:
1. Numbered item
2. Another numbered item with \`code\`

Final paragraph.`;

			const expectedJson = createExpectedJson([
				{
					type: 'paragraph',
					content: [
						{ type: 'text', text: 'Main Title', marks: [{ type: 'bold' }] }
					]
				},
				{
					type: 'paragraph',
					content: [
						{ type: 'text', text: 'This is a paragraph with ' },
						{ type: 'text', text: 'bold', marks: [{ type: 'bold' }] },
						{ type: 'text', text: ', ' },
						{ type: 'text', text: 'italic', marks: [{ type: 'italic' }] },
						{ type: 'text', text: ', ' },
						{ type: 'text', text: 'code', marks: [{ type: 'code' }] },
						{ type: 'text', text: ', and a ' },
						{ type: 'text', text: 'link (https://example.com)' },
						{ type: 'text', text: '.' }
					]
				},
				{
					type: 'paragraph',
					content: [
						{ type: 'text', text: 'Section Header', marks: [{ type: 'bold' }] }
					]
				},
				{
					type: 'paragraph',
					content: [
						{ type: 'text', text: 'Here&#39;s an unordered list:' }
					]
				},
				{
					type: 'paragraph',
					content: [
						{ type: 'text', text: '• ' },
						{ type: 'text', text: 'First item with ' },
						{ type: 'text', text: 'formatting', marks: [{ type: 'bold' }] }
					]
				},
				{
					type: 'paragraph',
					content: [
						{ type: 'text', text: '• ' },
						{ type: 'text', text: 'Second item with ' },
						{ type: 'text', text: 'emphasis', marks: [{ type: 'italic' }] }
					]
				},
				{
					type: 'paragraph',
					content: [
						{ type: 'text', text: 'And an ordered list:' }
					]
				},
				{
					type: 'paragraph',
					content: [
						{ type: 'text', text: '1. ' },
						{ type: 'text', text: 'Numbered item' }
					]
				},
				{
					type: 'paragraph',
					content: [
						{ type: 'text', text: '2. ' },
						{ type: 'text', text: 'Another numbered item with ' },
						{ type: 'text', text: 'code', marks: [{ type: 'code' }] }
					]
				},
				{
					type: 'paragraph',
					content: [
						{ type: 'text', text: 'Final paragraph.' }
					]
				}
			]);

			const profile = await mockSubstackClient.ownProfile();
			const noteBuilder = profile.newNote();
			
			const result = MarkdownParser.parseMarkdownToNoteStructured(markdown, noteBuilder);
			await result.publish();

			expect(capturedPayload).toMatchObject(expectedJson);
		});
	});

	describe('Error Cases and Validation', () => {
		it('should throw error for empty markdown', async () => {
			const profile = await mockSubstackClient.ownProfile();
			const noteBuilder = profile.newNote();
			
			expect(() => {
				MarkdownParser.parseMarkdownToNoteStructured('', noteBuilder);
			}).toThrow('Note body cannot be empty - at least one paragraph with content is required');
		});

		it('should throw error for whitespace-only markdown', async () => {
			const profile = await mockSubstackClient.ownProfile();
			const noteBuilder = profile.newNote();
			
			expect(() => {
				MarkdownParser.parseMarkdownToNoteStructured('   \n\t  ', noteBuilder);
			}).toThrow('Note body cannot be empty - at least one paragraph with content is required');
		});

		it('should throw error for empty headings', async () => {
			const profile = await mockSubstackClient.ownProfile();
			const noteBuilder = profile.newNote();
			
			expect(() => {
				MarkdownParser.parseMarkdownToNoteStructured('## \n### \n#### ', noteBuilder);
			}).toThrow('Note must contain at least one paragraph with actual content');
		});

		it('should throw error for empty list items only', async () => {
			const profile = await mockSubstackClient.ownProfile();
			const noteBuilder = profile.newNote();
			
			expect(() => {
				MarkdownParser.parseMarkdownToNoteStructured('- \n* \n1. ', noteBuilder);
			}).toThrow('Note must contain at least one paragraph with actual content');
		});
	});
});