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
	// GET /api/v1/posts - Get posts with pagination
	http.get('https://testblog.substack.com/api/v1/posts', ({ request }) => {
		const url = new URL(request.url);
		const offset = parseInt(url.searchParams.get('offset') || '0');
		const limit = parseInt(url.searchParams.get('limit') || '20');
		
		// Simulate pagination
		const start = offset;
		const end = start + limit;
		const paginatedPosts = mockPostsListResponse.slice(start, end);
		
		return HttpResponse.json(paginatedPosts);
	}),

	// GET /api/v1/posts/{slug} - Get specific post
	http.get('https://testblog.substack.com/api/v1/posts/:slug', ({ params }) => {
		// Return the first mock post for any slug
		return HttpResponse.json(mockPostsListResponse[0]);
	}),

	// GET /api/v1/search - Search posts
	http.get('https://testblog.substack.com/api/v1/search', ({ request }) => {
		const url = new URL(request.url);
		const query = url.searchParams.get('query') || '';
		
		// Simple search simulation - return all posts if query matches
		return HttpResponse.json({
			results: query ? mockPostsListResponse : [],
			total: query ? mockPostsListResponse.length : 0,
		});
	}),

	// GET /api/v1/posts/{postId}/comments - Get comments with pagination
	http.get('https://testblog.substack.com/api/v1/posts/:postId/comments', ({ request, params }) => {
		const url = new URL(request.url);
		const offset = parseInt(url.searchParams.get('offset') || '0');
		const limit = parseInt(url.searchParams.get('limit') || '20');
		
		// Simulate pagination
		const start = offset;
		const end = start + limit;
		const paginatedComments = mockCommentsListResponse.slice(start, end);
		
		return HttpResponse.json(paginatedComments);
	}),

	// GET /api/v1/comments/{commentId} - Get specific comment
	http.get('https://testblog.substack.com/api/v1/comments/:commentId', ({ params }) => {
		return HttpResponse.json(mockCommentsListResponse[0]);
	}),

	// GET /api/v1/notes - Get notes with cursor pagination
	http.get('https://testblog.substack.com/api/v1/notes', ({ request }) => {
		const url = new URL(request.url);
		const cursor = url.searchParams.get('cursor');
		
		// For simplicity, always return the same set of notes
		// In a real scenario, you'd handle cursor-based pagination
		// Use cursor to determine if we should return data or empty response
		return HttpResponse.json(cursor === 'end' ? { items: [], nextCursor: null } : mockNotesHttpResponse);
	}),

	// POST /api/v1/comment/feed - Publish note
	http.post('https://testblog.substack.com/api/v1/comment/feed', async ({ request }) => {
		const body = await request.json() as any;
		
		// Return a successful note creation response
		return HttpResponse.json({
			...mockNoteResponse,
			// Extract text from the complex bodyJson structure if available
			body: body?.bodyJson?.content?.[0]?.content?.[0]?.text || 'Published note',
		});
	}),

	// GET /api/v1/reader/feed/profile/{userId} - Get user profile
	http.get('https://testblog.substack.com/api/v1/reader/feed/profile/:userId', ({ params }) => {
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

	// GET /api/v1/user/{slug}/public_profile - Get public profile
	http.get('https://testblog.substack.com/api/v1/user/:slug/public_profile', ({ params }) => {
		return HttpResponse.json(mockFollowingProfilesResponse[0]);
	}),

	// GET /api/v1/feed/following - Get following IDs
	http.get('https://testblog.substack.com/api/v1/feed/following', () => {
		return HttpResponse.json(mockFollowingIdsResponse);
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
		// Reset handlers to return auth errors
		substackHttpServer.use(
			http.get('https://testblog.substack.com/api/v1/*', () => {
				return HttpResponse.json(
					{ error: 'Unauthorized', message: 'Invalid API key provided' },
					{ status: 401 }
				);
			}),
			http.post('https://testblog.substack.com/api/v1/*', () => {
				return HttpResponse.json(
					{ error: 'Unauthorized', message: 'Invalid API key provided' },
					{ status: 401 }
				);
			})
		);
	}

	static setupEmptyResponseMocks() {
		// Reset handlers to return empty responses
		substackHttpServer.use(
			http.get('https://testblog.substack.com/api/v1/posts', () => {
				return HttpResponse.json([]);
			}),
			http.get('https://testblog.substack.com/api/v1/posts/*/comments', () => {
				return HttpResponse.json([]);
			}),
			http.get('https://testblog.substack.com/api/v1/notes', () => {
				return HttpResponse.json({
					items: [],
					nextCursor: null,
					originalCursorTimestamp: '2024-01-15T10:30:00Z',
				});
			}),
			http.get('https://testblog.substack.com/api/v1/feed/following', () => {
				return HttpResponse.json([]);
			})
		);
	}

	static setupNetworkErrorMocks() {
		// Reset handlers to simulate network errors
		substackHttpServer.use(
			http.get('https://testblog.substack.com/api/v1/*', () => {
				return HttpResponse.error();
			}),
			http.post('https://testblog.substack.com/api/v1/*', () => {
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