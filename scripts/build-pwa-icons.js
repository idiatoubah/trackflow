const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function buildIcons() {
  const inputSvg = path.join(__dirname, '../public/icons/icon.svg');
  const iconsDir = path.join(__dirname, '../public/icons');

  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // 1. icon-192.png
  await sharp(inputSvg)
    .resize(192, 192)
    .png()
    .toFile(path.join(iconsDir, 'icon-192.png'));

  // 2. icon-512.png
  await sharp(inputSvg)
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'icon-512.png'));

  // 3. icon-maskable-512.png
  await sharp(inputSvg)
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'icon-maskable-512.png'));

  // 4. apple-icon.png (180x180)
  await sharp(inputSvg)
    .resize(180, 180)
    .png()
    .toFile(path.join(iconsDir, 'apple-icon.png'));

  // 5. favicon.ico / favicon.png
  await sharp(inputSvg)
    .resize(64, 64)
    .png()
    .toFile(path.join(__dirname, '../public/favicon.png'));

  console.log('✅ Toutes les icônes PWA ont été générées avec succès !');
}

buildIcons().catch((err) => {
  console.error('Erreur génération icônes:', err);
  process.exit(1);
});
