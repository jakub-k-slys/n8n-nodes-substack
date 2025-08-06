import { Substack } from '../../nodes/Substack/Substack.node';
import { createTestEnvironment, resetAllMocks } from '../utils/testSetup';
import { createRetrievalTestSuite, createValidationTestSuite } from '../utils/testHelpers';
import { createMockExecuteFunctions } from '../mocks/mockExecuteFunctions';
import { mockCredentials } from '../mocks/mockData';
import { testPosts, testLimits } from '../fixtures/testData';

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

describe('Substack Node Unit Tests - Post Operations', () => {
	let substackNode: Substack;
	let mockEnv: ReturnType<typeof createTestEnvironment>;

	beforeEach(() => {
		resetAllMocks();
		substackNode = new Substack();
		mockEnv = createTestEnvironment();
	});

	// Use the standardized test suite for post retrieval
	describe('Post Retrieval', () => {
		const testSuite = createRetrievalTestSuite('post', 'getAll', {
			expectedFields: ['id', 'title', 'subtitle', 'slug', 'url', 'postDate', 'type', 'published', 'paywalled', 'description', 'htmlBody', 'markdown'],
			clientMethod: 'ownProfile',
			profileMethod: 'posts',
			mockDataCount: 2,
		});

		it('should successfully retrieve posts with default limit', async () => {
			await testSuite.testSuccessful(substackNode, mockEnv);
		});

		it('should handle custom limit parameter', async () => {
			await testSuite.testCustomLimit(substackNode, mockEnv);
		});

		it('should handle empty posts list', async () => {
			await testSuite.testEmptyResponse(substackNode, mockEnv, () => {
				mockEnv.mockOwnProfile.posts.mockResolvedValue({
					async *[Symbol.asyncIterator]() {
						// Empty iterator
					},
				});
			});
		});

		it('should handle client errors during retrieval', async () => {
			await testSuite.testApiError(substackNode, mockEnv);
		});

		it('should handle continueOnFail mode for post retrieval', async () => {
			await testSuite.testContinueOnFail(substackNode, mockEnv);
		});

		it('should handle large limit values', async () => {
			await testSuite.testLargeLimit(substackNode, mockEnv);
		});
	});

	// Specific test cases using centralized test data
	describe('Post Data Handling', () => {
		it('should handle malformed post data gracefully', async () => {
			const malformedPostsData = [
				testPosts.complete,
				{
					id: null, // Invalid data to trigger skip logic
					publishedAt: new Date('invalid date'),
					rawData: {},
				},
			];

			mockEnv.mockOwnProfile.posts.mockResolvedValue({
				async *[Symbol.asyncIterator]() {
					for (const item of malformedPostsData) {
						yield item;
					}
				},
			});

			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getAll',
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);
			expect(result[0].length).toBe(2); // Both posts should be processed
		});

		it('should handle missing rawData fields gracefully', async () => {
			mockEnv.mockOwnProfile.posts.mockResolvedValue({
				async *[Symbol.asyncIterator]() {
					yield testPosts.minimal;
				},
			});

			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getAll',
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);

			const postData = result[0][0].json;
			expect(postData.subtitle).toBe(''); // Default for missing subtitle
			expect(postData.type).toBe('newsletter'); // Default for missing type
			expect(postData.published).toBe(true); // Default for missing published
			expect(postData.paywalled).toBe(false); // Default for missing paywalled
			expect(postData.description).toBe('Basic content'); // Falls back to body
		});

		it('should handle posts with invalid dates', async () => {
			mockEnv.mockOwnProfile.posts.mockResolvedValue({
				async *[Symbol.asyncIterator]() {
					yield testPosts.invalidDate;
				},
			});

			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getAll',
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);

			const postData = result[0][0].json;
			// Should have a valid date string (current date as fallback)
			expect(postData.postDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
		});
	});

	// Post retrieval by slug
	describe('Post Retrieval by Slug', () => {
		it('should successfully retrieve posts by slug', async () => {
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getPostsBySlug',
					slug: 'testblog',
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify client method calls
			expect(mockEnv.mockClient.profileForSlug).toHaveBeenCalledTimes(1);
			expect(mockEnv.mockClient.profileForSlug).toHaveBeenCalledWith('testblog');
			expect(mockEnv.mockOwnProfile.posts).toHaveBeenCalledTimes(1);

			// Verify results
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBe(2); // Mock data has 2 posts

			// Check structure
			const firstPost = result[0][0];
			expect(firstPost.json).toMatchObject({
				id: expect.any(Number),
				title: expect.any(String),
				subtitle: expect.any(String),
				url: expect.stringContaining('https://testblog.substack.com/p/'),
				postDate: expect.any(String),
				type: expect.any(String),
				published: expect.any(Boolean),
				paywalled: expect.any(Boolean),
				description: expect.any(String),
				htmlBody: expect.any(String),
				markdown: expect.any(String),
			});
		});
	});

	// Use standardized validation tests
	describe('Input Validation', () => {
		const validationSuite = createValidationTestSuite('post');

		it('should validate operation parameter for posts', async () => {
			await validationSuite.testInvalidOperation(substackNode);
		});
	});

	// Output formatting tests using test data
	describe('Output Formatting', () => {
		it('should format post retrieval output correctly', async () => {
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getAll',
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify each post output structure
			result[0].forEach((output: any) => {
				expect(output).toHaveProperty('json');
				expect(output).toHaveProperty('pairedItem');
				expect(output.pairedItem).toEqual({ item: 0 });
				
				// Verify required fields for post list items
				const postData = output.json;
				const expectedFields = ['id', 'title', 'subtitle', 'slug', 'url', 'postDate', 'type', 'published', 'paywalled', 'description', 'htmlBody', 'markdown'];
				expectedFields.forEach(field => {
					expect(postData).toHaveProperty(field);
				});
			});
		});
	});

	// Edge cases using centralized test data and limits
	describe('Edge Cases', () => {
		it('should handle zero limit', async () => {
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getAll',
					limit: testLimits.zero,
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);
			expect(result[0].length).toBe(0);
		});

		it('should handle posts with different types', async () => {
			mockEnv.mockOwnProfile.posts.mockResolvedValue({
				async *[Symbol.asyncIterator]() {
					yield testPosts.complete;
					yield testPosts.podcast;
					yield testPosts.paywalled;
				},
			});

			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getAll',
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);

			expect(result[0].length).toBe(3);
			
			// Verify different post types are handled correctly
			const posts = result[0].map((r: any) => r.json);
			expect(posts.find((p: any) => p.type === 'newsletter')).toBeDefined();
			expect(posts.find((p: any) => p.type === 'podcast')).toBeDefined();
			expect(posts.find((p: any) => p.paywalled === true)).toBeDefined();
		});
	});
});