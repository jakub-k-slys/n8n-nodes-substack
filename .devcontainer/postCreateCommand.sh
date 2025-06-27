#!/bin/bash

# Post-create script for dev container setup
echo "🚀 Setting up n8n Substack Node development environment..."

# Install dependencies
echo "📦 Installing npm dependencies..."
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

# Run tests to ensure everything is working
echo "🧪 Running tests to verify setup..."
npm test

echo "✅ Development environment setup complete!"
echo ""
echo "💡 Available commands:"
echo "  • npm run build          - Build the project"
echo "  • npm run dev            - Start development watch mode"
echo "  • npm test               - Run unit tests"
echo "  • npm run test:e2e       - Run E2E tests"
echo "  • npm run test:all       - Run all tests"
echo "  • npm run lint           - Check code style"
echo "  • npm run lintfix        - Fix code style issues"
echo "  • npm run format         - Format code with Prettier"
echo ""
echo "🔧 Optional: Install n8n CLI for integration testing:"
echo "  • npm install -g n8n     - Install n8n CLI globally"
echo "  • n8n                    - Start n8n (after CLI installation)"
echo ""
echo "🎯 Ready to develop! Open the Command Palette (Ctrl+Shift+P) and run tasks or use the terminal."