# Introduction

## Overview

The n8n Substack node enables you to integrate Substack workflows directly into your n8n automation platform. This community node provides a seamless way to interact with the Substack API, allowing you to automate content creation and data retrieval from your Substack publications.

The node is built using the robust [substack-api](https://www.npmjs.com/package/substack-api) library, ensuring reliable and type-safe interactions with Substack's services.

## What is n8n?

[n8n](https://n8n.io/) is a fair-code licensed workflow automation platform that lets you connect different services and automate repetitive tasks. With the Substack node, you can now include Substack operations as part of your automated workflows.

## Key Features

### Note Operations
- **Create Notes**: Publish short-form content to your Substack feed programmatically
- **Rich Content Support**: Support for HTML content in note bodies
- **Simple Interface**: Easy-to-use title and body parameters

### Post Operations
- **Retrieve Posts**: Get posts from your publication with full metadata
- **Pagination Support**: Control the number of posts retrieved using limit and offset parameters
- **Comprehensive Data**: Access to post titles, dates, URLs, paywall status, and more

### Authentication & Security
- **API Key Authentication**: Secure authentication using your Substack API key
- **Publication-Scoped**: Works with specific publication addresses
- **Credential Management**: Built-in n8n credential system for secure API key storage

### Error Handling
- **Robust Error Handling**: Clear error messages for troubleshooting
- **Continue on Fail**: Option to continue workflow execution even if some operations fail
- **Validation**: Parameter validation to prevent common configuration errors

## Use Cases

The n8n Substack node enables many automation scenarios:

### Content Management
- **Automated Publishing**: Create notes based on triggers from other systems
- **Content Curation**: Retrieve recent posts to analyze or share elsewhere
- **Cross-Platform Publishing**: Sync content between Substack and other platforms

### Analytics & Monitoring
- **Publication Monitoring**: Track new posts and engagement
- **Content Analysis**: Export post data for analysis in other tools
- **Reporting**: Generate reports on publication activity

### Integration Workflows
- **RSS to Substack**: Convert RSS feeds into Substack notes
- **Social Media Integration**: Create notes from social media mentions
- **Email to Note**: Convert emails into Substack content
- **Content Backup**: Regularly backup publication content

## Architecture

The node follows n8n's standard architecture patterns:

- **Resource-Based Design**: Operations are organized by resource type (Note, Post)
- **Parameter Validation**: Built-in validation for all user inputs
- **Credential Integration**: Seamless integration with n8n's credential system
- **Error Propagation**: Proper error handling and user feedback

## Getting Started

1. **Install the Node**: Add the community node to your n8n instance
2. **Configure Credentials**: Set up your Substack API credentials
3. **Create Workflows**: Build automation workflows using the available operations
4. **Test & Deploy**: Test your workflows and deploy them for production use

For detailed setup instructions, check out the [Quickstart](quickstart.md) guide or visit the [Installation](installation.md) page.

## Library Documentation

For developers interested in the underlying API library or advanced use cases, comprehensive documentation is available:

- **[API Reference](api-reference.md)**: Full library documentation
- **[Examples](examples.md)**: Code examples and workflows
- **[Development Guide](development.md)**: Contributing and development setup

The substack-api library can also be used directly in Function nodes for advanced operations not covered by the standard node interface.
