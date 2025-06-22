# n8n-nodes-substack

[![npm version](https://badge.fury.io/js/n8n-nodes-substack.svg)](https://badge.fury.io/js/n8n-nodes-substack)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This n8n community node allows interaction with the Substack API, enabling you to automate content creation and management workflows directly from n8n.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Features

- **Authenticate with Substack**: Secure API key authentication
- **Create Notes**: Publish Substack notes programmatically
- **Future Features** (coming soon):
  - Fetch subscribers and manage mailing lists
  - Create and publish full posts
  - Access publication statistics and analytics

## Quick Start

Here's a simple workflow that creates a Substack note:

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

## License

[MIT](LICENSE.md)
