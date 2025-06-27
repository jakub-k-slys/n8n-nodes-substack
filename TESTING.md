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

The E2E tests use a sophisticated mocking strategy to simulate real Substack API interactions without making actual HTTP requests:

### Mock Components

1. **Mock Execution Functions** (`tests/mocks/mockExecuteFunctions.ts`)
   - Simulates n8n's `IExecuteFunctions` interface
   - Provides controlled node parameters, credentials, and input data
   - Allows testing the actual node execution logic

2. **Mock Substack Server** (`tests/mocks/substackMockServer.ts`)
   - Mocks the `substack-api` library using Jest mocks
   - Provides realistic API responses for different scenarios
   - Supports success, error, and edge case scenarios

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

Instead of using HTTP interception (like `nock`), we mock the `substack-api` library directly because:

1. The library uses Node.js's built-in `fetch` API
2. Direct library mocking provides more control over responses
3. Tests run faster without actual HTTP overhead
4. More reliable test isolation

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
import { SubstackMockServer } from '../mocks/substackMockServer';
import { createMockExecuteFunctions } from '../mocks/mockExecuteFunctions';
import { mockCredentials } from '../mocks/mockData';

describe('My E2E Test', () => {
  let substackNode: Substack;

  beforeEach(() => {
    substackNode = new Substack();
    SubstackMockServer.setupSuccessfulMocks();
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

1. **Isolation**: Tests don't depend on external services
2. **Speed**: No network requests = faster test execution
3. **Reliability**: Consistent test results regardless of network conditions
4. **Comprehensive**: Can test error conditions that are hard to reproduce with real APIs
5. **CI/CD Friendly**: Tests run in any environment without API credentials

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