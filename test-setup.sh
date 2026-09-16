#!/bin/bash

# Test OpenCode Mobile Setup

echo "🧪 Testing OpenCode Mobile Setup..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test functions
test_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 is installed"
        return 0
    else
        echo -e "${RED}✗${NC} $1 is NOT installed"
        return 1
    fi
}

test_port() {
    if lsof -i :$1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} Port $1 is in use (service running)"
        return 0
    else
        echo -e "${YELLOW}!${NC} Port $1 is not in use (service not running)"
        return 1
    fi
}

test_url() {
    if curl -s -o /dev/null -w "%{http_code}" $1 | grep -q "200\|301\|302"; then
        echo -e "${GREEN}✓${NC} $1 is accessible"
        return 0
    else
        echo -e "${RED}✗${NC} $1 is NOT accessible"
        return 1
    fi
}

# Test prerequisites
echo "1. Testing Prerequisites..."
test_command node
test_command npm
test_command opencode
test_command cloudflared
echo ""

# Test Node.js version
echo "2. Checking versions..."
NODE_VERSION=$(node --version)
echo "   Node.js: $NODE_VERSION"
OPENCODE_VERSION=$(opencode --version 2>&1)
echo "   OpenCode: $OPENCODE_VERSION"
echo ""

# Test server dependencies
echo "3. Testing server dependencies..."
if [ -d "server/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Server dependencies installed"
else
    echo -e "${YELLOW}!${NC} Server dependencies not installed - run ./setup-server.sh"
fi
echo ""

# Test if services are running
echo "4. Testing services..."
test_port 7071
echo ""

# Test API endpoints
echo "5. Testing API endpoints..."
test_url "http://localhost:7071/health"

if curl -s https://opencode.relayapp.pro/health &> /dev/null; then
    test_url "https://opencode.relayapp.pro/health"
else
    echo -e "${YELLOW}!${NC} Public URL not accessible (tunnel may not be running)"
fi
echo ""

# Test OpenCode directly
echo "6. Testing OpenCode CLI..."
if timeout 5 opencode run "echo test" &> /dev/null; then
    echo -e "${GREEN}✓${NC} OpenCode CLI is working"
else
    echo -e "${YELLOW}!${NC} OpenCode CLI test timed out or failed"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Test complete! Check the results above."
echo ""
echo "If all tests pass, you're ready to build the app!"
echo "If any tests failed, see QUICKSTART.md for troubleshooting."
echo ""
