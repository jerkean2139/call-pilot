#!/bin/bash
# Generate PWA icons from a source SVG/PNG
# Usage: ./generate-icons.sh source.png
# For now, create placeholder SVG icons

for size in 72 96 128 144 152 192 384 512; do
cat > "icon-${size}x${size}.svg" << EOF
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size/8}" fill="#f83b3b"/>
  <text x="50%" y="55%" text-anchor="middle" fill="white" font-family="sans-serif" font-size="${size/4}" font-weight="bold" dominant-baseline="middle">LL</text>
</svg>
EOF
done

echo "Icons generated. Convert to PNG with: for f in *.svg; do convert \$f \${f%.svg}.png; done"
