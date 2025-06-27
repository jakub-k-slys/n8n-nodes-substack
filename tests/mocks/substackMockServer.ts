import { Substack as MockSubstack } from 'substack-api';
import {
	mockNoteResponse,
	mockNotesListResponse,
	mockPostsListResponse,
} from './mockData';

export class SubstackMockServer {
	static setupSuccessfulMocks() {
		const MockedSubstack = MockSubstack as jest.MockedClass<typeof MockSubstack>;
		
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
		} as any));
	}

	static setupAuthErrorMocks() {
		const MockedSubstack = MockSubstack as jest.MockedClass<typeof MockSubstack>;
		
		// Mock authentication errors
		MockedSubstack.mockImplementation(() => ({
			publishNote: jest.fn().mockRejectedValue(new Error('Unauthorized: Invalid API key provided')),
			getNotes: jest.fn().mockRejectedValue(new Error('Unauthorized: Invalid API key provided')),
			getPosts: jest.fn().mockRejectedValue(new Error('Unauthorized: Invalid API key provided')),
		} as any));
	}

	static setupEmptyResponseMocks() {
		const MockedSubstack = MockSubstack as jest.MockedClass<typeof MockSubstack>;
		
		// Mock empty responses
		MockedSubstack.mockImplementation(() => ({
			publishNote: jest.fn().mockResolvedValue(mockNoteResponse),
			getNotes: jest.fn().mockReturnValue(async function* () {
				// Empty generator
			}()),
			getPosts: jest.fn().mockReturnValue(async function* () {
				// Empty generator
			}()),
		} as any));
	}

	static setupNetworkErrorMocks() {
		const MockedSubstack = MockSubstack as jest.MockedClass<typeof MockSubstack>;
		
		// Mock network errors
		MockedSubstack.mockImplementation(() => ({
			publishNote: jest.fn().mockRejectedValue(new Error('fetch failed')),
			getNotes: jest.fn().mockRejectedValue(new Error('fetch failed')),
			getPosts: jest.fn().mockRejectedValue(new Error('fetch failed')),
		} as any));
	}

	static setupCustomMock(mockImplementation: any) {
		const MockedSubstack = MockSubstack as jest.MockedClass<typeof MockSubstack>;
		MockedSubstack.mockImplementation(() => mockImplementation);
	}

	static cleanup() {
		jest.clearAllMocks();
	}
}