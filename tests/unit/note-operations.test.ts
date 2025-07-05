import { Substack } from '../../nodes/Substack/Substack.node';
import { createMockExecuteFunctions } from '../mocks/mockExecuteFunctions';
import { mockCredentials } from '../mocks/mockData';
import { 
	createMockSubstackClient,
	createMockOwnProfile,
	createMockNoteBuilder,
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

	beforeEach(() => {
		// Reset all mocks
		jest.clearAllMocks();
		
		substackNode = new Substack();
		mockClient = createMockSubstackClient();
		mockOwnProfile = createMockOwnProfile();
		mockNoteBuilder = createMockNoteBuilder();

		// Setup method chain mocks
		mockClient.ownProfile.mockResolvedValue(mockOwnProfile);
		mockOwnProfile.newNote.mockReturnValue(mockNoteBuilder);

		// Mock SubstackUtils.initializeClient to return our mocked client
		const { SubstackUtils } = require('../../nodes/Substack/SubstackUtils');
		SubstackUtils.initializeClient.mockResolvedValue({
			client: mockClient,
			publicationAddress: 'https://testblog.substack.com',
		});
	});

	describe('Note Creation', () => {
		it('should successfully create a note with valid inputs', async () => {
			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: 'This is a test note from n8n integration',
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify client method calls
			expect(mockClient.ownProfile).toHaveBeenCalledTimes(1);
			expect(mockOwnProfile.newNote).toHaveBeenCalledWith('This is a test note from n8n integration');
			expect(mockNoteBuilder.publish).toHaveBeenCalledTimes(1);

			// Verify results
			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBe(1);

			const outputData = result[0][0];
			expect(outputData.json).toMatchObject({
				noteId: '12345',
				body: 'This is a test note from n8n integration',
				url: 'https://testblog.substack.com/p/12345',
				status: 'published',
				userId: '67890',
			});
		});

		it('should handle missing body parameter', async () => {
			// Setup execution context with missing body
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					// body is missing
				},
				credentials: mockCredentials,
			});

			// Execute and expect error
			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow('Body is required');

			// Verify client methods were not called
			expect(mockClient.ownProfile).not.toHaveBeenCalled();
		});

		it('should handle client errors gracefully', async () => {
			// Setup client to throw error
			mockNoteBuilder.publish.mockRejectedValue(new Error('API Error: Invalid request'));

			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: 'This note should fail',
				},
				credentials: mockCredentials,
			});

			// Execute and expect error
			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow();

			// Verify client methods were called
			expect(mockClient.ownProfile).toHaveBeenCalledTimes(1);
			expect(mockOwnProfile.newNote).toHaveBeenCalledWith('This note should fail');
			expect(mockNoteBuilder.publish).toHaveBeenCalledTimes(1);
		});

		it('should handle continueOnFail mode', async () => {
			// Setup client to throw error
			mockNoteBuilder.publish.mockRejectedValue(new Error('API Error: Invalid request'));

			// Setup execution context with continueOnFail enabled
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: 'This note should fail',
				},
				credentials: mockCredentials,
			});

			// Mock continueOnFail to return true
			mockExecuteFunctions.continueOnFail = jest.fn().mockReturnValue(true);

			// Execute - should not throw
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify error response
			expect(result[0][0].json).toHaveProperty('error');
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
		it('should format note creation output correctly', async () => {
			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: 'Test content',
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify output structure
			const output = result[0][0];
			expect(output).toHaveProperty('json');
			expect(output).toHaveProperty('pairedItem');
			expect(output.pairedItem).toEqual({ item: 0 });
			
			// Verify required fields
			const noteData = output.json;
			expect(noteData).toHaveProperty('noteId');
			expect(noteData).toHaveProperty('body');
			expect(noteData).toHaveProperty('url');
			expect(noteData).toHaveProperty('status');
			expect(noteData).toHaveProperty('userId');
		});

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
});