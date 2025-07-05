# Testing Guide

This document describes the testing infrastructure for the n8n-nodes-substack project.

## Test Types

### Unit Tests
Located in `tests/unit/`, these test node logic in isolation using mocked Substack client methods.

```bash
npm test                # Run unit tests (default)
npm run test:watch      # Run unit tests in watch mode
npm run test:unit       # Run unit tests (explicit)
npm run test:unit:watch # Run unit tests in watch mode
```

### End-to-End (E2E) Tests (Legacy)
Located in `tests/e2e/`, these test the complete node execution using mocked HTTP responses.

```bash
npm run test:e2e           # Run E2E tests
npm run test:e2e:watch     # Run E2E tests in watch mode
npm run test:all           # Run both unit and E2E tests
```

## Unit Test Architecture

The unit tests use direct mocking of the `substack-api` module to test node logic without any HTTP dependencies.

### Mock Components

1. **Mock Substack Client** (`tests/mocks/mockSubstackClient.ts`)
   - Mocks the `substack-api` module directly using `jest.mock()`
   - Provides realistic method chains (e.g., `client.ownProfile().newNote().publish()`)
   - Supports async iterables for list operations
   - Uses static fixtures for predictable responses

2. **Mock Execution Functions** (`tests/mocks/mockExecuteFunctions.ts`)
   - Simulates n8n's `IExecuteFunctions` interface
   - Provides controlled node parameters, credentials, and input data
   - Allows testing the actual node execution logic

3. **Mock Data** (`tests/mocks/mockData.ts`)
   - Contains static response data matching Substack API format
   - Includes sample notes, posts, comments, and following profiles

### Test Coverage

The unit tests cover:

- **Note Operations**
  - Creating notes with validation and error handling
  - Retrieving notes with pagination and limits
  - Input parameter validation
  - Output formatting and transformation

- **Post Operations**
  - Fetching posts with different limits
  - Handling malformed data gracefully
  - Date handling and edge cases

- **Comment Operations**
  - Retrieving comments for specific posts
  - postId validation and type conversion
  - Error handling for missing posts

- **Follow Operations**
  - Getting following profiles vs IDs
  - Handling different return types
  - Empty result handling

- **Integration Scenarios**
  - Multi-item processing
  - Mixed resource operations
  - Error propagation and continueOnFail behavior
  - Method chain verification

- **Edge Cases**
  - Invalid parameters and missing required fields
  - Client errors at different levels
  - Large/zero limits and boundary conditions

## Adding New Tests

### Unit Tests

```typescript
import { Substack } from '../../nodes/Substack/Substack.node';
import { createMockExecuteFunctions } from '../mocks/mockExecuteFunctions';
import { mockCredentials } from '../mocks/mockData';
import { createMockSubstackClient } from '../mocks/mockSubstackClient';

// Mock the substack-api module
jest.mock('substack-api', () => ({
	SubstackClient: jest.fn(),
}));

// Mock SubstackUtils
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

describe('My Unit Test', () => {
	let substackNode: Substack;
	let mockClient: any;

	beforeEach(() => {
		jest.clearAllMocks();
		substackNode = new Substack();
		mockClient = createMockSubstackClient();

		// Setup SubstackUtils mock
		const { SubstackUtils } = require('../../nodes/Substack/SubstackUtils');
		SubstackUtils.initializeClient.mockResolvedValue({
			client: mockClient,
			publicationAddress: 'https://testblog.substack.com',
		});
	});

	it('should test node logic', async () => {
		const mockExecuteFunctions = createMockExecuteFunctions({
			nodeParameters: {
				resource: 'note',
				operation: 'create',
				body: 'Test content',
			},
			credentials: mockCredentials,
		});

		const result = await substackNode.execute.call(mockExecuteFunctions);
		
		expect(result[0]).toBeDefined();
		expect(mockClient.ownProfile).toHaveBeenCalled();
	});
});
```

## Benefits of Unit Testing Approach

1. **Fast Execution**: No HTTP simulation overhead, pure JavaScript mocking
2. **Focused Testing**: Tests node logic and transformation, not transport layer
3. **Simple Setup**: No MSW complexity, uses standard Jest mocking
4. **Reliable**: No network dependencies or timing issues
5. **Comprehensive**: Validates input parameters, output formatting, and error handling
6. **Isolated**: Each test runs independently with fresh mocks

## Legacy E2E Testing

The E2E tests use MSW (Mock Service Worker) to intercept HTTP requests and are maintained for backward compatibility. They provide integration testing with actual network behavior simulation.

For new tests, prefer the unit testing approach described above.

## Running Tests

```bash
# Primary testing (unit tests)
npm test                # Run unit tests
npm run test:watch      # Watch mode for development

# Legacy testing
npm run test:e2e        # Run E2E tests with HTTP mocking
npm run test:all        # Run both unit and E2E tests

# Development
npm run test:unit:watch # Watch unit tests during development
npm run test:e2e:watch  # Watch E2E tests during development
```

## Debugging Tests

Unit tests can be debugged using standard Jest debugging techniques:

```bash
# Run with verbose output
npm test -- --verbose

# Run specific test file
npm test -- note-operations.test.ts

# Run with coverage
npm test -- --coverage
```

For debugging mock behavior, you can inspect mock calls:

```typescript
expect(mockClient.ownProfile).toHaveBeenCalledTimes(1);
expect(mockClient.ownProfile).toHaveBeenCalledWith();
console.log(mockClient.ownProfile.mock.calls);
```

## E2E Test Architecture

The E2E tests use MSW (Mock Service Worker) to intercept HTTP requests and provide realistic API responses, enabling integration testing with actual network behavior.

### Mock Components

1. **Mock Execution Functions** (`tests/mocks/mockExecuteFunctions.ts`)
   - Simulates n8n's `IExecuteFunctions` interface
   - Provides controlled node parameters, credentials, and input data
   - Allows testing the actual node execution logic

2. **MSW HTTP Server** (`tests/mocks/substackHttpServer.ts`)
   - Intercepts real HTTP requests made by the `substack-api` library
   - Provides realistic API responses for different scenarios
   - Supports success, error, and edge case scenarios
   - Handles all Substack API endpoints with proper pagination

3. **Mock Data** (`tests/mocks/mockData.ts`)
   - Contains static response data matching Substack API format
   - Includes sample notes, posts, and error responses

### Test Coverage

The E2E tests cover:

- **Note Operations**
  - Creating notes with various inputs
  - Retrieving notes with pagination
  - Error handling and validation

- **Post Operations**
  - Fetching posts with different limits
  - Handling empty responses
  - Malformed data graceful handling

- **Integration Scenarios**
  - Multi-item processing
  - Mixed resource operations
  - URL formatting and credential validation
  - Authentication error handling

- **Edge Cases**
  - Network errors
  - Invalid parameters
  - Partial failures with `continueOnFail`

## Test Configuration

### Jest Configuration

- **Unit Tests**: `jest.config.js`
- **E2E Tests**: `jest.e2e.config.js`

Both configurations use:
- TypeScript support via `ts-jest`
- 30-second timeout for E2E tests
- Setup files for global mock configuration

### Mock Strategy

The E2E tests use MSW (Mock Service Worker) to intercept HTTP requests instead of mocking the library directly because:

1. **Real HTTP Testing**: Tests actual fetch calls and HTTP request/response patterns
2. **Integration Confidence**: Catches issues with request formatting, headers, and error handling
3. **Realistic Network Behavior**: Simulates actual network conditions including errors and timeouts
4. **Better Test Coverage**: Ensures the full request/response pipeline is tested
5. **Flexibility**: Easy to test different domains, endpoints, and response scenarios

## Adding New Tests

### Unit Tests

```typescript
import { MyModule } from '../../nodes/Substack/MyModule';

describe('MyModule', () => {
  it('should do something', () => {
    expect(MyModule.doSomething()).toBe(expected);
  });
});
```

### E2E Tests

```typescript
import { Substack } from '../../nodes/Substack/Substack.node';
import { SubstackHttpServer } from '../mocks/substackHttpServer';
import { createMockExecuteFunctions } from '../mocks/mockExecuteFunctions';
import { mockCredentials } from '../mocks/mockData';

describe('My E2E Test', () => {
  let substackNode: Substack;

  beforeEach(() => {
    substackNode = new Substack();
    SubstackHttpServer.setupSuccessfulMocks();
  });

  it('should execute successfully', async () => {
    const mockExecuteFunctions = createMockExecuteFunctions({
      nodeParameters: {
        resource: 'note',
        operation: 'create',
        body: 'Test content',
      },
      credentials: mockCredentials,
    });

    const result = await substackNode.execute.call(mockExecuteFunctions);
    
    expect(result[0]).toBeDefined();
    expect(result[0][0].json).toMatchObject({
      noteId: expect.any(String),
      body: 'Test content',
    });
  });
});
```

## Benefits of This Testing Approach

1. **Realistic Integration Testing**: Tests actual HTTP requests and responses using real network behavior
2. **Better Coverage**: Validates request formatting, headers, query parameters, and error handling  
3. **Integration Confidence**: Catches issues with actual API interaction patterns
4. **Flexible Scenarios**: Easy to test different domains, endpoints, and edge cases
5. **Future-Proof**: Adding new endpoints or changing request patterns is straightforward
6. **Debugging Advantage**: HTTP interception makes it easier to debug request/response issues

## Debugging Tests

1. **Verbose Output**: Use `--verbose` flag with Jest
2. **Single Test**: Use `--testNamePattern="test name"` to run specific tests
3. **Debug Mode**: Use `--runInBand` for serial execution
4. **Mock Inspection**: Use `console.log` in mock implementations to see what's being called

```bash
# Run a specific test with verbose output
npm run test:e2e -- --testNamePattern="should successfully create a note" --verbose

# Debug mode
npm run test:e2e -- --runInBand
```