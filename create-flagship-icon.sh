#!/bin/bash

# Create a truly beautiful flagship AI app icon
# Combining the best of: Claude, Gemini, ChatGPT, and Grok

set -e

echo "✨ Creating flagship-quality app icon..."
echo ""

cd assets

SIZE=1024
CENTER=$((SIZE / 2))

# Step 1: Create multi-color gradient background (Gemini-inspired with ChatGPT green and Claude orange)
convert -size ${SIZE}x${SIZE} \
    radial-gradient:"#10A37F-#8B5CF6" \
    \( -size ${SIZE}x${SIZE} radial-gradient:"#FF6B35-#8B5CF6" \) \
    -compose blend -define compose:args=50 -composite \
    -swirl 30 \
    base.png

# Step 2: Create beautiful sparkle effect (Gemini-style)
# Main sparkle in center
convert -size ${SIZE}x${SIZE} xc:none \
    -stroke none \
    -fill "rgba(255,255,255,0.9)" \
    -draw "translate $CENTER,$CENTER path 'M 0,-300 L 30,-80 L 200,-80 L 60,30 L 100,220 L 0,90 L -100,220 L -60,30 L -200,-80 L -30,-80 Z'" \
    -blur 0x3 \
    sparkle_main.png

# Secondary smaller sparkles
convert -size ${SIZE}x${SIZE} xc:none \
    -stroke none \
    -fill "rgba(255,255,255,0.7)" \
    -draw "translate $CENTER,$CENTER rotate 30 path 'M 0,-180 L 20,-50 L 120,-50 L 40,20 L 60,130 L 0,60 L -60,130 L -40,20 L -120,-50 L -20,-50 Z'" \
    -blur 0x2 \
    sparkle_2.png

convert -size ${SIZE}x${SIZE} xc:none \
    -stroke none \
    -fill "rgba(255,255,255,0.6)" \
    -draw "translate $CENTER,$CENTER rotate -30 path 'M 0,-220 L 25,-60 L 150,-60 L 50,25 L 80,180 L 0,70 L -80,180 L -50,25 L -150,-60 L -25,-60 Z'" \
    -blur 0x2 \
    sparkle_3.png

# Step 3: Add glowing orbs (modern Grok-style)
convert -size ${SIZE}x${SIZE} xc:none \
    -fill "rgba(255,255,255,0.15)" \
    -draw "circle $CENTER,$CENTER $CENTER,312" \
    -blur 0x20 \
    glow_outer.png

convert -size ${SIZE}x${SIZE} xc:none \
    -fill "rgba(255,255,255,0.25)" \
    -draw "circle $CENTER,$CENTER $CENTER,412" \
    -blur 0x15 \
    glow_mid.png

convert -size ${SIZE}x${SIZE} xc:none \
    -fill "rgba(255,255,255,0.4)" \
    -draw "circle $CENTER,$CENTER $CENTER,462" \
    -blur 0x10 \
    glow_inner.png

# Step 4: Compose all layers
convert base.png \
    glow_outer.png -compose plus -composite \
    glow_mid.png -compose plus -composite \
    glow_inner.png -compose plus -composite \
    sparkle_main.png -compose plus -composite \
    sparkle_2.png -compose plus -composite \
    sparkle_3.png -compose plus -composite \
    composed.png

# Step 5: Add depth and 3D effect
convert composed.png \
    \( +clone -alpha extract -blur 0x8 -shade 135x30 -normalize \
       -blur 0x2 -contrast-stretch 0 \) \
    \( -clone 0 -clone 1 -compose hardlight -composite \) \
    -delete 0,1 \
    depth.png

# Step 6: Add subtle border and final polish
convert depth.png \
    -alpha set -virtual-pixel transparent \
    -channel A -blur 0x0.5 -level 50%,100% +channel \
    polished.png

# Step 7: Create rounded square with shadow (modern app style)
convert polished.png \
    \( +clone -alpha extract -draw 'fill black polygon 0,0 0,1024 1024,1024 1024,0' \
       \( +clone -blur 0x50 -level 50%,100% \) \
       -alpha off -compose copy_opacity -composite \
    \) -compose in -composite \
    -background none \
    icon.png

# Make adaptive icon slightly more vibrant
convert icon.png \
    -modulate 105,115,100 \
    -brightness-contrast 5x10 \
    adaptive-icon.png

# Create beautiful splash screen
convert -size 1284x2778 \
    -define gradient:angle=135 \
    gradient:"#0f172a-#1e293b-#334155" \
    \( icon.png -resize 420x420 -shadow 80x8+0+20 \) -gravity center -geometry +0-100 -composite \
    \( icon.png -resize 420x420 \) -gravity center -geometry +0-100 -composite \
    -font "DejaVu-Sans-Bold" \
    -fill white \
    -pointsize 90 \
    -gravity center \
    -annotate +0+350 "OpenCode" \
    -pointsize 45 \
    -fill '#94a3b8' \
    -annotate +0+450 "AI-Powered Coding Assistant" \
    splash.png

# Create hi-res favicon
convert icon.png \
    -resize 192x192 \
    -quality 100 \
    favicon-192.png

convert icon.png \
    -resize 48x48 \
    -quality 100 \
    favicon.png

# Cleanup
rm -f base.png sparkle_*.png glow_*.png composed.png depth.png polished.png

echo ""
echo "✅ Flagship-quality icon created!"
echo ""
echo "📱 Generated files:"
ls -lh icon.png adaptive-icon.png splash.png favicon.png favicon-192.png 2>/dev/null | grep -E '\.(png)$'
echo ""
echo "🎨 Design Features:"
echo "   ✨ Multi-color gradient (Claude orange + ChatGPT green + Gemini purple)"
echo "   ⭐ Triple-layered sparkle effect (Gemini style)"
echo "   💫 Glowing center orb (modern and clean)"
echo "   🎯 3D depth and shadows (premium quality)"
echo "   🌈 Professional polish and rounded corners"
echo ""
echo "This icon combines the best visual elements from all flagship AI apps!"
echo ""
