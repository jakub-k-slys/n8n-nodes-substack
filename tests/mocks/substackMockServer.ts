import { Substack as MockSubstack } from 'substack-api';
import {
	mockNoteResponse,
	mockNotesListResponse,
	mockPostsListResponse,
	mockCommentsListResponse,
	mockFollowingIdsResponse,
	mockFollowingProfilesResponse,
} from './mockData';

export class SubstackMockServer {
	static setupSuccessfulMocks() {
		const MockedSubstack = MockSubstack as jest.MockedClass<typeof MockSubstack>;
		
		// Clear any previous mock implementations
		MockedSubstack.mockClear();
		
		// Mock the constructor to return an instance with mocked methods
		MockedSubstack.mockImplementation(() => ({
			publishNote: jest.fn().mockResolvedValue(mockNoteResponse),
			getNotes: jest.fn().mockReturnValue(async function* () {
				for (const note of mockNotesListResponse) {
					yield note;
				}
			}()),
			getPosts: jest.fn().mockReturnValue(async function* () {
				for (const post of mockPostsListResponse) {
					yield post;
				}
			}()),
			getComments: jest.fn().mockReturnValue(async function* () {
				for (const comment of mockCommentsListResponse) {
					yield comment;
				}
			}()),
			getFollowingIds: jest.fn().mockResolvedValue(mockFollowingIdsResponse),
			getFollowingProfiles: jest.fn().mockResolvedValue(mockFollowingProfilesResponse),
		} as any));
	}

	static setupAuthErrorMocks() {
		const MockedSubstack = MockSubstack as jest.MockedClass<typeof MockSubstack>;
		
		// Clear any previous mock implementations
		MockedSubstack.mockClear();
		
		// Mock authentication errors - use functions to avoid immediate execution
		MockedSubstack.mockImplementation(() => ({
			publishNote: jest.fn().mockImplementation(() => {
				throw new Error('Unauthorized: Invalid API key provided');
			}),
			getNotes: jest.fn().mockImplementation(() => {
				throw new Error('Unauthorized: Invalid API key provided');
			}),
			getPosts: jest.fn().mockImplementation(() => {
				throw new Error('Unauthorized: Invalid API key provided');
			}),
			getComments: jest.fn().mockImplementation(() => {
				throw new Error('Unauthorized: Invalid API key provided');
			}),
			getFollowingIds: jest.fn().mockImplementation(() => {
				throw new Error('Unauthorized: Invalid API key provided');
			}),
			getFollowingProfiles: jest.fn().mockImplementation(() => {
				throw new Error('Unauthorized: Invalid API key provided');
			}),
		} as any));
	}

	static setupEmptyResponseMocks() {
		const MockedSubstack = MockSubstack as jest.MockedClass<typeof MockSubstack>;
		
		// Clear any previous mock implementations
		MockedSubstack.mockClear();
		
		// Mock empty responses
		MockedSubstack.mockImplementation(() => ({
			publishNote: jest.fn().mockResolvedValue(mockNoteResponse),
			getNotes: jest.fn().mockReturnValue(async function* () {
				// Empty generator
			}()),
			getPosts: jest.fn().mockReturnValue(async function* () {
				// Empty generator
			}()),
			getComments: jest.fn().mockReturnValue(async function* () {
				// Empty generator
			}()),
			getFollowingIds: jest.fn().mockResolvedValue([]),
			getFollowingProfiles: jest.fn().mockResolvedValue([]),
		} as any));
	}

	static setupNetworkErrorMocks() {
		const MockedSubstack = MockSubstack as jest.MockedClass<typeof MockSubstack>;
		
		// Clear any previous mock implementations
		MockedSubstack.mockClear();
		
		// Mock network errors - use functions to avoid immediate execution
		MockedSubstack.mockImplementation(() => ({
			publishNote: jest.fn().mockImplementation(() => {
				throw new Error('fetch failed');
			}),
			getNotes: jest.fn().mockImplementation(() => {
				throw new Error('fetch failed');
			}),
			getPosts: jest.fn().mockImplementation(() => {
				throw new Error('fetch failed');
			}),
			getComments: jest.fn().mockImplementation(() => {
				throw new Error('fetch failed');
			}),
			getFollowingIds: jest.fn().mockImplementation(() => {
				throw new Error('fetch failed');
			}),
			getFollowingProfiles: jest.fn().mockImplementation(() => {
				throw new Error('fetch failed');
			}),
		} as any));
	}

	static setupCustomMock(mockImplementation: any) {
		const MockedSubstack = MockSubstack as jest.MockedClass<typeof MockSubstack>;
		
		// Clear any previous mock implementations
		MockedSubstack.mockClear();
		
		MockedSubstack.mockImplementation(() => mockImplementation);
	}

	static cleanup() {
		const MockedSubstack = MockSubstack as jest.MockedClass<typeof MockSubstack>;
		MockedSubstack.mockClear();
		jest.clearAllMocks();
	}
}