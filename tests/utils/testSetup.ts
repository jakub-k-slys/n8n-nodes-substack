import {
	createMockSubstackClient,
	createMockOwnProfile,
	createMockNoteBuilder,
	createMockParagraphBuilder,
	createMockPost,
} from '../mocks/mockSubstackClient';

/**
 * Note: Mock setup should be done at module level in each test file
 * This function is kept for documentation but the actual mocks should be set up like this:
 * 
 * jest.mock('substack-api', () => ({
 *     SubstackClient: jest.fn(),
 * }));
 * 
 * jest.mock('../../nodes/Substack/SubstackUtils', () => ({
 *     SubstackUtils: {
 *         initializeClient: jest.fn(),
 *         formatUrl: jest.fn((base: string, path: string) => `${base}${path}`),
 *         formatErrorResponse: jest.fn((error: any) => ({ success: false, error: error.message })),
 *     },
 * }));
 */
export const setupStandardMocks = () => {
	// This is a no-op function - mocks must be set up at module level
	console.warn('setupStandardMocks() called - mocks should be set up at module level instead');
};

/**
 * Creates a complete test environment with all necessary mocks configured
 * Returns all mock objects needed for testing
 */
export const createTestEnvironment = () => {
	// Create all mock objects
	const mockClient = createMockSubstackClient();
	const mockOwnProfile = createMockOwnProfile();
	const mockNoteBuilder = createMockNoteBuilder();
	const mockParagraphBuilder = createMockParagraphBuilder();
	const mockPost = createMockPost();

	// Setup standard method chain mocks
	mockClient.ownProfile.mockResolvedValue(mockOwnProfile);
	mockClient.profileForSlug.mockResolvedValue(mockOwnProfile);
	mockClient.profileForId.mockResolvedValue(mockOwnProfile);
	mockClient.postForId.mockResolvedValue(mockPost);
	mockOwnProfile.newNote.mockReturnValue(mockNoteBuilder);
	mockNoteBuilder.paragraph.mockReturnValue(mockParagraphBuilder);

	// Mock SubstackUtils.initializeClient to return our mocked client
	const { SubstackUtils } = require('../../nodes/Substack/SubstackUtils');
	SubstackUtils.initializeClient.mockResolvedValue({
		client: mockClient,
		publicationAddress: 'https://testblog.substack.com',
	});

	return {
		mockClient,
		mockOwnProfile,
		mockNoteBuilder,
		mockParagraphBuilder,
		mockPost,
	};
};

/**
 * Resets all mocks to their initial state
 * Should be called in beforeEach hooks
 */
export const resetAllMocks = () => {
	jest.clearAllMocks();
};

/**
 * Creates a mock execution environment with error simulation capabilities
 */
export const createErrorTestEnvironment = (errorType: 'initialization' | 'profile' | 'api' | 'builder') => {
	const env = createTestEnvironment();
	
	switch (errorType) {
		case 'initialization':
			const { SubstackUtils } = require('../../nodes/Substack/SubstackUtils');
			SubstackUtils.initializeClient.mockRejectedValue(new Error('Invalid credentials'));
			break;
		case 'profile':
			env.mockClient.ownProfile.mockRejectedValue(new Error('Profile error'));
			break;
		case 'api':
			env.mockOwnProfile.posts.mockRejectedValue(new Error('API Error: Unable to fetch data'));
			break;
		case 'builder':
			env.mockParagraphBuilder.publish.mockRejectedValue(new Error('API Error: Failed to publish'));
			break;
	}
	
	return env;
};