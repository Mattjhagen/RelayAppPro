#!/bin/bash

# Build and deploy OpenCode Mobile

set -e

echo "🚀 OpenCode Mobile - Build & Deploy"
echo ""

# Check prerequisites
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install npm first."
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo "✅ npm: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi
echo ""

# Generate assets if they don't exist
if [ ! -f "assets/icon.png" ]; then
    echo "🎨 Assets not found. Generating placeholders..."
    if command -v convert &> /dev/null; then
        ./generate-assets.sh
    else
        echo "⚠️  ImageMagick not installed. Please generate assets manually."
        echo "   See assets/README.md for instructions."
        echo ""
        echo "For now, creating basic placeholder files..."
        mkdir -p assets
        # Create minimal 1x1 pixel placeholders
        echo "Creating basic placeholders (replace these with real assets)..."
        convert -size 1024x1024 xc:#3b82f6 assets/icon.png 2>/dev/null || touch assets/icon.png
        cp assets/icon.png assets/adaptive-icon.png 2>/dev/null || touch assets/adaptive-icon.png
        convert -size 1284x2778 xc:#0f172a assets/splash.png 2>/dev/null || touch assets/splash.png
        convert -size 48x48 xc:#3b82f6 assets/favicon.png 2>/dev/null || touch assets/favicon.png
    fi
fi
echo ""

# Build options
echo "Select build option:"
echo "  1) Development build (Expo Go)"
echo "  2) Preview APK build (standalone)"
echo "  3) Production build"
echo ""
read -p "Enter option (1-3): " BUILD_OPTION

case $BUILD_OPTION in
    1)
        echo ""
        echo "Starting Expo development server..."
        echo "Scan the QR code with Expo Go app on your phone."
        echo ""
        npx expo start
        ;;
    2)
        echo ""
        echo "Building preview APK..."
        echo ""

        # Check if EAS CLI is installed
        if ! command -v eas &> /dev/null; then
            echo "Installing EAS CLI..."
            npm install -g eas-cli
        fi

        # Check if logged in
        if ! eas whoami &> /dev/null; then
            echo "Please login to Expo:"
            eas login
        fi

        # Initialize if needed
        if [ ! -f ".easrc" ] && [ ! -d ".eas" ]; then
            echo "Initializing EAS project..."
            eas init
        fi

        echo "Starting APK build..."
        eas build -p android --profile preview

        echo ""
        echo "✅ Build started!"
        echo "   Check build progress at: https://expo.dev"
        echo "   Download the APK once complete and install on your device."
        ;;
    3)
        echo ""
        echo "Building production release..."

        # Check if EAS CLI is installed
        if ! command -v eas &> /dev/null; then
            echo "Installing EAS CLI..."
            npm install -g eas-cli
        fi

        # Check if logged in
        if ! eas whoami &> /dev/null; then
            echo "Please login to Expo:"
            eas login
        fi

        echo "Starting production build..."
        eas build -p android --profile production

        echo ""
        echo "✅ Build started!"
        echo "   This will create an AAB file for Google Play Store."
        ;;
    *)
        echo "Invalid option"
        exit 1
        ;;
esac
