import { Substack } from '../../nodes/Substack/Substack.node';
import { createMockExecuteFunctions } from '../mocks/mockExecuteFunctions';
import { mockCredentials } from '../mocks/mockData';
import { 
	createMockSubstackClient,
	createMockOwnProfile,
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

describe('Substack Node Unit Tests - Post Operations', () => {
	let substackNode: Substack;
	let mockClient: any;
	let mockOwnProfile: any;

	beforeEach(() => {
		// Reset all mocks
		jest.clearAllMocks();
		
		substackNode = new Substack();
		mockClient = createMockSubstackClient();
		mockOwnProfile = createMockOwnProfile();

		// Setup method chain mocks
		mockClient.ownProfile.mockResolvedValue(mockOwnProfile);

		// Mock SubstackUtils.initializeClient to return our mocked client
		const { SubstackUtils } = require('../../nodes/Substack/SubstackUtils');
		SubstackUtils.initializeClient.mockResolvedValue({
			client: mockClient,
			publicationAddress: 'https://testblog.substack.com',
		});
	});

	describe('Post Retrieval', () => {
		it('should successfully retrieve posts with default limit', async () => {
			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getAll',
					// limit will use default
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify client method calls
			expect(mockClient.ownProfile).toHaveBeenCalledTimes(1);
			expect(mockOwnProfile.posts).toHaveBeenCalledTimes(1);

			// Verify results
			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBe(2); // Mock data has 2 posts

			// Check first post structure
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
			});
		});

		it('should handle custom limit parameter', async () => {
			// Setup execution context with custom limit
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getAll',
					limit: 1,
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify client method calls
			expect(mockClient.ownProfile).toHaveBeenCalledTimes(1);
			expect(mockOwnProfile.posts).toHaveBeenCalledTimes(1);

			// Verify results - should only get 1 item due to limit
			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBe(1);
		});

		it('should handle empty posts list', async () => {
			// Setup empty posts response
			mockOwnProfile.posts.mockResolvedValue({
				async *[Symbol.asyncIterator]() {
					// Empty iterator
				},
			});

			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getAll',
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
			mockOwnProfile.posts.mockRejectedValue(new Error('API Error: Unable to fetch posts'));

			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getAll',
				},
				credentials: mockCredentials,
			});

			// Execute and expect error
			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow();

			// Verify client methods were called
			expect(mockClient.ownProfile).toHaveBeenCalledTimes(1);
			expect(mockOwnProfile.posts).toHaveBeenCalledTimes(1);
		});

		it('should handle malformed post data gracefully', async () => {
			// Setup posts response with malformed data
			const malformedPostsData = [
				{
					id: 12345,
					title: 'Valid Post',
					publishedAt: new Date('2024-01-15T10:30:00Z'),
					rawData: {
						subtitle: 'Valid subtitle',
						post_date: '2024-01-15T10:30:00Z',
						type: 'newsletter',
						published: true,
						paywalled: false,
						description: 'Valid description',
					},
				},
				{
					// Missing required fields to trigger skip logic
					id: null,
					publishedAt: new Date('invalid date'),
					rawData: {},
				},
			];

			mockOwnProfile.posts.mockResolvedValue({
				async *[Symbol.asyncIterator]() {
					for (const item of malformedPostsData) {
						yield item;
					}
				},
			});

			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getAll',
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Should only get valid posts (malformed ones are skipped)
			expect(result[0].length).toBe(2); // Both posts should be processed, even if one is malformed
		});

		it('should handle continueOnFail mode for post retrieval', async () => {
			// Setup client to throw error
			mockOwnProfile.posts.mockRejectedValue(new Error('API Error: Unable to fetch posts'));

			// Setup execution context with continueOnFail enabled
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getAll',
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
		it('should validate operation parameter for posts', async () => {
			// Setup execution context with invalid operation
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
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
		it('should format post retrieval output correctly', async () => {
			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getAll',
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify each post output structure
			result[0].forEach((output, index) => {
				expect(output).toHaveProperty('json');
				expect(output).toHaveProperty('pairedItem');
				expect(output.pairedItem).toEqual({ item: 0 });
				
				// Verify required fields for post list items
				const postData = output.json;
				expect(postData).toHaveProperty('id');
				expect(postData).toHaveProperty('title');
				expect(postData).toHaveProperty('subtitle');
				expect(postData).toHaveProperty('url');
				expect(postData).toHaveProperty('postDate');
				expect(postData).toHaveProperty('type');
				expect(postData).toHaveProperty('published');
				expect(postData).toHaveProperty('paywalled');
				expect(postData).toHaveProperty('description');
			});
		});

		it('should handle missing rawData fields gracefully', async () => {
			// Setup posts response with minimal data
			const minimalPostsData = [
				{
					id: 12345,
					title: 'Minimal Post',
					body: 'Minimal body',
					publishedAt: new Date('2024-01-15T10:30:00Z'),
					// rawData is missing most fields
					rawData: {},
				},
			];

			mockOwnProfile.posts.mockResolvedValue({
				async *[Symbol.asyncIterator]() {
					for (const item of minimalPostsData) {
						yield item;
					}
				},
			});

			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getAll',
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify it handles missing fields with defaults
			const postData = result[0][0].json;
			expect(postData.subtitle).toBe(''); // Default for missing subtitle
			expect(postData.type).toBe('newsletter'); // Default for missing type
			expect(postData.published).toBe(true); // Default for missing published
			expect(postData.paywalled).toBe(false); // Default for missing paywalled
			expect(postData.description).toBe('Minimal body'); // Falls back to body
		});
	});

	describe('Edge Cases', () => {
		it('should handle posts with invalid dates', async () => {
			// Setup posts response with no rawData.post_date and invalid publishedAt
			const postsWithInvalidDate = [
				{
					id: 12345,
					title: 'Post with invalid date',
					body: 'Test body',
					publishedAt: new Date('invalid date'), // This will be NaN
					rawData: {
						// post_date is missing, so it falls back to publishedAt
						type: 'newsletter',
						published: true,
						paywalled: false,
						description: 'Test description',
					},
				},
			];

			mockOwnProfile.posts.mockResolvedValue({
				async *[Symbol.asyncIterator]() {
					for (const item of postsWithInvalidDate) {
						yield item;
					}
				},
			});

			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getAll',
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Should handle invalid date gracefully
			expect(result[0].length).toBe(1);
			const postData = result[0][0].json;
			
			// Should have a valid date string (current date as fallback since publishedAt is invalid)
			expect(postData.postDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
		});

		it('should handle large limit values', async () => {
			// Setup execution context with very large limit
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getAll',
					limit: 10000,
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Should still work with available data
			expect(result[0].length).toBe(2); // Only 2 posts in mock data
		});
	});
});