import { Substack } from '../../nodes/Substack/Substack.node';
import { SubstackMockServer } from '../mocks/substackMockServer';
import { createMockExecuteFunctions } from '../mocks/mockExecuteFunctions';
import { mockCredentials } from '../mocks/mockData';

// Mock the entire substack-api module
jest.mock('substack-api');

describe('Substack Node E2E - Follow Operations', () => {
	let substackNode: Substack;

	beforeEach(() => {
		substackNode = new Substack();
		SubstackMockServer.cleanup();
	});

	afterEach(() => {
		SubstackMockServer.cleanup();
	});

	describe('Get Following', () => {
		it('should successfully retrieve following profiles with default limit', async () => {
			// Setup mocks
			SubstackMockServer.setupSuccessfulMocks();

			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'follow',
					operation: 'getFollowing',
					returnType: 'profiles',
					// limit will use default of 100
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify the result structure
			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBeGreaterThan(0);

			// Check the structure of returned data
			const firstItem = result[0][0];
			expect(firstItem.json).toHaveProperty('id');
			expect(firstItem.json).toHaveProperty('name');
			expect(firstItem.json).toHaveProperty('handle');
		});

		it('should successfully retrieve following IDs only', async () => {
			// Setup mocks
			SubstackMockServer.setupSuccessfulMocks();

			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'follow',
					operation: 'getFollowing',
					returnType: 'ids',
					limit: 10,
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify the result structure
			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBeGreaterThan(0);

			// Check that only ID is returned
			const firstItem = result[0][0];
			expect(firstItem.json).toHaveProperty('id');
			expect(firstItem.json).not.toHaveProperty('name');
			expect(firstItem.json).not.toHaveProperty('handle');
		});

		it('should handle empty limit parameter with default of 100', async () => {
			// Setup mocks
			SubstackMockServer.setupSuccessfulMocks();

			// Setup execution context with empty limit
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'follow',
					operation: 'getFollowing',
					returnType: 'profiles',
					limit: '',
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Should work with empty limit and apply default of 100
			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBeGreaterThan(0);
		});
	});
});