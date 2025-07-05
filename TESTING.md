# Testing Guide

This document describes the testing infrastructure for the n8n-nodes-substack project.

## Unit Tests

Located in `tests/unit/`, these test node logic in isolation using mocked Substack client methods.

```bash
npm test                # Run unit tests (default)
npm run test:watch      # Run unit tests in watch mode
npm run test:unit       # Run unit tests (explicit)
npm run test:unit:watch # Run unit tests in watch mode
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
3. **Simple Setup**: Standard Jest mocking without additional complexity
4. **Reliable**: No network dependencies or timing issues
5. **Comprehensive**: Validates input parameters, output formatting, and error handling
6. **Isolated**: Each test runs independently with fresh mocks

## Running Tests

```bash
# Primary testing (unit tests)
npm test                # Run unit tests
npm run test:watch      # Watch mode for development

# Development
npm run test:unit:watch # Watch unit tests during development
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