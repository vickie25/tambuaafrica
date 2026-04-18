-- DISABLE RLS ON STORAGE TO ALLOW UPLOADS
-- Run this in Supabase SQL Editor to temporarily disable RLS on storage

-- Disable RLS on storage.objects
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Verify buckets exist, create if they don't
INSERT INTO storage.buckets (id, name, public)
VALUES ('safaris', 'safaris', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('carousel-images', 'carousel-images', true)
ON CONFLICT (id) DO NOTHING;

-- Verify buckets exist
SELECT * FROM storage.buckets;
