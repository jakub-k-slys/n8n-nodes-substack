import { Substack } from '../../nodes/Substack/Substack.node';
import { createTestEnvironment, resetAllMocks } from '../utils/testSetup';
import { createRetrievalTestSuite, createValidationTestSuite } from '../utils/testHelpers';
import { createMockExecuteFunctions } from '../mocks/mockExecuteFunctions';
import { mockCredentials } from '../mocks/mockData';
import { testComments, testLimits } from '../fixtures/testData';

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
	let mockEnv: ReturnType<typeof createTestEnvironment>;

	beforeEach(() => {
		resetAllMocks();
		substackNode = new Substack();
		mockEnv = createTestEnvironment();
	});

	// Use standardized test suite for comment retrieval
	describe('Comment Retrieval', () => {
		const testSuite = createRetrievalTestSuite('comment', 'getAll', {
			additionalParams: { postId: 98765 },
			expectedFields: ['id', 'body', 'createdAt', 'parentPostId', 'author'],
			clientMethod: 'postForId',
			mockDataCount: 2,
			customErrorSetup: (mockEnv) => {
				mockEnv.mockPost.comments.mockRejectedValue(new Error('API Error: Unable to fetch comments'));
			},
		});

		it('should successfully retrieve comments with valid postId', async () => {
			const result = await testSuite.testSuccessful(substackNode, mockEnv);
			
			// Additional comment-specific verifications
			expect(mockEnv.mockClient.postForId).toHaveBeenCalledWith(98765);
			expect(mockEnv.mockPost.comments).toHaveBeenCalledTimes(1);

			// Check comment structure
			if (result[0].length > 0) {
				const firstComment = result[0][0].json;
				expect(firstComment.author).toHaveProperty('id');
				expect(firstComment.author).toHaveProperty('name');
				expect(firstComment.author).toHaveProperty('isAdmin');
			}
		});

		it('should handle custom limit parameter', async () => {
			await testSuite.testCustomLimit(substackNode, mockEnv);
		});

		it('should handle empty comments list', async () => {
			await testSuite.testEmptyResponse(substackNode, mockEnv, () => {
				mockEnv.mockPost.comments.mockResolvedValue({
					async *[Symbol.asyncIterator]() {
						// Empty iterator
					},
				});
			});
		});

		it('should handle client errors during retrieval', async () => {
			await testSuite.testApiError(substackNode, mockEnv);
		});

		it('should handle continueOnFail mode for comment retrieval', async () => {
			await testSuite.testContinueOnFail(substackNode, mockEnv);
		});
	});

	// Comment-specific error handling
	describe('Comment-Specific Error Handling', () => {
		it('should handle postForId errors', async () => {
			mockEnv.mockClient.postForId.mockRejectedValue(new Error('Post not found'));

			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'comment',
					operation: 'getAll',
					postId: 999999, // Non-existent post
				},
				credentials: mockCredentials,
			});

			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow();

			expect(mockEnv.mockClient.postForId).toHaveBeenCalledWith(999999);
		});

		it('should handle null/undefined postId', async () => {
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'comment',
					operation: 'getAll',
					postId: null,
				},
				credentials: mockCredentials,
			});

			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow(); // Will throw when trying to call null.toString()
		});
	});

	// Input validation using standardized patterns
	describe('Input Validation', () => {
		const validationSuite = createValidationTestSuite('comment');

		it('should validate operation parameter for comments', async () => {
			await validationSuite.testInvalidOperation(substackNode);
		});

		it('should handle string postId parameter', async () => {
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'comment',
					operation: 'getAll',
					postId: '98765', // String instead of number
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Should work fine and convert to number for API call
			expect(mockEnv.mockClient.postForId).toHaveBeenCalledWith(98765);
			expect(result[0].length).toBe(2);
		});
	});

	// Output formatting using test data
	describe('Output Formatting', () => {
		it('should format comment retrieval output correctly', async () => {
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'comment',
					operation: 'getAll',
					postId: 98765,
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify each comment output structure
			result[0].forEach((output: any) => {
				expect(output).toHaveProperty('json');
				expect(output).toHaveProperty('pairedItem');
				expect(output.pairedItem).toEqual({ item: 0 });
				
				const commentData = output.json;
				const expectedFields = ['id', 'body', 'createdAt', 'parentPostId', 'author'];
				expectedFields.forEach(field => {
					expect(commentData).toHaveProperty(field);
				});
			});
		});

		it('should use provided postId as parentPostId', async () => {
			const testPostId = 12345;
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'comment',
					operation: 'getAll',
					postId: testPostId,
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify all comments have the correct parentPostId
			result[0].forEach((output: any) => {
				expect(output.json.parentPostId).toBe(testPostId);
			});
		});

		it('should handle missing rawData fields gracefully', async () => {
			mockEnv.mockPost.comments.mockResolvedValue({
				async *[Symbol.asyncIterator]() {
					yield testComments.minimal[0];
				},
			});

			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'comment',
					operation: 'getAll',
					postId: 98765,
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);

			const commentData = result[0][0].json;
			expect(commentData.createdAt).toBe('2024-01-15T16:00:00.000Z'); // Uses createdAt.toISOString()
		});
	});

	// Edge cases using centralized test data
	describe('Edge Cases', () => {
		it('should handle zero limit', async () => {
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'comment',
					operation: 'getAll',
					postId: 98765,
					limit: testLimits.zero,
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);
			expect(result[0].length).toBe(0);
		});

		it('should handle large limit values', async () => {
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'comment',
					operation: 'getAll',
					postId: 98765,
					limit: testLimits.large,
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Should still work with available data
			expect(result[0].length).toBe(2); // Only 2 comments in mock data
		});

		it('should handle comments with different author types', async () => {
			mockEnv.mockPost.comments.mockResolvedValue({
				async *[Symbol.asyncIterator]() {
					yield* testComments.basic; // Includes both admin and regular users
				},
			});

			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'comment',
					operation: 'getAll',
					postId: 98765,
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);

			expect(result[0].length).toBe(2);
			
			// Verify different author types are handled correctly
			const comments = result[0].map((r: any) => r.json);
			expect(comments.find((c: any) => c.author.isAdmin === true)).toBeDefined();
			expect(comments.find((c: any) => c.author.isAdmin === false)).toBeDefined();
		});
	});
});