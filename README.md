# OpenCode Mobile

[![GitHub](https://img.shields.io/badge/GitHub-RelayAppPro-blue?logo=github)](https://github.com/Mattjhagen/RelayAppPro)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![React Native](https://img.shields.io/badge/React%20Native-0.74-61DAFB?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-51-000020?logo=expo)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js)](https://nodejs.org/)

A flagship Android app wrapper for OpenCode that provides a ChatGPT/Claude/Gemini-like experience on mobile devices.

## 🔗 Quick Links

- **Repository:** [https://github.com/Mattjhagen/RelayAppPro](https://github.com/Mattjhagen/RelayAppPro)
- **Issues:** [Report a bug or request a feature](https://github.com/Mattjhagen/RelayAppPro/issues)
- **Documentation:** See below or check out [QUICKSTART.md](QUICKSTART.md) for a 5-minute setup guide

## Features

- 🎨 Modern, polished UI matching flagship AI apps
- 🌓 Automatic dark/light theme support
- 💬 Chat-style interface with markdown rendering
- 📱 Native Android experience with React Native
- 🔐 Secure server connection via Cloudflare Tunnel
- 📋 Copy message content
- 🗑️ Clear conversation history
- ⚙️ Configurable server URL

## Architecture

```
┌─────────────────┐
│   Android App   │ (React Native/Expo)
│   (Your Phone)  │
└────────┬────────┘
         │ HTTPS via Cloudflare Tunnel
         │
┌────────▼────────┐
│ Bridge Server   │ (Node.js/Express)
│   (Port 7071)   │
└────────┬────────┘
         │ CLI execution
         │
┌────────▼────────┐
│    OpenCode     │ (TUI/CLI)
│   /snap/bin/    │
└─────────────────┘
```

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- OpenCode installed and configured
- Cloudflare Tunnel set up (or use existing tunnel)
- Expo CLI for building the Android app

### 2. Server Setup

```bash
# Run the setup script
chmod +x setup-server.sh
./setup-server.sh

# Start the bridge server
cd server
npm start

# Or with auto-reload for development
npm run dev
```

### 3. Configure Cloudflare Tunnel

You need to set up a DNS record for your tunnel:

```bash
# Add DNS record (replace with your tunnel ID and desired subdomain)
cloudflared tunnel route dns c226c5ef-a3fb-4685-9a7e-c0522990693a opencode.relayapp.pro
```

### 4. Start Services

```bash
# Make scripts executable
chmod +x *.sh

# Start all services (bridge + tunnel)
./start-all.sh

# Or start individually:
./start-tunnel.sh    # In one terminal
cd server && npm start  # In another terminal
```

### 5. Build Android APK

```bash
# Install dependencies
npm install

# Install Expo CLI globally if needed
npm install -g expo-cli eas-cli

# Login to Expo
eas login

# Configure your project
eas init

# Build APK
eas build -p android --profile preview

# Or for development build
eas build -p android --profile development
```

### 6. Install on Android

1. Download the built APK from Expo
2. Transfer to your phone
3. Enable "Install from Unknown Sources" in Android settings
4. Install the APK
5. Open the app and configure your server URL in settings

## Configuration

### Server URL

The app defaults to `https://opencode.relayapp.pro`. You can change this in the app's settings menu.

### Environment Variables

Create a `.env` file in the project root:

```env
# Server configuration
PORT=7071
OPENCODE_PATH=/snap/bin/opencode

# Cloudflare tunnel
TUNNEL_ID=c226c5ef-a3fb-4685-9a7e-c0522990693a
TUNNEL_DOMAIN=opencode.relayapp.pro
```

## API Endpoints

### POST /api/chat

Send a message to OpenCode.

**Request:**
```json
{
  "message": "Your question or command",
  "history": [...],  // Optional: previous messages
  "model": "anthropic/claude-3-5-sonnet",  // Optional
  "sessionId": "uuid"  // Optional: for session continuation
}
```

**Response:**
```json
{
  "response": "OpenCode's response",
  "timestamp": "2026-09-16T..."
}
```

### WebSocket /ws

Real-time streaming for chat responses.

**Connect:**
```javascript
const ws = new WebSocket('wss://opencode.relayapp.pro/ws');
```

**Send:**
```json
{
  "type": "chat",
  "message": "Your message",
  "history": [...],
  "model": "anthropic/claude-3-5-sonnet"
}
```

**Receive:**
```json
{
  "type": "chunk",
  "content": "Streaming response..."
}
```

## Development

### Project Structure

```
opencode-mobile/
├── App.tsx              # Main React Native app
├── app.json             # Expo configuration
├── eas.json             # EAS Build configuration
├── package.json         # Dependencies
├── server/
│   ├── bridge.js        # Node.js bridge server
│   └── package.json     # Server dependencies
├── assets/              # App icons and images
└── scripts/
    ├── setup-server.sh  # Setup script
    ├── start-tunnel.sh  # Start Cloudflare tunnel
    └── start-all.sh     # Start all services
```

### Local Testing

1. Start the server: `cd server && npm start`
2. Test the API: `curl -X POST http://localhost:7071/api/chat -H "Content-Type: application/json" -d '{"message":"hello"}'`
3. Run the app: `npx expo start`
4. Press `a` to open in Android emulator or scan QR code with Expo Go

## Troubleshooting

### Server won't start
- Check if port 7071 is already in use: `lsof -i :7071`
- Kill existing process: `pkill -f "node.*bridge.js"`

### Can't connect from mobile app
- Verify Cloudflare tunnel is running: `cloudflared tunnel info c226c5ef-a3fb-4685-9a7e-c0522990693a`
- Check DNS propagation: `dig opencode.relayapp.pro`
- Test endpoint: `curl https://opencode.relayapp.pro/health`

### OpenCode not responding
- Verify OpenCode is installed: `which opencode`
- Test OpenCode directly: `opencode run "hello"`
- Check OpenCode configuration: `opencode providers`

## Security Notes

- The bridge server should only be accessible via Cloudflare Tunnel
- Never expose port 7071 directly to the internet
- Use Cloudflare's security features (WAF, rate limiting) to protect your endpoint
- Consider implementing authentication for production use

## Future Enhancements

- [ ] Voice input support
- [ ] Image/file upload
- [ ] Session management and history sync
- [ ] Push notifications for long-running tasks
- [ ] Biometric authentication
- [ ] Multi-account support
- [ ] Offline mode with local caching

## License

MIT

## Author

Built for use with OpenCode - A versatile AI coding assistant.
