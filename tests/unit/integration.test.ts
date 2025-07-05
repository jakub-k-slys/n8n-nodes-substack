import { Substack } from '../../nodes/Substack/Substack.node';
import { createMockExecuteFunctions } from '../mocks/mockExecuteFunctions';
import { mockCredentials } from '../mocks/mockData';
import { 
	createMockSubstackClient,
	createMockOwnProfile,
	createMockNoteBuilder,
	createMockPost,
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

describe('Substack Node Unit Tests - Integration', () => {
	let substackNode: Substack;
	let mockClient: any;
	let mockOwnProfile: any;
	let mockNoteBuilder: any;
	let mockPost: any;

	beforeEach(() => {
		// Reset all mocks
		jest.clearAllMocks();
		
		substackNode = new Substack();
		mockClient = createMockSubstackClient();
		mockOwnProfile = createMockOwnProfile();
		mockNoteBuilder = createMockNoteBuilder();
		mockPost = createMockPost();

		// Setup method chain mocks
		mockClient.ownProfile.mockResolvedValue(mockOwnProfile);
		mockClient.postForId.mockResolvedValue(mockPost);
		mockOwnProfile.newNote.mockReturnValue(mockNoteBuilder);

		// Mock SubstackUtils.initializeClient to return our mocked client
		const { SubstackUtils } = require('../../nodes/Substack/SubstackUtils');
		SubstackUtils.initializeClient.mockResolvedValue({
			client: mockClient,
			publicationAddress: 'https://testblog.substack.com',
		});
	});

	describe('Multi-Item Processing', () => {
		it('should process multiple input items correctly', async () => {
			// Setup execution context with multiple input items
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: 'Test note content',
				},
				credentials: mockCredentials,
			});

			// Mock multiple input items
			mockExecuteFunctions.getInputData = jest.fn().mockReturnValue([
				{ json: { content: 'First item' } },
				{ json: { content: 'Second item' } },
				{ json: { content: 'Third item' } },
			]);

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify that client was called for each item
			expect(mockClient.ownProfile).toHaveBeenCalledTimes(3);
			expect(mockOwnProfile.newNote).toHaveBeenCalledTimes(3);
			expect(mockNoteBuilder.publish).toHaveBeenCalledTimes(3);

			// Verify results for each item
			expect(result[0]).toHaveLength(3);
			result[0].forEach((output, index) => {
				expect(output.pairedItem).toEqual({ item: index });
				expect(output.json.noteId).toBe('12345');
			});
		});

		it('should handle mixed success and failure with continueOnFail', async () => {
			// Setup client to fail on second call
			let callCount = 0;
			mockNoteBuilder.publish.mockImplementation(() => {
				callCount++;
				if (callCount === 2) {
					throw new Error('API Error on second item');
				}
				return Promise.resolve({
					id: 12345,
					body: 'Test note content',
					date: '2024-01-15T10:30:00Z',
					user_id: 67890,
				});
			});

			// Setup execution context with multiple input items
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: 'Test note content',
				},
				credentials: mockCredentials,
			});

			// Mock multiple input items
			mockExecuteFunctions.getInputData = jest.fn().mockReturnValue([
				{ json: { content: 'First item' } },
				{ json: { content: 'Second item' } },
				{ json: { content: 'Third item' } },
			]);

			// Mock continueOnFail to return true
			mockExecuteFunctions.continueOnFail = jest.fn().mockReturnValue(true);

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify results: success, error, success
			expect(result[0]).toHaveLength(3);
			
			// First item should succeed
			expect(result[0][0].json.noteId).toBe('12345');
			
			// Second item should have error
			expect(result[0][1].json).toHaveProperty('error');
			
			// Third item should succeed
			expect(result[0][2].json.noteId).toBe('12345');
		});
	});

	describe('Cross-Resource Operations', () => {
		it('should handle different resources with same execution function', async () => {
			// Test that we can switch between resources in the same test
			// This validates that mocking doesn't interfere between operations

			// First, test note creation
			const noteExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: 'Test note',
				},
				credentials: mockCredentials,
			});

			const noteResult = await substackNode.execute.call(noteExecuteFunctions);
			expect(noteResult[0][0].json.noteId).toBe('12345');

			// Then test post retrieval
			const postExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getAll',
					limit: 10,
				},
				credentials: mockCredentials,
			});

			const postResult = await substackNode.execute.call(postExecuteFunctions);
			expect(postResult[0]).toHaveLength(2); // Mock data has 2 posts

			// Then test comment retrieval
			const commentExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'comment',
					operation: 'getAll',
					postId: 98765,
				},
				credentials: mockCredentials,
			});

			const commentResult = await substackNode.execute.call(commentExecuteFunctions);
			expect(commentResult[0]).toHaveLength(2); // Mock data has 2 comments
		});
	});

	describe('Error Propagation', () => {
		it('should propagate initialization errors correctly', async () => {
			// Setup SubstackUtils.initializeClient to throw error
			const { SubstackUtils } = require('../../nodes/Substack/SubstackUtils');
			SubstackUtils.initializeClient.mockRejectedValue(new Error('Invalid credentials'));

			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: 'Test note',
				},
				credentials: { ...mockCredentials, apiKey: 'invalid' },
			});

			// Execute and expect error
			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow('Invalid credentials');

			// Verify client methods were not called
			expect(mockClient.ownProfile).not.toHaveBeenCalled();
		});

		it('should handle method chain errors at different levels', async () => {
			// Test error at ownProfile level
			mockClient.ownProfile.mockRejectedValue(new Error('Profile error'));

			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'get',
				},
				credentials: mockCredentials,
			});

			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow();

			// Verify error propagated correctly
			expect(mockClient.ownProfile).toHaveBeenCalled();
		});
	});

	describe('Parameter Validation', () => {
		it('should validate all resource types', async () => {
			const resources = ['note', 'post', 'comment', 'follow'];
			
			for (const resource of resources) {
				const mockExecuteFunctions = createMockExecuteFunctions({
					nodeParameters: {
						resource: resource,
						operation: resource === 'note' ? 'create' : 
								  resource === 'post' ? 'getAll' :
								  resource === 'comment' ? 'getAll' : 'getFollowing',
						...(resource === 'note' && { body: 'Test content' }),
						...(resource === 'comment' && { postId: 98765 }),
					},
					credentials: mockCredentials,
				});

				// Should not throw for valid resources
				const result = await substackNode.execute.call(mockExecuteFunctions);
				expect(result).toBeDefined();
			}
		});

		it('should validate all operation types', async () => {
			// Test note operations
			for (const operation of ['create', 'get']) {
				const mockExecuteFunctions = createMockExecuteFunctions({
					nodeParameters: {
						resource: 'note',
						operation: operation,
						...(operation === 'create' && { body: 'Test content' }),
					},
					credentials: mockCredentials,
				});

				const result = await substackNode.execute.call(mockExecuteFunctions);
				expect(result).toBeDefined();
			}

			// Test post operations
			const postExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getAll',
				},
				credentials: mockCredentials,
			});

			const postResult = await substackNode.execute.call(postExecuteFunctions);
			expect(postResult).toBeDefined();

			// Test comment operations
			const commentExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'comment',
					operation: 'getAll',
					postId: 98765,
				},
				credentials: mockCredentials,
			});

			const commentResult = await substackNode.execute.call(commentExecuteFunctions);
			expect(commentResult).toBeDefined();

			// Test follow operations
			const followExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'follow',
					operation: 'getFollowing',
				},
				credentials: mockCredentials,
			});

			const followResult = await substackNode.execute.call(followExecuteFunctions);
			expect(followResult).toBeDefined();
		});
	});

	describe('Client Method Chain Verification', () => {
		it('should verify complete note creation chain', async () => {
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: 'Test note content',
				},
				credentials: mockCredentials,
			});

			await substackNode.execute.call(mockExecuteFunctions);

			// Verify the complete method chain
			expect(mockClient.ownProfile).toHaveBeenCalledTimes(1);
			expect(mockOwnProfile.newNote).toHaveBeenCalledWith('Test note content');
			expect(mockNoteBuilder.publish).toHaveBeenCalledTimes(1);
		});

		it('should verify complete comment retrieval chain', async () => {
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'comment',
					operation: 'getAll',
					postId: 98765,
				},
				credentials: mockCredentials,
			});

			await substackNode.execute.call(mockExecuteFunctions);

			// Verify the complete method chain
			expect(mockClient.postForId).toHaveBeenCalledWith('98765');
			expect(mockPost.comments).toHaveBeenCalledTimes(1);
		});

		it('should verify async iterable consumption', async () => {
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'get',
					limit: 1, // Only get one item
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify async iterable was consumed correctly
			expect(mockClient.ownProfile).toHaveBeenCalledTimes(1);
			expect(mockOwnProfile.notes).toHaveBeenCalledTimes(1);
			expect(result[0]).toHaveLength(1); // Only one item due to limit
		});
	});
});