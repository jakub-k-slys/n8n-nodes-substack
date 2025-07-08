# Design and Architecture

This document explains the design decisions, architecture patterns, and project structure of n8n-nodes-substack.

## Architecture Overview

The n8n-nodes-substack project follows a modular, resource-oriented architecture that aligns with n8n's node development best practices and the Substack API structure.

### Core Design Principles

1. **Resource-Operation Pattern**: Organize functionality by Substack resources (Profile, Post, Note, Comment)
2. **Separation of Concerns**: Separate operation logic, field definitions, and utilities
3. **Type Safety**: Comprehensive TypeScript typing throughout the codebase
4. **Error Handling**: Consistent error handling and user-friendly error messages
5. **Testability**: Modular design that supports comprehensive unit testing

## Project Structure

```
n8n-nodes-substack/
├── nodes/Substack/                 # Main node implementation
│   ├── Substack.node.ts           # Primary node class and orchestration
│   ├── Substack.node.json         # Node metadata and configuration
│   ├── types.ts                   # TypeScript type definitions
│   ├── SubstackUtils.ts           # Shared utilities and helpers
│   │
│   ├── Profile.operations.ts      # Profile resource operations
│   ├── Profile.fields.ts          # Profile resource field definitions
│   ├── Post.operations.ts         # Post resource operations  
│   ├── Post.fields.ts             # Post resource field definitions
│   ├── Note.operations.ts         # Note resource operations
│   ├── Note.fields.ts             # Note resource field definitions
│   ├── Comment.operations.ts      # Comment resource operations
│   ├── Comment.fields.ts          # Comment resource field definitions
│   │
│   └── substack.svg               # Node icon
│
├── credentials/                    # Authentication configuration
│   └── SubstackApi.credentials.ts # Substack API credentials
│
├── tests/                         # Test suite
│   ├── unit/                      # Unit tests by functionality
│   └── mocks/                     # Mock data and utilities
│
└── docs/                          # Documentation
    ├── resources/                 # Resource-specific guides
    └── [additional docs]
```

## Design Patterns

### 1. Resource-Operation Pattern

Each Substack resource is implemented using a consistent pattern:

```typescript
// Resource enum definition
export enum ResourceOperation {
    OperationName = 'operationName',
    // ... other operations
}

// Operation configuration for n8n UI
export const resourceOperations: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation', 
        type: 'options',
        options: [/* operation definitions */]
    }
];

// Operation handlers
export const resourceOperationHandlers: Record<
    ResourceOperation,
    (executeFunctions, client, publicationAddress, itemIndex) => Promise<IStandardResponse>
> = {
    [ResourceOperation.OperationName]: operationFunction,
    // ... other handlers
};
```

**Benefits:**
- Consistent API across all resources
- Easy to add new operations
- Clear separation between UI configuration and business logic
- Type-safe operation dispatch

### 2. Centralized Error Handling

All operations use standardized error handling through `SubstackUtils`:

```typescript
// Consistent error response format
return SubstackUtils.formatErrorResponse({
    message: error.message,
    node: executeFunctions.getNode(),
    itemIndex,
});
```

**Benefits:**
- Uniform error messages for users
- Centralized error logging and tracking
- Consistent error response structure

### 3. Type-Safe API Responses

All operations return a standardized response interface:

```typescript
interface IStandardResponse {
    success: boolean;
    data: any;
    metadata: {
        status: string;
        [key: string]: any;
    };
}
```

**Benefits:**
- Predictable response structure
- Type safety across operations
- Easy to extend with additional metadata

### 4. Builder Pattern for Node Configuration

The main node class uses a builder pattern to compose all resources:

```typescript
export class Substack implements INodeType {
    description: INodeTypeDescription = {
        // ... base configuration
        properties: [
            // Resource selector
            {
                displayName: 'Resource',
                name: 'resource',
                type: 'options',
                options: [
                    { name: 'Profile', value: 'profile' },
                    { name: 'Post', value: 'post' },
                    // ... other resources
                ]
            },
            
            // Compose all resource operations and fields
            ...profileOperations,
            ...profileFields,
            ...postOperations,
            ...postFields,
            // ... other resources
        ]
    };
}
```

**Benefits:**
- Modular composition of functionality
- Easy to add or remove resources
- Clear separation of concerns

## Key Architectural Decisions

### 1. Read-Only Operations

**Decision**: Implement only read operations (GET) for all resources.

**Rationale**:
- Aligns with common automation use cases (data collection, monitoring)
- Reduces complexity and potential for destructive operations
- Matches current Substack API limitations and permissions
- Safer for community node adoption

### 2. Async Iterator Support

**Decision**: Use async iterators for handling paginated API responses.

**Implementation**:
```typescript
// Handle paginated responses with async iteration
for await (const item of paginatedResponse) {
    if (count >= limit) break;
    formattedItems.push(formatItem(item));
    count++;
}
```

**Benefits**:
- Memory-efficient handling of large datasets
- Natural pagination support
- Consistent with substack-api library patterns

### 3. Mock-Based Testing

**Decision**: Use comprehensive mocking instead of live API testing.

**Rationale**:
- Faster test execution
- No external dependencies
- Predictable test results
- Easier CI/CD integration
- Avoids API rate limits during development

### 4. Modular File Organization

**Decision**: Separate operations and field definitions into distinct files.

**Structure**:
- `Resource.operations.ts`: Business logic and API calls
- `Resource.fields.ts`: n8n UI field definitions
- `Substack.node.ts`: Orchestration and composition

**Benefits**:
- Clear separation of concerns
- Easier to maintain and extend
- Better code organization
- Simplified testing

## Extension Points

### Adding New Operations

To add a new operation to an existing resource:

1. **Define the operation enum**:
```typescript
// In Resource.operations.ts
export enum ResourceOperation {
    ExistingOp = 'existingOp',
    NewOperation = 'newOperation',  // Add here
}
```

2. **Add UI configuration**:
```typescript
// In resourceOperations array
{
    name: 'New Operation Name',
    value: ResourceOperation.NewOperation,
    description: 'Description of what this does',
    action: 'Action description'
}
```

3. **Implement the operation function**:
```typescript
async function newOperation(
    executeFunctions: IExecuteFunctions,
    client: SubstackClient,
    publicationAddress: string,
    itemIndex: number,
): Promise<IStandardResponse> {
    // Implementation
}
```

4. **Add to operation handlers**:
```typescript
export const resourceOperationHandlers = {
    [ResourceOperation.ExistingOp]: existingOp,
    [ResourceOperation.NewOperation]: newOperation,  // Add here
};
```

5. **Add corresponding fields** in `Resource.fields.ts` if needed

6. **Write tests** in `tests/unit/resource-operations.test.ts`

### Adding New Resources

To add a completely new resource:

1. **Create operation files**: `NewResource.operations.ts` and `NewResource.fields.ts`
2. **Follow the established patterns** from existing resources
3. **Add to main node**: Import and include in `Substack.node.ts`
4. **Update types**: Add new interfaces to `types.ts`
5. **Add tests**: Create corresponding test files
6. **Update documentation**: Add resource guide in `docs/resources/`

## Performance Considerations

### 1. Pagination Strategy

- Default limits prevent overwhelming responses
- Configurable limits allow user control
- Offset-based pagination supports large datasets

### 2. Memory Management

- Async iterators for streaming large responses
- Chunked processing prevents memory overflow
- Early termination when limits are reached

### 3. Error Recovery

- Graceful handling of API failures
- Partial success support where applicable
- Clear error messages for troubleshooting

## Security Considerations

### 1. Credential Handling

- Secure storage of API keys
- No credential logging or exposure
- Validation of credential format

### 2. Input Validation

- Parameter validation for all operations
- Type checking and sanitization
- Prevention of injection attacks

### 3. Error Information

- Safe error messages (no credential exposure)
- Structured error responses
- Appropriate error detail levels

## Future Considerations

### Potential Enhancements

1. **Write Operations**: Add support for creating/updating content when API permits
2. **Real-time Webhooks**: Integration with Substack webhook events
3. **Batch Operations**: Bulk processing capabilities
4. **Advanced Filtering**: Client-side filtering and transformation options
5. **Caching Layer**: Response caching for improved performance

### Scalability Patterns

- Connection pooling for high-volume usage
- Rate limiting and backoff strategies
- Monitoring and observability hooks
- Performance metrics collection