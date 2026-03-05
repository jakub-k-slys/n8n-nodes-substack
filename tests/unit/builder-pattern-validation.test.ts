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

describe('Note Creation API Tests', () => {
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

	describe('Correct publishNote API Usage', () => {
		it('should call ownProfile.publishNote() with note content', async () => {
			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: 'Hello world',
					visibility: 'everyone',
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// 1. ownProfile should be called
			expect(mockClient.ownProfile).toHaveBeenCalledTimes(1);

			// 2. publishNote() should be called on ownProfile with correct content
			expect(mockOwnProfile.publishNote).toHaveBeenCalledWith('Hello world', undefined);

			// Verify success
			expect(result[0][0].json).toHaveProperty('success', true);
		});

		it('should call publishNote with attachment when link is provided', async () => {
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: 'Note with link',
					attachment: 'link',
					linkUrl: 'https://example.com',
					visibility: 'everyone',
				},
				credentials: mockCredentials,
			});

			await substackNode.execute.call(mockExecuteFunctions);

			expect(mockOwnProfile.publishNote).toHaveBeenCalledWith('Note with link', {
				attachment: 'https://example.com',
			});
		});

		it('should provide early validation for empty content before attempting to publish', async () => {
			// Setup execution context with empty content
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: '',
					visibility: 'everyone',
				},
				credentials: mockCredentials,
			});

			// Execute and expect validation error BEFORE publishNote is called
			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow('Note must contain at least one paragraph with content - body cannot be empty');

			// Verify that publishNote was not called since validation failed early
			expect(mockOwnProfile.publishNote).not.toHaveBeenCalled();
		});

		it('should handle publishNote API errors', async () => {
			mockOwnProfile.publishNote.mockRejectedValue(new Error('API Error: Failed to publish'));

			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: 'Test note',
					visibility: 'everyone',
				},
				credentials: mockCredentials,
			});

			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow();

			expect(mockOwnProfile.publishNote).toHaveBeenCalledTimes(1);
		});
	});

	describe('Pattern Compliance Tests', () => {
		it('should trim content before publishing', async () => {
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: '  Hello world  ',
				},
				credentials: mockCredentials,
			});

			await substackNode.execute.call(mockExecuteFunctions);

			// Verify content is trimmed
			const calls = mockOwnProfile.publishNote.mock.calls;
			expect(calls[0][0]).toBe('Hello world');
		});

		it('should include noteId from publishNote response', async () => {
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'create',
					body: 'Hello world',
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);

			// publishNote returns { id: 12345 }, so noteId should be '12345'
			expect(result[0][0].json).toHaveProperty('noteId', '12345');
		});
	});
});
