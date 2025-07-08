# Profile Resource

The Profile resource allows you to retrieve information about Substack profiles, including your own profile and other users' profiles.

## Operations

### Get Own Profile

Retrieve your own profile information including name, handle, and bio.

**Operation:** `getOwnProfile`

**Parameters:** None

**Example Response:**
```json
{
  "id": 12345,
  "name": "John Doe",
  "handle": "johndoe",
  "bio": "Writer and developer"
}
```

**Example Workflow Node:**
```json
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
```

### Get Profile by Slug

Retrieve a profile by its publication slug (e.g., "username.substack.com").

**Operation:** `getProfileBySlug`

**Parameters:**
- `slug` (string, required): The publication slug (e.g., "johndoe")

**Example Workflow Node:**
```json
{
  "name": "Get Profile by Slug",
  "type": "n8n-nodes-substack.substack",
  "parameters": {
    "resource": "profile",
    "operation": "getProfileBySlug",
    "slug": "johndoe"
  },
  "credentials": {
    "substackApi": "your-credential-id"
  }
}
```

### Get Profile by ID

Retrieve a profile by its unique user ID.

**Operation:** `getProfileById`

**Parameters:**
- `userId` (number, required): The unique user ID

**Example Workflow Node:**
```json
{
  "name": "Get Profile by ID",
  "type": "n8n-nodes-substack.substack",
  "parameters": {
    "resource": "profile",
    "operation": "getProfileById",
    "userId": 12345
  },
  "credentials": {
    "substackApi": "your-credential-id"
  }
}
```

### Get Followees

Retrieve a list of users that you follow.

**Operation:** `getFollowees`

**Parameters:**
- `limit` (number, optional): Maximum number of followees to return (default: 100)

**Example Workflow Node:**
```json
{
  "name": "Get My Followees",
  "type": "n8n-nodes-substack.substack",
  "parameters": {
    "resource": "profile",
    "operation": "getFollowees",
    "limit": 50
  },
  "credentials": {
    "substackApi": "your-credential-id"
  }
}
```

## Use Cases

- **Profile Analytics**: Monitor your own profile information and follower connections
- **Content Curation**: Find and track other writers you follow
- **User Research**: Gather profile data for content strategy and audience analysis
- **Integration Workflows**: Use profile data as input for other automation tasks