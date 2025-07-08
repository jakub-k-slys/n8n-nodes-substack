# Contributing Guide

Thank you for your interest in contributing to n8n-nodes-substack! This guide will help you get started with contributing to the project.

## Getting Started

### Prerequisites

- **Node.js**: Version 20.15 or higher
- **npm**: Latest version
- **Git**: For version control
- **TypeScript**: Basic familiarity recommended
- **n8n**: Understanding of n8n workflows is helpful

### Development Setup

#### Option 1: Quick Start with Dev Container (Recommended)

The fastest way to get started is using GitHub Codespaces or VS Code Dev Containers:

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/jakub-k-slys/n8n-nodes-substack)

Or locally with VS Code:
1. Clone the repository
2. Open in VS Code with Dev Containers extension
3. VS Code will automatically set up the development environment

#### Option 2: Manual Setup

1. **Fork and clone the repository**:
```bash
git clone https://github.com/YOUR_USERNAME/n8n-nodes-substack.git
cd n8n-nodes-substack
```

2. **Install dependencies**:
```bash
npm install
```

3. **Build the project**:
```bash
npm run build
```

4. **Run tests to verify setup**:
```bash
npm test
```

## Development Workflow

### 1. Before Making Changes

1. **Create a new branch** for your feature or fix:
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

2. **Understand the codebase** by reading:
   - [Design and Architecture](design.md)
   - [Testing Guide](testing.md)
   - Resource documentation in [docs/resources/](resources/)

3. **Run existing tests** to ensure everything works:
```bash
npm test
```

### 2. Making Changes

#### Code Quality Standards

- **TypeScript**: All code must be properly typed
- **ESLint**: Follow the configured linting rules
- **Prettier**: Use consistent code formatting
- **Tests**: Include tests for new functionality

#### Running Quality Checks

```bash
# Lint your code
npm run lint

# Fix linting issues automatically
npm run lintfix

# Format code with Prettier
npm run format

# Run tests
npm test

# Run tests in watch mode during development
npm run test:watch
```

### 3. Types of Contributions

#### Adding New Operations

If you want to add a new operation to an existing resource:

1. **Update the operation enum** in `nodes/Substack/Resource.operations.ts`
2. **Add the operation configuration** to the operations array
3. **Implement the operation function**
4. **Add to the operation handlers mapping**
5. **Add any new fields** in `Resource.fields.ts` if needed
6. **Write comprehensive tests**
7. **Update documentation**

Example:
```typescript
// 1. Add to enum
export enum PostOperation {
    GetAll = 'getAll',
    NewOperation = 'newOperation', // Add here
}

// 2. Add to UI options
{
    name: 'New Operation',
    value: PostOperation.NewOperation,
    description: 'Description of the new operation',
    action: 'Perform new operation'
}

// 3. Implement function
async function newOperation(
    executeFunctions: IExecuteFunctions,
    client: SubstackClient,
    publicationAddress: string,
    itemIndex: number,
): Promise<IStandardResponse> {
    try {
        // Implementation here
        return {
            success: true,
            data: result,
            metadata: { status: 'success' }
        };
    } catch (error) {
        return SubstackUtils.formatErrorResponse({
            message: error.message,
            node: executeFunctions.getNode(),
            itemIndex,
        });
    }
}

// 4. Add to handlers
export const postOperationHandlers = {
    [PostOperation.GetAll]: getAll,
    [PostOperation.NewOperation]: newOperation, // Add here
};
```

#### Adding New Resources

To add a completely new Substack resource:

1. **Create operation files**: `NewResource.operations.ts` and `NewResource.fields.ts`
2. **Follow existing patterns** from Profile, Post, Note, or Comment resources
3. **Add to main node** in `Substack.node.ts`
4. **Update type definitions** in `types.ts`
5. **Create comprehensive tests**
6. **Add resource documentation** in `docs/resources/newresource.md`

#### Bug Fixes

1. **Identify the issue** and create a failing test that reproduces it
2. **Fix the bug** with minimal changes
3. **Ensure the test now passes**
4. **Verify no other tests are broken**

#### Documentation Improvements

- Update existing documentation for clarity
- Add examples and use cases
- Fix typos and formatting issues
- Improve API documentation

### 4. Testing Your Changes

#### Required Tests

All contributions must include appropriate tests:

```bash
# Run all tests
npm test

# Run specific test file
npm test -- post-operations.test.ts

# Run tests with coverage
npm test -- --coverage
```

#### Test Requirements

1. **Unit tests** for new operations
2. **Integration tests** for resource additions
3. **Error handling tests** for edge cases
4. **Mock data** for new API responses

#### Example Test Pattern

```typescript
describe('New Operation', () => {
    it('should handle successful operation', async () => {
        const mockExecuteFunctions = createMockExecuteFunctions({
            nodeParameters: {
                resource: 'post',
                operation: 'newOperation',
                // ... parameters
            },
            credentials: mockCredentials,
        });

        const result = await substackNode.execute.call(mockExecuteFunctions);
        
        expect(result[0]).toHaveLength(expectedLength);
        expect(result[0][0].json).toMatchObject({
            // Expected structure
        });
    });

    it('should handle errors gracefully', async () => {
        // Test error scenarios
    });
});
```

### 5. Documentation Updates

When adding new functionality, update:

1. **Resource documentation** in `docs/resources/` if applicable
2. **README.md** if adding major features
3. **API reference** documentation
4. **Code comments** for complex logic

## Submission Guidelines

### Pull Request Process

1. **Ensure your branch is up to date**:
```bash
git fetch origin
git rebase origin/main
```

2. **Run the full test suite**:
```bash
npm test
npm run lint
npm run build
```

3. **Create a descriptive pull request**:
   - Clear title describing the change
   - Detailed description of what was changed and why
   - Reference any related issues
   - Include screenshots for UI changes (if applicable)

4. **Ensure CI passes** - all tests and linting checks must pass

### Pull Request Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature  
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Refactoring

## Changes Made
- List of specific changes

## Testing
- [ ] All existing tests pass
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## Documentation
- [ ] Documentation updated (if applicable)
- [ ] Code comments added for complex logic

## Related Issues
Fixes #(issue number)
```

## Code Review Process

### What Reviewers Look For

1. **Functionality**: Does the code work as intended?
2. **Tests**: Are there adequate tests for the changes?
3. **Code Quality**: Is the code clean, readable, and well-structured?
4. **Documentation**: Is the code and functionality properly documented?
5. **Consistency**: Does it follow existing patterns and conventions?
6. **Performance**: Are there any performance implications?

### Addressing Feedback

- Respond to all review comments
- Make requested changes in new commits
- Ask for clarification if feedback is unclear
- Update tests and documentation as needed

## Coding Standards

### TypeScript Guidelines

- Use explicit types where helpful for clarity
- Avoid `any` types (use proper interfaces)
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Code Organization

- Follow the established file structure
- Use consistent naming conventions
- Keep functions focused and single-purpose
- Separate concerns appropriately

### Error Handling

- Use the standardized error handling patterns
- Provide user-friendly error messages
- Log appropriate debug information
- Handle edge cases gracefully

## Community Guidelines

### Communication

- Be respectful and inclusive
- Ask questions when unclear
- Provide constructive feedback
- Help others when possible

### Issue Reporting

When reporting bugs:
1. Use the issue template
2. Provide clear reproduction steps
3. Include relevant error messages
4. Specify your environment details

### Feature Requests

When requesting features:
1. Explain the use case clearly
2. Describe the expected behavior
3. Consider implementation complexity
4. Be open to alternative solutions

## Getting Help

- **Documentation**: Check the existing docs first
- **Issues**: Search existing issues for similar problems
- **Discussions**: Use GitHub Discussions for questions
- **n8n Community**: Check the [n8n Community Forum](https://community.n8n.io/)

## Recognition

Contributors are recognized in:
- Release notes for significant contributions
- README acknowledgments
- Project history and attribution

Thank you for contributing to n8n-nodes-substack! Your efforts help make workflow automation more accessible and powerful for everyone.