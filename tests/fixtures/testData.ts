/**
 * Centralized test data for consistent use across all test files
 * This eliminates hardcoded data duplication and makes test maintenance easier
 */

export const testPosts = {
	minimal: {
		id: 12345,
		title: 'Minimal Post',
		body: 'Basic content',
		truncatedBody: 'Basic content',
		publishedAt: new Date('2024-01-15T10:30:00Z'),
		htmlBody: '',
		url: 'https://testblog.substack.com/p/12345',
	},
	complete: {
		id: 98765,
		title: 'Test Post Title',
		subtitle: 'A comprehensive guide to testing',
		slug: 'test-post-title',
		body: 'This is a test post for integration testing.',
		truncatedBody: 'This is a test post for integration testing.',
		publishedAt: new Date('2024-01-10T12:00:00Z'),
		htmlBody: '',
		url: 'https://testblog.substack.com/p/test-post-title',
	},
	paywalled: {
		id: 13579,
		title: 'Premium Content',
		subtitle: 'Exclusive for subscribers',
		slug: 'premium-content',
		body: 'This is premium content',
		truncatedBody: 'This is premium content',
		publishedAt: new Date('2024-01-10T12:00:00Z'),
		htmlBody: '',
		url: 'https://testblog.substack.com/p/premium-content',
	},
	podcast: {
		id: 24680,
		title: 'Podcast Episode',
		body: 'Audio content',
		truncatedBody: 'Audio content',
		publishedAt: new Date('2024-01-10T12:00:00Z'),
		htmlBody: '',
		url: 'https://testblog.substack.com/p/24680',
	},
	invalidDate: {
		id: 11111,
		title: 'Post with invalid date',
		body: 'Test content',
		truncatedBody: 'Test content',
		publishedAt: new Date('invalid date'),
		htmlBody: '',
		url: 'https://testblog.substack.com/p/11111',
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

export const testProfiles = {
	own: {
		id: 67890,
		name: 'Test User',
		handle: 'testuser',
		email: 'test@example.com',
		bio: 'This is a test user profile.',
	},
	external: {
		id: 11111,
		name: 'External User',
		handle: 'externaluser',
		bio: 'This is an external user profile.',
	},
};

export const testFollowees = [
	{
		id: 11111,
		name: 'Followed User 1',
		handle: 'followeduser1',
		bio: 'First followed user',
	},
	{
		id: 22222,
		name: 'Followed User 2',
		handle: 'followeduser2',
		bio: 'Second followed user',
	},
];

export const testMarkdownContent = {
	simple: 'This is a simple text note.',
	withFormatting: '**Bold text** and *italic text* with `code`.',
	withLinks: 'Check out [n8n](https://n8n.io) for automation.',
	withLists: `## Shopping List

- First item
- Second item
- Third item

## Numbered List

1. First step
2. Second step
3. Third step`,
	complex: `# Main Title

This is a paragraph with **bold**, *italic*, \`code\`, and a [link](https://example.com).

## Section Header

Here's an unordered list:
- First item with **formatting**
- Second item with *emphasis*

And an ordered list:
1. Numbered item
2. Another numbered item with \`code\`

Final paragraph.`,
	empty: '',
	whitespaceOnly: '   \n\t  ',
	invalidMarkdown: '## \n### \n#### ',
};

export const testCredentials = {
	valid: {
		hostname: 'testblog.substack.com',
		apiKey: 'test-api-key-12345',
	},
	invalid: {
		hostname: 'invalid.substack.com',
		apiKey: 'invalid-key',
	},
};

export const testUrls = {
	base: 'https://testblog.substack.com',
	post: (id: number | string) => `https://testblog.substack.com/p/${id}`,
	note: (id: string) => `https://testblog.substack.com/p/${id}`,
	profile: (handle: string) => `https://${handle}.substack.com`,
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

/**
 * Helper functions to create test data variations
 */
export const createPostWithOverrides = (basePost: any, overrides: Partial<any>) => ({
	...basePost,
	...overrides,
});

export const createCommentWithOverrides = (baseComment: any, overrides: Partial<any>) => ({
	...baseComment,
	...overrides,
});

export const createNoteWithOverrides = (baseNote: any, overrides: Partial<any>) => ({
	...baseNote,
	...overrides,
});