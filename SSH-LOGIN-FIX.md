# SSH Expo Login Fix

When you're SSH'd into a server, the Expo OAuth callback doesn't work because it tries to connect to `localhost` on your Mac, but the server is listening on its own localhost.

## 🚀 Quick Fix Options

### Option 1: Manual Login (Easiest!)

Instead of the browser login, use username/password:

```bash
cd ~/opencode-mobile
npx eas-cli login --username YOUR_EXPO_USERNAME
```

You'll be prompted:
```
Password: [enter your password]
```

That's it! No browser needed.

---

### Option 2: SSH Port Forwarding (Most Reliable)

**On your Mac**, disconnect and reconnect with port forwarding:

```bash
# Exit current SSH session
exit

# Reconnect with port forwarding
ssh -L 35471:localhost:35471 matt@YOUR_R510_IP
```

Replace `YOUR_R510_IP` with your server's IP address (e.g., `192.168.1.100`).

Now when you run `npx eas-cli login`, the browser callback will work because port 35471 is forwarded from the server to your Mac!

**Example:**
```bash
# On Mac terminal:
ssh -L 35471:localhost:35471 matt@192.168.1.100

# Once connected, on the server:
cd ~/opencode-mobile
npx eas-cli login
# Browser opens and works! ✅
```

---

### Option 3: Access Token (For Automation)

1. **On your Mac browser**, go to: https://expo.dev/settings/access-tokens

2. **Create a new token:**
   - Click "Create Token"
   - Name it: "EAS CLI Build"
   - Copy the token

3. **Set the token on your server:**
   ```bash
   export EXPO_TOKEN=your_token_here
   ```

4. **The CLI will use it automatically:**
   ```bash
   npx eas-cli whoami
   # Shows your username without login!
   ```

To make it permanent, add to `~/.bashrc`:
```bash
echo 'export EXPO_TOKEN=your_token_here' >> ~/.bashrc
source ~/.bashrc
```

---

## ✅ After Login

Verify you're logged in:

```bash
npx eas-cli whoami
```

Should show:
```
YourExpoUsername
```

Then continue with the build:

```bash
npx eas-cli build:configure
npx eas-cli build -p android --profile preview
```

---

## 🔧 Troubleshooting

### "Invalid username or password"

- Make sure you're using your **Expo username**, not email
- Check your password (it's case-sensitive)
- If you signed up with GitHub/Google, you need to set a password:
  1. Go to https://expo.dev/settings/account
  2. Click "Change Password"
  3. Set a password
  4. Try login again

### "Port already in use"

If port 35471 is already being used on your Mac:

```bash
# On Mac, kill the process
lsof -ti:35471 | xargs kill -9

# Try SSH forwarding again
ssh -L 35471:localhost:35471 matt@YOUR_SERVER_IP
```

### SSH keeps disconnecting

Add `-o ServerAliveInterval=60` to keep connection alive:

```bash
ssh -L 35471:localhost:35471 -o ServerAliveInterval=60 matt@YOUR_SERVER_IP
```

---

## 💡 Recommended Approach

**Best option:** Use **Option 1 (Manual Login)** - it's the simplest and works every time!

```bash
npx eas-cli login --username YOUR_EXPO_USERNAME
# Enter password when prompted
# Done! ✅
```

Then proceed with building:

```bash
npx eas-cli build:configure
npx eas-cli build -p android --profile preview
```

---

## 📱 Alternative: Build on Your Mac Locally

If SSH is too complicated, you can build from your Mac instead:

1. **On your Mac terminal:**
   ```bash
   git clone https://github.com/Mattjhagen/RelayAppPro.git
   cd RelayAppPro
   npm install
   ```

2. **Login works normally** (no SSH, no port forwarding):
   ```bash
   npx eas-cli login
   # Browser opens and works! ✅
   ```

3. **Build:**
   ```bash
   npx eas-cli build:configure
   npx eas-cli build -p android --profile preview
   ```

The build happens on Expo's servers anyway, so it doesn't matter if you trigger it from Mac or server!

---

Need more help? See [BUILD-APK-GUIDE.md](BUILD-APK-GUIDE.md)
