# Test Utilities Documentation

This directory contains shared test utilities that eliminate code duplication and ensure consistent testing patterns across all test files.

## Overview

The test utilities are organized into several modules:

- **`utils/testSetup.ts`** - Mock setup and environment management
- **`utils/testPatterns.ts`** - Standardized test patterns and functions
- **`utils/testHelpers.ts`** - High-level test helpers and complete test suites
- **`fixtures/testData.ts`** - Centralized test data to eliminate hardcoded values

## Quick Start

### Basic Test File Setup

```typescript
import { Substack } from '../../nodes/Substack/Substack.node';
import { createTestEnvironment, resetAllMocks } from '../utils/testSetup';
import { createRetrievalTestSuite } from '../utils/testHelpers';

// REQUIRED: Mock setup at module level (replaces 20+ lines of boilerplate)
jest.mock('substack-api', () => ({
    SubstackClient: jest.fn(),
}));

jest.mock('../../nodes/Substack/SubstackUtils', () => ({
    SubstackUtils: {
        initializeClient: jest.fn(),
        formatUrl: jest.fn((base: string, path: string) => `${base}${path}`),
        formatErrorResponse: jest.fn((error: any) => ({ success: false, error: error.message })),
    },
}));

describe('My Resource Tests', () => {
    let substackNode: Substack;
    let mockEnv: ReturnType<typeof createTestEnvironment>;

    beforeEach(() => {
        resetAllMocks();
        substackNode = new Substack();
        mockEnv = createTestEnvironment();
    });

    // Your tests here...
});
```

### Using Standardized Test Suites

#### 1. Resource Retrieval Tests

```typescript
// Automatically creates standard tests for list operations
runStandardRetrievalTests(
    describe,
    it,
    substackNode,
    mockEnv,
    'post',
    'getAll',
    {
        expectedFields: ['id', 'title', 'subtitle', 'url'],
        clientMethod: 'ownProfile',
        profileMethod: 'posts',
        mockDataCount: 2,
    }
);
```

This creates 6 standard tests:
- ✅ Successful retrieval with default parameters
- ✅ Custom limit parameter handling
- ✅ Large limit values
- ✅ Empty response handling
- ✅ API error handling
- ✅ ContinueOnFail mode

#### 2. By-ID Operation Tests

```typescript
const byIdSuite = createByIdTestSuite('post', 'getPostById', 'postId', {
    validId: 98765,
    invalidId: 999999,
    clientMethod: 'postForId',
    expectedFields: ['id', 'title', 'url'],
});

it('should retrieve by ID', async () => {
    await byIdSuite.testSuccessfulById(substackNode, mockEnv);
});

it('should handle invalid ID', async () => {
    await byIdSuite.testInvalidId(substackNode, mockEnv);
});
```

#### 3. Validation Tests

```typescript
const validationSuite = createValidationTestSuite('post');

it('should validate operations', async () => {
    await validationSuite.testInvalidOperation(substackNode);
});
```

## Test Data Management

### Using Centralized Test Data

Instead of hardcoding test data in each file:

```typescript
// OLD WAY (avoid this)
const mockPost = {
    id: 12345,
    title: 'Test Post',
    // ... more hardcoded data
};

// NEW WAY (use centralized data)
import { testPosts } from '../fixtures/testData';

mockEnv.mockOwnProfile.posts.mockResolvedValue({
    async *[Symbol.asyncIterator]() {
        yield testPosts.complete;
        yield testPosts.minimal;
        yield testPosts.paywalled;
    },
});
```

### Available Test Data Sets

- `testPosts` - Various post configurations (minimal, complete, paywalled, podcast, etc.)
- `testComments` - Comment data with different author types
- `testNotes` - Note data for different scenarios
- `testProfiles` - Profile data for own and external profiles
- `testMarkdownContent` - Markdown content for parser testing
- `testErrorMessages` - Standardized error messages
- `testLimits` - Standard limit values (default, small, large, zero)

## Mock Environment

### Standard Mock Setup

The `createTestEnvironment()` function creates all necessary mocks with proper relationships:

```typescript
const mockEnv = createTestEnvironment();

// Access individual mocks
mockEnv.mockClient      // SubstackClient mock
mockEnv.mockOwnProfile  // OwnProfile mock  
mockEnv.mockPost        // Post mock
mockEnv.mockNoteBuilder // NoteBuilder mock
mockEnv.mockParagraphBuilder // ParagraphBuilder mock
```

### Error Testing

```typescript
// Create environment pre-configured for error testing
const errorEnv = createErrorTestEnvironment('api');
```

Error types:
- `'initialization'` - Client initialization errors
- `'profile'` - Profile retrieval errors  
- `'api'` - API operation errors
- `'builder'` - Note builder errors

## Advanced Patterns

### Custom Test Logic with Standardized Base

```typescript
describe('Custom Tests', () => {
    const retrievalSuite = createRetrievalTestSuite('post', 'getAll', {
        expectedFields: ['id', 'title'],
        clientMethod: 'ownProfile',
        profileMethod: 'posts',
    });

    it('should handle standard retrieval', async () => {
        await retrievalSuite.testSuccessful(substackNode, mockEnv);
    });

    it('should handle custom business logic', async () => {
        // Setup specific test scenario
        mockEnv.mockOwnProfile.posts.mockResolvedValue({
            async *[Symbol.asyncIterator]() {
                yield testPosts.paywalled;
            },
        });

        // Use standard execution pattern
        const result = await testSuccessfulRetrieval(
            substackNode,
            { resource: 'post', operation: 'getAll' },
            mockEnv
        );

        // Custom assertions
        expect(result[0][0].json.paywalled).toBe(true);
    });
});
```

### Performance Testing

```typescript
it('should handle large datasets efficiently', async () => {
    const largeMockData = Array.from({ length: 1000 }, (_, i) => ({
        ...testPosts.complete,
        id: i + 1,
    }));

    mockEnv.mockOwnProfile.posts.mockResolvedValue({
        async *[Symbol.asyncIterator]() {
            yield* largeMockData;
        },
    });

    const startTime = Date.now();
    const result = await testSuccessfulRetrieval(
        substackNode,
        { resource: 'post', operation: 'getAll', limit: 100 },
        mockEnv
    );
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(1000);
    expect(result[0].length).toBeLessThanOrEqual(100);
});
```

## Migration Guide

### Converting Existing Tests

1. **Replace mock setup boilerplate:**
   ```typescript
   // Before
   jest.mock('substack-api', () => ({ SubstackClient: jest.fn() }));
   jest.mock('../../nodes/Substack/SubstackUtils', () => ({ ... }));
   
   // After
   setupStandardMocks();
   ```

2. **Replace individual test functions:**
   ```typescript
   // Before
   it('should retrieve posts', async () => {
       const mockExecuteFunctions = createMockExecuteFunctions({...});
       const result = await substackNode.execute.call(mockExecuteFunctions);
       expect(result).toBeDefined();
       expect(result[0].length).toBe(2);
       // ... 15+ lines of assertions
   });
   
   // After  
   it('should retrieve posts', async () => {
       await testSuite.testSuccessful(substackNode, mockEnv);
   });
   ```

3. **Use centralized test data:**
   ```typescript
   // Before
   const mockPost = { id: 12345, title: 'Test', ... };
   
   // After
   import { testPosts } from '../fixtures/testData';
   // Use testPosts.complete, testPosts.minimal, etc.
   ```

## Benefits

✅ **Reduced Code Duplication**: 80% less boilerplate code per test file  
✅ **Consistent Testing**: Standardized patterns across all resources  
✅ **Easier Maintenance**: Changes to test patterns apply everywhere  
✅ **Better Coverage**: Standard suites ensure comprehensive testing  
✅ **Faster Development**: Write tests faster with pre-built patterns  
✅ **Improved Reliability**: Tested utilities reduce test flakiness

## Examples

See the following files for complete examples:
- `tests/unit/post-operations-refactored.test.ts` - Basic resource retrieval
- `tests/unit/comment-operations-refactored.test.ts` - Resource with dependencies
- `tests/unit/example-standardized.test.ts` - Comprehensive example showing all patterns

## Best Practices

1. **Always use `setupStandardMocks()`** at the top of test files
2. **Use `resetAllMocks()`** in `beforeEach` hooks
3. **Prefer standardized test suites** over custom implementations
4. **Use centralized test data** instead of hardcoded values
5. **Add custom tests alongside standardized ones** when needed
6. **Keep test descriptions consistent** with the patterns
7. **Use appropriate test suite types** for different operation types

## Contributing

When adding new test utilities:

1. **Add to appropriate module** (setup, patterns, helpers, or fixtures)
2. **Follow existing naming conventions**
3. **Include TypeScript types** for better developer experience
4. **Document new utilities** in this README
5. **Create examples** showing usage patterns
6. **Update existing tests** to use new utilities when beneficial