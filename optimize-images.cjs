// optimize-images.cjs
// Run with: node optimize-images.cjs
// This script recursively compresses and converts images in public/ to WebP format using sharp.

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const publicDir = path.join(__dirname, 'public');
const MIN_SIZE_TO_OPTIMIZE = 50 * 1024; // 50KB

function isImage(file) {
  // Ignore already optimized webp if they are small, but process heavy ones
  if (file.toLowerCase().includes('logo')) return false;
  return /\.(jpe?g|png|webp)$/i.test(file);
}

async function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      await walkDir(filePath);
    } else if (isImage(file)) {
      if (stat.size > MIN_SIZE_TO_OPTIMIZE) {
        await optimizeImage(filePath);
      }
    }
  }
}

async function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const base = filePath.substring(0, filePath.lastIndexOf(ext));
  
  // Always output to a temporary path first if it's already webp
  const tempPath = base + '.temp.webp';
  const finalWebpPath = base + '.webp';
  
  try {
    const metadata = await sharp(filePath).metadata();
    
    // Skip if it's already reasonably small and reasonable width
    if (metadata.width <= 1920 && metadata.format === 'webp' && fs.statSync(filePath).size < MIN_SIZE_TO_OPTIMIZE * 2) {
      return;
    }

    await sharp(filePath)
      .resize({ 
        width: 1920, 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ 
        quality: 70, // Slightly lower for better compression
        effort: 6,
        lossless: false,
        smartSubsampling: true
      })
      .toFile(tempPath);
    
    const oldSize = fs.statSync(filePath).size;
    const newSize = fs.statSync(tempPath).size;

    if (newSize < oldSize) {
      if (filePath !== finalWebpPath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      if (fs.existsSync(finalWebpPath) && tempPath !== finalWebpPath) {
        fs.unlinkSync(finalWebpPath);
      }
      fs.renameSync(tempPath, finalWebpPath);
      console.log(`✅ Optimized: ${path.relative(publicDir, finalWebpPath)} (${(oldSize/1024).toFixed(1)}KB -> ${(newSize/1024).toFixed(1)}KB)`);
    } else {
      fs.unlinkSync(tempPath);
      console.log(`ℹ️ Skipped (already optimal): ${path.relative(publicDir, filePath)}`);
    }
  } catch (err) {
    console.error(`❌ Error optimizing ${filePath}:`, err.message);
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
}

console.log('🚀 Starting Recursive Image Optimization...');
walkDir(publicDir).then(() => {
  console.log('✨ Optimization Complete!');
}).catch(console.error);
