import {
	createMockSubstackClient,
	createMockOwnProfile,
	createMockPost,
} from '../mocks/mockSubstackClient';

/**
 * Creates a complete test environment with all necessary mocks configured
 * Returns all mock objects needed for testing
 */
export const createTestEnvironment = () => {
	// Create all mock objects
	const mockClient = createMockSubstackClient();
	const mockOwnProfile = createMockOwnProfile();
	const mockPost = createMockPost();

	// Setup standard method chain mocks
	mockClient.ownProfile.mockResolvedValue(mockOwnProfile);
	mockClient.profileForSlug.mockResolvedValue(mockOwnProfile);
	mockClient.postForId.mockResolvedValue(mockPost);

	// Mock SubstackUtils.initializeClient to return our mocked client
	const { SubstackUtils } = require('../../nodes/Substack/SubstackUtils');
	SubstackUtils.initializeClient.mockResolvedValue({
		client: mockClient,
		publicationAddress: 'https://testblog.substack.com',
	});

	return {
		mockClient,
		mockOwnProfile,
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
export const createErrorTestEnvironment = (errorType: 'initialization' | 'profile' | 'api' | 'publish') => {
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
		case 'publish':
			env.mockOwnProfile.publishNote.mockRejectedValue(new Error('API Error: Failed to publish'));
			break;
	}

	return env;
};
