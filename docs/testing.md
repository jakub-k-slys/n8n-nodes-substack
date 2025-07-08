# Testing Guide

This guide covers testing practices and procedures for the n8n-nodes-substack project.

## Testing Philosophy

The project follows a comprehensive testing strategy focused on:

- **Unit Testing**: Individual node operations and utility functions
- **Integration Testing**: End-to-end node execution workflows
- **Mock-based Testing**: Using mocked Substack API responses for reliable testing
- **No External Dependencies**: Tests run without requiring actual Substack API access

## Test Structure

### Test Organization

```
tests/
├── unit/                          # Unit tests
│   ├── integration.test.ts        # Full node integration tests
│   ├── post-operations.test.ts    # Post resource tests
│   ├── note-operations.test.ts    # Note resource tests
│   ├── comment-operations.test.ts # Comment resource tests
│   ├── SubstackUtils.test.ts      # Utility function tests
│   └── new-api-integration.test.ts # API integration tests
└── mocks/                         # Mock data and utilities
    ├── mockSubstackClient.ts      # Mocked Substack API client
    ├── mockExecuteFunctions.ts    # Mocked n8n execution functions
    └── mockData.ts                # Test data fixtures
```

### Test Categories

#### 1. Unit Tests
Test individual operations in isolation:

```typescript
// Example: Testing a single post operation
describe('Post Operations', () => {
  it('should retrieve posts with getAll operation', async () => {
    // Setup mocks
    const mockExecuteFunctions = createMockExecuteFunctions({
      nodeParameters: {
        resource: 'post',
        operation: 'getAll',
        limit: 10
      }
    });

    // Execute operation
    const result = await substackNode.execute.call(mockExecuteFunctions);
    
    // Verify results
    expect(result[0]).toHaveLength(2); // Expected number of posts
    expect(result[0][0].json).toHaveProperty('id');
  });
});
```

#### 2. Integration Tests
Test complete node execution workflows:

```typescript
// Example: Testing resource and operation validation
describe('Parameter Validation', () => {
  it('should validate all resource types', async () => {
    const resources = ['note', 'post', 'comment', 'profile'];
    
    for (const resource of resources) {
      const mockExecuteFunctions = createMockExecuteFunctions({
        nodeParameters: { resource, operation: 'getAll' }
      });
      
      const result = await substackNode.execute.call(mockExecuteFunctions);
      expect(result).toBeDefined();
    }
  });
});
```

## Running Tests

### Basic Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- post-operations.test.ts

# Run tests with coverage
npm test -- --coverage
```

### Test Configuration

Tests use Jest with TypeScript support configured in `jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'nodes/**/*.ts',
    '!nodes/**/*.d.ts',
    '!**/node_modules/**'
  ]
};
```

## Writing Tests

### Mock Setup

#### Creating Mock Execution Functions

```typescript
import { createMockExecuteFunctions } from '../mocks/mockExecuteFunctions';

const mockExecuteFunctions = createMockExecuteFunctions({
  nodeParameters: {
    resource: 'post',
    operation: 'getAll',
    limit: 10
  },
  credentials: {
    publicationAddress: 'test.substack.com',
    apiKey: 'test-api-key'
  }
});
```

#### Using Mock Data

```typescript
import { mockPostsData } from '../mocks/mockData';

// Mock the Substack client
jest.mock('substack-api', () => ({
  SubstackClient: jest.fn().mockImplementation(() => ({
    ownProfile: jest.fn().mockReturnValue(mockProfileData),
    posts: jest.fn().mockReturnValue({
      async *[Symbol.asyncIterator]() {
        for (const post of mockPostsData) {
          yield post;
        }
      }
    })
  }))
}));
```

### Test Patterns

#### Testing Successful Operations

```typescript
it('should handle successful post retrieval', async () => {
  const mockExecuteFunctions = createMockExecuteFunctions({
    nodeParameters: { resource: 'post', operation: 'getAll' }
  });

  const result = await substackNode.execute.call(mockExecuteFunctions);
  
  expect(result[0]).toHaveLength(expectedPosts.length);
  expect(result[0][0].json).toMatchObject({
    id: expect.any(Number),
    title: expect.any(String),
    publishedAt: expect.any(String)
  });
});
```

#### Testing Error Handling

```typescript
it('should handle API errors gracefully', async () => {
  const mockClient = {
    ownProfile: jest.fn().mockRejectedValue(new Error('API Error'))
  };

  const mockExecuteFunctions = createMockExecuteFunctions({
    nodeParameters: { resource: 'profile', operation: 'getOwnProfile' }
  });

  await expect(
    substackNode.execute.call(mockExecuteFunctions)
  ).rejects.toThrow('API Error');
});
```

#### Testing Edge Cases

```typescript
it('should handle empty responses', async () => {
  // Mock empty response
  const mockClient = {
    posts: jest.fn().mockReturnValue({
      async *[Symbol.asyncIterator]() {
        // Empty iterator
      }
    })
  };

  const result = await substackNode.execute.call(mockExecuteFunctions);
  expect(result[0]).toHaveLength(0);
});
```

## Best Practices

### 1. Comprehensive Coverage
- Test all supported operations for each resource
- Include both success and error scenarios
- Test edge cases (empty responses, malformed data)

### 2. Isolated Testing
- Use mocks to avoid external dependencies
- Test each operation independently
- Don't rely on specific API data that might change

### 3. Realistic Mock Data
- Use realistic Substack API response structures
- Include both minimal and complete data examples
- Test with various data types and edge cases

### 4. Clear Test Names
```typescript
// Good: Descriptive test names
it('should format post output with default values for missing fields', async () => {

// Bad: Vague test names  
it('should work with posts', async () => {
```

### 5. Test Organization
- Group related tests in describe blocks
- Use setup/teardown when appropriate
- Keep tests focused and atomic

## Debugging Tests

### Common Issues

1. **Mock Setup Problems**
   - Ensure mocks are configured before importing the tested module
   - Check that mock return values match expected API structure

2. **Async Testing Issues**
   - Use proper async/await syntax
   - Handle promises correctly in test assertions

3. **Type Errors**
   - Ensure mock objects match TypeScript interfaces
   - Use proper typing for mock functions

### Debug Tools

```bash
# Run tests with detailed output
npm test -- --verbose

# Run specific test with debugging
npm test -- --testNamePattern="specific test name"

# Check test coverage
npm test -- --coverage --coverageReporters=text-lcov
```

## Contributing Test Changes

When adding new operations or modifying existing ones:

1. **Add corresponding tests** for new functionality
2. **Update existing tests** if behavior changes
3. **Ensure all tests pass** before submitting changes
4. **Maintain test coverage** above 80%
5. **Add mock data** for new API responses if needed