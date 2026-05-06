// Generate Chrome extension icons using Node.js
// Run: node generate-icons.js

const fs = require('fs');
const path = require('path');

const sizes = [16, 48, 128];
const outDir = path.join(__dirname, 'icons');

// SVG template - a simple "AI" badge with sparkle
function generateSVG(size) {
  const padding = Math.max(2, Math.floor(size * 0.12));
  const inner = size - padding * 2;
  const r = Math.floor(inner * 0.2);
  const fontSize = Math.floor(size * 0.45);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6c5ce7"/>
      <stop offset="100%" style="stop-color:#a29bfe"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${r}" fill="url(#bg)"/>
  <text x="${size/2}" y="${size/2 + fontSize*0.35}"
        font-family="Arial, sans-serif" font-size="${fontSize}"
        font-weight="bold" fill="white" text-anchor="middle">AI</text>
</svg>`;
}

// Generate PNG from SVG using a simple approach
// Since we can't easily convert SVG to PNG in pure Node without canvas,
// let's write a script that creates PNG files
function createMinimalPNG(size) {
  // Create a minimal valid PNG file with the gradient color
  // We'll use a simple approach - write the SVG and use a batch conversion
  const svg = generateSVG(size);
  const svgPath = path.join(outDir, `icon${size}.svg`);
  fs.writeFileSync(svgPath, svg);
  return svg;
}

// Main
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('Generating icons...');
sizes.forEach(size => {
  createMinimalPNG(size);
  console.log(`  ✓ icon${size}.svg generated`);
});

// Also create a PNG version using base64 inline SVG data URIs won't work for Chrome extensions
// Instead, let's write a comprehensive HTML file that can be used to generate the PNGs
const htmlContent = `<!DOCTYPE html>
<html>
<head><title>Generate Icons</title></head>
<body>
<h1>Icon Generator</h1>
<p>Open each SVG in browser and take a screenshot, or use a tool like <a href="https://convertio.co/svg-png/">convertio.co</a></p>
<p>Or right-click each image and "Save as PNG":</p>
${sizes.map(s => `<div><h3>${s}x${s}</h3><img src="icon${s}.svg" width="${s}" height="${s}"></div>`).join('')}
<script>
// Alternative: Use canvas to convert
sizes.forEach(s => {
  const canvas = document.createElement('canvas');
  canvas.width = s; canvas.height = s;
  const ctx = canvas.getContext('2d');
  // Draw gradient background
  const grad = ctx.createLinearGradient(0, 0, s, s);
  grad.addColorStop(0, '#6c5ce7');
  grad.addColorStop(1, '#a29bfe');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(0, 0, s, s, s*0.2);
  ctx.fill();
  // Draw text
  ctx.fillStyle = 'white';
  ctx.font = 'bold ' + (s*0.45) + 'px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('AI', s/2, s/2);
  // Download
  canvas.toBlob(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'icon' + s + '.png';
    a.click();
  });
});
</script>
</body>
</html>`;

fs.writeFileSync(path.join(outDir, 'generate.html'), htmlContent);
console.log('  ✓ generate.html created (open in browser to export PNGs)');

// Also let's try using a simple Node.js approach with native tools
// Create a simple script to generate icons using Node.js built-in capabilities
console.log('\nDone! The SVG icons are ready in the icons/ directory.');
console.log('To convert to PNG:');
console.log('  1. Open icons/generate.html in a browser');
console.log('  2. The page will auto-download PNG files');
console.log('  OR use: https://convertio.co/svg-png/');
