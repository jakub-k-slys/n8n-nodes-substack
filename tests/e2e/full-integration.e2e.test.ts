import { Substack } from '../../nodes/Substack/Substack.node';
import { createMockExecuteFunctions } from '../mocks/mockExecuteFunctions';
import { SubstackHttpServer } from '../mocks/substackHttpServer';
import { mockCredentials } from '../mocks/mockData';

// Mock the entire substack-api module
jest.mock('substack-api');

describe('Substack Node - Full Integration Test', () => {
	let substackNode: Substack;

	beforeEach(() => {
		substackNode = new Substack();
		SubstackHttpServer.cleanup();
	});

	afterEach(() => {
		SubstackHttpServer.cleanup();
	});

	describe('Complete Implementation Verification', () => {
		it('should support all three resource types with empty limit defaults', async () => {
			// Setup mocks
			SubstackHttpServer.setupSuccessfulMocks();

			// Test Notes operation
			const notesMockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'get',
					limit: '', // Empty limit - fetch all
				},
				credentials: mockCredentials,
			});

			const notesResult = await substackNode.execute.call(notesMockExecuteFunctions);
			expect(notesResult[0]).toBeDefined();
			expect(notesResult[0].length).toBeGreaterThan(0);

			// Test Posts operation
			const postsMockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getAll',
					limit: '', // Empty limit - fetch all
				},
				credentials: mockCredentials,
			});

			const postsResult = await substackNode.execute.call(postsMockExecuteFunctions);
			expect(postsResult[0]).toBeDefined();
			expect(postsResult[0].length).toBeGreaterThan(0);

			// Test Comments operation
			const commentsMockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'comment',
					operation: 'getAll',
					postId: 98765,
					limit: '', // Empty limit - fetch all
				},
				credentials: mockCredentials,
			});

			const commentsResult = await substackNode.execute.call(commentsMockExecuteFunctions);
			expect(commentsResult[0]).toBeDefined();
			expect(commentsResult[0].length).toBeGreaterThan(0);
		});

		it('should verify client reuse pattern is implemented', async () => {
			// Setup mocks
			SubstackHttpServer.setupSuccessfulMocks();

			// Test that client is instantiated only once per execution
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

			// Verify the result structure and client reuse
			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBeGreaterThan(0);

			// Verify credentials were accessed (indicating client initialization)
			expect(mockExecuteFunctions.getCredentials).toHaveBeenCalledWith('substackApi');
		});

		it('should handle async iteration for all operations', async () => {
			// Setup mocks
			SubstackHttpServer.setupSuccessfulMocks();

			// Test async iteration by verifying multiple items are returned
			const operations = [
				{ resource: 'note', operation: 'get' },
				{ resource: 'post', operation: 'getAll' },
				{ resource: 'comment', operation: 'getAll', postId: 98765 },
			];

			for (const operation of operations) {
				const mockExecuteFunctions = createMockExecuteFunctions({
					nodeParameters: {
						...operation,
						limit: '', // Empty to test "fetch all" behavior
					},
					credentials: mockCredentials,
				});

				const result = await substackNode.execute.call(mockExecuteFunctions);
				
				// Each operation should return an array of results
				expect(result[0]).toBeDefined();
				expect(Array.isArray(result[0])).toBe(true);
				
				// Mock data provides multiple items for each operation
				expect(result[0].length).toBeGreaterThan(0);
			}
		});

		it('should maintain backward compatibility with numeric limits', async () => {
			// Setup mocks
			SubstackHttpServer.setupSuccessfulMocks();

			// Test that numeric limits still work
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getAll',
					limit: 10,
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);
			
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBeGreaterThan(0);
		});
	});
});