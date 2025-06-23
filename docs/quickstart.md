# Quickstart

This guide will help you get started with the n8n Substack node quickly.

## For n8n Users

### Prerequisites

- n8n instance (self-hosted or cloud)
- Substack account with API access
- Substack API key

### Installation

#### n8n Cloud
1. Go to **Settings** > **Community Nodes**
2. Click **Install a community node**
3. Enter `n8n-nodes-substack`
4. Click **Install**

#### Self-hosted n8n
```bash
npm install n8n-nodes-substack
```
Then restart your n8n instance.

### Credential Setup

1. Add the Substack node to your workflow
2. Create new credentials with:
   - **Publication Address**: Your Substack domain (e.g., `myblog.substack.com`)
   - **API Key**: Your Substack API key

### Basic Usage

#### Create a Note

1. Add Substack node to workflow
2. Select **Note** as resource
3. Select **Create** as operation
4. Fill in **Title** and **Body**
5. Execute the workflow

#### Retrieve Posts

1. Add Substack node to workflow
2. Select **Post** as resource
3. Select **Get Many** as operation
4. Optionally set **Limit** and **Offset** for pagination
5. Execute the workflow

### Example Workflows

**Simple Note Creation:**
```json
{
  "nodes": [
    {
      "name": "Create Note",
      "type": "n8n-nodes-substack.substack",
      "parameters": {
        "resource": "note",
        "operation": "create",
        "title": "Hello World",
        "body": "My first automated note!"
      }
    }
  ]
}
```

**Get Recent Posts:**
```json
{
  "nodes": [
    {
      "name": "Get Posts",
      "type": "n8n-nodes-substack.substack",
      "parameters": {
        "resource": "post",
        "operation": "getAll",
        "limit": 10
      }
    }
  ]
}
```

---

## For Developers Using the API Library

> **Note**: The following section is for developers who want to use the underlying [substack-api](https://www.npmjs.com/package/substack-api) library directly in their own applications or Function nodes.

### Installation

```bash
npm install substack-api
```

### Basic Setup

```typescript
import { Substack } from 'substack-api';

const client = new Substack({
  hostname: 'example.substack.com',
  apiKey: process.env.SUBSTACK_API_KEY!
});
```

### Quick Examples

```typescript
// Get posts
const posts = await client.getPosts({ limit: 10 });

// Publish a note
const response = await client.publishNote('Hello from the API!');

// Search posts
const results = await client.searchPosts({
  query: 'typescript',
  limit: 5
});
```
