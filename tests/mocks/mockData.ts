// Mock data matching the actual Substack Gateway API response schemas.
// See: https://substack-gateway.vercel.app/api/docs#/

// Matches GET /v1/me/notes and GET /v1/profiles/{slug}/notes → NoteResponse
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

// Matches GET /v1/me/posts and GET /v1/profiles/{slug}/posts → PostResponse
// Note: PostResponse does NOT include slug, url, htmlBody — those are FullPostResponse only
export const mockPostsListResponse = [
	{
		id: 98765,
		title: 'Test Post Title',
		subtitle: 'A comprehensive guide to testing',
		truncated_body: 'This is a test post for integration testing.',
		published_at: '2024-01-10T12:00:00Z',
	},
	{
		id: 87654,
		title: 'Another Test Post',
		subtitle: 'More testing content',
		truncated_body: 'This is another test post.',
		published_at: '2024-01-09T09:30:00Z',
	},
];

// Matches GET /v1/posts/{post_id}/comments → CommentResponse (flat, no nested author)
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

// GET /v1/me/following returns FollowingUserResponse: {id, handle} only.
// The library's following() method returns AsyncIterable<Profile> by fetching each profile,
// so mockClientFollowingData in mockSubstackClient.ts represents the enriched Profile objects.
export const mockFollowingUsersResponse = [
	{ id: 12345, handle: 'johndoe' },
	{ id: 67890, handle: 'janesmith' },
	{ id: 54321, handle: 'bobwilson' },
];
