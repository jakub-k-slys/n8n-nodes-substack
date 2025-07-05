import { Substack } from '../../nodes/Substack/Substack.node';
import { createMockExecuteFunctions } from '../mocks/mockExecuteFunctions';
import { mockCredentials } from '../mocks/mockData';
import { 
	createMockSubstackClient,
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

describe('Substack Node Unit Tests - Comment Operations', () => {
	let substackNode: Substack;
	let mockClient: any;
	let mockPost: any;

	beforeEach(() => {
		// Reset all mocks
		jest.clearAllMocks();
		
		substackNode = new Substack();
		mockClient = createMockSubstackClient();
		mockPost = createMockPost();

		// Setup method chain mocks
		mockClient.postForId.mockResolvedValue(mockPost);

		// Mock SubstackUtils.initializeClient to return our mocked client
		const { SubstackUtils } = require('../../nodes/Substack/SubstackUtils');
		SubstackUtils.initializeClient.mockResolvedValue({
			client: mockClient,
			publicationAddress: 'https://testblog.substack.com',
		});
	});

	describe('Comment Retrieval', () => {
		it('should successfully retrieve comments with valid postId', async () => {
			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'comment',
					operation: 'getAll',
					postId: 98765,
					// limit will use default
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify client method calls
			expect(mockClient.postForId).toHaveBeenCalledWith('98765');
			expect(mockPost.comments).toHaveBeenCalledTimes(1);

			// Verify results
			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBe(2); // Mock data has 2 comments

			// Check first comment structure
			const firstComment = result[0][0];
			expect(firstComment.json).toMatchObject({
				id: expect.any(Number),
				body: expect.any(String),
				createdAt: expect.any(String),
				parentPostId: 98765,
				author: {
					id: expect.any(Number),
					name: expect.any(String),
					isAdmin: expect.any(Boolean),
				},
			});
		});

		it('should handle custom limit parameter', async () => {
			// Setup execution context with custom limit
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'comment',
					operation: 'getAll',
					postId: 98765,
					limit: 1,
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify client method calls
			expect(mockClient.postForId).toHaveBeenCalledWith('98765');
			expect(mockPost.comments).toHaveBeenCalledTimes(1);

			// Verify results - should only get 1 item due to limit
			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBe(1);
		});

		it('should handle empty comments list', async () => {
			// Setup empty comments response
			mockPost.comments.mockResolvedValue({
				async *[Symbol.asyncIterator]() {
					// Empty iterator
				},
			});

			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'comment',
					operation: 'getAll',
					postId: 98765,
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
			mockPost.comments.mockRejectedValue(new Error('API Error: Unable to fetch comments'));

			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'comment',
					operation: 'getAll',
					postId: 98765,
				},
				credentials: mockCredentials,
			});

			// Execute and expect error
			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow();

			// Verify client methods were called
			expect(mockClient.postForId).toHaveBeenCalledWith('98765');
			expect(mockPost.comments).toHaveBeenCalledTimes(1);
		});

		it('should handle postForId errors', async () => {
			// Setup client to throw error when fetching post
			mockClient.postForId.mockRejectedValue(new Error('Post not found'));

			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'comment',
					operation: 'getAll',
					postId: 999999, // Non-existent post
				},
				credentials: mockCredentials,
			});

			// Execute and expect error
			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow();

			// Verify client methods were called
			expect(mockClient.postForId).toHaveBeenCalledWith('999999');
		});

		it('should handle continueOnFail mode for comment retrieval', async () => {
			// Setup client to throw error
			mockPost.comments.mockRejectedValue(new Error('API Error: Unable to fetch comments'));

			// Setup execution context with continueOnFail enabled
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'comment',
					operation: 'getAll',
					postId: 98765,
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

	describe('Input Validation', () => {
		it('should validate operation parameter for comments', async () => {
			// Setup execution context with invalid operation
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'comment',
					operation: 'invalid_operation',
					postId: 98765,
				},
				credentials: mockCredentials,
			});

			// Execute and expect error
			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow('Unknown operation: invalid_operation');
		});

		it('should handle string postId parameter', async () => {
			// Setup execution context with string postId (should work fine)
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'comment',
					operation: 'getAll',
					postId: '98765', // String instead of number
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Should work fine and convert to string for API call
			expect(mockClient.postForId).toHaveBeenCalledWith('98765');
			expect(result[0].length).toBe(2);
		});
	});

	describe('Output Formatting', () => {
		it('should format comment retrieval output correctly', async () => {
			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'comment',
					operation: 'getAll',
					postId: 98765,
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify each comment output structure
			result[0].forEach((output, index) => {
				expect(output).toHaveProperty('json');
				expect(output).toHaveProperty('pairedItem');
				expect(output.pairedItem).toEqual({ item: 0 });
				
				// Verify required fields for comment list items
				const commentData = output.json;
				expect(commentData).toHaveProperty('id');
				expect(commentData).toHaveProperty('body');
				expect(commentData).toHaveProperty('createdAt');
				expect(commentData).toHaveProperty('parentPostId');
				expect(commentData).toHaveProperty('author');
				expect(commentData.author).toHaveProperty('id');
				expect(commentData.author).toHaveProperty('name');
				expect(commentData.author).toHaveProperty('isAdmin');
			});
		});

		it('should use provided postId as parentPostId', async () => {
			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'comment',
					operation: 'getAll',
					postId: 12345,
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify all comments have the correct parentPostId
			result[0].forEach((output) => {
				expect(output.json.parentPostId).toBe(12345);
			});
		});

		it('should handle missing rawData fields gracefully', async () => {
			// Setup comments response with minimal data
			const minimalCommentsData = [
				{
					id: 33333,
					body: 'Minimal comment',
					author: {
						id: 11111,
						name: 'John Doe',
						isAdmin: false,
					},
					createdAt: new Date('2024-01-15T14:20:00Z'),
					// rawData is missing
				},
			];

			mockPost.comments.mockResolvedValue({
				async *[Symbol.asyncIterator]() {
					for (const item of minimalCommentsData) {
						yield item;
					}
				},
			});

			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'comment',
					operation: 'getAll',
					postId: 98765,
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify it handles missing rawData gracefully
			const commentData = result[0][0].json;
			expect(commentData.createdAt).toBe('2024-01-15T14:20:00.000Z'); // Uses createdAt.toISOString()
		});
	});

	describe('Edge Cases', () => {
		it('should handle large limit values', async () => {
			// Setup execution context with very large limit
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'comment',
					operation: 'getAll',
					postId: 98765,
					limit: 10000,
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Should still work with available data
			expect(result[0].length).toBe(2); // Only 2 comments in mock data
		});

		it('should handle zero limit', async () => {
			// Setup execution context with zero limit
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'comment',
					operation: 'getAll',
					postId: 98765,
					limit: 0,
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Should return no comments due to zero limit
			expect(result[0].length).toBe(0);
		});

		it('should handle null/undefined postId', async () => {
			// Setup execution context with null postId
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'comment',
					operation: 'getAll',
					postId: null,
				},
				credentials: mockCredentials,
			});

			// Execute - this should throw an error due to null postId
			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow(); // Will throw when trying to call null.toString()
		});
	});
});