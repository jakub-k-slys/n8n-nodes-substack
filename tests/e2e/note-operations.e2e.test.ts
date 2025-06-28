import { Substack } from '../../nodes/Substack/Substack.node';
import { SubstackHttpServer } from '../mocks/substackHttpServer';
import { createMockExecuteFunctions } from '../mocks/mockExecuteFunctions';
import { mockCredentials } from '../mocks/mockData';

describe('Substack Node E2E - Note Operations', () => {
	let substackNode: Substack;

	beforeEach(() => {
		substackNode = new Substack();
		SubstackHttpServer.cleanup();
	});

	afterEach(() => {
		SubstackHttpServer.cleanup();
	});

	describe('Note Creation', () => {
		it('should successfully create a note with valid inputs', async () => {
			// Setup mocks
			SubstackHttpServer.setupSuccessfulMocks();

			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: 'This is a test note from n8n integration',
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify results
			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBe(1);

			const outputData = result[0][0];
			expect(outputData.json).toMatchObject({
				noteId: '12345',
				body: 'This is a test note from n8n integration',
				url: 'https://testblog.substack.com/p/12345',
				status: 'published',
				userId: '67890',
			});
		});

		it('should handle missing body parameter', async () => {
			// Setup execution context with missing body
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					// body is missing
				},
				credentials: mockCredentials,
			});

			// Execute and expect error
			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow('Body is required');
		});

		it('should handle authentication errors gracefully', async () => {
			// Setup auth error mocks
			SubstackHttpServer.setupAuthErrorMocks();

			// Setup execution context with invalid credentials
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: 'This note should fail due to auth error',
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
	});

	describe('Note Retrieval', () => {
		it('should successfully retrieve notes with default limit', async () => {
			// Setup mocks
			SubstackHttpServer.setupSuccessfulMocks();

			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'get',
					// limit will use default of 10
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify results
			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBe(2); // Mock data has 2 notes

			// Check first note
			const firstNote = result[0][0];
			expect(firstNote.json).toMatchObject({
				noteId: '11111',
				body: 'First test note',
				url: 'https://testblog.substack.com/p/11111',
				status: 'published',
				userId: '67890',
				likes: 5,
				restacks: 2,
				type: 'note',
				entityKey: 'note_1',
			});

			// Check second note
			const secondNote = result[0][1];
			expect(secondNote.json).toMatchObject({
				noteId: '22222',
				body: 'Second test note',
				url: 'https://testblog.substack.com/p/22222',
				status: 'published',
				userId: '67890',
				likes: 3,
				restacks: 1,
				type: 'note',
				entityKey: 'note_2',
			});
		});

		it('should handle custom limit parameter', async () => {
			// Setup mocks
			SubstackHttpServer.setupSuccessfulMocks();

			// Setup execution context with custom limit
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'get',
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

		it('should handle empty notes list', async () => {
			// Setup empty response mocks
			SubstackHttpServer.setupEmptyResponseMocks();

			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'get',
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
	});

	describe('Error Handling', () => {
		it('should handle network errors', async () => {
			// Setup network error mocks
			SubstackHttpServer.setupNetworkErrorMocks();

			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: 'This should fail with network error',
				},
				credentials: mockCredentials,
			});

			// Execute and expect network error
			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow();
		});

		it('should handle invalid resource type', async () => {
			// Setup execution context with invalid resource
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'invalid_resource',
					operation: 'create',
				},
				credentials: mockCredentials,
			});

			// Execute and expect error
			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow('Unknown resource: invalid_resource');
		});

		it('should handle invalid operation type', async () => {
			// Setup execution context with invalid operation
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
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
});