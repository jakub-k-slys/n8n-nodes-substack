import {
	mockNotesListResponse,
	mockPostsListResponse,
	mockCommentsListResponse,
} from './mockData';

// Mock data transformed to match substack-api v3 library domain object format

const mockClientNoteResponse = {
	id: 12345,
};

// Note domain objects: NoteResponse fields converted to camelCase by the library
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

// PreviewPost (returned by profile.posts()) only exposes: id, title, subtitle, body, truncatedBody, publishedAt
// It does NOT expose slug, url, or htmlBody — those are only on FullPost (returned by client.postForId())
const mockClientPostsData = mockPostsListResponse.map(post => ({
	id: post.id,
	title: post.title,
	subtitle: post.subtitle,
	body: post.truncated_body,
	truncatedBody: post.truncated_body,
	publishedAt: new Date(post.published_at),
}));

// Comment domain objects: CommentResponse.is_admin mapped to isAdmin by the library
const mockClientCommentsData = mockCommentsListResponse.map(comment => ({
	id: comment.id,
	body: comment.body,
	isAdmin: comment.is_admin,
}));

// following() returns AsyncIterable<Profile> — the library fetches a full Profile per following user.
// These represent enriched Profile domain objects, not raw FollowingUserResponse ({id, handle} only).
const mockClientFollowingData = [
	{ id: 12345, name: 'John Doe', handle: 'johndoe', slug: 'johndoe', bio: 'Tech writer and blogger' },
	{ id: 67890, name: 'Jane Smith', handle: 'janesmith', slug: 'janesmith', bio: 'Science communicator' },
	{ id: 54321, name: 'Bob Wilson', handle: 'bobwilson', slug: 'bobwilson', bio: 'Politics and current events' },
];

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
