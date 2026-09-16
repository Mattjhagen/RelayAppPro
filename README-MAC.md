# OpenCode Mobile - macOS Setup Guide

Quick setup guide for running OpenCode Mobile on macOS.

## Prerequisites

### 1. Install Homebrew (if not installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install Node.js
```bash
brew install node
```

### 3. Install OpenCode
```bash
brew install anomalyco/tap/opencode
```

Verify installation:
```bash
which opencode
opencode --version
```

## Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Mattjhagen/RelayAppPro.git
cd RelayAppPro
```

### 2. Setup Server
```bash
./setup-server.sh
```

If you get "opencode not found", add Homebrew to your PATH:

**Apple Silicon Macs:**
```bash
export PATH="/opt/homebrew/bin:$PATH"
# Add to ~/.zshrc or ~/.bash_profile to make permanent
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
```

**Intel Macs:**
```bash
export PATH="/usr/local/bin:$PATH"
# Add to ~/.zshrc or ~/.bash_profile to make permanent
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.zshrc
```

Then try setup again:
```bash
./setup-server.sh
```

## Running the App

### Option 1: Run Locally (Development)

Start the bridge server:
```bash
cd server
node bridge.js
```

The server will run on `http://localhost:7072`

Test it:
```bash
curl http://localhost:7072/health
```

### Option 2: Run PWA Server

In a new terminal:
```bash
cd server
node serve-pwa.js
```

Then open `http://localhost:8081` in your browser.

### Option 3: Build Native App with Expo

Install Expo CLI:
```bash
npm install -g expo-cli eas-cli
```

Build APK for Android:
```bash
./build-and-deploy.sh
# Select option 2
```

Or run with Expo Go:
```bash
npm install
npx expo start
```

## Cloudflare Tunnel (Optional)

If you want to access from your phone without being on the same network:

### 1. Install cloudflared
```bash
brew install cloudflare/cloudflare/cloudflared
```

### 2. Login
```bash
cloudflared tunnel login
```

### 3. Create Tunnel
```bash
cloudflared tunnel create opencode-mobile
```

### 4. Configure
Edit `.cloudflared-pwa.yml` with your tunnel ID and credentials.

### 5. Start Tunnel
```bash
cloudflared tunnel --config .cloudflared-pwa.yml run
```

## Troubleshooting

### "opencode: command not found"

**Issue:** Homebrew's bin directory isn't in your PATH.

**Solution:**
```bash
# Find where Homebrew installed opencode
brew --prefix opencode

# Add Homebrew to PATH (choose one):
# Apple Silicon:
export PATH="/opt/homebrew/bin:$PATH"

# Intel Mac:
export PATH="/usr/local/bin:$PATH"

# Make it permanent by adding to ~/.zshrc or ~/.bash_profile
```

### Port Already in Use

If you get "EADDRINUSE" errors:

**Find what's using the port:**
```bash
lsof -i :7072  # or whatever port
```

**Kill the process:**
```bash
kill -9 <PID>
```

**Or use a different port:**
```bash
PORT=7073 node server/bridge.js
```

### Node Version Issues

Make sure you're using Node.js 18 or higher:
```bash
node --version
```

If too old:
```bash
brew upgrade node
```

### OpenCode CLI Slow Response

OpenCode can take 30-120 seconds to respond. This is normal. The bridge server has a 120-second timeout.

## Testing

### Test OpenCode Directly
```bash
opencode run "What is TypeScript?"
```

### Test Bridge Server
```bash
# Start server
cd server && node bridge.js

# In another terminal:
curl -X POST http://localhost:7072/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'
```

### Test PWA
```bash
# Start PWA server
cd server && node serve-pwa.js

# Open in browser
open http://localhost:8081
```

## macOS Specific Notes

- **Apple Silicon (M1/M2/M3)**: Homebrew installs to `/opt/homebrew`
- **Intel Mac**: Homebrew installs to `/usr/local`
- **Default Shell**: macOS Catalina+ uses `zsh` (not bash), so edit `~/.zshrc`
- **Permissions**: You may need to allow terminal apps in System Preferences → Security & Privacy

## What's Different on Mac vs Linux

| Feature | macOS | Linux (Server) |
|---------|-------|----------------|
| OpenCode path | `/opt/homebrew/bin/opencode` | `/snap/bin/opencode` |
| Default shell | zsh | bash |
| Homebrew location | `/opt/homebrew` (ARM) or `/usr/local` (Intel) | N/A |
| Package manager | Homebrew | apt/snap |

The bridge server now auto-detects the correct OpenCode path, so it works on both!

## Next Steps

Once running locally:
1. Test the chat interface
2. Customize colors and branding
3. Build Android APK with Expo
4. Or deploy as PWA with Cloudflare Tunnel

## Support

- Main README: [README.md](README.md)
- Quick Start: [QUICKSTART.md](QUICKSTART.md)
- Architecture: [ARCHITECTURE.md](ARCHITECTURE.md)
- GitHub: https://github.com/Mattjhagen/RelayAppPro

---

Enjoy using OpenCode Mobile on your Mac! 🎉
