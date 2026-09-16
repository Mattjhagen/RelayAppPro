# 📱 Complete APK Build Guide for OpenCode Mobile

Step-by-step instructions to build your Android APK.

---

## ✅ Prerequisites (Already Done)

- ✅ Node.js v20.20.2 installed
- ✅ npm 10.8.2 installed  
- ✅ Project dependencies installed
- ✅ You're in `/home/matt/opencode-mobile`

---

## 🚀 Step-by-Step Build Process

### Step 1: Create Expo Account (5 minutes)

1. **Go to:** https://expo.dev/signup

2. **Choose one:**
   - Sign up with email
   - Sign up with GitHub (recommended - fastest)
   - Sign up with Google

3. **Verify your email** if you used email signup

4. **Remember your username!** You'll need it for the CLI

---

### Step 2: Login to EAS CLI (2 minutes)

Open your terminal in the project directory:

```bash
cd ~/opencode-mobile
```

Login to Expo:

```bash
npx eas-cli login
```

You'll be prompted:
```
Email or username: [enter your Expo username/email]
Password: [enter your password]
```

You should see:
```
✔ Logged in as YourUsername
```

---

### Step 3: Configure Your Project (3 minutes)

Initialize EAS Build:

```bash
npx eas-cli build:configure
```

**Questions you'll be asked:**

1. **"Select a platform"**
   - Choose: `Android`

2. **"Would you like to set up an Android app now?"**
   - Choose: `Yes`

3. **"Generate a new Android package name?"**
   - Choose: `Yes` (or enter your own like `com.yourname.opencode`)

This creates/updates `eas.json` and `app.json` with your Android config.

---

### Step 4: Build the APK! (15-20 minutes)

Now build your APK:

```bash
npx eas-cli build -p android --profile preview
```

**What happens:**

1. **Uploads your code** to Expo servers (30 seconds)
2. **Queues your build** (1-5 minutes wait)
3. **Builds the APK** (10-15 minutes)
4. **Gives you a download link**

You'll see output like:
```
✔ Build started
✔ Build queued
✔ Build in progress...
✔ Build finished!

Download: https://expo.dev/artifacts/eas/xxxxx.apk
```

**IMPORTANT:** Keep the terminal open or save that download link!

---

### Step 5: Download Your APK (1 minute)

Once the build completes:

1. **Copy the download URL** from the terminal
2. **Open in browser** to download the APK
3. **OR use wget:**
   ```bash
   wget -O opencode-mobile.apk "https://expo.dev/artifacts/eas/YOUR_BUILD_ID.apk"
   ```

File size should be about 50-70 MB.

---

### Step 6: Install on Your Android Device

#### Method A: USB Transfer

1. **Connect phone** to your computer via USB
2. **Enable File Transfer** mode on phone
3. **Copy APK** to your phone's Downloads folder
4. **On phone:** Open "Files" app → Downloads
5. **Tap the APK** → Allow installation from this source → Install

#### Method B: Direct Download

1. **Upload APK** to Google Drive, Dropbox, or your website
2. **Open link** on your phone
3. **Download and install**

#### Method C: QR Code (if on local network)

```bash
# Serve the APK
cd ~/opencode-mobile
python3 -m http.server 8000
```

Then on phone, visit: `http://YOUR_SERVER_IP:8000/opencode-mobile.apk`

---

## 🎯 Quick Command Reference

```bash
# Full build process (copy/paste these one at a time)
cd ~/opencode-mobile

# 1. Login
npx eas-cli login

# 2. Configure (first time only)
npx eas-cli build:configure

# 3. Build APK
npx eas-cli build -p android --profile preview

# 4. Check build status (if you closed terminal)
npx eas-cli build:list

# 5. Download completed build
# (Use the URL from build output)
```

---

## 🔧 Troubleshooting

### "Not logged in"

```bash
npx eas-cli whoami
# If not logged in:
npx eas-cli login
```

### "Project not configured"

```bash
npx eas-cli build:configure
```

### "Build failed"

Check the build logs on https://expo.dev/accounts/[your-username]/projects/opencode-mobile/builds

Common issues:
- Missing dependencies: Run `npm install` again
- Invalid app.json: Check JSON syntax
- Expo account issues: Re-login with `npx eas-cli logout` then `npx eas-cli login`

### "Can't install APK on phone"

1. Go to **Settings → Security**
2. Enable **"Install from Unknown Sources"** or **"Install Unknown Apps"**
3. Allow your file manager/browser to install apps
4. Try installing again

### Build takes forever

- First build: 15-20 minutes is normal
- Subsequent builds: 5-10 minutes (cached)
- Free tier: May queue longer during busy times

---

## 💡 Pro Tips

### Faster Development

Instead of building APK every time, use Expo Go for instant testing:

```bash
npx expo start
```

Then:
1. Install "Expo Go" from Play Store
2. Scan the QR code
3. App opens instantly!
4. Changes reload automatically!

### Check Your Builds

View all your builds:
```bash
npx eas-cli build:list
```

Or visit: https://expo.dev

### Build Both Profiles

- **Preview (APK):** For testing and sharing
  ```bash
  npx eas-cli build -p android --profile preview
  ```

- **Production (AAB):** For Google Play Store
  ```bash
  npx eas-cli build -p android --profile production
  ```

---

## 📊 What Each Profile Does

| Profile | Output | Size | Use Case |
|---------|--------|------|----------|
| preview | APK | ~60MB | Testing, sharing, sideloading |
| production | AAB | ~40MB | Google Play Store submission |
| development | APK | ~80MB | Development with Expo tools |

---

## 🎉 After Your First Build

Once you have the APK:

1. **Install on your phone**
2. **Test all features:**
   - ✅ Chat interface works
   - ✅ Settings save
   - ✅ Model selection works
   - ✅ Server connection works
   - ✅ Dark/light themes
   - ✅ Copy message functionality

3. **Share with others!**
   - Upload to Google Drive
   - Send via email
   - Share download link

4. **Publish (optional):**
   - Build production AAB
   - Create Google Play Console account
   - Upload and publish

---

## 🆘 Need Help?

1. **Expo Docs:** https://docs.expo.dev/build/setup/
2. **EAS Build:** https://docs.expo.dev/build/introduction/
3. **GitHub Issues:** https://github.com/Mattjhagen/RelayAppPro/issues

---

## 📱 Expected Results

After successful build:

- **File:** `opencode-mobile.apk` (50-70 MB)
- **Time:** 15-20 minutes (first build)
- **Cost:** FREE (EAS free tier: 30 builds/month)

Install on Android 8.0+ devices.

---

## ✨ Alternative: Use Build Script

We created an automated script:

```bash
cd ~/opencode-mobile
./build-and-deploy.sh
```

Select option 2 (Preview APK build) and follow prompts!

---

**Happy Building! 🚀**

Questions? Check the main [README.md](README.md) or [QUICKSTART.md](QUICKSTART.md)
