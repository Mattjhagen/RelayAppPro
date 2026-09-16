#!/bin/bash

# Generate placeholder assets using ImageMagick

set -e

echo "🎨 Generating app assets..."
echo ""

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick is not installed."
    echo "   Install with: sudo apt install imagemagick"
    exit 1
fi

cd assets

# Colors
BG_COLOR="#0f172a"
PRIMARY_COLOR="#3b82f6"
TEXT_COLOR="#ffffff"

# Generate app icon (1024x1024)
echo "Creating icon.png..."
convert -size 1024x1024 \
    xc:"$BG_COLOR" \
    -fill "$PRIMARY_COLOR" \
    -draw "roundrectangle 50,50 974,974 100,100" \
    -fill "$TEXT_COLOR" \
    -font "DejaVu-Sans-Bold" \
    -pointsize 400 \
    -gravity center \
    -annotate +0+0 "OC" \
    icon.png

# Generate adaptive icon (same as icon)
echo "Creating adaptive-icon.png..."
cp icon.png adaptive-icon.png

# Generate splash screen (1284x2778)
echo "Creating splash.png..."
convert -size 1284x2778 \
    xc:"$BG_COLOR" \
    -fill "$TEXT_COLOR" \
    -font "DejaVu-Sans-Bold" \
    -pointsize 120 \
    -gravity center \
    -annotate +0-200 "OpenCode" \
    -pointsize 60 \
    -annotate +0-80 "Mobile" \
    splash.png

# Generate favicon (48x48)
echo "Creating favicon.png..."
convert -size 48x48 \
    xc:"$BG_COLOR" \
    -fill "$PRIMARY_COLOR" \
    -draw "roundrectangle 2,2 46,46 8,8" \
    -fill "$TEXT_COLOR" \
    -font "DejaVu-Sans-Bold" \
    -pointsize 24 \
    -gravity center \
    -annotate +0+0 "OC" \
    favicon.png

echo ""
echo "✅ Assets generated successfully!"
echo ""
echo "Generated files:"
ls -lh *.png
echo ""
echo "Note: These are placeholder assets. Replace with custom designs for production."
echo ""
