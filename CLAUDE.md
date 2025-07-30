# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Build and Development
```bash
npm run build            # Full build: clean dist, compile TypeScript, copy icons
npm run dev             # Watch mode for TypeScript compilation
npm run format          # Format code with Prettier
npm run lint            # Lint code with ESLint  
npm run lintfix         # Auto-fix ESLint issues
npm run prepublishOnly  # Pre-publish checks: build + strict lint
```

### Testing
```bash
npm test                # Run unit tests
npm run test:watch      # Run tests in watch mode
npm run test:unit       # Run unit tests (explicit)
npm run test:unit:watch # Watch unit tests during development
```

### Running Single Tests
```bash
npm test -- <test-file-name>           # Run specific test file
npm test -- --testNamePattern="<name>" # Run tests matching pattern
```

## Architecture Overview

This is an n8n community node package that provides Substack API integration. The project follows n8n's node development patterns with a modular resource-based architecture.

### Core Structure

- **Main Node**: `nodes/Substack/Substack.node.ts` - Central node implementation that routes operations to resource handlers
- **Utility Layer**: `SubstackUtils.ts` - Client initialization, caching, response validation, and error handling
- **Resource Modules**: Each resource (Profile, Post, Note, Comment) has separate `.fields.ts` and `.operations.ts` files
- **Credentials**: `credentials/SubstackApi.credentials.ts` - API authentication configuration
- **Types**: `nodes/Substack/types.ts` - TypeScript interfaces for API responses

### Resource-Based Architecture

The node supports four main resources, each with dedicated modules:

1. **Profile** (`Profile.fields.ts`, `Profile.operations.ts`)
   - Get own profile, followees, publication data
   
2. **Post** (`Post.fields.ts`, `Post.operations.ts`) 
   - Retrieve posts with pagination support
   
3. **Note** (`Note.fields.ts`, `Note.operations.ts`)
   - Create and retrieve notes, supports Markdown parsing
   - Uses `MarkdownParser.ts` for content transformation
   
4. **Comment** (`Comment.fields.ts`, `Comment.operations.ts`)
   - Get comments for specific posts

### Key Design Patterns

- **Operation Handler Pattern**: Each resource exports operation handlers that the main node routes to
- **Client Caching**: SubstackUtils maintains a Map-based cache of SubstackClient instances keyed by hostname+apiKey
- **Standardized Responses**: All operations return `IStandardResponse` with consistent `success`, `data`, `error` structure
- **Error Handling**: Uses n8n's `NodeOperationError` with proper item indexing and `continueOnFail` support

### Dependencies

- **substack-api**: External library handling actual Substack API communication (currently v1.3.0)
- **marked**: Markdown parsing library used in Note operations
- **n8n-workflow**: Core n8n types and utilities

### Testing Architecture

The project uses Jest with a comprehensive mocking strategy:

- **Unit Tests Only**: Located in `tests/unit/`, no integration tests
- **Mock Strategy**: Direct mocking of `substack-api` module using `jest.mock()`
- **Mock Components**:
  - `mockSubstackClient.ts`: Mocks the SubstackClient with method chains
  - `mockExecuteFunctions.ts`: Simulates n8n's IExecuteFunctions interface  
  - `mockData.ts`: Static fixtures matching Substack API format
- **Test Coverage**: All operations, error handling, parameter validation, and edge cases

### Build System

- **TypeScript**: Strict configuration with declaration files
- **Gulp**: Used for copying icon assets to dist directory
- **ESLint**: Two configurations - standard and stricter pre-publish rules
- **Output**: Compiled to `dist/` directory with proper n8n package structure

### Development Workflow

1. Use `npm run dev` for TypeScript watch mode during development
2. Run `npm run test:watch` for continuous testing
3. Use `npm run lint` to check code style
4. Always run `npm run build` before publishing to ensure clean compilation
5. The `prepublishOnly` script runs additional strict linting checks