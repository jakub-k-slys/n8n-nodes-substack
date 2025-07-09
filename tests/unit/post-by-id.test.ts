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

describe('Substack Node - getPostById Operation', () => {
	let substackNode: Substack;
	let mockClient: any;
	let mockPost: any;

	beforeEach(() => {
		// Reset all mocks
		jest.clearAllMocks();
		
		substackNode = new Substack();
		mockClient = createMockSubstackClient();
		mockPost = createMockPost();

		// Override the postForId mock to return our detailed mock post
		mockClient.postForId.mockResolvedValue(mockPost);

		// Mock SubstackUtils.initializeClient to return our mocked client
		const { SubstackUtils } = require('../../nodes/Substack/SubstackUtils');
		SubstackUtils.initializeClient.mockResolvedValue({
			client: mockClient,
			publicationAddress: 'https://testblog.substack.com',
		});
	});

	describe('Post Retrieval by ID', () => {
		it('should successfully retrieve a post by ID', async () => {
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getPostById',
					postId: '98765',
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify client method was called correctly
			expect(mockClient.postForId).toHaveBeenCalledTimes(1);
			expect(mockClient.postForId).toHaveBeenCalledWith('98765');

			// Verify results structure
			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBe(1);

			// Check the returned post data structure
			const postData = result[0][0].json;
			expect(postData).toMatchObject({
				id: 98765,
				title: 'Test Post Title',
				subtitle: 'A comprehensive guide to testing',
				url: 'https://testblog.substack.com/p/98765',
				postDate: '2024-01-10T12:00:00Z',
				type: 'newsletter',
				published: true,
				paywalled: false,
				description: 'This is a test post for integration testing.',
			});
		});

		it('should handle post with minimal data', async () => {
			// Create a post with minimal data
			const minimalPost = {
				id: 12345,
				title: 'Minimal Post',
				body: 'Just the basics',
				publishedAt: new Date('2024-01-15T10:30:00Z'),
				rawData: {}, // Empty rawData
			};

			mockClient.postForId.mockResolvedValue(minimalPost);

			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getPostById',
					postId: '12345',
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);

			const postData = result[0][0].json;
			expect(postData).toMatchObject({
				id: 12345,
				title: 'Minimal Post',
				subtitle: '', // Should default to empty string
				type: 'newsletter', // Should default to 'newsletter'
				published: true, // Should default to true
				paywalled: false, // Should default to false
				description: 'Just the basics', // Should fall back to body
			});
		});

		it('should handle post with invalid publishedAt date', async () => {
			// Create a post with invalid date
			const postWithInvalidDate = {
				id: 12345,
				title: 'Post with invalid date',
				body: 'Test content',
				publishedAt: new Date('invalid date'), // Invalid date
				rawData: {
					// no post_date either
					type: 'newsletter',
					published: true,
					paywalled: false,
				},
			};

			mockClient.postForId.mockResolvedValue(postWithInvalidDate);

			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getPostById',
					postId: '12345',
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);

			const postData = result[0][0].json;
			// Should have a valid date string (current date as fallback)
			expect(postData.postDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
		});

		it('should handle postForId API errors', async () => {
			// Mock the API to return a 404 error
			mockClient.postForId.mockRejectedValue(new Error('Post not found'));

			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getPostById',
					postId: '999999',
				},
				credentials: mockCredentials,
			});

			// Should throw the error (this will be caught by the calling code)
			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow('Post not found');

			expect(mockClient.postForId).toHaveBeenCalledWith('999999');
		});

		it('should handle numeric postId parameter', async () => {
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getPostById',
					postId: 159325011, // Numeric ID like in the issue
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Should convert to string and call API
			expect(mockClient.postForId).toHaveBeenCalledWith(159325011);
			expect(result[0][0].json.id).toBe(98765); // From mock data
		});

		it('should handle the specific post ID from the issue (159325011)', async () => {
			// Test the exact scenario mentioned in the issue
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getPostById',
					postId: '159325011',
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify the API is called with the correct ID
			expect(mockClient.postForId).toHaveBeenCalledWith('159325011');
			expect(result[0]).toBeDefined();
			expect(result[0][0].json).toHaveProperty('id');
			expect(result[0][0].json).toHaveProperty('title');
			// Should not throw a 404 error since we're using the correct client method
		});

		it('should format URL correctly', async () => {
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getPostById',
					postId: '98765',
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);

			const postData = result[0][0].json;
			expect(postData.url).toBe('https://testblog.substack.com/p/98765');
		});
	});

	describe('Edge Cases', () => {
		it('should handle post with paywalled content', async () => {
			const paywalledPost = {
				id: 98765,
				title: 'Premium Content',
				body: 'This is premium content',
				publishedAt: new Date('2024-01-10T12:00:00Z'),
				rawData: {
					subtitle: 'Exclusive for subscribers',
					post_date: '2024-01-10T12:00:00Z',
					type: 'newsletter',
					published: true,
					paywalled: true,
					description: 'This is premium content',
				},
			};

			mockClient.postForId.mockResolvedValue(paywalledPost);

			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getPostById',
					postId: '98765',
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);

			const postData = result[0][0].json;
			expect(postData.paywalled).toBe(true);
		});

		it('should handle post with podcast type', async () => {
			const podcastPost = {
				id: 98765,
				title: 'Podcast Episode',
				body: 'Audio content',
				publishedAt: new Date('2024-01-10T12:00:00Z'),
				rawData: {
					type: 'podcast',
					published: true,
					paywalled: false,
				},
			};

			mockClient.postForId.mockResolvedValue(podcastPost);

			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getPostById',
					postId: '98765',
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);

			const postData = result[0][0].json;
			expect(postData.type).toBe('podcast');
		});
	});
});