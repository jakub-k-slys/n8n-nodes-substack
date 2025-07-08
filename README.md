# n8n-nodes-substack

[![npm version](https://badge.fury.io/js/n8n-nodes-substack.svg)](https://badge.fury.io/js/n8n-nodes-substack)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://github.com/jakub-k-slys/n8n-nodes-substack/actions/workflows/test.yaml/badge.svg)](https://github.com/jakub-k-slys/n8n-nodes-substack/actions/workflows/test.yaml)

This n8n community node allows interaction with the Substack API, enabling you to automate content creation and management workflows directly from n8n.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Features

- **Authenticate with Substack**: Secure API key authentication using publication address and API key
- **Create Notes**: Publish Substack notes programmatically with optional title and body content, supporting both simple text and advanced JSON formatting
- **Retrieve Posts**: Get posts from your publication with pagination support (limit and offset parameters)
- **Powered by substack-api**: Uses the robust [substack-api](https://www.npmjs.com/package/substack-api) library for reliable API interactions

## Quick Start

Here are simple workflows for the available operations:

### Create a Substack Note

```json
{
  "nodes": [
    {
      "name": "Create Substack Note",
      "type": "n8n-nodes-substack.substack", 
      "parameters": {
        "resource": "note",
        "operation": "create",
        "title": "Hello from n8n!",
        "body": "This note was created automatically using n8n."
      },
      "credentials": {
        "substackApi": "your-credential-id"
      }
    }
  ]
}
```

### Retrieve Posts from Publication

```json
{
  "nodes": [
    {
      "name": "Get Substack Posts",
      "type": "n8n-nodes-substack.substack",
      "parameters": {
        "resource": "post", 
        "operation": "getAll",
        "limit": 10,
        "offset": 0
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

For comprehensive usage instructions, configuration options, and examples:

📖 **[Full Documentation](docs/n8n-usage.md)**

Additional resources:
- [API Reference](docs/api-reference.md)
- [Examples](docs/examples.md) 
- [Development Guide](docs/development.md)
- [Testing Guide](TESTING.md)

## Development

### Quick Start with Dev Container

Get started instantly with GitHub Codespaces or VS Code Remote Containers:

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/jakub-k-slys/n8n-nodes-substack)

Or clone locally and open in VS Code with the Dev Containers extension.

**What's included:**
- ⚡ Node.js LTS with all dependencies pre-installed
- 🧪 Complete testing environment (Jest, unit tests)  
- 🔧 Code quality tools (ESLint, Prettier, TypeScript)
- 📋 Pre-configured VS Code tasks and extensions
- 🚀 Optional n8n CLI for integration testing

See [.devcontainer/README.md](.devcontainer/README.md) for full details.

### Manual Setup

1. **Prerequisites**: Node.js >=20.15, npm, Git
2. **Install dependencies**: `npm install`
3. **Build project**: `npm run build`
4. **Run tests**: `npm test`

See the [Development Guide](docs/development.md) for detailed instructions.

## License

[MIT](LICENSE.md)
