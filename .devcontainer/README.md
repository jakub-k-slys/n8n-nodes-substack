# Dev Container for n8n Substack Node

This directory contains the development container configuration for the n8n Substack Node project, enabling instant development environments through GitHub Codespaces or VS Code Remote Containers.

## 🚀 Quick Start

### GitHub Codespaces (Recommended)

1. **Open in Codespaces**: Click the "Code" button in the GitHub repository and select "Create codespace on main"
2. **Wait for setup**: The container will automatically install dependencies and build the project (~2-3 minutes)
3. **Start developing**: Everything is ready! Run tasks using Ctrl+Shift+P → "Tasks: Run Task"

### VS Code Remote Containers

1. **Install Extension**: Install the "Dev Containers" extension in VS Code
2. **Open Repository**: Clone the repo and open it in VS Code
3. **Reopen in Container**: VS Code will prompt you, or use Ctrl+Shift+P → "Dev Containers: Reopen in Container"
4. **Wait for setup**: The container will automatically configure everything

## 🛠 What's Included

### Development Tools
- **Node.js LTS** (v20+) - Latest LTS version for optimal compatibility
- **npm** - Package manager with all project dependencies
- **Git** - Version control with safe directory configuration
- **GitHub CLI** - For advanced GitHub integration

### Code Quality Tools
- **ESLint** - Code linting with n8n-specific rules
- **Prettier** - Code formatting
- **TypeScript** - Type checking and compilation
- **EditorConfig** - Consistent editor settings

### VS Code Extensions
- **ESLint** (`dbaeumer.vscode-eslint`) - Real-time linting
- **Prettier** (`esbenp.prettier-vscode`) - Code formatting
- **GitLens** (`eamodio.gitlens`) - Enhanced Git capabilities
- **TypeScript** (`ms-vscode.vscode-typescript-next`) - Advanced TypeScript support
- **JSON** (`ms-vscode.vscode-json`) - JSON file support
- **EditorConfig** (`EditorConfig.EditorConfig`) - Editor consistency

### Testing & Building
- **Jest** - Unit and E2E testing framework
- **Gulp** - Build task automation
- **TypeScript Compiler** - Code compilation
- **n8n CLI** - For integration testing (optional)

## 📋 Available Tasks

Access these through VS Code Command Palette (Ctrl+Shift+P) → "Tasks: Run Task":

| Task | Command | Description |
|------|---------|-------------|
| **Build Project** | `npm run build` | Compile TypeScript and build icons |
| **Run Tests** | `npm test` | Execute unit tests |
| **Run E2E Tests** | `npm run test:e2e` | Execute end-to-end tests |
| **Run All Tests** | `npm run test:all` | Execute both unit and E2E tests |
| **Lint Code** | `npm run lint` | Check code style and quality |
| **Fix Lint Issues** | `npm run lintfix` | Auto-fix linting issues |
| **Format Code** | `npm run format` | Format code with Prettier |
| **Watch Build** | `npm run dev` | Start TypeScript watch mode |
| **Install Dependencies** | `npm install` | Install/update npm packages |

## 🔧 Configuration Details

### Container Features
- **Base Image**: `mcr.microsoft.com/devcontainers/javascript-node:1-20-bookworm`
- **Workspace**: Mounted to `/workspace` with cached consistency
- **User**: Runs as `node` user for security
- **Port**: 5678 forwarded for debugging/development servers

### Auto-Setup Process
1. **Dependency Installation**: `npm install` runs automatically
2. **n8n CLI Installation**: Global installation for integration testing
3. **Project Build**: Initial build to verify setup
4. **Test Validation**: Quick test run to ensure everything works
5. **Git Configuration**: Safe directory setup for container environment

### VS Code Integration
- **Auto-format on save** with Prettier
- **ESLint auto-fix** on save
- **TypeScript auto-imports** enabled
- **Consistent line endings** (LF)
- **Integrated terminal** configured

## 🧪 Testing Your Node

### Local Testing
```bash
# Run all tests
npm run test:all

# Build and verify
npm run build

# Lint code
npm run lint
```

### Integration Testing with n8n
```bash
# Start n8n (after container setup)
n8n

# Your node will be available in the n8n interface
# Navigate to http://localhost:5678 in your browser
```

## 📁 File Structure

```
.devcontainer/
├── devcontainer.json         # Main container configuration
├── postCreateCommand.sh      # Setup script run after container creation
└── README.md                # This documentation file
```

## 🔍 Troubleshooting

### Container Won't Start
- Check Docker is running (for local development)
- Verify VS Code has the Dev Containers extension installed
- Try rebuilding the container: Ctrl+Shift+P → "Dev Containers: Rebuild Container"

### Build Errors
- Ensure all dependencies are installed: run "Install Dependencies" task
- Check Node.js version: should be 20+ (automatic in container)
- Verify TypeScript compilation: run "Build Project" task

### Test Failures
- Run tests individually to isolate issues
- Check if mocks are properly configured
- Verify test data and expectations

### Port Issues
- Default port 5678 is forwarded automatically
- Check VS Code's "Ports" tab to verify forwarding
- For custom ports, update `forwardPorts` in devcontainer.json

## 🤝 Contributing

When developing in the container:

1. **Follow the workflow**: Format → Lint → Test → Build
2. **Use provided tasks**: Leverage VS Code tasks for consistency
3. **Test thoroughly**: Run both unit and E2E tests
4. **Keep it clean**: Let auto-formatting and linting handle style

The dev container ensures all contributors have the same development environment, reducing "works on my machine" issues and streamlining the contribution process.

## 🎯 Benefits

- **⚡ Instant Setup**: Zero configuration required
- **🧼 Consistency**: Same environment for all developers
- **🔒 Isolation**: No conflicts with local system
- **🚀 Performance**: Optimized for n8n node development
- **🧪 Testing**: Pre-configured testing environment
- **📦 Complete**: All tools included out of the box