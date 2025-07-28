import { Substack } from '../../nodes/Substack/Substack.node';
import { createMockExecuteFunctions } from '../mocks/mockExecuteFunctions';
import { mockCredentials } from '../mocks/mockData';
import { 
	createMockSubstackClient,
	createMockOwnProfile,
	createMockNoteBuilder,
	createMockParagraphBuilder,
} from '../mocks/mockSubstackClient';

// Mock the substack-api module
jest.mock('substack-api', () => ({
	SubstackClient: jest.fn(),
}));

// Mock SubstackUtils to return our mocked client
jest.mock('../../nodes/Substack/SubstackUtils', () => ({
	SubstackUtils: {
		initializeClient: jest.fn(),
		formatUrl: jest.fn((base: string, path: string) => `${base}${path}`),
		formatErrorResponse: jest.fn((error: any) => ({
			success: false,
			error: error.message,
		})),
	},
}));

describe('Substack API 1.2.0 Validation Tests', () => {
	let substackNode: Substack;
	let mockClient: any;
	let mockOwnProfile: any;
	let mockNoteBuilder: any;
	let mockParagraphBuilder: any;

	beforeEach(() => {
		// Reset all mocks
		jest.clearAllMocks();
		
		substackNode = new Substack();
		mockClient = createMockSubstackClient();
		mockOwnProfile = createMockOwnProfile();
		mockNoteBuilder = createMockNoteBuilder();
		mockParagraphBuilder = createMockParagraphBuilder();

		// Setup method chain mocks
		mockClient.ownProfile.mockResolvedValue(mockOwnProfile);
		mockOwnProfile.newNote.mockReturnValue(mockNoteBuilder);
		mockNoteBuilder.paragraph.mockReturnValue(mockParagraphBuilder);

		// Mock SubstackUtils.initializeClient to return our mocked client
		const { SubstackUtils } = require('../../nodes/Substack/SubstackUtils');
		SubstackUtils.initializeClient.mockResolvedValue({
			client: mockClient,
			publicationAddress: 'https://testblog.substack.com',
		});
	});

	describe('Enhanced Runtime Validation Compliance', () => {
		it('should demonstrate compatibility with the new immutable NoteBuilder pattern', async () => {
			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: 'Hello from the upgraded API!',
					contentType: 'simple',
					visibility: 'everyone',
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify the immutable pattern: each call creates new instances
			// 1. ownProfile.newNote() creates new NoteBuilder
			expect(mockOwnProfile.newNote).toHaveBeenCalledWith();
			
			// 2. noteBuilder.paragraph() creates new ParagraphBuilder
			expect(mockNoteBuilder.paragraph).toHaveBeenCalledTimes(1);
			
			// 3. paragraphBuilder.text() operates on the paragraph
			expect(mockParagraphBuilder.text).toHaveBeenCalledWith('Hello from the upgraded API!');
			
			// 4. noteBuilder.publish() completes the chain
			expect(mockNoteBuilder.publish).toHaveBeenCalledTimes(1);
			
			// Verify success with the new API
			expect(result[0][0].json).toHaveProperty('success', true);
		});

		it('should prevent "Note must contain at least one paragraph" errors through proper structure', async () => {
			// This test verifies that our implementation prevents the runtime validation error
			// that the new API would throw if .publish() is called without paragraphs
			
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: 'Valid content with proper structure',
					contentType: 'simple',
					visibility: 'everyone',
				},
				credentials: mockCredentials,
			});

			// Execute the node
			await substackNode.execute.call(mockExecuteFunctions);

			// The key validation: paragraph() MUST be called before publish()
			// to satisfy the new API's "mandatory paragraph creation" requirement
			expect(mockNoteBuilder.paragraph).toHaveBeenCalledTimes(1);
			expect(mockNoteBuilder.publish).toHaveBeenCalledTimes(1);
			
			// Verify paragraph() was called BEFORE publish() by checking call order
			const paragraphCalls = mockNoteBuilder.paragraph.mock.invocationCallOrder;
			const publishCalls = mockNoteBuilder.publish.mock.invocationCallOrder;
			
			expect(paragraphCalls[0]).toBeLessThan(publishCalls[0]);
		});

		it('should handle enhanced validation gracefully when content is empty', async () => {
			// Test that our validation prevents invalid notes from reaching the new API
			
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: '',
					contentType: 'simple',
					visibility: 'everyone',
				},
				credentials: mockCredentials,
			});

			// Our validation should catch this BEFORE the new API validation kicks in
			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow('Note must contain at least one paragraph with content - body cannot be empty');

			// Verify that the API builder pattern was never called, 
			// preventing the "Note must contain at least one paragraph" runtime error
			expect(mockNoteBuilder.paragraph).not.toHaveBeenCalled();
			expect(mockNoteBuilder.publish).not.toHaveBeenCalled();
		});

		it('should work correctly with advanced mode (Markdown) and the new validation', async () => {
			const markdownContent = `# Upgraded API Test

This note validates the **new** substack-api 1.2.0 patterns:

- ✅ Immutable NoteBuilder
- ✅ Mandatory paragraph creation
- ✅ No deprecated .newNote() on NoteBuilder
- ✅ Enhanced validation

[Learn more](https://example.com)`;

			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: markdownContent,
					contentType: 'advanced',
					visibility: 'everyone',
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify multiple paragraphs were created for the markdown structure
			// (heading, paragraph, list, etc.)
			expect(mockNoteBuilder.paragraph).toHaveBeenCalled();
			expect(mockNoteBuilder.publish).toHaveBeenCalledTimes(1);
			
			// Should succeed with new API validation
			expect(result[0][0].json).toHaveProperty('success', true);
		});
	});

	describe('Deprecated Pattern Avoidance', () => {
		it('should confirm no usage of deprecated NoteBuilder().newNote()', async () => {
			// This test confirms we don't use the removed pattern
			
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: 'Testing deprecated pattern avoidance',
					contentType: 'simple',
				},
				credentials: mockCredentials,
			});

			await substackNode.execute.call(mockExecuteFunctions);

			// Verify we call newNote() on OwnProfile, NOT on NoteBuilder
			expect(mockOwnProfile.newNote).toHaveBeenCalledWith();
			
			// Verify noteBuilder does NOT have newNote called on it
			// (this would be the deprecated pattern)
			expect(mockNoteBuilder.newNote).toBeUndefined();
		});

		it('should avoid mutable chaining patterns on the same builder instance', async () => {
			// Verify we don't use patterns like: builder.text("...").bold("...")
			// which would be mutable chaining on the same instance
			
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: 'Testing immutable pattern compliance',
					contentType: 'simple',
				},
				credentials: mockCredentials,
			});

			await substackNode.execute.call(mockExecuteFunctions);

			// Each call should be independent, not chained on the same instance
			expect(mockParagraphBuilder.text).toHaveBeenCalledWith('Testing immutable pattern compliance');
			
			// The paragraph builder should have been created fresh from noteBuilder.paragraph()
			expect(mockNoteBuilder.paragraph).toHaveBeenCalledTimes(1);
		});
	});

	describe('Error Handling with New Validation', () => {
		it('should handle new API builder errors gracefully', async () => {
			// Simulate the new API throwing validation errors
			mockNoteBuilder.publish.mockRejectedValue(
				new Error('Note must contain at least one paragraph')
			);

			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: 'This should trigger API validation error',
					contentType: 'simple',
				},
				credentials: mockCredentials,
			});

			// Should handle the new validation errors appropriately
			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow();

			// Verify proper structure was attempted
			expect(mockNoteBuilder.paragraph).toHaveBeenCalled();
			expect(mockNoteBuilder.publish).toHaveBeenCalled();
		});
	});
});