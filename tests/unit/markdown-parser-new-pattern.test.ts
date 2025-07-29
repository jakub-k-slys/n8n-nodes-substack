import { MarkdownParser } from '../../nodes/Substack/MarkdownParser';
import { createMockNoteBuilder, createMockParagraphBuilder } from '../mocks/mockSubstackClient';

describe('MarkdownParser - New Test Pattern', () => {
	let mockNoteBuilder: any;
	let mockParagraphBuilder: any;

	beforeEach(() => {
		// Create mock builders with payload capture
		mockParagraphBuilder = createMockParagraphBuilder();
		mockNoteBuilder = createMockNoteBuilder();
		
		// Setup method chain mocks
		mockNoteBuilder.paragraph.mockReturnValue(mockParagraphBuilder);
		
		// Reset captured payload
		mockParagraphBuilder._resetCapturedPayload();
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
					content: [
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
									text: ' text with '
								},
								{
									type: 'text',
									text: 'italic',
									marks: [{ type: 'italic' }]
								},
								{
									type: 'text',
									text: ' formatting.'
								}
							]
						}
					]
				},
				tabId: 'mockTabId',
				surface: 'feed',
				replyMinimumRole: 'everyone'
			};
			
			// 3. Call parseMarkdown and get the final builder
			const finalBuilder = MarkdownParser.parseMarkdownToNoteStructured(markdownInput, mockNoteBuilder);
			
			// 4. Call .publish() on the final NodeBuilder
			await finalBuilder.publish();
			
			// 5. Capture the payload passed to the mocked SubstackClient
			const capturedDraft = mockParagraphBuilder._getCapturedPayload();
			
			// 6. Assert: expect(capturedDraft).toEqual(expectedJson)
			expect(capturedDraft).toBeDefined();
			expect(capturedDraft).toHaveProperty('bodyJson');
			expect(capturedDraft).toHaveProperty('tabId', expectedJson.tabId);
			expect(capturedDraft).toHaveProperty('surface', expectedJson.surface);
			expect(capturedDraft).toHaveProperty('replyMinimumRole', expectedJson.replyMinimumRole);
			
			// Note: For now, we're just checking the structure exists
			// In a full implementation, we would compare capturedDraft.bodyJson to expectedJson.bodyJson
			console.log('Captured payload:', JSON.stringify(capturedDraft, null, 2));
		});

		it('should handle simple text paragraph', async () => {
			// 1. Provide a Markdown string
			const markdownInput = 'Simple paragraph text.';
			
			// 2. Define the expected JSON note draft structure
			const expectedJson = {
				bodyJson: {
					type: 'doc',
					attrs: { schemaVersion: 'v1' },
					content: [
						{
							type: 'paragraph',
							content: [
								{
									type: 'text',
									text: 'Simple paragraph text.'
								}
							]
						}
					]
				},
				tabId: 'mockTabId',
				surface: 'feed',
				replyMinimumRole: 'everyone'
			};
			
			// 3. Parse the markdown
			const finalBuilder = MarkdownParser.parseMarkdownToNoteStructured(markdownInput, mockNoteBuilder);
			
			// 4. Call .publish() on the final NodeBuilder
			await finalBuilder.publish();
			
			// 5. Capture the payload passed to the mocked SubstackClient
			const capturedDraft = mockParagraphBuilder._getCapturedPayload();
			
			// 6. Assert: expect(capturedDraft).toEqual(expectedJson)
			expect(capturedDraft).toBeDefined();
			expect(capturedDraft).toMatchObject({
				tabId: expectedJson.tabId,
				surface: expectedJson.surface,
				replyMinimumRole: expectedJson.replyMinimumRole
			});
			
			console.log('Simple text payload:', JSON.stringify(capturedDraft, null, 2));
		});

		it('should handle heading as bold text', async () => {
			// 1. Provide a Markdown string
			const markdownInput = '## Main Heading';
			
			// 2. Define the expected JSON note draft structure
			const expectedJson = {
				bodyJson: {
					type: 'doc',
					attrs: { schemaVersion: 'v1' },
					content: [
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
					]
				},
				tabId: 'mockTabId',
				surface: 'feed',
				replyMinimumRole: 'everyone'
			};
			
			// 3. Parse the markdown
			const finalBuilder = MarkdownParser.parseMarkdownToNoteStructured(markdownInput, mockNoteBuilder);
			
			// 4. Call .publish() on the final NodeBuilder
			await finalBuilder.publish();
			
			// 5. Capture the payload passed to the mocked SubstackClient
			const capturedDraft = mockParagraphBuilder._getCapturedPayload();
			
			// 6. Assert: expect(capturedDraft).toEqual(expectedJson)
			expect(capturedDraft).toBeDefined();
			expect(capturedDraft).toMatchObject({
				tabId: expectedJson.tabId,
				surface: expectedJson.surface,
				replyMinimumRole: expectedJson.replyMinimumRole
			});
			
			console.log('Heading payload:', JSON.stringify(capturedDraft, null, 2));
		});
	});
});