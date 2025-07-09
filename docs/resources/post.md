# Post Resource

The Post resource allows you to retrieve published posts from Substack publications, including your own posts and posts from other publications.

## Operations

### Get All Posts

Retrieve all posts from your own publication with pagination support.

**Operation:** `getAll`

**Parameters:**
- `limit` (number, optional): Maximum number of posts to return (default: 100)
- `offset` (number, optional): Number of posts to skip for pagination (default: 0)

**Example Response:**
```json
[
  {
    "id": 98765,
    "title": "My Latest Post",
    "subtitle": "A subtitle for the post",
    "slug": "my-latest-post",
    "published": true,
    "paywalled": false,
    "type": "newsletter",
    "publishedAt": "2024-01-15T10:00:00Z",
    "description": "Post excerpt or description",
    "url": "https://yourpub.substack.com/p/my-latest-post"
  }
]
```

**Example Workflow Node:**
```json
{
  "name": "Get My Posts",
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
```

### Get Posts From Profile by Slug

Retrieve posts from any publication by its slug.

**Operation:** `getPostsBySlug`

**Parameters:**
- `slug` (string, required): The publication slug (e.g., "johndoe")
- `limit` (number, optional): Maximum number of posts to return (default: 100)
- `offset` (number, optional): Number of posts to skip for pagination (default: 0)

**Example Workflow Node:**
```json
{
  "name": "Get Posts by Slug",
  "type": "n8n-nodes-substack.substack",
  "parameters": {
    "resource": "post",
    "operation": "getPostsBySlug",
    "slug": "johndoe",
    "limit": 5
  },
  "credentials": {
    "substackApi": "your-credential-id"
  }
}
```

### Get Posts From Profile by ID

Retrieve posts from a publication by the author's user ID.

**Operation:** `getPostsById`

**Parameters:**
- `userId` (number, required): The user ID of the publication author
- `limit` (number, optional): Maximum number of posts to return (default: 100)
- `offset` (number, optional): Number of posts to skip for pagination (default: 0)

**Example Workflow Node:**
```json
{
  "name": "Get Posts by User ID",
  "type": "n8n-nodes-substack.substack",
  "parameters": {
    "resource": "post",
    "operation": "getPostsById",
    "userId": 12345,
    "limit": 20
  },
  "credentials": {
    "substackApi": "your-credential-id"
  }
}
```

### Get Post by ID

Retrieve a specific post by its unique ID.

**Operation:** `getPostById`

**Parameters:**
- `postId` (number, required): The unique post ID

**Example Workflow Node:**
```json
{
  "name": "Get Specific Post",
  "type": "n8n-nodes-substack.substack",
  "parameters": {
    "resource": "post",
    "operation": "getPostById",
    "postId": 98765
  },
  "credentials": {
    "substackApi": "your-credential-id"
  }
}
```

**Note:** This operation uses the correct Substack API endpoint (`https://substack.com/api/v1/posts/by-id/${id}`) via the `substack-api` library (v0.15.1+), which resolves the previous 404 error issue that occurred with older API endpoint implementations.

## Use Cases

- **Content Analytics**: Track post performance and publication metrics
- **Content Aggregation**: Collect posts from multiple publications for analysis
- **Workflow Automation**: Use post data to trigger other automated tasks
- **Archive Management**: Build comprehensive archives of your published content
- **Research and Monitoring**: Track posts from specific publications you're interested in

## Tips

- Use pagination (`limit` and `offset`) for large datasets to avoid timeouts
- Post IDs are unique across all Substack publications
- Published posts include both free and paywalled content (check the `paywalled` field)
- The `type` field distinguishes between newsletters, podcasts, and other content types