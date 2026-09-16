#!/bin/bash

# Start all services for OpenCode Mobile (Bridge + PWA + Tunnel)

echo "🚀 Starting OpenCode Mobile - Complete Stack..."
echo ""

# Kill any existing processes
echo "Cleaning up existing processes..."
pkill -f "node.*bridge.js" || true
pkill -f "node.*serve-pwa.js" || true
pkill -f "cloudflared.*opencode" || true
sleep 2

# Start the bridge server
echo "1/3 Starting bridge server (port 7071)..."
cd server
npm start &
BRIDGE_PID=$!
cd ..
sleep 2

# Check if bridge is running
if curl -s http://localhost:7071/health > /dev/null; then
    echo "✅ Bridge server is running (PID: $BRIDGE_PID)"
else
    echo "❌ Bridge server failed to start"
    exit 1
fi

# Start the PWA server
echo ""
echo "2/3 Starting PWA server (port 8080)..."
cd server
node serve-pwa.js &
PWA_PID=$!
cd ..
sleep 2

# Check if PWA is running
if curl -s http://localhost:8080 > /dev/null; then
    echo "✅ PWA server is running (PID: $PWA_PID)"
else
    echo "❌ PWA server failed to start"
    kill $BRIDGE_PID 2>/dev/null || true
    exit 1
fi

# Start Cloudflare tunnel
echo ""
echo "3/3 Starting Cloudflare tunnel..."
cloudflared tunnel --config .cloudflared-pwa.yml run &
TUNNEL_PID=$!

echo ""
echo "✅ All services started!"
echo ""
echo "═══════════════════════════════════════════════════════"
echo "Services Running:"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "📱 PWA Website:"
echo "   Local:  http://localhost:8080"
echo "   Public: https://app.relayapp.pro"
echo ""
echo "🌉 Bridge API:"
echo "   Local:  http://localhost:7071"
echo "   Public: https://opencode.relayapp.pro"
echo ""
echo "🌐 Cloudflare Tunnel:"
echo "   PID: $TUNNEL_PID"
echo ""
echo "═══════════════════════════════════════════════════════"
echo "To stop all services:"
echo "═══════════════════════════════════════════════════════"
echo "  pkill -f 'node.*bridge.js'"
echo "  pkill -f 'node.*serve-pwa.js'"
echo "  pkill -f 'cloudflared.*opencode'"
echo ""
echo "To view logs:"
echo "  tail -f server/*.log"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Keep script running
wait
