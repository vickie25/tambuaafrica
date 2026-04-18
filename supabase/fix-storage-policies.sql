-- FIX STORAGE BUCKET RLS POLICIES
-- Run this in Supabase SQL Editor to allow image uploads

-- Drop existing storage policies
DROP POLICY IF EXISTS "Public Read Access on safaris" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Access on safaris" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Access on safaris" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Access on safaris" ON storage.objects;

DROP POLICY IF EXISTS "Public Read Access on carousel-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Access on carousel-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Access on carousel-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Access on carousel-images" ON storage.objects;

-- Create new policies that allow authenticated users to upload
-- Safaris bucket policies
CREATE POLICY "Public Read Access on safaris" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'safaris');

CREATE POLICY "Authenticated Upload Access on safaris" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'safaris');

CREATE POLICY "Authenticated Update Access on safaris" ON storage.objects
  FOR UPDATE TO authenticated WITH CHECK (bucket_id = 'safaris');

CREATE POLICY "Authenticated Delete Access on safaris" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'safaris');

-- Carousel-images bucket policies
CREATE POLICY "Public Read Access on carousel-images" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'carousel-images');

CREATE POLICY "Authenticated Upload Access on carousel-images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'carousel-images');

CREATE POLICY "Authenticated Update Access on carousel-images" ON storage.objects
  FOR UPDATE TO authenticated WITH CHECK (bucket_id = 'carousel-images');

CREATE POLICY "Authenticated Delete Access on carousel-images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'carousel-images');

-- Verify the policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
