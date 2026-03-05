import {
	mockNotesListResponse,
	mockPostsListResponse,
	mockCommentsListResponse,
	mockFollowingProfilesResponse
} from './mockData';

// Mock data transformed to match substack-api v3 library format
export const mockClientNoteResponse = {
	id: 12345,
};

export const mockClientNotesData = mockNotesListResponse.map(note => ({
	id: note.comment.id,
	body: note.comment.body,
	author: {
		id: note.context.users[0]?.id || 67890,
		name: note.context.users[0]?.name || 'Test User',
		handle: note.context.users[0]?.handle || 'testuser',
		avatarUrl: note.context.users[0]?.photo_url || '',
	},
	publishedAt: new Date(note.comment.date),
	likesCount: note.comment.reaction_count,
}));

export const mockClientPostsData = mockPostsListResponse.map(post => ({
	id: post.id,
	title: post.title,
	subtitle: post.subtitle,
	slug: post.slug,
	body: post.description,
	truncatedBody: post.description,
	publishedAt: new Date(post.post_date),
	htmlBody: '',
	url: `https://testblog.substack.com/p/${post.slug}`,
}));

export const mockClientCommentsData = mockCommentsListResponse.map(comment => ({
	id: comment.id,
	body: comment.body,
	isAdmin: comment.author.is_admin,
}));

export const mockClientFollowingData = mockFollowingProfilesResponse.map(profile => ({
	id: profile.id,
	name: profile.name,
	handle: profile.handle,
	slug: profile.handle,
	bio: profile.bio,
}));

// Create async iterables for mocking
export function createMockAsyncIterable<T>(data: T[]): AsyncIterable<T> {
	return {
		async *[Symbol.asyncIterator]() {
			for (const item of data) {
				yield item;
			}
		},
	};
}

export const createMockOwnProfile = () => ({
	id: 12345,
	name: 'Test User',
	handle: 'testuser',
	slug: 'testuser',
	bio: 'Test bio for user',
	publishNote: jest.fn().mockResolvedValue(mockClientNoteResponse),
	notes: jest.fn().mockReturnValue(createMockAsyncIterable(mockClientNotesData)),
	posts: jest.fn().mockReturnValue(createMockAsyncIterable(mockClientPostsData)),
	following: jest.fn().mockReturnValue(createMockAsyncIterable(mockClientFollowingData)),
});

export const createMockPost = () => ({
	id: 98765,
	title: 'Test Post Title',
	subtitle: 'A comprehensive guide to testing',
	slug: 'test-post-title',
	body: 'This is a test post for integration testing.',
	truncatedBody: 'This is a test post for integration testing.',
	publishedAt: new Date('2024-01-10T12:00:00Z'),
	htmlBody: '',
	url: 'https://testblog.substack.com/p/test-post-title',
	comments: jest.fn().mockReturnValue(createMockAsyncIterable(mockClientCommentsData)),
});

export const createMockSubstackClient = () => ({
	ownProfile: jest.fn().mockResolvedValue(createMockOwnProfile()),
	postForId: jest.fn().mockResolvedValue(createMockPost()),
	profileForSlug: jest.fn().mockResolvedValue(createMockOwnProfile()),
	noteForId: jest.fn().mockResolvedValue(mockClientNotesData[0]),
});

// Mock the entire substack-api module
export const mockSubstackApi = {
	SubstackClient: jest.fn().mockImplementation(() => createMockSubstackClient()),
};
