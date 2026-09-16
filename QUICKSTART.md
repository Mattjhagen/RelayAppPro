# OpenCode Mobile - Quick Start Guide

Get your OpenCode mobile app up and running in 5 minutes!

## Step 1: Setup Server (2 minutes)

```bash
cd ~/opencode-mobile

# Make scripts executable
chmod +x *.sh

# Install dependencies
./setup-server.sh
```

## Step 2: Configure Cloudflare Tunnel (1 minute)

Your tunnel is already configured! Just set up the DNS record:

```bash
cloudflared tunnel route dns c226c5ef-a3fb-4685-9a7e-c0522990693a opencode.relayapp.pro
```

## Step 3: Start Services (30 seconds)

### Option A: Run manually (for testing)

```bash
./start-all.sh
```

### Option B: Install as system services (recommended)

```bash
sudo ./install-services.sh
sudo systemctl start opencode-mobile
sudo systemctl start cloudflare-tunnel

# Check status
sudo systemctl status opencode-mobile
sudo systemctl status cloudflare-tunnel
```

## Step 4: Test the API (30 seconds)

```bash
# Test health endpoint
curl https://opencode.relayapp.pro/health

# Test chat endpoint
curl -X POST https://opencode.relayapp.pro/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is TypeScript?"}'
```

## Step 5: Build & Install Android App (1 minute)

### Quick method - Use Expo Go (fastest)

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go app on your phone.

### Full APK build

```bash
# Install Expo CLI
npm install -g eas-cli

# Login to Expo
eas login

# Initialize project
eas init

# Build APK
eas build -p android --profile preview
```

Download the APK from the Expo website and install on your phone.

## Troubleshooting

### Server won't start

```bash
# Check if port is in use
sudo lsof -i :7071

# Kill existing process
pkill -f "node.*bridge.js"

# Try again
cd server && npm start
```

### Tunnel not working

```bash
# Check tunnel status
cloudflared tunnel info c226c5ef-a3fb-4685-9a7e-c0522990693a

# Check DNS
dig opencode.relayapp.pro

# Restart tunnel
sudo systemctl restart cloudflare-tunnel
```

### Can't connect from app

1. Open app settings (gear icon)
2. Enter your server URL: `https://opencode.relayapp.pro`
3. Save and try again

### OpenCode not responding

```bash
# Test OpenCode directly
opencode run "hello"

# Check OpenCode configuration
opencode providers

# View OpenCode logs
opencode --print-logs run "test"
```

## What's Next?

- Customize the app UI in `App.tsx`
- Add authentication to the bridge server
- Set up monitoring and alerts
- Configure Cloudflare WAF for security

## Need Help?

Check the full README.md for detailed documentation and troubleshooting.

---

🎉 Enjoy your mobile OpenCode experience!
