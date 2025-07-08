# n8n Substack Node Usage

This document provides detailed information about using the Substack community node in n8n workflows.

## Overview

The n8n Substack node allows you to interact with the Substack API directly from your n8n workflows. The node supports two main resources:

- **Notes**: Create short-form Substack notes 
- **Posts**: Retrieve posts from your publication with pagination support

The node uses the [substack-api](https://www.npmjs.com/package/substack-api) library for reliable API interactions.

## Prerequisites

- n8n instance (self-hosted or cloud)
- Substack account with API access
- Substack API key

## Installation

### For n8n Cloud Users

1. Go to **Settings** > **Community Nodes**
2. Click **Install a community node**
3. Enter `n8n-nodes-substack`
4. Click **Install**

### For Self-hosted n8n

Install the node using npm in your n8n installation directory:

```bash
npm install n8n-nodes-substack
```

Then restart your n8n instance.

## Configuration

### Setting up Credentials

1. In your n8n workflow, add the Substack node
2. Click **Create New Credential** when prompted
3. Enter your Substack credentials:
   - **Publication Address**: Your full Substack domain (e.g., `myblog.substack.com`)
   - **API Key**: Your Substack API key

### Getting Your API Key

1. Log in to your Substack account
2. Go to your publication settings
3. Navigate to the API section
4. Generate or copy your API key

## Supported Operations

### Posts

#### Get Many
Retrieves posts from your Substack publication with pagination support.

**Parameters:**
- **Limit** (optional): Maximum number of posts to return (default: 50, minimum: 1)
- **Offset** (optional): Number of posts to skip for pagination (default: 0, minimum: 0)

**Example Output:**
```json
[
  {
    "id": 12345,
    "title": "My Latest Post",
    "subtitle": "An exciting update from my publication",
    "slug": "my-latest-post",
    "post_date": "2023-12-01T10:00:00.000Z",
    "canonical_url": "https://myblog.substack.com/p/my-latest-post",
    "type": "newsletter",
    "published": true,
    "paywalled": false
  }
]
```

### Notes

#### Create Note
Creates a new Substack note.

**Parameters:**
- **Title** (optional): The headline of the note
- **Body** (required): The content of the note
- **Content Type** (optional): Choose between 'Simple Text' or 'Advanced (JSON)' formatting
- **Visibility** (optional): Who can see the note ('Everyone' or 'Subscribers')

**Example Output:**
```json
{
  "success": true,
  "title": "My Note Title",
  "noteId": "12345",
  "body": "Note content here",
  "url": "https://myblog.substack.com/p/12345",
  "date": "2023-12-01T10:00:00.000Z",
  "status": "published",
  "userId": "67890",
  "visibility": "everyone"
}
```

## Example Workflows

### Simple Note Creation

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

### Retrieve Posts with Pagination

```json
{
  "nodes": [
    {
      "name": "Get Substack Posts",
      "type": "n8n-nodes-substack.substack",
      "parameters": {
        "resource": "post",
        "operation": "getAll",
        "limit": 5,
        "offset": 0
      },
      "credentials": {
        "substackApi": "your-credential-id"
      }
    }
  ]
}
```

### Dynamic Note Creation from Webhook

This workflow creates a Substack note when a webhook is triggered:

```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "create-note"
      }
    },
    {
      "name": "Create Substack Note", 
      "type": "n8n-nodes-substack.substack",
      "parameters": {
        "resource": "note",
        "operation": "create",
        "title": "={{$json.title}}",
        "body": "={{$json.content}}"
      },
      "credentials": {
        "substackApi": "your-credential-id"
      }
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Create Substack Note",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

### Content Analysis Pipeline

This workflow retrieves posts and processes them for analysis:

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
    },
    {
      "name": "Filter Published Posts",
      "type": "n8n-nodes-base.filter",
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "={{$json.published}}",
              "operation": "equal",
              "value2": true
            }
          ]
        }
      }
    },
    {
      "name": "Create Summary Note",
      "type": "n8n-nodes-substack.substack",
      "parameters": {
        "resource": "note",
        "operation": "create",
        "title": "Recent Posts Summary",
        "body": "={{$json.title}} - Published on {{$json.post_date}}"
      },
      "credentials": {
        "substackApi": "your-credential-id"
      }
    }
  ],
  "connections": {
    "Get Recent Posts": {
      "main": [
        [
          {
            "node": "Filter Published Posts",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Filter Published Posts": {
      "main": [
        [
          {
            "node": "Create Summary Note",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## Error Handling

The node will return errors in the following scenarios:
- Invalid API credentials
- Missing required parameters
- Network connectivity issues
- Substack API rate limiting

Common error codes:
- `401`: Invalid API key or unauthorized
- `400`: Bad request (missing or invalid parameters)
- `429`: Rate limit exceeded
- `500`: Substack API server error

## Troubleshooting

### Authentication Issues
- Verify your API key is correct and active
- Ensure the publication address matches your Substack domain exactly
- Check that your Substack account has API access enabled

### Note Creation Failures
- Verify both title and body parameters are provided
- Check for special characters that might need escaping
- Ensure your account has permission to create notes

## Limitations

Current limitations of the node:
- Note creation supports text content only (HTML is accepted but no media uploads)
- Post operations are read-only (retrieval only, no creation or editing)
- No advanced filtering options for post retrieval beyond pagination

## Roadmap

Planned features for future releases:
- Enhanced post operations (creation, editing, deletion)
- Advanced post filtering (by date range, status, search terms)
- Subscriber management (fetch subscribers, add/remove)
- Statistics and analytics retrieval
- Comment management and moderation
- Mailing list operations and automation

## Support

For issues specific to this n8n node:
- [GitHub Issues](https://github.com/jakub-k-slys/n8n-nodes-substack/issues)

For general n8n support:
- [n8n Community](https://community.n8n.io/)
- [n8n Documentation](https://docs.n8n.io/)

For Substack API documentation:
- [Substack API Docs](https://substack.com/api)