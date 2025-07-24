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

describe('Substack Node Unit Tests - Note Operations', () => {
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

	describe('Note Retrieval', () => {
		it('should successfully retrieve notes with default limit', async () => {
			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'get',
					// limit will use default
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify client method calls
			expect(mockClient.ownProfile).toHaveBeenCalledTimes(1);
			expect(mockOwnProfile.notes).toHaveBeenCalledTimes(1);

			// Verify results
			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBe(2); // Mock data has 2 notes

			// Check first note structure
			const firstNote = result[0][0];
			expect(firstNote.json).toMatchObject({
				noteId: expect.any(String),
				body: expect.any(String),
				url: expect.stringContaining('https://testblog.substack.com/p/'),
				status: 'published',
				userId: expect.any(String),
				likes: expect.any(Number),
				restacks: expect.any(Number),
				type: 'note',
			});
		});

		it('should handle custom limit parameter', async () => {
			// Setup execution context with custom limit
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'get',
					limit: 1,
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify client method calls
			expect(mockClient.ownProfile).toHaveBeenCalledTimes(1);
			expect(mockOwnProfile.notes).toHaveBeenCalledTimes(1);

			// Verify results - should only get 1 item due to limit
			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBe(1);
		});

		it('should handle empty notes list', async () => {
			// Setup empty notes response
			mockOwnProfile.notes.mockResolvedValue({
				async *[Symbol.asyncIterator]() {
					// Empty iterator
				},
			});

			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'get',
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify results
			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBe(0); // Empty list
		});

		it('should handle client errors during retrieval', async () => {
			// Setup client to throw error
			mockOwnProfile.notes.mockRejectedValue(new Error('API Error: Unable to fetch notes'));

			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'get',
				},
				credentials: mockCredentials,
			});

			// Execute and expect error
			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow();

			// Verify client methods were called
			expect(mockClient.ownProfile).toHaveBeenCalledTimes(1);
			expect(mockOwnProfile.notes).toHaveBeenCalledTimes(1);
		});
	});

	describe('Input Validation', () => {
		it('should validate resource parameter', async () => {
			// Setup execution context with invalid resource
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'invalid_resource',
					operation: 'create',
				},
				credentials: mockCredentials,
			});

			// Execute and expect error
			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow('Unknown resource: invalid_resource');
		});

		it('should validate operation parameter', async () => {
			// Setup execution context with invalid operation
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'invalid_operation',
				},
				credentials: mockCredentials,
			});

			// Execute and expect error
			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow('Unknown operation: invalid_operation');
		});
	});

	describe('Output Formatting', () => {
		it('should format note retrieval output correctly', async () => {
			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'get',
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify each note output structure
			result[0].forEach((output, index) => {
				expect(output).toHaveProperty('json');
				expect(output).toHaveProperty('pairedItem');
				expect(output.pairedItem).toEqual({ item: 0 });
				
				// Verify required fields for note list items
				const noteData = output.json;
				expect(noteData).toHaveProperty('noteId');
				expect(noteData).toHaveProperty('body');
				expect(noteData).toHaveProperty('url');
				expect(noteData).toHaveProperty('status');
				expect(noteData).toHaveProperty('userId');
				expect(noteData).toHaveProperty('likes');
				expect(noteData).toHaveProperty('restacks');
				expect(noteData).toHaveProperty('type');
			});
		});
	});

	describe('Note Creation', () => {
		it('should successfully create a simple note', async () => {
			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					title: 'Test Note Title',
					body: 'This is a test note body',
					contentType: 'simple',
					visibility: 'everyone',
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify the result structure
			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBe(1);

			const output = result[0][0];
			expect(output).toHaveProperty('json');
			expect(output).toHaveProperty('pairedItem');
			expect(output.pairedItem).toEqual({ item: 0 });

			// Verify response fields
			const noteData = output.json;
			expect(noteData).toHaveProperty('success', true);
			expect(noteData).toHaveProperty('title', 'Test Note Title');
			expect(noteData).toHaveProperty('noteId', '12345');
			expect(noteData).toHaveProperty('body');
			expect(noteData).toHaveProperty('url');
			expect(noteData).toHaveProperty('status', 'published');
			expect(noteData).toHaveProperty('visibility', 'everyone');

			// Verify client methods were called
			expect(mockClient.ownProfile).toHaveBeenCalledTimes(1);
			expect(mockOwnProfile.newNote).toHaveBeenCalledWith('Test Note Title');
			expect(mockNoteBuilder.paragraph).toHaveBeenCalledWith('This is a test note body');
			expect(mockNoteBuilder.publish).toHaveBeenCalledTimes(1);
		});

		it('should successfully create a note without title', async () => {
			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: 'This is a test note without title',
					contentType: 'simple',
					visibility: 'everyone',
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify the result
			expect(result[0][0].json).toHaveProperty('success', true);
			expect(result[0][0].json).toHaveProperty('title', '');

			// Verify client methods were called correctly
			expect(mockOwnProfile.newNote).toHaveBeenCalledWith(); // Called without title
		});

		it('should successfully create an advanced note with Markdown content', async () => {
			const markdownContent = `## Hello from n8n

This is a note with **bold**, *italic*, and a [link](https://n8n.io).

- First bullet point
- Second bullet point

1. Numbered item
2. Another numbered item`;

			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					title: 'Markdown Note',
					body: markdownContent,
					contentType: 'advanced',
					visibility: 'subscribers',
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify the result
			expect(result[0][0].json).toHaveProperty('success', true);
			expect(result[0][0].json).toHaveProperty('visibility', 'subscribers');

			// Verify client methods were called
			expect(mockOwnProfile.newNote).toHaveBeenCalledWith('Markdown Note');
			expect(mockNoteBuilder.publish).toHaveBeenCalledTimes(1);
		});

		it('should handle empty body validation in advanced mode', async () => {
			// Setup execution context with empty body
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					title: 'Empty Note',
					body: '   ', // Whitespace only
					contentType: 'advanced',
					visibility: 'everyone',
				},
				credentials: mockCredentials,
			});

			// Execute and expect error
			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow('Note body cannot be empty');
		});

		it('should handle creation errors appropriately', async () => {
			// Setup client to throw error
			mockNoteBuilder.publish.mockRejectedValue(new Error('API Error: Failed to publish note'));

			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					title: 'Error Note',
					body: 'This should fail',
					contentType: 'simple',
				},
				credentials: mockCredentials,
			});

			// Execute and expect error
			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow();

			// Verify client methods were called
			expect(mockClient.ownProfile).toHaveBeenCalledTimes(1);
			expect(mockNoteBuilder.publish).toHaveBeenCalledTimes(1);
		});
	});
});