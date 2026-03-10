import {
	mockNotesListResponse,
	mockPostsListResponse,
	mockCommentsListResponse,
	mockFollowingProfilesResponse
} from './mockData';

// Transform gateway API response shapes into substack-api v3 domain objects
// (Note, PreviewPost, Comment, Profile classes)

const mockClientNoteResponse = {
	id: 12345,
};

const mockClientNotesData = mockNotesListResponse.map(note => ({
	id: note.id,
	body: note.body,
	author: {
		id: note.author.id,
		name: note.author.name,
		handle: note.author.handle,
		avatarUrl: note.author.avatar_url,
	},
	publishedAt: new Date(note.published_at),
	likesCount: note.likes_count,
}));

const mockClientPostsData = mockPostsListResponse.map(post => ({
	id: post.id,
	title: post.title,
	subtitle: post.subtitle,
	body: post.truncated_body,
	truncatedBody: post.truncated_body,
	publishedAt: new Date(post.published_at),
	htmlBody: '',
	markdown: '',
	url: `https://testblog.substack.com/p/${post.id}`,
}));

const mockClientCommentsData = mockCommentsListResponse.map(comment => ({
	id: comment.id,
	body: comment.body,
	isAdmin: comment.is_admin,
}));

const mockClientFollowingData = mockFollowingProfilesResponse.map(profile => ({
	id: profile.id,
	name: profile.name,
	handle: profile.handle,
	slug: profile.handle,
	bio: profile.bio,
	url: profile.url,
	avatarUrl: profile.avatar_url,
}));

// Create async iterables for mocking
function createMockAsyncIterable<T>(data: T[]): AsyncIterable<T> {
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
	url: 'https://testuser.substack.com',
	avatarUrl: 'https://example.com/avatar.jpg',
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
	markdown: '',
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
