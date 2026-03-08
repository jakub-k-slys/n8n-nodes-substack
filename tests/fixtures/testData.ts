/**
 * Centralized test data for consistent use across all test files
 * This eliminates hardcoded data duplication and makes test maintenance easier
 */

// These fixtures represent PreviewPost objects (returned by profile.posts()).
// PreviewPost only exposes: id, title, subtitle, body, truncatedBody, publishedAt.
// slug, url, and htmlBody are NOT part of PreviewPost — they only exist on FullPost
// (returned by client.postForId()). DataFormatters.formatPost handles their absence via fallbacks.
export const testPosts = {
	minimal: {
		id: 12345,
		title: 'Minimal Post',
		body: 'Basic content',
		truncatedBody: 'Basic content',
		publishedAt: new Date('2024-01-15T10:30:00Z'),
	},
	complete: {
		id: 98765,
		title: 'Test Post Title',
		subtitle: 'A comprehensive guide to testing',
		body: 'This is a test post for integration testing.',
		truncatedBody: 'This is a test post for integration testing.',
		publishedAt: new Date('2024-01-10T12:00:00Z'),
	},
	paywalled: {
		id: 13579,
		title: 'Premium Content',
		subtitle: 'Exclusive for subscribers',
		body: 'This is premium content',
		truncatedBody: 'This is premium content',
		publishedAt: new Date('2024-01-10T12:00:00Z'),
	},
	podcast: {
		id: 24680,
		title: 'Podcast Episode',
		body: 'Audio content',
		truncatedBody: 'Audio content',
		publishedAt: new Date('2024-01-10T12:00:00Z'),
	},
	invalidDate: {
		id: 11111,
		title: 'Post with invalid date',
		body: 'Test content',
		truncatedBody: 'Test content',
		publishedAt: new Date('invalid date'),
	},
};

export const testComments = {
	basic: [
		{
			id: 33333,
			body: 'Great post! This is very helpful.',
			isAdmin: false,
		},
		{
			id: 44444,
			body: 'Thanks for sharing this information.',
			isAdmin: true,
		},
	],
	minimal: [
		{
			id: 55555,
			body: 'Minimal comment',
			isAdmin: false,
		},
	],
};

export const testNotes = {
	published: [
		{
			id: 12345,
			body: 'This is a published note for testing purposes.',
			likesCount: 15,
			author: { id: 67890, name: 'Test User', handle: 'testuser', avatarUrl: '' },
			publishedAt: new Date('2024-01-20T10:00:00Z'),
		},
		{
			id: 67890,
			body: 'Another test note with different content.',
			likesCount: 8,
			author: { id: 67890, name: 'Test User', handle: 'testuser', avatarUrl: '' },
			publishedAt: new Date('2024-01-21T11:30:00Z'),
		},
	],
	minimal: [
		{
			id: 99999,
			body: 'Minimal note',
			likesCount: 0,
			author: { id: 67890, name: 'Test User', handle: 'testuser', avatarUrl: '' },
			publishedAt: new Date('2024-01-22T12:00:00Z'),
		},
	],
};

export const testErrorMessages = {
	invalidCredentials: 'Invalid credentials',
	postNotFound: 'Post not found',
	apiError: 'API Error: Unable to fetch data',
	builderError: 'Note construction failed',
	emptyContent: 'Note must contain at least one paragraph with content - body cannot be empty',
	invalidOperation: (operation: string) => `Unknown operation: ${operation}`,
	invalidResource: (resource: string) => `Unknown resource: ${resource}`,
	publishError: 'API Error: Failed to publish',
};

export const testLimits = {
	default: 50,
	small: 1,
	large: 10000,
	zero: 0,
};
