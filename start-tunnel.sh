#!/bin/bash

# Start Cloudflare Tunnel for OpenCode Mobile

set -e

echo "🌐 Starting Cloudflare Tunnel for OpenCode Mobile..."
echo ""

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "❌ cloudflared is not installed."
    echo "   Install with: sudo apt install cloudflared"
    exit 1
fi

# Start the tunnel
echo "Starting tunnel with config: .cloudflared-opencode.yml"
echo ""

cloudflared tunnel --config .cloudflared-opencode.yml run

# Note: You'll need to configure the DNS record first:
# cloudflared tunnel route dns c226c5ef-a3fb-4685-9a7e-c0522990693a opencode.relayapp.pro
