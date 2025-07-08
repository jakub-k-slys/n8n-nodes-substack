# Comment Resource

The Comment resource allows you to retrieve comments from Substack posts. Comments are reader responses and discussions on published posts.

## Operations

### Get All Comments

Retrieve all comments for a specific post.

**Operation:** `getAll`

**Parameters:**
- `postId` (number, required): The unique ID of the post to get comments for
- `limit` (number, optional): Maximum number of comments to return (default: 100)

**Example Response:**
```json
[
  {
    "id": 789012,
    "body": "Great article! Really helpful insights.",
    "authorName": "Jane Reader",
    "createdAt": "2024-01-15T16:45:00Z",
    "postId": 98765
  }
]
```

**Example Workflow Node:**
```json
{
  "name": "Get Post Comments",
  "type": "n8n-nodes-substack.substack",
  "parameters": {
    "resource": "comment",
    "operation": "getAll",
    "postId": 98765,
    "limit": 50
  },
  "credentials": {
    "substackApi": "your-credential-id"
  }
}
```

### Get Comment by ID

Retrieve a specific comment by its unique ID.

**Operation:** `getCommentById`

**Parameters:**
- `commentId` (number, required): The unique comment ID

**Example Workflow Node:**
```json
{
  "name": "Get Specific Comment",
  "type": "n8n-nodes-substack.substack",
  "parameters": {
    "resource": "comment",
    "operation": "getCommentById",
    "commentId": 789012
  },
  "credentials": {
    "substackApi": "your-credential-id"
  }
}
```

## Use Cases

- **Community Management**: Monitor and analyze reader engagement on your posts
- **Content Analytics**: Track which posts generate the most discussion
- **Moderation Workflows**: Automate comment monitoring and flagging
- **Engagement Tracking**: Measure reader response and community activity
- **Research and Insights**: Analyze reader sentiment and feedback patterns
- **Newsletter Analytics**: Understand which topics resonate most with your audience

## Tips

- Comments are nested under specific posts - you need a `postId` to retrieve them
- Use the `limit` parameter to control the number of comments returned
- Comments include author information and timestamps for analysis
- Comment IDs are unique across all Substack publications
- Comments may include replies and nested discussions (check the API response structure)
- Consider rate limiting when processing large numbers of comments

## Workflow Examples

### Monitor New Comments on Recent Posts

Combine Post and Comment operations to monitor engagement:

1. **Get Recent Posts**: Use `post.getAll` with a small limit to get your latest posts
2. **Get Comments**: Use `comment.getAll` for each post ID to check for new comments
3. **Process Comments**: Filter, analyze, or forward comments to other systems

### Engagement Analysis

Create analytics workflows:

1. **Collect Comments**: Get all comments for a specific post
2. **Analyze Sentiment**: Use AI tools to analyze comment sentiment
3. **Generate Reports**: Create engagement reports based on comment data