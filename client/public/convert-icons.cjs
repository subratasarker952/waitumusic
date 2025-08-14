const fs = require('fs');
const sharp = require('sharp');

// Convert SVG icons to PNG
async function convertIcons() {
  try {
    // Convert 192x192 icon
    await sharp('icon-192x192.svg')
      .png()
      .resize(192, 192)
      .toFile('icon-192x192.png');
    console.log('✅ Created icon-192x192.png');

    // Convert 512x512 icon
    await sharp('icon-512x512.svg')
      .png()
      .resize(512, 512)
      .toFile('icon-512x512.png');
    console.log('✅ Created icon-512x512.png');

  } catch (error) {
    console.error('Error converting icons:', error);
  }
}

convertIcons();
