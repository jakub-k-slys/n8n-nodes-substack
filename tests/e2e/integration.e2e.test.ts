import { Substack } from '../../nodes/Substack/Substack.node';
import { SubstackHttpServer } from '../mocks/substackHttpServer';
import { createMockExecuteFunctions } from '../mocks/mockExecuteFunctions';
import { mockCredentials } from '../mocks/mockData';

describe('Substack Node E2E - Integration Tests', () => {
	let substackNode: Substack;

	beforeEach(() => {
		substackNode = new Substack();
		SubstackHttpServer.cleanup();
	});

	afterEach(() => {
		SubstackHttpServer.cleanup();
	});

	describe('Multi-Item Processing', () => {
		it('should process multiple input items for note creation', async () => {
			// Setup mocks
			SubstackHttpServer.setupSuccessfulMocks();

			// Setup execution context with multiple input items
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: '={{$json.content}}', // Will be dynamically replaced
				},
				credentials: mockCredentials,
				inputData: [
					{ json: { content: 'First note content' } },
					{ json: { content: 'Second note content' } },
					{ json: { content: 'Third note content' } },
				],
			});

			// Override getNodeParameter to return different values for different items
			(mockExecuteFunctions.getNodeParameter as jest.Mock).mockImplementation(
				(name: string, itemIndex: number, defaultValue?: any) => {
					if (name === 'body') {
						const inputData = mockExecuteFunctions.getInputData();
						return inputData[itemIndex]?.json?.content || 'Default content';
					}
					if (name === 'resource') return 'note';
					if (name === 'operation') return 'create';
					return defaultValue;
				}
			);

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify results
			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBe(3); // Should create 3 notes

			// Check that each item was processed
			result[0].forEach((item, index) => {
				expect(item.json.noteId).toBe('12345');
				// Check pairedItem properly
				if (typeof item.pairedItem === 'object' && item.pairedItem !== null && 'item' in item.pairedItem) {
					expect(item.pairedItem.item).toBe(index);
				}
			});
		});

		it('should handle partial failures with continueOnFail enabled', async () => {
			// Setup mocks that will fail for some items
			SubstackHttpServer.setupNetworkErrorMocks();

			// Create mock that enables continueOnFail
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: 'Test content',
				},
				credentials: mockCredentials,
				inputData: [
					{ json: { id: 1 } },
					{ json: { id: 2 } },
				],
			});

			// Override continueOnFail to return true
			(mockExecuteFunctions.continueOnFail as jest.Mock).mockReturnValue(true);

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify results - should have error items
			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBe(2); // Should have 2 items (both errors)

			// Check that error items are properly formatted
			result[0].forEach((item) => {
				expect(item.json).toHaveProperty('error');
			});
		});
	});

	describe('Credential Validation', () => {
		it('should validate required credentials', async () => {
			// Setup execution context with missing credentials
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: 'Test content',
				},
				credentials: {}, // Empty credentials
			});

			// Override getCredentials to simulate missing credentials
			(mockExecuteFunctions.getCredentials as jest.Mock).mockRejectedValue(new Error('Credentials not found'));

			// Execute and expect error
			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow('Credentials not found');
		});

		it('should validate API key presence', async () => {
			// Setup execution context with missing API key
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: 'Test content',
				},
				credentials: {
					publicationAddress: 'https://testblog.substack.com',
					// apiKey is missing
				},
			});

			// Execute and expect error about missing API key
			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow('API key is required');
		});

		it('should validate publication URL format', async () => {
			// Setup execution context with invalid URL
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: 'Test content',
				},
				credentials: {
					apiKey: 'test-key',
					publicationAddress: 'invalid-url', // Invalid URL format
				},
			});

			// Execute and expect error about invalid URL
			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow('Invalid publication URL provided');
		});
	});

	describe('Integration Workflows', () => {
		it('should support a complete workflow: create note then get notes', async () => {
			// This test simulates a real workflow where we create a note and then retrieve all notes
			
			// Setup mocks for both operations
			SubstackHttpServer.setupSuccessfulMocks();

			// Step 1: Create a note
			const createNoteMockFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: 'Workflow test note',
				},
				credentials: mockCredentials,
			});

			const createResult = await substackNode.execute.call(createNoteMockFunctions);
			
			// Verify note creation
			expect(createResult[0].length).toBe(1);
			expect(createResult[0][0].json.noteId).toBe('12345');

			// Step 2: Get all notes
			const getNotesRequest = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'get',
					limit: 10,
				},
				credentials: mockCredentials,
			});

			const getResult = await substackNode.execute.call(getNotesRequest);
			
			// Verify notes retrieval
			expect(getResult[0].length).toBe(2); // Based on mock data
			expect(getResult[0][0].json.noteId).toBe('11111');
			expect(getResult[0][1].json.noteId).toBe('22222');
		});

		it('should support mixed resource operations in sequence', async () => {
			// Test accessing both notes and posts with the same credentials
			
			SubstackHttpServer.setupSuccessfulMocks();

			// Get posts
			const getPostsMockFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getAll',
					limit: 5,
				},
				credentials: mockCredentials,
			});

			const postsResult = await substackNode.execute.call(getPostsMockFunctions);
			expect(postsResult[0].length).toBe(2);

			// Get notes  
			const getNotesMockFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'get',
					limit: 5,
				},
				credentials: mockCredentials,
			});

			const notesResult = await substackNode.execute.call(getNotesMockFunctions);
			expect(notesResult[0].length).toBe(2);
		});
	});

	describe('URL and Response Formatting', () => {
		it('should correctly format URLs for different publication addresses', async () => {
			// Setup mocks for custom domain
			const customDomain = 'https://custom-domain.com';
			
			SubstackHttpServer.setupSuccessfulMocks();

			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: 'Test note',
				},
				credentials: {
					apiKey: 'test-key',
					publicationAddress: customDomain,
				},
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);
			
			// Verify URL formatting
			expect(result[0][0].json.url).toBe(`${customDomain}/p/12345`);
		});

		it('should handle trailing slashes in publication addresses', async () => {
			// Setup mocks with trailing slash
			const domainWithSlash = 'https://testblog.substack.com/';
			
			SubstackHttpServer.setupSuccessfulMocks();

			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: 'Test note',
				},
				credentials: {
					apiKey: 'test-key',
					publicationAddress: domainWithSlash,
				},
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);
			
			// URL should not have double slashes
			expect(result[0][0].json.url).toBe('https://testblog.substack.com/p/12345');
		});
	});
});