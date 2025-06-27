// Global test setup
import nock from 'nock';

// Mock the substack-api library since nock doesn't work well with Node.js fetch
jest.mock('substack-api', () => {
	return {
		Substack: jest.fn().mockImplementation(() => ({
			publishNote: jest.fn(),
			getNotes: jest.fn(),
			getPosts: jest.fn(),
		})),
		SubstackError: class SubstackError extends Error {
			constructor(message: string, status?: number) {
				super(message);
				this.name = 'SubstackError';
			}
		},
	};
});

// Configure nock as backup
nock.disableNetConnect();

// Cleanup after each test
afterEach(() => {
	nock.cleanAll();
	jest.clearAllMocks();
});

// Global teardown
afterAll(() => {
	nock.restore();
});