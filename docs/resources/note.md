# Note Resource

The Note resource allows you to retrieve Substack notes (short-form content) from publications. Notes are Substack's equivalent to social media posts or micro-content.

## Operations

### Get Notes

Retrieve notes from your own profile.

**Operation:** `get`

**Parameters:**
- `limit` (number, optional): Maximum number of notes to return (default: 100)

**Example Response:**
```json
[
  {
    "id": 54321,
    "body": "Just published a new article about automation!",
    "publishedAt": "2024-01-15T14:30:00Z",
    "url": "https://yourpub.substack.com/notes/post/54321"
  }
]
```

**Example Workflow Node:**
```json
{
  "name": "Get My Notes",
  "type": "n8n-nodes-substack.substack",
  "parameters": {
    "resource": "note",
    "operation": "get",
    "limit": 10
  },
  "credentials": {
    "substackApi": "your-credential-id"
  }
}
```

### Get Notes From Profile by Slug

Retrieve notes from any publication by its slug.

**Operation:** `getNotesBySlug`

**Parameters:**
- `slug` (string, required): The publication slug (e.g., "johndoe")
- `limit` (number, optional): Maximum number of notes to return (default: 100)

**Example Workflow Node:**
```json
{
  "name": "Get Notes by Slug",
  "type": "n8n-nodes-substack.substack",
  "parameters": {
    "resource": "note",
    "operation": "getNotesBySlug",
    "slug": "johndoe",
    "limit": 20
  },
  "credentials": {
    "substackApi": "your-credential-id"
  }
}
```

### Get Notes From Profile by ID

Retrieve notes from a publication by the author's user ID.

**Operation:** `getNotesById`

**Parameters:**
- `userId` (number, required): The user ID of the publication author
- `limit` (number, optional): Maximum number of notes to return (default: 100)

**Example Workflow Node:**
```json
{
  "name": "Get Notes by User ID",
  "type": "n8n-nodes-substack.substack",
  "parameters": {
    "resource": "note",
    "operation": "getNotesById",
    "userId": 12345,
    "limit": 50
  },
  "credentials": {
    "substackApi": "your-credential-id"
  }
}
```

### Get Note by ID

Retrieve a specific note by its unique ID.

**Operation:** `getNoteById`

**Parameters:**
- `noteId` (number, required): The unique note ID

**Example Workflow Node:**
```json
{
  "name": "Get Specific Note",
  "type": "n8n-nodes-substack.substack",
  "parameters": {
    "resource": "note",
    "operation": "getNoteById",
    "noteId": 54321
  },
  "credentials": {
    "substackApi": "your-credential-id"
  }
}
```

## Use Cases

- **Social Media Integration**: Cross-post notes to other social platforms
- **Content Monitoring**: Track notes from specific publications you follow
- **Engagement Analytics**: Analyze note frequency and content patterns
- **Content Curation**: Collect and organize notes for content inspiration
- **Community Building**: Monitor and respond to notes from your network

## Tips

- Notes are short-form content, typically similar to tweets or social media posts
- Use pagination with the `limit` parameter for better performance
- Notes may include text, links, and references to longer-form content
- Note IDs are unique across all Substack publications
- Some notes may be responses or reactions to posts or other notes