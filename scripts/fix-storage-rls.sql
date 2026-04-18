-- Fix: Allow public uploads to 'safaris' storage bucket
-- Run this in Supabase Dashboard → SQL Editor

-- Enable RLS on storage.objects if not already
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations on safaris bucket
CREATE POLICY "safaris_public_access" ON storage.objects
FOR ALL 
USING (bucket_id = 'safaris')
WITH CHECK (bucket_id = 'safaris');

-- Verify
SELECT polname, polpermissive 
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';