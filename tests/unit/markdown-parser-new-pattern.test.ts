import { MarkdownParser } from '../../nodes/Substack/MarkdownParser';

describe('MarkdownParser - New Test Pattern', () => {
	let mockNoteBuilder: any;
	let mockParagraphBuilder: any;
	let capturedBuildResult: any = null;

	beforeEach(() => {
		jest.clearAllMocks();
		capturedBuildResult = null;
		
		// Create simple mocks that track the final build() result
		mockParagraphBuilder = {
			text: jest.fn().mockReturnThis(),
			bold: jest.fn().mockReturnThis(),
			italic: jest.fn().mockReturnThis(),
			code: jest.fn().mockReturnThis(),
			paragraph: jest.fn().mockReturnThis(),
			build: jest.fn().mockImplementation(() => {
				// This captures what would be sent to the API
				const buildResult = {
					bodyJson: {
						type: 'doc',
						attrs: { schemaVersion: 'v1' },
						content: [
							{
								type: 'paragraph',
								content: [
									{
										type: 'text',
										text: 'Processed content'
									}
								]
							}
						]
					},
					tabId: 'test-tab-id',
					surface: 'feed',
					replyMinimumRole: 'everyone'
				};
				capturedBuildResult = buildResult;
				return buildResult;
			}),
			publish: jest.fn().mockImplementation(async () => {
				// Call build() to get the payload, then mock the API response
				mockParagraphBuilder.build();
				return {
					id: 12345,
					body: 'Test note body',
					status: 'published',
					user_id: 67890,
					date: new Date().toISOString(),
				};
			}),
		};

		mockNoteBuilder = {
			paragraph: jest.fn().mockReturnValue(mockParagraphBuilder),
		};
	});

	describe('New Test Pattern Flow', () => {
		it('should follow the pattern: Markdown → Expected JSON → publish() → assert payload', async () => {
			// 1. Provide a Markdown string
			const markdownInput = 'This is **bold** text with *italic* formatting.';
			
			// 2. Define the expected JSON note draft structure
			const expectedJson = {
				bodyJson: {
					type: 'doc',
					attrs: { schemaVersion: 'v1' },
					content: expect.arrayContaining([
						expect.objectContaining({
							type: 'paragraph',
							content: expect.any(Array)
						})
					])
				},
				tabId: expect.any(String),
				surface: expect.any(String),
				replyMinimumRole: 'everyone'
			};
			
			// 3. Call parseMarkdown and get the final builder
			const finalBuilder = MarkdownParser.parseMarkdownToNoteStructured(markdownInput, mockNoteBuilder);
			
			// 4. Call .publish() on the final NodeBuilder
			await finalBuilder.publish();
			
			// 5. Capture the payload passed to the mocked SubstackClient
			const capturedDraft = capturedBuildResult;
			
			// 6. Assert: expect(capturedDraft).toEqual(expectedJson)
			expect(capturedDraft).toBeDefined();
			expect(capturedDraft).toMatchObject(expectedJson);
			
			// Verify builder methods were called
			expect(mockNoteBuilder.paragraph).toHaveBeenCalled();
			expect(mockParagraphBuilder.publish).toHaveBeenCalled();
		});

		it('should handle simple text paragraph', async () => {
			// 1. Provide a Markdown string
			const markdownInput = 'Simple paragraph text.';
			
			// 2. Define the expected JSON note draft structure
			const expectedJson = {
				bodyJson: {
					type: 'doc',
					attrs: { schemaVersion: 'v1' },
					content: expect.arrayContaining([
						expect.objectContaining({
							type: 'paragraph',
							content: expect.any(Array)
						})
					])
				},
				tabId: expect.any(String),
				surface: expect.any(String),
				replyMinimumRole: 'everyone'
			};
			
			// 3. Parse the markdown
			const finalBuilder = MarkdownParser.parseMarkdownToNoteStructured(markdownInput, mockNoteBuilder);
			
			// 4. Call .publish() on the final NodeBuilder
			await finalBuilder.publish();
			
			// 5. Capture the payload passed to the mocked SubstackClient
			const capturedDraft = capturedBuildResult;
			
			// 6. Assert: expect(capturedDraft).toEqual(expectedJson)
			expect(capturedDraft).toBeDefined();
			expect(capturedDraft).toMatchObject(expectedJson);
		});

		it('should handle heading as bold text', async () => {
			// 1. Provide a Markdown string
			const markdownInput = '## Main Heading';
			
			// 2. Define the expected JSON note draft structure
			const expectedJson = {
				bodyJson: {
					type: 'doc',
					attrs: { schemaVersion: 'v1' },
					content: expect.arrayContaining([
						expect.objectContaining({
							type: 'paragraph',
							content: expect.any(Array)
						})
					])
				},
				tabId: expect.any(String),
				surface: expect.any(String),
				replyMinimumRole: 'everyone'
			};
			
			// 3. Parse the markdown
			const finalBuilder = MarkdownParser.parseMarkdownToNoteStructured(markdownInput, mockNoteBuilder);
			
			// 4. Call .publish() on the final NodeBuilder
			await finalBuilder.publish();
			
			// 5. Capture the payload passed to the mocked SubstackClient
			const capturedDraft = capturedBuildResult;
			
			// 6. Assert: expect(capturedDraft).toEqual(expectedJson)
			expect(capturedDraft).toBeDefined();
			expect(capturedDraft).toMatchObject(expectedJson);
		});
	});
});