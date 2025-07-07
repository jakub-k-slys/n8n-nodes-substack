import { Substack } from '../../nodes/Substack/Substack.node';
import { createMockExecuteFunctions } from '../mocks/mockExecuteFunctions';
import { mockCredentials } from '../mocks/mockData';
import { 
	createMockSubstackClient,
	createMockOwnProfile,
} from '../mocks/mockSubstackClient';

// Mock the substack-api module
jest.mock('substack-api', () => ({
	SubstackClient: jest.fn(),
}));

// Mock SubstackUtils to return our mocked client
jest.mock('../../nodes/Substack/SubstackUtils', () => ({
	SubstackUtils: {
		initializeClient: jest.fn(),
		formatUrl: jest.fn((base: string, path: string) => `${base}${path}`),
		formatErrorResponse: jest.fn((error: any) => ({
			success: false,
			error: error.message,
		})),
	},
}));

describe('Substack Node - New API Integration Tests', () => {
	let substackNode: Substack;
	let mockClient: any;
	let mockProfile: any;

	beforeEach(() => {
		// Reset all mocks
		jest.clearAllMocks();
		
		substackNode = new Substack();
		mockClient = createMockSubstackClient();
		mockProfile = createMockOwnProfile();

		// Setup method chain mocks
		mockClient.ownProfile.mockResolvedValue(mockProfile);
		mockClient.profileForSlug.mockResolvedValue(mockProfile);
		mockClient.profileForId.mockResolvedValue(mockProfile);

		// Mock SubstackUtils.initializeClient to return our mocked client
		const { SubstackUtils } = require('../../nodes/Substack/SubstackUtils');
		SubstackUtils.initializeClient.mockResolvedValue({
			client: mockClient,
			publicationAddress: 'https://testblog.substack.com',
		});
	});

	describe('Profile Operations', () => {
		it('should get own profile', async () => {
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'profile',
					operation: 'getOwnProfile',
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);

			expect(mockClient.ownProfile).toHaveBeenCalledTimes(1);
			expect(result[0]).toBeDefined();
			expect(result[0][0].json).toMatchObject({
				id: expect.any(Number),
				name: expect.any(String),
				handle: expect.any(String),
			});
		});

		it('should get profile by slug', async () => {
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'profile',
					operation: 'getProfileBySlug',
					slug: 'testblog',
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);

			expect(mockClient.profileForSlug).toHaveBeenCalledTimes(1);
			expect(mockClient.profileForSlug).toHaveBeenCalledWith('testblog');
			expect(result[0]).toBeDefined();
		});

		it('should get followees', async () => {
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'profile',
					operation: 'getFollowees',
					returnType: 'profiles',
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);

			expect(mockClient.ownProfile).toHaveBeenCalledTimes(1);
			expect(mockProfile.followees).toHaveBeenCalledTimes(1);
			expect(result[0]).toBeDefined();
		});
	});

	describe('Post Operations', () => {
		it('should get posts by slug', async () => {
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getPostsBySlug',
					slug: 'testblog',
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);

			expect(mockClient.profileForSlug).toHaveBeenCalledTimes(1);
			expect(mockClient.profileForSlug).toHaveBeenCalledWith('testblog');
			expect(mockProfile.posts).toHaveBeenCalledTimes(1);
			expect(result[0]).toBeDefined();
		});

		it('should get post by ID', async () => {
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'post',
					operation: 'getPostById',
					postId: '12345',
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);

			expect(mockClient.postForId).toHaveBeenCalledTimes(1);
			expect(mockClient.postForId).toHaveBeenCalledWith('12345');
			expect(result[0]).toBeDefined();
		});
	});

	describe('Note Operations', () => {
		it('should get notes by slug', async () => {
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'getNotesBySlug',
					slug: 'testblog',
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);

			expect(mockClient.profileForSlug).toHaveBeenCalledTimes(1);
			expect(mockClient.profileForSlug).toHaveBeenCalledWith('testblog');
			expect(mockProfile.notes).toHaveBeenCalledTimes(1);
			expect(result[0]).toBeDefined();
		});

		it('should get note by ID', async () => {
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'note',
					operation: 'getNoteById',
					noteId: '12345',
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);

			expect(mockClient.noteForId).toHaveBeenCalledTimes(1);
			expect(mockClient.noteForId).toHaveBeenCalledWith('12345');
			expect(result[0]).toBeDefined();
		});
	});

	describe('Comment Operations', () => {
		it('should get comment by ID', async () => {
			const mockExecuteFunctions = createMockExecuteFunctions({
				nodeParameters: {
					resource: 'comment',
					operation: 'getCommentById',
					commentId: '12345',
				},
				credentials: mockCredentials,
			});

			const result = await substackNode.execute.call(mockExecuteFunctions);

			expect(mockClient.commentForId).toHaveBeenCalledTimes(1);
			expect(mockClient.commentForId).toHaveBeenCalledWith('12345');
			expect(result[0]).toBeDefined();
		});
	});
});