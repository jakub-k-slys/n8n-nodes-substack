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

describe('Builder Pattern Validation Tests', () => {
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

	describe('Correct Builder Pattern Implementation', () => {
		it('should use correct builder pattern: ownProfile.newNote().paragraph().text().publish()', async () => {
			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: 'Hello world',
					contentType: 'simple',
					visibility: 'everyone',
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify the EXACT pattern from the issue description is followed:
			// await ownProfile.newNote().paragraph().text("Hello world").publish();
			
			// 1. ownProfile should be called
			expect(mockClient.ownProfile).toHaveBeenCalledTimes(1);
			
			// 2. newNote() should be called on ownProfile
			expect(mockOwnProfile.newNote).toHaveBeenCalledWith();
			
			// 3. paragraph() should be called directly on noteBuilder (NOT newNode().paragraph())
			expect(mockNoteBuilder.paragraph).toHaveBeenCalledTimes(1);
			
			// 4. text() should be called on paragraphBuilder
			expect(mockParagraphBuilder.text).toHaveBeenCalledWith('Hello world');
			
			// 5. publish() should be called on noteBuilder
			expect(mockNoteBuilder.publish).toHaveBeenCalledTimes(1);
			
			// Verify success
			expect(result[0][0].json).toHaveProperty('success', true);
		});

		it('should prevent the "Note must contain at least one paragraph" error by ensuring paragraph() is called', async () => {
			// Setup execution context with non-empty content
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: 'This note should work correctly',
					contentType: 'simple',
					visibility: 'everyone',
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// The key validation: paragraph() must be called before publish()
			// We verify this by checking that both were called
			expect(mockNoteBuilder.paragraph).toHaveBeenCalledTimes(1);
			expect(mockNoteBuilder.publish).toHaveBeenCalledTimes(1);
			
			// And text() must be called on the paragraph builder
			expect(mockParagraphBuilder.text).toHaveBeenCalledWith('This note should work correctly');
			
			// Should succeed without the "Note must contain at least one paragraph" error
			expect(result[0][0].json).toHaveProperty('success', true);
		});

		it('should handle advanced mode (Markdown) with correct builder pattern', async () => {
			const markdownContent = `## Hello from n8n

This is a test note with **bold text**.

- First bullet
- Second bullet`;

			// Setup execution context
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

			// Verify that the MarkdownParser also uses the correct pattern
			// Multiple paragraphs should be created for different markdown elements
			expect(mockNoteBuilder.paragraph).toHaveBeenCalled();
			expect(mockNoteBuilder.publish).toHaveBeenCalledTimes(1);
			
			// Should succeed
			expect(result[0][0].json).toHaveProperty('success', true);
		});

		it('should provide early validation for empty content before attempting to build', async () => {
			// Setup execution context with empty content
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

			// Execute and expect validation error BEFORE any builder pattern is attempted
			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow('Note must contain at least one paragraph with content - body cannot be empty');

			// Verify that no builder methods were called since validation failed early
			expect(mockNoteBuilder.paragraph).not.toHaveBeenCalled();
			expect(mockNoteBuilder.publish).not.toHaveBeenCalled();
		});
	});

	describe('Pattern Compliance Tests', () => {
		it('should match the exact API pattern described in the issue', async () => {
			// This test validates that our implementation exactly matches:
			// await ownProfile.newNote().paragraph().text("Hello world").publish();

			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: 'Hello world',
					contentType: 'simple',
				},
				credentials: mockCredentials,
			});

			await substackNode.execute.call(mockExecuteFunctions);

			// Verify the exact call chain
			const calls = mockNoteBuilder.paragraph.mock.calls;
			const publishCalls = mockNoteBuilder.publish.mock.calls;
			const textCalls = mockParagraphBuilder.text.mock.calls;

			// Should have called paragraph() once
			expect(calls).toHaveLength(1);
			
			// Should have called text() with the content
			expect(textCalls).toHaveLength(1);
			expect(textCalls[0][0]).toBe('Hello world');
			
			// Should have called publish() once
			expect(publishCalls).toHaveLength(1);
		});
	});
});