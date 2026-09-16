#!/bin/bash

# OpenCode Mobile Server Setup Script

set -e

echo "🚀 Setting up OpenCode Mobile Server..."
echo ""

# Detect OS
OS="$(uname -s)"
case "${OS}" in
    Linux*)     MACHINE=Linux;;
    Darwin*)    MACHINE=Mac;;
    *)          MACHINE="UNKNOWN:${OS}"
esac

echo "📱 Detected OS: $MACHINE"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    if [ "$MACHINE" = "Mac" ]; then
        echo "   Install with: brew install node"
    else
        echo "   Install from: https://nodejs.org/"
    fi
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if opencode is installed and find its location
OPENCODE_PATH=""
if command -v opencode &> /dev/null; then
    OPENCODE_PATH=$(command -v opencode)
    echo "✅ OpenCode found at: $OPENCODE_PATH"
    echo "✅ OpenCode version: $(opencode --version)"
else
    echo "❌ OpenCode is not installed or not in PATH."
    if [ "$MACHINE" = "Mac" ]; then
        echo ""
        echo "   Install with:"
        echo "   brew install anomalyco/tap/opencode"
        echo ""
        echo "   If already installed, add to PATH:"
        echo "   export PATH=\"/opt/homebrew/bin:\$PATH\"  # Apple Silicon"
        echo "   export PATH=\"/usr/local/bin:\$PATH\"     # Intel Mac"
    else
        echo "   Install with: snap install opencode"
    fi
    exit 1
fi

# Install server dependencies
echo ""
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

echo ""
echo "✅ Server setup complete!"
echo ""
echo "📍 OpenCode location: $OPENCODE_PATH"
echo ""
echo "To start the server:"
echo "  cd server && npm start"
echo ""
echo "To start with auto-reload (development):"
echo "  cd server && npm run dev"
echo ""
