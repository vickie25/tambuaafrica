// Upload all images from public/images to Supabase Storage
// Run this after completing the database reset

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Storage buckets
const BUCKETS = {
  safaris: 'safaris',
  destinations: 'destinations',
  blogs: 'blogs',
  carousel: 'carousel-images'
};

async function uploadFile(bucket, filePath, storagePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .upload(storagePath || fileName, fileBuffer, {
        contentType: 'image/webp',
        upsert: true
      });

    if (error) {
      console.error(`Error uploading ${fileName}:`, error);
      return null;
    }

    const { data: { publicUrl } } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(storagePath || fileName);

    console.log(`✅ Uploaded: ${fileName} -> ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return null;
  }
}

async function uploadAllImages() {
  console.log('Starting image upload to Supabase Storage...');

  // Find all images in public/images
  const imageFiles = await glob('public/images/**/*.{webp,jpg,jpeg,png}', {
    cwd: path.join(__dirname, '..')
  });

  console.log(`Found ${imageFiles.length} images to upload`);

  // Determine bucket based on folder structure
  const uploads = [];

  for (const file of imageFiles) {
    const fullPath = path.join(__dirname, '..', file);
    const relativePath = file.replace('public/images/', '');
    
    // Determine bucket based on path
    let bucket = 'safaris'; // default
    let storagePath = relativePath;

    if (relativePath.startsWith('destiations/')) {
      bucket = 'destinations';
      storagePath = relativePath.replace('destiations/', '');
    } else if (relativePath.startsWith('blogs/')) {
      bucket = 'blogs';
      storagePath = relativePath.replace('blogs/', '');
    } else if (relativePath.startsWith('carousel/')) {
      bucket = 'carousel';
      storagePath = relativePath.replace('carousel/', '');
    }

    uploads.push(uploadFile(bucket, fullPath, storagePath));
  }

  // Upload all images
  const results = await Promise.all(uploads);
  const successful = results.filter(r => r !== null);

  console.log(`\n✅ Successfully uploaded ${successful.length}/${imageFiles.length} images`);

  // Generate mapping file for updating data files
  const mapping = {};
  for (const file of imageFiles) {
    const relativePath = file.replace('public/', '/');
    const storagePath = file.replace('public/images/', '');
    
    let bucket = 'safaris';
    if (storagePath.startsWith('destiations/')) {
      bucket = 'destinations';
      storagePath = storagePath.replace('destiations/', '');
    } else if (storagePath.startsWith('blogs/')) {
      bucket = 'blogs';
      storagePath = storagePath.replace('blogs/', '');
    } else if (storagePath.startsWith('carousel/')) {
      bucket = 'carousel';
      storagePath = storagePath.replace('carousel/', '');
    }

    const { data: { publicUrl } } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(storagePath);

    mapping[relativePath] = publicUrl;
  }

  // Save mapping to file
  fs.writeFileSync(
    path.join(__dirname, 'image-url-mapping.json'),
    JSON.stringify(mapping, null, 2)
  );

  console.log('💾 Saved image URL mapping to scripts/image-url-mapping.json');
  console.log('\nNext steps:');
  console.log('1. Use the mapping file to update your data files');
  console.log('2. Run the SQL to update database with Supabase URLs');
}

uploadAllImages().catch(console.error);
