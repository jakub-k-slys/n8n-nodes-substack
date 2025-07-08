# n8n-nodes-substack

[![npm version](https://badge.fury.io/js/n8n-nodes-substack.svg)](https://badge.fury.io/js/n8n-nodes-substack)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://github.com/jakub-k-slys/n8n-nodes-substack/actions/workflows/test.yaml/badge.svg)](https://github.com/jakub-k-slys/n8n-nodes-substack/actions/workflows/test.yaml)

This n8n community node provides comprehensive read-only access to the Substack API, enabling you to automate content discovery, analytics, and workflow integration with Substack publications.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## ✨ Features

### 📊 **Profile Management**
- **Get Own Profile**: Retrieve your profile information (name, handle, bio)
- **Get Profile by Slug**: Find profiles by publication slug (e.g., "username.substack.com")
- **Get Profile by ID**: Access profiles using unique user IDs
- **Get Followees**: List users you follow

### 📝 **Post Operations**
- **Get All Posts**: Retrieve all posts from your publication with pagination
- **Get Posts by Slug**: Fetch posts from any publication by slug
- **Get Posts by ID**: Access posts from specific users by ID
- **Get Post by ID**: Retrieve individual posts using post IDs

### 💭 **Note Operations** 
- **Get Notes**: Retrieve notes from your own profile
- **Get Notes by Slug**: Fetch notes from any publication by slug  
- **Get Notes by ID**: Access notes from specific users by ID
- **Get Note by ID**: Retrieve individual notes using note IDs

### 💬 **Comment Operations**
- **Get All Comments**: Retrieve comments for specific posts
- **Get Comment by ID**: Access individual comments using comment IDs

### 🔧 **Technical Features**
- **Secure Authentication**: API key authentication with publication address
- **Pagination Support**: Built-in pagination for all list operations
- **Error Handling**: Robust error handling with user-friendly messages
- **TypeScript Support**: Full type definitions for reliable development
- **Comprehensive Testing**: Unit and integration tests for reliability

## 🚀 Quick Start

### Fetch Your Profile Information

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

### Monitor Comments on a Post

```json
{
  "nodes": [
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
  ]
}
```

## 📦 Installation

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

## 📖 Documentation

### Quick Navigation

- **[Resource Guides](docs/resources/)** - Detailed documentation for each resource:
  - [Profile Operations](docs/resources/profile.md)
  - [Post Operations](docs/resources/post.md)
  - [Note Operations](docs/resources/note.md)
  - [Comment Operations](docs/resources/comment.md)

- **[Development](docs/development.md)** - Contributing to the node development
- **[Testing Guide](docs/testing.md)** - Testing practices and procedures
- **[Architecture](docs/design.md)** - Design decisions and project structure
- **[Contributing](docs/contributing.md)** - How to contribute to the project

### Usage Examples

#### Content Analytics Workflow

Monitor engagement across your content:

1. **Get Recent Posts** → Get your latest 20 posts
2. **For Each Post** → Get comments and engagement metrics
3. **Analyze Data** → Generate analytics reports

#### Cross-Platform Content Distribution

Automatically share content to other platforms:

1. **Get New Posts** → Monitor for new publications
2. **Extract Content** → Get post titles and descriptions  
3. **Distribute** → Share to Twitter, LinkedIn, etc.

#### Community Management

Stay on top of reader engagement:

1. **Monitor Comments** → Check for new comments on recent posts
2. **Filter Comments** → Identify questions or feedback
3. **Generate Alerts** → Notify via email or Slack

## 🏗️ Project Architecture

### File Structure

```
nodes/Substack/
├── Substack.node.ts          # Main node implementation
├── types.ts                  # TypeScript definitions
├── SubstackUtils.ts          # Shared utilities
├── Profile.operations.ts     # Profile operations
├── Post.operations.ts        # Post operations  
├── Note.operations.ts        # Note operations
├── Comment.operations.ts     # Comment operations
└── *.fields.ts              # UI field definitions
```

### Design Patterns

- **Resource-Operation Pattern**: Organized by Substack resources (Profile, Post, Note, Comment)
- **Modular Architecture**: Separated concerns for operations, fields, and utilities
- **Type Safety**: Comprehensive TypeScript typing throughout
- **Error Handling**: Standardized error responses and user-friendly messages
- **Testing**: Mock-based testing for reliable CI/CD

### Adding New Operations

The modular design makes it easy to extend functionality:

1. Add operation to the relevant resource enum
2. Implement the operation function
3. Add UI field definitions if needed
4. Write comprehensive tests
5. Update documentation

See the [Contributing Guide](docs/contributing.md) for detailed instructions.

## 🔍 Use Cases

### Content Creators
- **Analytics**: Track post performance and reader engagement
- **Archive Management**: Build comprehensive content archives
- **Cross-promotion**: Automate content sharing across platforms

### Publishers
- **Community Management**: Monitor comments and reader feedback
- **Content Strategy**: Analyze which topics resonate with readers
- **Workflow Automation**: Integrate with CRM, email, and social media tools

### Researchers & Analysts
- **Data Collection**: Gather publication data for analysis
- **Trend Monitoring**: Track content patterns across publications
- **Competitive Analysis**: Monitor competitor publications

### Developers
- **API Integration**: Build custom applications with Substack data
- **Automation**: Create workflows for content management
- **Analytics Tools**: Develop custom reporting and analytics solutions

## 🛠️ Development

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

### Manual Setup

1. **Prerequisites**: Node.js >=20.15, npm, Git
2. **Install dependencies**: `npm install`
3. **Build project**: `npm run build`
4. **Run tests**: `npm test`

See the [Development Guide](docs/development.md) for detailed instructions.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/contributing.md) for details on:

- Development setup and workflow
- Code standards and quality requirements
- Testing practices and requirements
- Submission process and review guidelines

### Ways to Contribute

- 🐛 **Bug Reports**: Help us identify and fix issues
- ✨ **Feature Requests**: Suggest new operations and capabilities
- 📖 **Documentation**: Improve guides, examples, and explanations
- 🧪 **Testing**: Add test coverage and edge case handling
- 💻 **Code**: Implement new features and optimizations

## 📜 License

[MIT](LICENSE.md) - Feel free to use this project for personal and commercial purposes.

## 🙏 Acknowledgments

- Built with the robust [substack-api](https://www.npmjs.com/package/substack-api) library
- Powered by the [n8n](https://n8n.io/) workflow automation platform
- Inspired by the vibrant n8n community

---

**Need help?** Check our [documentation](docs/), browse [existing issues](https://github.com/jakub-k-slys/n8n-nodes-substack/issues), or visit the [n8n Community Forum](https://community.n8n.io/).
