#!/bin/bash

# Create a truly premium flagship AI app icon
# Properly combining visual elements from Claude, Gemini, ChatGPT, and Grok

set -e

echo "✨ Creating premium flagship app icon..."
echo ""

cd assets

SIZE=1024

# Clean slate
rm -f *.png

# Step 1: Create vibrant gradient background
# Purple-blue (Gemini) blended with orange-green (Claude + ChatGPT)
convert -size ${SIZE}x${SIZE} \
    gradient:'#FF6B35-#F72585' \
    gradient:'#4361EE-#7209B7' -compose blend -define compose:args=50 -composite \
    -distort SRT "0,0 1,1 0" \
    bg_gradient.png

# Add radial overlay for depth
convert -size ${SIZE}x${SIZE} \
    radial-gradient:'rgba(255,255,255,0.4)-rgba(255,255,255,0)' \
    radial_overlay.png

convert bg_gradient.png radial_overlay.png -composite base.png

# Step 2: Create central geometric shape (like Gemini's diamond/sparkle)
# Create a stylized 'O' for OpenCode with sparkle points
convert -size ${SIZE}x${SIZE} xc:none \
    -fill white \
    -stroke white -strokewidth 40 \
    -draw "circle 512,512 512,712" \
    -stroke none \
    -fill black \
    -draw "circle 512,512 512,612" \
    ring_base.png

# Add sparkle points around the ring
convert ring_base.png \
    -fill white -stroke none \
    -draw "path 'M 512,212 L 532,292 L 612,292 L 552,342 L 572,422 L 512,372 L 452,422 L 472,342 L 412,292 L 492,292 Z'" \
    -draw "path 'M 812,512 L 732,532 L 732,612 L 682,552 L 602,572 L 652,512 L 602,452 L 682,472 L 732,412 L 732,492 Z'" \
    -draw "path 'M 512,812 L 492,732 L 412,732 L 472,682 L 452,602 L 512,652 L 572,602 L 552,682 L 612,732 L 532,732 Z'" \
    -draw "path 'M 212,512 L 292,492 L 292,412 L 342,472 L 422,452 L 372,512 L 422,572 L 342,552 L 292,612 L 292,532 Z'" \
    ring_with_sparkles.png

# Add glow effect
convert ring_with_sparkles.png \
    \( +clone -channel A -blur 0x20 \) \
    -compose DstOver -composite \
    ring_glow.png

# Step 3: Add subtle particle effects (like Gemini)
convert -size ${SIZE}x${SIZE} xc:none \
    -fill white -stroke none \
    -draw "circle 350,300 350,310" \
    -draw "circle 720,280 720,285" \
    -draw "circle 300,650 300,308" \
    -draw "circle 750,720 750,726" \
    -draw "circle 200,450 200,456" \
    -draw "circle 850,580 850,586" \
    \( +clone -channel A -blur 0x5 \) \
    -compose Over -composite \
    particles.png

# Step 4: Compose everything
convert base.png \
    ring_glow.png -compose Over -composite \
    particles.png -compose Over -composite \
    -alpha set \
    composed.png

# Step 5: Add professional lighting and depth
convert composed.png \
    \( +clone -alpha extract -blur 0x12 -shade 120x45 -alpha on -channel RGB -evaluate multiply 0.5 +channel \) \
    -compose HardLight -composite \
    lit.png

# Step 6: Add subtle vignette for polish
convert -size ${SIZE}x${SIZE} \
    radial-gradient:'rgba(0,0,0,0)-rgba(0,0,0,0.3)' \
    vignette.png

convert lit.png vignette.png -compose Multiply -composite final_flat.png

# Step 7: Round the corners (modern app style)
convert final_flat.png \
    -alpha set \
    \( +clone -alpha extract \
       -draw 'fill black polygon 0,0 0,15 15,0 fill white circle 15,15 15,0' \
       \( +clone -flip \) -compose Multiply -composite \
       \( +clone -flop \) -compose Multiply -composite \
    \) -alpha off -compose CopyOpacity -composite \
    -quality 100 \
    icon.png

# Create enhanced adaptive icon
convert icon.png \
    -modulate 108,120,100 \
    -contrast-stretch 1%x1% \
    -quality 100 \
    adaptive-icon.png

# Create splash screen with icon
convert -size 1284x2778 \
    gradient:'#0a0e27-#1a1f3a-#2a2f4a' \
    \( icon.png -resize 480x480 \
       \( +clone -background black -shadow 100x20+0+20 \) \
       +swap -background none -layers merge +repage \
    \) -gravity center -geometry +0-150 -composite \
    -font "DejaVu-Sans-Bold" \
    -fill white \
    -pointsize 110 \
    -kerning 3 \
    -gravity center \
    -annotate +0+420 "OpenCode" \
    -pointsize 50 \
    -fill '#8B92B0' \
    -annotate +0+540 "AI-Powered Coding Assistant" \
    -quality 95 \
    splash.png

# Create favicons
convert icon.png -resize 192x192 -quality 100 favicon-192.png
convert icon.png -resize 48x48 -quality 100 favicon.png

# Cleanup
rm -f bg_gradient.png radial_overlay.png base.png ring_base.png ring_with_sparkles.png \
      ring_glow.png particles.png composed.png lit.png vignette.png final_flat.png

echo ""
echo "✅ Premium flagship icon created successfully!"
echo ""
echo "📱 Generated Assets:"
ls -lh *.png
echo ""
echo "🎨 Design Features:"
echo "   ✨ Vibrant gradient (Orange, Pink, Purple, Blue)"
echo "   ⭐ Central 'O' ring with sparkle points (Gemini-inspired)"
echo "   💫 Particle effects for depth"
echo "   🎯 Professional lighting and shadows"
echo "   🌈 Modern rounded corners and vignette"
echo "   💎 High-quality PNG output"
echo ""
echo "This icon will look stunning on any device!"
echo ""
