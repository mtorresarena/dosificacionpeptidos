const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = path.join(__dirname, '../public/logo-qspain.jpg');
const outputDir = path.join(__dirname, '../public');

async function generateFavicons() {
  try {
    // Favicon 32x32
    await sharp(inputPath)
      .resize(32, 32)
      .png()
      .toFile(path.join(outputDir, 'favicon-32x32.png'));
    console.log('Created favicon-32x32.png');

    // Favicon 16x16
    await sharp(inputPath)
      .resize(16, 16)
      .png()
      .toFile(path.join(outputDir, 'favicon-16x16.png'));
    console.log('Created favicon-16x16.png');

    // Apple touch icon 180x180
    await sharp(inputPath)
      .resize(180, 180)
      .png()
      .toFile(path.join(outputDir, 'apple-touch-icon.png'));
    console.log('Created apple-touch-icon.png');

    // Android chrome 192x192
    await sharp(inputPath)
      .resize(192, 192)
      .png()
      .toFile(path.join(outputDir, 'android-chrome-192x192.png'));
    console.log('Created android-chrome-192x192.png');

    // Android chrome 512x512
    await sharp(inputPath)
      .resize(512, 512)
      .png()
      .toFile(path.join(outputDir, 'android-chrome-512x512.png'));
    console.log('Created android-chrome-512x512.png');

    // Favicon ICO (usando el 32x32 como base)
    await sharp(inputPath)
      .resize(32, 32)
      .toFile(path.join(outputDir, 'favicon.ico'));
    console.log('Created favicon.ico');

    console.log('All favicons generated successfully!');
  } catch (error) {
    console.error('Error generating favicons:', error);
  }
}

generateFavicons();
