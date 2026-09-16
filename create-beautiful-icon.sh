#!/bin/bash

# Create a beautiful app icon combining elements from flagship AI apps
# Inspired by: Claude (gradient), Gemini (sparkle), ChatGPT (clean), Grok (bold)

set -e

echo "🎨 Creating beautiful app icon..."
echo ""

cd assets

# Icon size
SIZE=1024

# Create base gradient background (purple-blue like Gemini with orange like Claude)
convert -size ${SIZE}x${SIZE} \
    radial-gradient:'#8B5CF6-#3B82F6' \
    -swirl 20 \
    base_gradient.png

# Create a sparkle/star effect (inspired by Gemini)
convert -size ${SIZE}x${SIZE} xc:none \
    -fill white \
    -draw "translate 512,512 rotate 0 polygon 0,-250 25,-75 200,-75 50,25 100,200 0,75 -100,200 -50,25 -200,-75 -25,-75" \
    -gaussian-blur 0x4 \
    star1.png

convert -size ${SIZE}x${SIZE} xc:none \
    -fill white \
    -draw "translate 512,512 rotate 45 polygon 0,-200 20,-60 160,-60 40,20 80,160 0,60 -80,160 -40,20 -160,-60 -20,-60" \
    -gaussian-blur 0x3 \
    star2.png

# Create center circle (clean like ChatGPT)
convert -size ${SIZE}x${SIZE} xc:none \
    -fill white \
    -draw "circle 512,512 512,200" \
    -gaussian-blur 0x2 \
    center_glow.png

# Combine all layers
convert base_gradient.png \
    \( star1.png -modulate 100,100,50 \) -compose lighten -composite \
    \( star2.png -modulate 100,100,50 \) -compose lighten -composite \
    \( center_glow.png -channel A -evaluate multiply 0.3 +channel \) -compose over -composite \
    -quality 100 \
    temp_icon.png

# Add subtle 3D effect and polish
convert temp_icon.png \
    \( +clone -alpha extract -blur 0x10 -shade 110x30 -normalize -sigmoidal-contrast 8,50% \
       +clone -compose multiply -composite \) \
    -compose copy_opacity -composite \
    -background none -flatten \
    icon_processed.png

# Create final icon with rounded corners and shadow
convert icon_processed.png \
    \( +clone -alpha extract \
       -draw 'fill black polygon 0,0 0,1024 1024,1024 1024,0' \
       \( +clone -blur 0x65 -level 50%,100% \) \
       -compose copy_opacity -composite \
    \) -compose in -composite \
    -background none -flatten \
    icon.png

# Create adaptive icon (more vibrant)
convert icon.png \
    -modulate 105,110,100 \
    adaptive-icon.png

# Create splash screen with icon in center
convert -size 1284x2778 \
    radial-gradient:'#0f172a-#1e293b' \
    \( icon.png -resize 400x400 \) -gravity center -composite \
    -font "DejaVu-Sans-Bold" \
    -fill white \
    -pointsize 80 \
    -gravity south \
    -annotate +0+300 "OpenCode" \
    -pointsize 40 \
    -fill '#94a3b8' \
    -annotate +0+200 "Mobile" \
    splash.png

# Create favicon
convert icon.png -resize 48x48 favicon.png

# Cleanup temp files
rm -f base_gradient.png star1.png star2.png center_glow.png temp_icon.png icon_processed.png

echo ""
echo "✅ Beautiful icon created successfully!"
echo ""
echo "Generated files:"
ls -lh icon.png adaptive-icon.png splash.png favicon.png
echo ""
echo "Icon features:"
echo "  ✨ Gradient background (Claude + Gemini inspired)"
echo "  ⭐ Sparkle effects (Gemini inspired)"
echo "  🎯 Clean center design (ChatGPT inspired)"
echo "  💫 Modern bold aesthetic (Grok inspired)"
echo ""
