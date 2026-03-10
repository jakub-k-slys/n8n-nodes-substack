// Mock data matching the Substack Gateway API response shapes (substack-api v3)
// These match the GatewayNote, GatewayPost, GatewayComment, GatewayProfile codecs
// from the substack-api library's io-ts validators.

export const mockNotesListResponse = [
	{
		id: 11111,
		body: 'First test note',
		likes_count: 5,
		author: {
			id: 67890,
			name: 'Test User',
			handle: 'testuser',
			avatar_url: 'https://example.com/avatar.jpg',
		},
		published_at: '2024-01-15T10:30:00Z',
	},
	{
		id: 22222,
		body: 'Second test note',
		likes_count: 3,
		author: {
			id: 67890,
			name: 'Test User',
			handle: 'testuser',
			avatar_url: 'https://example.com/avatar.jpg',
		},
		published_at: '2024-01-14T15:45:00Z',
	},
];

export const mockPostsListResponse = [
	{
		id: 98765,
		title: 'Test Post Title',
		subtitle: 'A comprehensive guide to testing',
		published_at: '2024-01-10T12:00:00Z',
		truncated_body: 'This is a test post for integration testing.',
	},
	{
		id: 87654,
		title: 'Another Test Post',
		subtitle: 'More testing content',
		published_at: '2024-01-09T09:30:00Z',
		truncated_body: 'This is another test post.',
	},
];

export const mockCommentsListResponse = [
	{
		id: 33333,
		body: 'Great article! Thanks for sharing.',
		is_admin: false,
	},
	{
		id: 44444,
		body: 'I have a question about this topic.',
		is_admin: true,
	},
];

export const mockCredentials = {
	apiKey: 'test-api-key-12345',
	publicationAddress: 'https://testblog.substack.com',
};

export const mockFollowingProfilesResponse = [
	{
		id: 12345,
		name: 'John Doe',
		handle: 'johndoe',
		url: 'https://johndoe.substack.com',
		avatar_url: 'https://example.com/avatar1.jpg',
		bio: 'Tech writer and blogger',
	},
	{
		id: 67890,
		name: 'Jane Smith',
		handle: 'janesmith',
		url: 'https://janesmith.substack.com',
		avatar_url: 'https://example.com/avatar2.jpg',
		bio: 'Science communicator',
	},
	{
		id: 54321,
		name: 'Bob Wilson',
		handle: 'bobwilson',
		url: 'https://bobwilson.substack.com',
		avatar_url: 'https://example.com/avatar3.jpg',
		bio: 'Politics and current events',
	},
];
