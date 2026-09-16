# OpenCode Mobile - Progressive Web App (PWA)

A fully-featured Progressive Web App for OpenCode that works on any device with a modern web browser.

## 🌟 Features

- ✅ **Install as App** - Add to home screen on iOS/Android
- ✅ **Offline Support** - Works without internet (cached UI)
- ✅ **Push Notifications** - Get notified of responses (future)
- ✅ **Auto-Updates** - Always get the latest version
- ✅ **Cross-Platform** - Works on any device
- ✅ **No App Store** - Install directly from browser
- ✅ **Fast Loading** - Service worker caching
- ✅ **Native Feel** - Full-screen, app-like experience

## 🚀 Quick Start

### 1. Start the PWA Server

```bash
cd ~/opencode-mobile
./start-all-pwa.sh
```

This starts:
- Bridge server (port 7071)
- PWA server (port 8080)
- Cloudflare tunnel

### 2. Access the PWA

**Local (for testing):**
- http://localhost:8080

**Public (via Cloudflare Tunnel):**
- https://app.relayapp.pro

### 3. Install on Mobile

#### iOS (Safari):
1. Open https://app.relayapp.pro in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"

#### Android (Chrome):
1. Open https://app.relayapp.pro in Chrome
2. Tap the menu (three dots)
3. Tap "Add to Home Screen" or "Install app"
4. Tap "Install"

#### Desktop (Chrome/Edge):
1. Open https://app.relayapp.pro
2. Click the install icon in the address bar
3. Click "Install"

## 📱 PWA vs Native App

| Feature | PWA | Native App |
|---------|-----|------------|
| Installation | Direct from browser | Build & transfer APK |
| Updates | Automatic | Manual rebuild |
| Size | ~1MB | ~20-30MB |
| Platform | Any (iOS, Android, Desktop) | Android only |
| App Store | Not required | Not required |
| Offline | Partial (cached UI) | Full app available |
| Performance | Excellent | Excellent |

**Use PWA if:**
- You want instant access without building
- You need cross-platform support
- You want automatic updates

**Use Native App if:**
- You need full offline functionality
- You want deeper OS integration
- You prefer traditional app experience

## 🔧 Configuration

### DNS Setup

Configure your Cloudflare tunnel DNS:

```bash
# PWA website
cloudflared tunnel route dns c226c5ef-a3fb-4685-9a7e-c0522990693a app.relayapp.pro

# API bridge (if not already done)
cloudflared tunnel route dns c226c5ef-a3fb-4685-9a7e-c0522990693a opencode.relayapp.pro
```

### Server URL

By default, the PWA connects to `https://opencode.relayapp.pro`.

To change:
1. Open the PWA
2. Click settings (gear icon)
3. Enter your server URL
4. Click "Save Settings"

### Customization

Edit these files to customize:

**Branding:**
- `pwa/manifest.json` - App name, colors, icons
- `pwa/css/styles.css` - Theme colors, fonts

**Behavior:**
- `pwa/js/app.js` - App logic
- `pwa/service-worker.js` - Offline behavior

## 🛠️ Development

### Local Development

```bash
# Start PWA server only
./start-pwa.sh

# Start all services
./start-all-pwa.sh

# View in browser
open http://localhost:8080
```

### File Structure

```
pwa/
├── index.html           # Main HTML
├── manifest.json        # PWA manifest
├── service-worker.js    # Service worker
├── css/
│   └── styles.css       # Styles
└── js/
    ├── app.js           # App logic
    └── marked.min.js    # Markdown library
```

### Testing PWA Features

**Test Offline Mode:**
1. Open DevTools (F12)
2. Go to Application tab
3. Check "Offline" under Service Workers
4. Refresh page - should still work (cached UI)

**Test Installation:**
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Manifest" to verify manifest.json
4. Check for install prompt

**Test Service Worker:**
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Service Workers"
4. Verify worker is active

## 🔐 Security

The PWA includes:
- ✅ HTTPS via Cloudflare Tunnel
- ✅ Content Security Policy headers
- ✅ Secure local storage
- ✅ CORS configuration

**Recommended additions:**
- API key authentication
- Rate limiting
- Input sanitization

## 📊 Performance

**Lighthouse Scores (Target):**
- Performance: 90+
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- PWA: 100

**Optimization:**
- Service worker caching
- Lazy loading
- Code splitting
- Image optimization

## 🐛 Troubleshooting

### PWA won't install

**Check:**
1. Service worker is registered: DevTools → Application → Service Workers
2. Manifest is valid: DevTools → Application → Manifest
3. HTTPS is enabled (required for PWA)
4. No console errors

### Service worker not updating

```javascript
// Force update in browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(reg => reg.update());
});
```

### Offline mode not working

1. Check service worker is active
2. Verify files are cached: DevTools → Application → Cache Storage
3. Clear cache and reload

## 🚀 Deployment

### Production Checklist

- [ ] Update manifest.json with production URLs
- [ ] Configure DNS for app.relayapp.pro
- [ ] Enable HTTPS (Cloudflare provides this)
- [ ] Test on multiple devices
- [ ] Test installation flow
- [ ] Test offline functionality
- [ ] Add analytics (optional)
- [ ] Set up monitoring

### Systemd Service

Create `/etc/systemd/system/opencode-pwa.service`:

```ini
[Unit]
Description=OpenCode Mobile PWA Server
After=network.target

[Service]
Type=simple
User=matt
WorkingDirectory=/home/matt/opencode-mobile/server
ExecStart=/usr/bin/node serve-pwa.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PWA_PORT=8080

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable opencode-pwa
sudo systemctl start opencode-pwa
```

## 📱 Screenshots

Add your screenshots to:
- `assets/screenshots/` directory
- Reference in `manifest.json`

## 🎨 Customization Guide

### Change Theme Colors

Edit `pwa/css/styles.css`:

```css
:root {
    --primary-color: #3b82f6;  /* Your brand color */
    --background: #ffffff;
    /* ... */
}

[data-theme="dark"] {
    --background: #0f172a;
    /* ... */
}
```

### Change App Name

Edit `pwa/manifest.json`:

```json
{
  "name": "Your App Name",
  "short_name": "YourApp",
  "description": "Your description"
}
```

### Add Custom Features

Edit `pwa/js/app.js` to add:
- Voice input
- File uploads
- Code editor
- Custom shortcuts

## 🔄 Updates

PWA updates automatically when you:
1. Update files
2. User revisits the app
3. Service worker detects changes

**Force update for users:**
- Change CACHE_NAME in service-worker.js
- Service worker will auto-update on next visit

## 📚 Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)

## 🆘 Support

If you encounter issues:
1. Check browser console for errors
2. Verify service worker is active
3. Test on different browser/device
4. Clear cache and try again

## 🎉 Features Coming Soon

- [ ] Voice input/output
- [ ] File upload support
- [ ] Code editor integration
- [ ] Push notifications
- [ ] Background sync
- [ ] Share target integration
- [ ] Keyboard shortcuts
- [ ] Multiple themes

---

Built with ❤️ for OpenCode Mobile
