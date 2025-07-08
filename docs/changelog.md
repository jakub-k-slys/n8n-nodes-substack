# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive documentation restructure with modular guides
- Resource-specific documentation for Profile, Post, Note, and Comment operations
- Detailed testing guide with best practices and examples
- Architecture and design documentation explaining code structure
- Contributing guide with development workflow and standards
- Real-world usage scenarios and workflow examples

### Changed
- Updated README.md with accurate feature descriptions
- Corrected documentation to reflect read-only operations (no create operations)
- Improved project structure documentation
- Enhanced installation and setup instructions
- Updated substack-api dependency to v0.15.1 for latest features and fixes

### Removed
- Incorrect references to "Create Notes" functionality (only read operations exist)

### Fixed
- Documentation accuracy regarding supported operations
- README feature list to match actual implemented functionality

## [0.1.0] - 2024-11-20

### Added
- Initial release of n8n-nodes-substack
- Support for Substack API integration with read-only operations
- Authentication via API key and publication address
- **Profile operations**: Get own profile, Get by slug, Get by ID, Get followees
- **Post operations**: Get all, Get by slug, Get by ID, Get post by ID  
- **Note operations**: Get (own profile), Get by slug, Get by ID, Get by note ID
- **Comment operations**: Get all for post, Get by ID
- Comprehensive test suite with unit and integration tests
- TypeScript support with full type definitions
- Robust error handling and input validation
- Dev container support for easy development setup
- Mock-based testing for reliable CI/CD
- Modular architecture with resource-operation pattern
- Pagination support for large datasets
- Complete documentation and usage examples