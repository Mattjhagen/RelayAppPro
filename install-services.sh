#!/bin/bash

# Install OpenCode Mobile as systemd services

set -e

echo "📦 Installing OpenCode Mobile services..."
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "This script must be run as root (use sudo)"
    exit 1
fi

# Copy service files
echo "Copying service files..."
cp opencode-mobile.service /etc/systemd/system/
cp cloudflare-tunnel.service /etc/systemd/system/

# Reload systemd
echo "Reloading systemd..."
systemctl daemon-reload

# Enable services
echo "Enabling services..."
systemctl enable opencode-mobile.service
systemctl enable cloudflare-tunnel.service

echo ""
echo "✅ Services installed successfully!"
echo ""
echo "To start the services:"
echo "  sudo systemctl start opencode-mobile"
echo "  sudo systemctl start cloudflare-tunnel"
echo ""
echo "To check status:"
echo "  sudo systemctl status opencode-mobile"
echo "  sudo systemctl status cloudflare-tunnel"
echo ""
echo "To view logs:"
echo "  sudo journalctl -u opencode-mobile -f"
echo "  sudo journalctl -u cloudflare-tunnel -f"
echo ""
