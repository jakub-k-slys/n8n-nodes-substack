# Testing Guide

This document describes the testing infrastructure for the n8n-nodes-substack project.

## Test Types

### Unit Tests
Located in `tests/unit/`, these test individual functions and utilities in isolation.

```bash
npm test                # Run unit tests
npm run test:watch      # Run unit tests in watch mode
```

### End-to-End (E2E) Tests
Located in `tests/e2e/`, these test the complete node execution using mocked Substack API responses.

```bash
npm run test:e2e           # Run E2E tests
npm run test:e2e:watch     # Run E2E tests in watch mode
npm run test:all           # Run both unit and E2E tests
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