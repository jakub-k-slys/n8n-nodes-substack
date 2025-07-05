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

describe('Substack Node Unit Tests - Follow Operations', () => {
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

	describe('Following Retrieval', () => {
		it('should successfully retrieve following profiles with default returnType', async () => {
			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'follow',
					operation: 'getFollowing',
					// returnType will default to 'profiles'
					// limit will use default
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify client method calls
			expect(mockClient.ownProfile).toHaveBeenCalledTimes(1);
			expect(mockOwnProfile.followees).toHaveBeenCalledTimes(1);

			// Verify results
			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBe(3); // Mock data has 3 following profiles

			// Check first profile structure
			const firstProfile = result[0][0];
			expect(firstProfile.json).toMatchObject({
				id: expect.any(Number),
				name: expect.any(String),
				handle: expect.any(String),
				bio: expect.any(String),
				subscriberCount: 0, // Not available in new API
				subscriberCountString: '', // Not available in new API
			});
		});

		it('should retrieve following IDs when returnType is ids', async () => {
			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'follow',
					operation: 'getFollowing',
					returnType: 'ids',
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify client method calls
			expect(mockClient.ownProfile).toHaveBeenCalledTimes(1);
			expect(mockOwnProfile.followees).toHaveBeenCalledTimes(1);

			// Verify results - should only return IDs
			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBe(3); // Mock data has 3 following profiles

			// Check that only IDs are returned
			result[0].forEach((output) => {
				expect(output.json).toMatchObject({
					id: expect.any(Number),
				});
				// Should not have profile fields
				expect(output.json).not.toHaveProperty('name');
				expect(output.json).not.toHaveProperty('handle');
				expect(output.json).not.toHaveProperty('bio');
			});
		});

		it('should handle custom limit parameter', async () => {
			// Setup execution context with custom limit
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'follow',
					operation: 'getFollowing',
					returnType: 'profiles',
					limit: 1,
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify client method calls
			expect(mockClient.ownProfile).toHaveBeenCalledTimes(1);
			expect(mockOwnProfile.followees).toHaveBeenCalledTimes(1);

			// Verify results - should only get 1 item due to limit
			expect(result).toBeDefined();
			expect(result[0]).toBeDefined();
			expect(result[0].length).toBe(1);
		});

		it('should handle empty following list', async () => {
			// Setup empty following response
			mockOwnProfile.followees.mockResolvedValue({
				async *[Symbol.asyncIterator]() {
					// Empty iterator
				},
			});

			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'follow',
					operation: 'getFollowing',
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
			mockOwnProfile.followees.mockRejectedValue(new Error('API Error: Unable to fetch following'));

			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'follow',
					operation: 'getFollowing',
				},
				credentials: mockCredentials,
			});

			// Execute and expect error
			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow();

			// Verify client methods were called
			expect(mockClient.ownProfile).toHaveBeenCalledTimes(1);
			expect(mockOwnProfile.followees).toHaveBeenCalledTimes(1);
		});

		it('should handle ownProfile errors', async () => {
			// Setup client to throw error when fetching profile
			mockClient.ownProfile.mockRejectedValue(new Error('Unable to fetch profile'));

			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'follow',
					operation: 'getFollowing',
				},
				credentials: mockCredentials,
			});

			// Execute and expect error
			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow();

			// Verify client methods were called
			expect(mockClient.ownProfile).toHaveBeenCalledTimes(1);
		});

		it('should handle continueOnFail mode for following retrieval', async () => {
			// Setup client to throw error
			mockOwnProfile.followees.mockRejectedValue(new Error('API Error: Unable to fetch following'));

			// Setup execution context with continueOnFail enabled
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'follow',
					operation: 'getFollowing',
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
		it('should validate operation parameter for following', async () => {
			// Setup execution context with invalid operation
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'follow',
					operation: 'invalid_operation',
				},
				credentials: mockCredentials,
			});

			// Execute and expect error
			await expect(
				substackNode.execute.call(mockExecuteFunctions)
			).rejects.toThrow('Unknown operation: invalid_operation');
		});

		it('should handle invalid returnType gracefully', async () => {
			// Setup execution context with invalid returnType (should default to profiles)
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'follow',
					operation: 'getFollowing',
					returnType: 'invalid_type',
				},
				credentials: mockCredentials,
			});

			// Execute the node - should default to profiles behavior
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Should return full profiles (not just IDs)
			expect(result[0][0].json).toHaveProperty('name');
			expect(result[0][0].json).toHaveProperty('handle');
			expect(result[0][0].json).toHaveProperty('bio');
		});
	});

	describe('Output Formatting', () => {
		it('should format following profiles output correctly', async () => {
			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'follow',
					operation: 'getFollowing',
					returnType: 'profiles',
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify each following output structure
			result[0].forEach((output, index) => {
				expect(output).toHaveProperty('json');
				expect(output).toHaveProperty('pairedItem');
				expect(output.pairedItem).toEqual({ item: 0 });
				
				// Verify required fields for following profiles
				const followingData = output.json;
				expect(followingData).toHaveProperty('id');
				expect(followingData).toHaveProperty('name');
				expect(followingData).toHaveProperty('handle');
				expect(followingData).toHaveProperty('bio');
				expect(followingData).toHaveProperty('subscriberCount');
				expect(followingData).toHaveProperty('subscriberCountString');
			});
		});

		it('should format following IDs output correctly', async () => {
			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'follow',
					operation: 'getFollowing',
					returnType: 'ids',
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify each following ID output structure
			result[0].forEach((output, index) => {
				expect(output).toHaveProperty('json');
				expect(output).toHaveProperty('pairedItem');
				expect(output.pairedItem).toEqual({ item: 0 });
				
				// Verify only ID field for following IDs
				const followingData = output.json;
				expect(followingData).toHaveProperty('id');
				
				// Should not have other profile fields
				expect(followingData).not.toHaveProperty('name');
				expect(followingData).not.toHaveProperty('handle');
				expect(followingData).not.toHaveProperty('bio');
			});
		});

		it('should handle missing profile fields gracefully', async () => {
			// Setup following response with minimal data
			const minimalFollowingData = [
				{
					id: 12345,
					// name is missing
					slug: 'testuser',
					// bio is missing
				},
			];

			mockOwnProfile.followees.mockResolvedValue({
				async *[Symbol.asyncIterator]() {
					for (const item of minimalFollowingData) {
						yield item;
					}
				},
			});

			// Setup execution context
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'follow',
					operation: 'getFollowing',
					returnType: 'profiles',
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Verify it handles missing fields gracefully
			const followingData = result[0][0].json;
			expect(followingData.id).toBe(12345);
			expect(followingData.name).toBeUndefined(); // Missing name field
			expect(followingData.handle).toBe('testuser'); // Uses slug as handle
			expect(followingData.bio).toBeUndefined(); // Missing bio field
		});
	});

	describe('Edge Cases', () => {
		it('should handle large limit values', async () => {
			// Setup execution context with very large limit
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'follow',
					operation: 'getFollowing',
					returnType: 'profiles',
					limit: 10000,
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Should still work with available data
			expect(result[0].length).toBe(3); // Only 3 following profiles in mock data
		});

		it('should handle zero limit', async () => {
			// Setup execution context with zero limit
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'follow',
					operation: 'getFollowing',
					limit: 0,
				},
				credentials: mockCredentials,
			});

			// Execute the node
			const result = await substackNode.execute.call(mockExecuteFunctions);

			// Should return no followees due to zero limit
			expect(result[0].length).toBe(0);
		});

		it('should handle empty limit parameter', async () => {
			// Setup execution context with empty limit (should use default)
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

			// Should use default limit and return all available data
			expect(result[0].length).toBe(3);
		});
	});
});