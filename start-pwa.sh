#!/bin/bash

# Start OpenCode Mobile PWA Server

set -e

echo "🌐 Starting OpenCode Mobile PWA Server..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    exit 1
fi

# Check if server dependencies are installed
if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing server dependencies..."
    cd server && npm install && cd ..
fi

# Start PWA server
echo "Starting PWA server on port 8080..."
cd server
node serve-pwa.js &
PWA_PID=$!
cd ..

echo ""
echo "✅ PWA Server started (PID: $PWA_PID)"
echo ""
echo "Access the PWA:"
echo "  Local: http://localhost:8080"
echo "  Public: https://app.relayapp.pro (after DNS config)"
echo ""
echo "To stop:"
echo "  pkill -f 'node.*serve-pwa.js'"
echo ""
