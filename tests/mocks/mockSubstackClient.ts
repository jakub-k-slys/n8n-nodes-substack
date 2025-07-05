import { 
	mockNotesListResponse, 
	mockPostsListResponse, 
	mockCommentsListResponse,
	mockFollowingProfilesResponse 
} from './mockData';

// Mock data transformed to match substack-api library format
export const mockClientNoteResponse = {
	id: 12345,
	body: 'This is a test note from n8n integration',
	date: '2024-01-15T10:30:00Z',
	user_id: 67890,
	type: 'note',
};

export const mockClientNotesData = mockNotesListResponse.map(note => ({
	id: note.comment.id,
	body: note.comment.body,
	author: {
		id: note.comment.user_id,
		name: note.context.users[0]?.name || 'Test User',
	},
	publishedAt: new Date(note.comment.date),
	likesCount: note.comment.reaction_count,
	rawData: note, // Include original raw data for compatibility
}));

export const mockClientPostsData = mockPostsListResponse.map(post => ({
	id: post.id,
	title: post.title,
	body: post.description,
	publishedAt: new Date(post.post_date),
	rawData: post, // Include original raw data for compatibility
}));

export const mockClientCommentsData = mockCommentsListResponse.map(comment => ({
	id: comment.id,
	body: comment.body,
	author: {
		id: comment.author.id,
		name: comment.author.name,
		isAdmin: comment.author.is_admin,
	},
	createdAt: new Date(comment.created_at),
	rawData: comment, // Include original raw data for compatibility
}));

export const mockClientFollowingData = mockFollowingProfilesResponse.map(profile => ({
	id: profile.id,
	name: profile.name,
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

// Mock method chains
export const createMockNoteBuilder = () => ({
	publish: jest.fn().mockResolvedValue(mockClientNoteResponse),
});

export const createMockOwnProfile = () => ({
	newNote: jest.fn().mockReturnValue(createMockNoteBuilder()),
	notes: jest.fn().mockResolvedValue(createMockAsyncIterable(mockClientNotesData)),
	posts: jest.fn().mockResolvedValue(createMockAsyncIterable(mockClientPostsData)),
	followees: jest.fn().mockResolvedValue(createMockAsyncIterable(mockClientFollowingData)),
});

export const createMockPost = () => ({
	comments: jest.fn().mockResolvedValue(createMockAsyncIterable(mockClientCommentsData)),
});

export const createMockSubstackClient = () => ({
	ownProfile: jest.fn().mockResolvedValue(createMockOwnProfile()),
	postForId: jest.fn().mockResolvedValue(createMockPost()),
});

// Mock the entire substack-api module
export const mockSubstackApi = {
	SubstackClient: jest.fn().mockImplementation(() => createMockSubstackClient()),
};