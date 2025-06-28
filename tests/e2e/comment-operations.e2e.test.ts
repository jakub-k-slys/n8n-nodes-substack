import { Substack } from '../../nodes/Substack/Substack.node';
import { createMockExecuteFunctions } from '../mocks/mockExecuteFunctions';
import { SubstackHttpServer } from '../mocks/substackHttpServer';
import { mockCredentials } from '../mocks/mockData';

// Mock the entire substack-api module

describe('Substack Node - Comment Operations', () => {
	let substackNode: Substack;

	beforeEach(() => {
		substackNode = new Substack();
		SubstackHttpServer.cleanup();
	});

	afterEach(() => {
		SubstackHttpServer.cleanup();
	});

	describe('Comment getAll Operation', () => {
		it('should retrieve comments successfully', async () => {
			// Setup mocks
			SubstackHttpServer.setupSuccessfulMocks();

			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'comment',
					operation: 'getAll',
					postId: 98765,
					limit: 10,
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify results
			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBe(2); // Should match mockCommentsListResponse

			// Check first comment structure
			const firstComment = result[0][0];
			expect(firstComment.json).toMatchObject({
				id: 33333,
				body: 'Great article! Thanks for sharing.',
				createdAt: '2024-01-15T14:20:00Z',
				parentPostId: 98765,
				author: {
					id: 11111,
					name: 'John Doe',
					isAdmin: false,
				},
			});

			// Check second comment structure
			const secondComment = result[0][1];
			expect(secondComment.json).toMatchObject({
				id: 44444,
				body: 'I have a question about this topic.',
				createdAt: '2024-01-15T15:30:00Z',
				parentPostId: 98765,
				author: {
					id: 22222,
					name: 'Jane Smith',
					isAdmin: true,
				},
			});
		});

		it('should handle empty limit parameter (fetch all)', async () => {
			// Setup mocks
			SubstackHttpServer.setupSuccessfulMocks();

			// Setup execution context with empty limit
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'comment',
					operation: 'getAll',
					postId: 98765,
					limit: '',
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

		it('should handle authentication errors', async () => {
			// Setup mocks for auth error
			SubstackHttpServer.setupAuthErrorMocks();

			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'comment',
					operation: 'getAll',
					postId: 98765,
					limit: 10,
				},
				credentials: {
					...mockCredentials,
					apiKey: 'invalid-key',
				},
			});

			// Execute the node and expect it to throw
			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow('Request failed: Unauthorized');
		});

		it('should handle empty response', async () => {
			// Setup mocks for empty response
			SubstackHttpServer.setupEmptyResponseMocks();

			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'comment',
					operation: 'getAll',
					postId: 98765,
					limit: 10,
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Should handle empty response gracefully
			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBe(0);
		});

		it('should handle custom limit parameter', async () => {
			// Setup mocks
			SubstackHttpServer.setupSuccessfulMocks();

			// Setup execution context with custom limit
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'comment',
					operation: 'getAll',
					postId: 98765,
					limit: 5,
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
	});

	describe('Comment Operation Errors', () => {
		it('should throw error for unknown operation', async () => {
			// Setup mocks
			SubstackHttpServer.setupSuccessfulMocks();

			// Setup execution context with invalid operation
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'comment',
					operation: 'invalidOperation',
					postId: 98765,
				},
				credentials: mockCredentials,
			});

			// Execute the node and expect it to throw
			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow('Unknown operation: invalidOperation');
		});
	});
});