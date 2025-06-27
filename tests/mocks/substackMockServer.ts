import { Substack as MockSubstack } from 'substack-api';
import {
	mockNoteResponse,
	mockNotesListResponse,
	mockPostsListResponse,
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