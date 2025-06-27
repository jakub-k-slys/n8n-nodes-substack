// Mock data for Substack API responses

export const mockNoteResponse = {
	id: 12345,
	body: 'This is a test note from n8n integration',
	date: '2024-01-15T10:30:00Z',
	status: 'published',
	user_id: 67890,
	type: 'note',
};

export const mockNotesListResponse = [
	{
		entity_key: 'note_1',
		comment: {
			id: 11111,
			body: 'First test note',
			date: '2024-01-15T10:30:00Z',
			user_id: 67890,
			type: 'note',
			reaction_count: 5,
			restacks: 2,
		},
	},
	{
		entity_key: 'note_2',
		comment: {
			id: 22222,
			body: 'Second test note',
			date: '2024-01-14T15:45:00Z',
			user_id: 67890,
			type: 'note',
			reaction_count: 3,
			restacks: 1,
		},
	},
];

export const mockPostsListResponse = [
	{
		id: 98765,
		title: 'Test Post Title',
		subtitle: 'A comprehensive guide to testing',
		post_date: '2024-01-10T12:00:00Z',
		type: 'newsletter',
		published: true,
		paywalled: false,
		description: 'This is a test post for integration testing.',
	},
	{
		id: 87654,
		title: 'Another Test Post',
		subtitle: 'More testing content',
		post_date: '2024-01-09T09:30:00Z',
		type: 'newsletter',
		published: true,
		paywalled: true,
		description: 'This is another test post.',
	},
];

export const mockCommentsListResponse = [
	{
		id: 33333,
		body: 'Great article! Thanks for sharing.',
		created_at: '2024-01-15T14:20:00Z',
		parent_post_id: 98765,
		author: {
			id: 11111,
			name: 'John Doe',
			is_admin: false,
		},
	},
	{
		id: 44444,
		body: 'I have a question about this topic.',
		created_at: '2024-01-15T15:30:00Z',
		parent_post_id: 98765,
		author: {
			id: 22222,
			name: 'Jane Smith',
			is_admin: true,
		},
	},
];

export const mockCredentials = {
	apiKey: 'test-api-key-12345',
	publicationAddress: 'https://testblog.substack.com',
};

export const mockErrorResponse = {
	error: 'Unauthorized',
	message: 'Invalid API key provided',
	status: 401,
};

export const mockFollowingIdsResponse = [12345, 67890, 54321, 98765];

export const mockFollowingProfilesResponse = [
	{
		id: 12345,
		name: 'John Doe',
		handle: 'johndoe',
		bio: 'Tech writer and blogger',
		subscriberCount: 1500,
		subscriberCountString: '1.5K',
		primaryPublication: {
			id: 101,
			name: 'Tech Insights',
			subdomain: 'techinsights',
		},
	},
	{
		id: 67890,
		name: 'Jane Smith',
		handle: 'janesmith',
		bio: 'Science communicator',
		subscriberCount: 3200,
		subscriberCountString: '3.2K',
		primaryPublication: {
			id: 102,
			name: 'Science Today',
			subdomain: 'sciencetoday',
		},
	},
	{
		id: 54321,
		name: 'Bob Wilson',
		handle: 'bobwilson',
		bio: 'Politics and current events',
		subscriberCount: 850,
		subscriberCountString: '850',
		primaryPublication: {
			id: 103,
			name: 'Political Perspectives',
			subdomain: 'politicalperspectives',
		},
	},
];