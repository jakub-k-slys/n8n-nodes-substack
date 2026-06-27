> [!WARNING]
> This package is superseded by [n8n-nodes-substack-new](https://github.com/jakub-k-slys/n8n-nodes-substack-new),
> which connects to [Substack Gateway OSS](https://github.com/jakub-k-slys/substack-gateway-oss)
> and supports full read and write operations. This package remains
> available but is no longer actively developed.

# n8n-nodes-substack

[![npm version](https://badge.fury.io/js/n8n-nodes-substack.svg)](https://badge.fury.io/js/n8n-nodes-substack)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://github.com/jakub-k-slys/n8n-nodes-substack/actions/workflows/test.yml/badge.svg)](https://github.com/jakub-k-slys/n8n-nodes-substack/actions/workflows/test.yml)

Read-only n8n community node for Substack. Enables content discovery and
analytics workflows against Substack publications.

## Features

- Profile operations: get profile information and publication data
- Post operations: retrieve posts with pagination
- Note operations: read and create notes
- Comment operations: get comments for posts

## Installation

### Self-hosted n8n

```bash
npm install n8n-nodes-substack
```

Restart n8n after installation.

### Credentials

Add credentials with:
- **Publication Address**: your Substack domain (e.g. `myblog.substack.com`)
- **API Key**: your Substack API key

## Documentation

- [Resource Guides](docs/resources/)
- [Development Guide](docs/contributing.md)
- [Testing Guide](docs/testing.md)
- [Architecture](docs/design.md)

## Author

Built by [Jakub Slys](https://iam.slys.dev) — Backend Engineer building
distributed systems for telecoms, running a self-hosted Kubernetes homelab,
and building AI automation pipelines with n8n, MCP, and Claude.

I write about building this kind of tooling — n8n workflows, self-hosted AI
automation, and the engineering decisions behind them — at
[iam.slys.dev](https://iam.slys.dev).

→ [iam.slys.dev](https://iam.slys.dev)

## License

MIT
