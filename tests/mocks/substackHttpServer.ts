import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
	mockNoteResponse,
	mockNotesListResponse,
	mockPostsListResponse,
	mockCommentsListResponse,
	mockFollowingIdsResponse,
	mockFollowingProfilesResponse,
} from './mockData';

// Convert the existing mock data to proper HTTP response format
const mockNotesHttpResponse = {
	items: mockNotesListResponse,
	nextCursor: null,
	originalCursorTimestamp: '2024-01-15T10:30:00Z',
};

// Create MSW request handlers for Substack API endpoints
const substackHandlers = [
	// GET /api/v1/me - Get own profile (for entity model)
	http.get('*/api/v1/me', () => {
		return HttpResponse.json({
			id: 12345,
			slug: 'testuser',
			name: 'Test User',
			url: 'https://testblog.substack.com/profile/12345-testuser',
			avatarUrl: 'https://testblog.substack.com/avatar.jpg',
			bio: 'Test user bio',
		});
	}),

	// POST /api/v1/notes - Create a new note (for entity model)
	http.post('*/api/v1/notes', async ({ request }) => {
		const body = await request.json() as any;
		
		return HttpResponse.json({
			id: 'note-12345',
			body: body.body || 'Test note',
			likesCount: 0,
			author: {
				id: 12345,
				name: 'Test User',
				handle: 'testuser',
				avatarUrl: 'https://testblog.substack.com/avatar.jpg',
			},
			publishedAt: new Date().toISOString(),
		});
	}),

	// GET /api/v1/me/notes - Get own notes (for entity model)
	http.get('*/api/v1/me/notes', ({ request }) => {
		const url = new URL(request.url);
		const limit = parseInt(url.searchParams.get('limit') || '25');
		
		// Return mock notes for the entity model
		const mockNotes = Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
			id: `note-${i + 1}`,
			body: `Test note ${i + 1}`,
			likesCount: i * 2,
			author: {
				id: 12345,
				name: 'Test User',
				handle: 'testuser',
				avatarUrl: 'https://testblog.substack.com/avatar.jpg',
			},
			publishedAt: new Date(Date.now() - i * 86400000).toISOString(),
		}));
		
		return HttpResponse.json(mockNotes);
	}),

	// GET /api/v1/users/{userId}/notes - Get user notes (for entity model)
	http.get('*/api/v1/users/:userId/notes', ({ request, params }) => {
		const url = new URL(request.url);
		const limit = parseInt(url.searchParams.get('limit') || '25');
		
		// Return mock notes for the entity model
		const mockNotes = Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
			id: `note-${i + 1}`,
			body: `Test note ${i + 1}`,
			likesCount: i * 2,
			author: {
				id: parseInt(params.userId as string),
				name: 'Test User',
				handle: 'testuser',
				avatarUrl: 'https://testblog.substack.com/avatar.jpg',
			},
			publishedAt: new Date(Date.now() - i * 86400000).toISOString(),
		}));
		
		return HttpResponse.json(mockNotes);
	}),

	// GET /api/v1/me/posts - Get own posts (for entity model)
	http.get('*/api/v1/me/posts', ({ request }) => {
		const url = new URL(request.url);
		const limit = parseInt(url.searchParams.get('limit') || '25');
		
		// Return mock posts for the entity model
		const mockPosts = Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
			id: i + 1,
			title: `Test Post ${i + 1}`,
			body: `Test post content ${i + 1}`,
			likesCount: i * 5,
			author: {
				id: 12345,
				name: 'Test User',
				handle: 'testuser',
				avatarUrl: 'https://testblog.substack.com/avatar.jpg',
			},
			publishedAt: new Date(Date.now() - i * 86400000).toISOString(),
		}));
		
		return HttpResponse.json(mockPosts);
	}),

	// GET /api/v1/users/{userId}/posts - Get user posts (for entity model)
	http.get('*/api/v1/users/:userId/posts', ({ request, params }) => {
		const url = new URL(request.url);
		const limit = parseInt(url.searchParams.get('limit') || '25');
		
		// Return mock posts for the entity model
		const mockPosts = Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
			id: i + 1,
			title: `Test Post ${i + 1}`,
			body: `Test post content ${i + 1}`,
			likesCount: i * 5,
			author: {
				id: parseInt(params.userId as string),
				name: 'Test User',
				handle: 'testuser',
				avatarUrl: 'https://testblog.substack.com/avatar.jpg',
			},
			publishedAt: new Date(Date.now() - i * 86400000).toISOString(),
		}));
		
		return HttpResponse.json(mockPosts);
	}),

	// GET /api/v1/me/followees - Get users I follow (for entity model)
	http.get('*/api/v1/me/followees', ({ request }) => {
		const url = new URL(request.url);
		const limit = parseInt(url.searchParams.get('limit') || '25');
		
		// Return mock followees for the entity model
		const mockFollowees = Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
			id: i + 100,
			slug: `followee-${i + 1}`,
			name: `Followee ${i + 1}`,
			url: `https://followee${i + 1}.substack.com/profile/${i + 100}`,
			avatarUrl: `https://followee${i + 1}.substack.com/avatar.jpg`,
			bio: `Bio for followee ${i + 1}`,
		}));
		
		return HttpResponse.json(mockFollowees);
	}),

	// GET /api/v1/users/{userId}/followees - Get users someone follows (for entity model)
	http.get('*/api/v1/users/:userId/followees', ({ request, params }) => {
		const url = new URL(request.url);
		const limit = parseInt(url.searchParams.get('limit') || '25');
		
		// Return mock followees for the entity model
		const mockFollowees = Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
			id: i + 100,
			slug: `followee-${i + 1}`,
			name: `Followee ${i + 1}`,
			url: `https://followee${i + 1}.substack.com/profile/${i + 100}`,
			avatarUrl: `https://followee${i + 1}.substack.com/avatar.jpg`,
			bio: `Bio for followee ${i + 1}`,
		}));
		
		return HttpResponse.json(mockFollowees);
	}),

	// GET /api/v1/posts/{postId}/comments - Get comments for a post (for entity model)
	http.get('*/api/v1/posts/:postId/comments', ({ request, params }) => {
		console.log('Comments endpoint hit:', request.url, 'params:', params);
		const url = new URL(request.url);
		const limit = parseInt(url.searchParams.get('limit') || '25');
		
		// Return mock comments for the entity model
		const mockComments = Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
			id: i + 1,
			body: `Test comment ${i + 1} on post ${params.postId}`,
			author: {
				id: i + 200,
				name: `Commenter ${i + 1}`,
				is_admin: i === 0,
			},
			created_at: new Date(Date.now() - i * 3600000).toISOString(),
		}));
		
		console.log('Returning comments:', mockComments);
		return HttpResponse.json(mockComments);
	}),

	// GET /api/v1/posts - Get posts with pagination (for any domain)
	http.get('*/api/v1/posts', ({ request }) => {
		const url = new URL(request.url);
		const offset = parseInt(url.searchParams.get('offset') || '0');
		const limit = parseInt(url.searchParams.get('limit') || '20');
		
		// Simulate pagination
		const start = offset;
		const end = start + limit;
		const paginatedPosts = mockPostsListResponse.slice(start, end);
		
		return HttpResponse.json(paginatedPosts);
	}),

	// GET /api/v1/notes - Get notes with cursor pagination (for any domain)
	http.get('*/api/v1/notes', ({ request }) => {
		const url = new URL(request.url);
		const cursor = url.searchParams.get('cursor');
		
		// For simplicity, always return the same set of notes
		// In a real scenario, you'd handle cursor-based pagination
		// Use cursor to determine if we should return data or empty response
		return HttpResponse.json(cursor === 'end' ? { items: [], nextCursor: null } : mockNotesHttpResponse);
	}),

	// POST /api/v1/comment/feed - Publish note (for any domain)
	http.post('*/api/v1/comment/feed', async ({ request }) => {
		const body = await request.json() as any;
		
		// Return a successful note creation response
		return HttpResponse.json({
			...mockNoteResponse,
			// Extract text from the complex bodyJson structure if available
			body: body?.bodyJson?.content?.[0]?.content?.[0]?.text || 'Published note',
		});
	}),

	// Additional wildcard handlers for better test coverage
	// GET /api/v1/posts/{postId}/comments - Get comments with pagination (for any domain)
	http.get('*/api/v1/posts/:postId/comments', ({ request, params }) => {
		const url = new URL(request.url);
		const offset = parseInt(url.searchParams.get('offset') || '0');
		const limit = parseInt(url.searchParams.get('limit') || '20');
		
		// Simulate pagination
		const start = offset;
		const end = start + limit;
		const paginatedComments = mockCommentsListResponse.slice(start, end);
		
		return HttpResponse.json(paginatedComments);
	}),

	// GET /api/v1/comments/{commentId} - Get specific comment (for any domain)
	http.get('*/api/v1/comments/:commentId', ({ params }) => {
		return HttpResponse.json(mockCommentsListResponse[0]);
	}),

	// GET /api/v1/posts/{postId} - Get specific post (for entity model)
	http.get('*/api/v1/posts/:postId', ({ params }) => {
		// Return a mock post for the entity model
		return HttpResponse.json({
			id: parseInt(params.postId as string),
			title: `Test Post ${params.postId}`,
			body: `Test post content for post ${params.postId}`,
			likesCount: 10,
			author: {
				id: 12345,
				name: 'Test User',
				handle: 'testuser',
				avatarUrl: 'https://testblog.substack.com/avatar.jpg',
			},
			publishedAt: new Date().toISOString(),
		});
	}),

	// GET /api/v1/search - Search posts (for any domain)
	http.get('*/api/v1/search', ({ request }) => {
		const url = new URL(request.url);
		const query = url.searchParams.get('query') || '';
		
		// Simple search simulation - return all posts if query matches
		return HttpResponse.json({
			results: query ? mockPostsListResponse : [],
			total: query ? mockPostsListResponse.length : 0,
		});
	}),

	// GET /api/v1/reader/feed/profile/{userId} - Get user profile (for any domain)
	http.get('*/api/v1/reader/feed/profile/:userId', ({ params }) => {
		return HttpResponse.json({
			items: [
				{
					context: {
						users: [
							{
								id: params.userId,
								handle: 'testuser',
								name: 'Test User',
							},
						],
						timestamp: '2024-01-15T10:30:00Z',
					},
				},
			],
		});
	}),

	// GET /api/v1/user/{slug}/public_profile - Get public profile (for any domain)
	http.get('*/api/v1/user/:slug/public_profile', ({ params }) => {
		return HttpResponse.json(mockFollowingProfilesResponse[0]);
	}),

	// GET /api/v1/feed/following - Get following IDs (for any domain)
	http.get('*/api/v1/feed/following', () => {
		return HttpResponse.json(mockFollowingIdsResponse);
	}),

	// Catch-all for debugging - GET /api/v1/* (should be placed last)
	http.get('*/api/v1/*', ({ request }) => {
		console.log('Unhandled GET request:', request.url);
		return HttpResponse.json({ error: 'Endpoint not implemented in mock' }, { status: 404 });
	}),
];

// Create MSW server
export const substackHttpServer = setupServer(...substackHandlers);

// Helper class to manage different server scenarios
export class SubstackHttpServer {
	static setupSuccessfulMocks() {
		// The default handlers already provide successful responses
		// No additional setup needed
	}

	static setupAuthErrorMocks() {
		// Reset handlers to return auth errors (wildcard for any domain)
		substackHttpServer.use(
			http.get('*/api/v1/*', () => {
				return HttpResponse.json(
					{ error: 'Unauthorized', message: 'Invalid API key provided' },
					{ status: 401 }
				);
			}),
			http.post('*/api/v1/*', () => {
				return HttpResponse.json(
					{ error: 'Unauthorized', message: 'Invalid API key provided' },
					{ status: 401 }
				);
			})
		);
	}

	static setupEmptyResponseMocks() {
		// Reset handlers to return empty responses (wildcard for any domain)
		substackHttpServer.use(
			http.get('*/api/v1/posts', () => {
				return HttpResponse.json([]);
			}),
			http.get('*/api/v1/posts/*/comments', () => {
				return HttpResponse.json([]);
			}),
			http.get('*/api/v1/notes', () => {
				return HttpResponse.json({
					items: [],
					nextCursor: null,
					originalCursorTimestamp: '2024-01-15T10:30:00Z',
				});
			}),
			http.get('*/api/v1/feed/following', () => {
				return HttpResponse.json([]);
			})
		);
	}

	static setupNetworkErrorMocks() {
		// Reset handlers to simulate network errors (wildcard for any domain)
		substackHttpServer.use(
			http.get('*/api/v1/*', () => {
				return HttpResponse.error();
			}),
			http.post('*/api/v1/*', () => {
				return HttpResponse.error();
			})
		);
	}

	static setupCustomMock(customHandlers: any[]) {
		substackHttpServer.use(...customHandlers);
	}

	static cleanup() {
		substackHttpServer.resetHandlers();
	}

	static start() {
		substackHttpServer.listen({ onUnhandledRequest: 'error' });
	}

	static stop() {
		substackHttpServer.close();
	}

	static reset() {
		substackHttpServer.resetHandlers();
	}
}