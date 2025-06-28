import { Substack } from '../../nodes/Substack/Substack.node';
import { createMockExecuteFunctions } from '../mocks/mockExecuteFunctions';
import { SubstackHttpServer } from '../mocks/substackHttpServer';
import { mockCredentials } from '../mocks/mockData';

// Mock the entire substack-api module

describe('Substack Node - Limit Parameter Handling', () => {
	let substackNode: Substack;

	beforeEach(() => {
		substackNode = new Substack();
		SubstackHttpServer.cleanup();
	});

	afterEach(() => {
		SubstackHttpServer.cleanup();
	});

	describe('Empty Limit Parameter (Fetch All)', () => {
		it('should handle empty limit for notes', async () => {
			// Setup mocks
			SubstackHttpServer.setupSuccessfulMocks();

			// Setup execution context with empty limit
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'get',
					limit: '',
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Should work with empty limit
			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBeGreaterThan(0);
		});

		it('should handle empty limit for posts', async () => {
			// Setup mocks
			SubstackHttpServer.setupSuccessfulMocks();

			// Setup execution context with empty limit
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getAll',
					limit: '',
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Should work with empty limit
			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBeGreaterThan(0);
		});

		it('should handle empty limit for comments', async () => {
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

			// Should work with empty limit
			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBeGreaterThan(0);
		});
	});

	describe('Null/Undefined Limit Parameter', () => {
		it('should handle null limit', async () => {
			// Setup mocks
			SubstackHttpServer.setupSuccessfulMocks();

			// Setup execution context with null limit
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'get',
					limit: null,
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Should work with null limit
			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
		});

		it('should handle undefined limit', async () => {
			// Setup mocks
			SubstackHttpServer.setupSuccessfulMocks();

			// Setup execution context with undefined limit
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'get',
					// limit is undefined
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Should work with undefined limit
			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
		});
	});

	describe('Numeric Limit Parameter', () => {
		it('should handle numeric limit values', async () => {
			// Setup mocks
			SubstackHttpServer.setupSuccessfulMocks();

			// Setup execution context with numeric limit
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

			// Should work with numeric limit
			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBeGreaterThan(0);
		});

		it('should handle string numeric limit values', async () => {
			// Setup mocks
			SubstackHttpServer.setupSuccessfulMocks();

			// Setup execution context with string numeric limit
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getAll',
					limit: '10',
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Should work with string numeric limit
			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBeGreaterThan(0);
		});
	});
});