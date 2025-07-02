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
	// NEW ENDPOINTS for substack-api v0.12.2+
	
	// GET /api/v1/subscription - Get own profile subscription info (used by ownProfile())
	http.get('*/api/v1/subscription', () => {
		return HttpResponse.json({
			id: 123456,
			type: 'active',
			status: 'active',
			subscriber: {
				id: 12345,
				name: 'Test User',
				handle: 'testuser',
				email: 'test@example.com',
			},
			context: {
				timestamp: '2024-01-15T10:30:00Z',
			},
		});
	}),

	// GET /api/v1/subscriptions - Get own profile subscription info (alternative endpoint)
	http.get('*/api/v1/subscriptions', () => {
		return HttpResponse.json([{
			id: 123456,
			type: 'active',
			status: 'active',
			subscriber: {
				id: 12345,
				name: 'Test User',
				handle: 'testuser',
				email: 'test@example.com',
			},
			context: {
				timestamp: '2024-01-15T10:30:00Z',
			},
		}]);
	}),

	// GET /api/v1/user/{userId}/profile - Get user profile by ID (used by ownProfile())
	http.get('*/api/v1/user/:userId/profile', ({ params }) => {
		return HttpResponse.json({
			originalCursorTimestamp: '2024-01-15T10:30:00Z',
			nextCursor: null,
			items: [
				{
					entity_key: `user-${params.userId}`,
					type: 'profile',
					context: {
						users: [
							{
								id: Number(params.userId),
								handle: 'testuser',
								name: 'Test User',
								photo_url: 'https://example.com/avatar.jpg',
								bio: 'Test bio',
							},
						],
						timestamp: '2024-01-15T10:30:00Z',
						type: 'profile',
					},
				},
			],
		});
	}),

	// GET /api/v1/profile/posts - Get posts from profile
	http.get('*/api/v1/profile/posts', ({ request }) => {
		const url = new URL(request.url);
		const profileUserId = url.searchParams.get('profile_user_id');
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const offset = parseInt(url.searchParams.get('offset') || '0');
		
		const posts = mockPostsListResponse.slice(offset, offset + limit).map(post => ({
			id: post.id,
			title: post.title,
			body: post.description || 'Post body content',
			likesCount: 0,
			author: {
				id: Number(profileUserId) || 12345,
				name: 'Test User',
				handle: 'testuser',
				avatarUrl: 'https://example.com/avatar.jpg',
			},
			publishedAt: post.post_date,
		}));
		
		return HttpResponse.json(posts);
	}),

	// GET /api/v1/profile/notes - Get notes from profile  
	http.get('*/api/v1/profile/notes', ({ request }) => {
		const url = new URL(request.url);
		const profileUserId = url.searchParams.get('profile_user_id');
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const offset = parseInt(url.searchParams.get('offset') || '0');
		
		const notes = mockNotesListResponse.slice(offset, offset + limit).map(note => ({
			id: note.comment.id.toString(),
			body: note.comment.body,
			likesCount: note.comment.reaction_count || 0,
			author: {
				id: Number(profileUserId) || 12345,
				name: 'Test User',
				handle: 'testuser',
				avatarUrl: 'https://example.com/avatar.jpg',
			},
			publishedAt: note.comment.date,
		}));
		
		return HttpResponse.json(notes);
	}),

	// GET /api/v1/profile/followees - Get followees from profile
	http.get('*/api/v1/profile/followees', ({ request }) => {
		const url = new URL(request.url);
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const offset = parseInt(url.searchParams.get('offset') || '0');
		
		const followees = mockFollowingProfilesResponse.slice(offset, offset + limit).map(profile => ({
			id: profile.id,
			slug: profile.handle,
			name: profile.name,
			url: `https://${profile.handle}.substack.com`,
			avatarUrl: 'https://example.com/avatar.jpg',
			bio: profile.bio,
		}));
		
		return HttpResponse.json(followees);
	}),

	// GET /api/v1/posts/{postId}/comments - Get comments for a post
	http.get('*/api/v1/posts/:postId/comments', ({ params, request }) => {
		const url = new URL(request.url);
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const offset = parseInt(url.searchParams.get('offset') || '0');
		
		const comments = mockCommentsListResponse.slice(offset, offset + limit).map(comment => ({
			id: comment.id,
			body: comment.body,
			author: {
				id: comment.author.id,
				name: comment.author.name,
				isAdmin: comment.author.is_admin,
			},
			createdAt: comment.created_at,
		}));
		
		return HttpResponse.json(comments);
	}),

	// POST /api/v1/notes - Create note (new endpoint for v0.12.2+)
	http.post('*/api/v1/notes', async ({ request }) => {
		const body = await request.json() as any;
		
		// Return a successful note creation response in new API format
		return HttpResponse.json({
			id: '12345',
			body: body?.body || 'Published note',
			likesCount: 0,
			author: {
				id: 12345,
				name: 'Test User',
				handle: 'testuser',
				avatarUrl: 'https://example.com/avatar.jpg',
			},
			publishedAt: new Date().toISOString(),
		});
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

	// OLD ENDPOINTS (for backwards compatibility)
	
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

	// GET /api/v1/posts/{slug} - Get specific post (for any domain)
	http.get('*/api/v1/posts/:slug', ({ params }) => {
		// Return the first mock post for any slug
		return HttpResponse.json(mockPostsListResponse[0]);
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

	// DEBUG: Catch-all handler to see what requests are missing
	http.all('*/api/v1/*', ({ request }) => {
		console.warn(`[MSW DEBUG] Unhandled request: ${request.method} ${request.url}`);
		// Return minimal valid response
		return HttpResponse.json({
			error: 'Unhandled endpoint',
			method: request.method,
			url: request.url,
			context: {
				timestamp: '2024-01-15T10:30:00Z',
			},
		});
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