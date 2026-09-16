#!/bin/bash

# OpenCode Mobile Server Setup Script

set -e

echo "🚀 Setting up OpenCode Mobile Server..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if opencode is installed
if ! command -v opencode &> /dev/null; then
    echo "❌ OpenCode is not installed. Please install opencode first."
    exit 1
fi

echo "✅ OpenCode version: $(opencode --version)"

# Install server dependencies
echo ""
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

echo ""
echo "✅ Server setup complete!"
echo ""
echo "To start the server:"
echo "  cd server && npm start"
echo ""
echo "To start with auto-reload (development):"
echo "  cd server && npm run dev"
echo ""
