#!/bin/bash

# Start all services for OpenCode Mobile

echo "🚀 Starting OpenCode Mobile Services..."
echo ""

# Kill any existing processes
echo "Cleaning up existing processes..."
pkill -f "node.*bridge.js" || true
pkill -f "cloudflared.*opencode" || true
sleep 2

# Start the bridge server in background
echo "Starting bridge server..."
cd server
npm start &
SERVER_PID=$!
cd ..

# Wait for server to be ready
echo "Waiting for server to start..."
sleep 3

# Check if server is running
if curl -s http://localhost:7071/health > /dev/null; then
    echo "✅ Bridge server is running (PID: $SERVER_PID)"
else
    echo "❌ Bridge server failed to start"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Start Cloudflare tunnel
echo ""
echo "Starting Cloudflare tunnel..."
cloudflared tunnel --config .cloudflared-opencode.yml run &
TUNNEL_PID=$!

echo ""
echo "✅ All services started!"
echo ""
echo "Services:"
echo "  Bridge Server (PID: $SERVER_PID) - http://localhost:7071"
echo "  Cloudflare Tunnel (PID: $TUNNEL_PID) - https://opencode.relayapp.pro"
echo ""
echo "To stop all services:"
echo "  pkill -f 'node.*bridge.js'"
echo "  pkill -f 'cloudflared.*opencode'"
echo ""
echo "Logs:"
echo "  tail -f server/logs/*.log"
echo ""

# Keep script running
wait
