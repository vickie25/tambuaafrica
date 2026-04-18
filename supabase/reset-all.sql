-- RESET ALL SUPABASE DATA
-- WARNING: This will delete ALL data including users, bookings, safaris, etc.
-- Run this in Supabase SQL Editor

-- Drop all RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;

DROP POLICY IF EXISTS "Public can view safaris" ON public.safaris;
DROP POLICY IF EXISTS "Admins can manage safaris" ON public.safaris;

DROP POLICY IF EXISTS "Public can view destinations" ON public.destinations;
DROP POLICY IF EXISTS "Admins can manage destinations" ON public.destinations;

DROP POLICY IF EXISTS "Public can view blogs" ON public.blogs;
DROP POLICY IF EXISTS "Admins can manage blogs" ON public.blogs;

DROP POLICY IF EXISTS "Public can view carousel images" ON public.carousel_images;
DROP POLICY IF EXISTS "Admins can manage carousel images" ON public.carousel_images;

DROP POLICY IF EXISTS "Users can create inquiries" ON public.inquiry_submissions;
DROP POLICY IF EXISTS "Admins can view all inquiries" ON public.inquiry_submissions;
DROP POLICY IF EXISTS "Admins can update inquiries" ON public.inquiry_submissions;

-- Drop all storage policies
DROP POLICY IF EXISTS "Public Read Access on safaris" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Access on safaris" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Access on safaris" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Access on safaris" ON storage.objects;

DROP POLICY IF EXISTS "Public Read Access on carousel-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Access on carousel-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Access on carousel-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Access on carousel-images" ON storage.objects;

-- NOTE: Storage buckets must be deleted manually via Supabase Dashboard → Storage
-- Supabase does not allow direct SQL operations on storage tables
-- Steps:
-- 1. Go to Supabase Dashboard → Storage
-- 2. For each bucket, delete all files manually
-- 3. Then delete the bucket itself

-- Drop triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_safaris_updated_at ON public.safaris;
DROP TRIGGER IF EXISTS update_destinations_updated_at ON public.destinations;
DROP TRIGGER IF EXISTS update_blogs_updated_at ON public.blogs;
DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
DROP TRIGGER IF EXISTS update_inquiry_submissions_updated_at ON public.inquiry_submissions;
DROP TRIGGER IF EXISTS update_carousel_images_updated_at ON public.carousel_images;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Drop all tables
DROP TABLE IF EXISTS public.inquiry_submissions CASCADE;
DROP TABLE IF EXISTS public.carousel_images CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.safaris CASCADE;
DROP TABLE IF EXISTS public.destinations CASCADE;
DROP TABLE IF EXISTS public.blogs CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Verify everything is dropped
SELECT 'All data dropped successfully' as status;
