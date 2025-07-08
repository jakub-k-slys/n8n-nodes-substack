# n8n-nodes-substack

[![npm version](https://badge.fury.io/js/n8n-nodes-substack.svg)](https://badge.fury.io/js/n8n-nodes-substack)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://github.com/jakub-k-slys/n8n-nodes-substack/actions/workflows/test.yaml/badge.svg)](https://github.com/jakub-k-slys/n8n-nodes-substack/actions/workflows/test.yaml)

This n8n community node provides read-only access to the Substack API, enabling you to automate content discovery and analytics workflows with Substack publications.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Features

- **Profile Operations**: Get profile information, followees, and publication data
- **Post Operations**: Retrieve posts with pagination support
- **Note Operations**: Access notes from publications and create new notes programmatically with optional title and body content, supporting both simple text and advanced JSON formatting
- **Comment Operations**: Get comments for posts
- **Secure Authentication**: API key authentication with publication address
- **Powered by substack-api**: Uses the robust [substack-api](https://www.npmjs.com/package/substack-api) library for reliable API interactions

## Quick Start

### Get Your Profile Information

```json
{
  "nodes": [
    {
      "name": "Get My Profile",
      "type": "n8n-nodes-substack.substack",
      "parameters": {
        "resource": "profile",
        "operation": "getOwnProfile"
      },
      "credentials": {
        "substackApi": "your-credential-id"
      }
    }
  ]
}
```

### Retrieve Recent Posts

```json
{
  "nodes": [
    {
      "name": "Get Recent Posts",
      "type": "n8n-nodes-substack.substack",
      "parameters": {
        "resource": "post",
        "operation": "getAll",
        "limit": 10
      },
      "credentials": {
        "substackApi": "your-credential-id"
      }
    }
  ]
}
```

## Installation

### n8n Cloud

1. Go to **Settings** > **Community Nodes**
2. Click **Install a community node**
3. Enter `n8n-nodes-substack`
4. Click **Install**

### Self-hosted n8n

Install the node in your n8n installation directory:

```bash
npm install n8n-nodes-substack
```

Then restart your n8n instance.

### Credentials Setup

1. Add the Substack node to your workflow
2. Create new credentials with:
   - **Publication Address**: Your Substack domain (e.g., `myblog.substack.com`)
   - **API Key**: Your Substack API key

## Documentation

📖 **[Complete Documentation](docs/)** - Comprehensive guides for all operations

- **[Resource Guides](docs/resources/)** - Detailed documentation for Profile, Post, Note, and Comment operations
- **[Development Guide](docs/contributing.md)** - Contributing to the project
- **[Testing Guide](docs/testing.md)** - Testing practices and procedures
- **[Architecture](docs/design.md)** - Design decisions and project structure

## License

[MIT](LICENSE.md)
