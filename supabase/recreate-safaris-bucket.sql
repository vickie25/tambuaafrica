-- Delete existing safaris bucket and recreate with proper policies
-- Run this in Supabase SQL Editor

-- Delete existing policies for safaris bucket
DROP POLICY IF EXISTS "Public Read Access on safaris" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Access on safaris" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Access on safaris" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Access on safaris" ON storage.objects;

-- Delete the safaris bucket
DELETE FROM storage.buckets WHERE id = 'safaris';

-- Create new safaris bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('safaris', 'safaris', false);

-- Create RLS policies for safaris bucket

-- Public read access (for displaying images)
CREATE POLICY "Public Read Access on safaris" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'safaris');

-- Authenticated users can upload
CREATE POLICY "Authenticated Upload Access on safaris" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'safaris');

-- Authenticated users can update
CREATE POLICY "Authenticated Update Access on safaris" ON storage.objects
FOR UPDATE
TO authenticated
WITH CHECK (bucket_id = 'safaris');

-- Authenticated users can delete
CREATE POLICY "Authenticated Delete Access on safaris" ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'safaris');

-- Verify the bucket was created
SELECT * FROM storage.buckets WHERE id = 'safaris';
