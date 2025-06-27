import { Substack } from '../../nodes/Substack/Substack.node';
import { SubstackMockServer } from '../mocks/substackMockServer';
import { createMockExecuteFunctions } from '../mocks/mockExecuteFunctions';
import { mockCredentials } from '../mocks/mockData';

describe('Substack Node E2E - Post Operations', () => {
	let substackNode: Substack;

	beforeEach(() => {
		substackNode = new Substack();
		SubstackMockServer.cleanup();
	});

	afterEach(() => {
		SubstackMockServer.cleanup();
	});

	describe('Post Retrieval', () => {
		it('should successfully retrieve posts with default limit', async () => {
			// Setup mocks
			SubstackMockServer.setupSuccessfulMocks();

			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getAll',
					// limit will use default of 50
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify results
			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBe(2); // Mock data has 2 posts

			// Check first post
			const firstPost = result[0][0];
			expect(firstPost.json).toMatchObject({
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

			// Check second post
			const secondPost = result[0][1];
			expect(secondPost.json).toMatchObject({
				id: 87654,
				title: 'Another Test Post',
				subtitle: 'More testing content',
				url: 'https://testblog.substack.com/p/87654',
				postDate: '2024-01-09T09:30:00Z',
				type: 'newsletter',
				published: true,
				paywalled: true,
				description: 'This is another test post.',
			});
		});

		it('should handle custom limit parameter', async () => {
			// Setup mocks
			SubstackMockServer.setupSuccessfulMocks();

			// Setup execution context with custom limit
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getAll',
					limit: 10,
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify results - should still get all mock data since we have only 2 items
			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBe(2);
		});

		it('should handle empty posts list', async () => {
			// Setup empty response mocks
			SubstackMockServer.setupEmptyResponseMocks();

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

		it('should handle authentication errors gracefully', async () => {
			// Setup auth error mocks
			SubstackMockServer.setupAuthErrorMocks();

			// Setup execution context with invalid credentials
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getAll',
				},
				credentials: {
					...mockCredentials,
					apiKey: 'invalid-api-key',
				},
			});

			// Execute and expect it to handle the error
			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow();
		});

		it('should handle network errors', async () => {
			// Setup network error mocks
			SubstackMockServer.setupNetworkErrorMocks();

			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getAll',
				},
				credentials: mockCredentials,
			});

			// Execute and expect network error
			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow();
		});

		it('should handle invalid operation for post resource', async () => {
			// Setup execution context with invalid operation
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'create', // Posts don't support create operation
				},
				credentials: mockCredentials,
			});

			// Execute and expect error
			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow('Unknown operation: create');
		});
	});

	describe('Edge Cases and Pagination', () => {
		it('should handle very large limit values', async () => {
			// Setup mocks
			SubstackMockServer.setupSuccessfulMocks();

			// Setup execution context with large limit
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getAll',
					limit: 1000,
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Should still work and return available data
			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBe(2); // Only 2 items in mock data
		});

		it('should handle zero limit', async () => {
			// Setup mocks
			SubstackMockServer.setupSuccessfulMocks();

			// Setup execution context with zero limit
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getAll',
					limit: 0,
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Should handle gracefully
			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
		});

		it('should handle malformed post data gracefully', async () => {
			// Setup mock with malformed data
			const malformedResponse = [
				{
					// Missing required fields
					id: 123,
					// title is missing
					type: 'newsletter',
				},
			];

			// Mock the API response directly through the library mock
			SubstackMockServer.setupCustomMock({
				getPosts: jest.fn().mockReturnValue(async function* () {
					yield malformedResponse[0];
				}()),
				publishNote: jest.fn(),
				getNotes: jest.fn(),
			});

			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getAll',
				},
				credentials: mockCredentials,
			});

			// Execute the node - should handle malformed data
			const result = await substackNode.execute.call(mockExecuteFunctions);

			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBe(1);
			
			// Should handle missing title gracefully
			const outputData = result[0][0];
			expect(outputData.json.id).toBe(123);
			expect(outputData.json.title).toBe(''); // Should default to empty string
		});
	});
});