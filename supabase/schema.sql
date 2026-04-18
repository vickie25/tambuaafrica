-- ============================================
-- Tambua Africa Tours & Safaris - Database Schema
-- ============================================
-- Run these SQL queries in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
-- Extends auth.users with additional user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on role for faster admin checks
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. SAFARIS TABLE
-- ============================================
-- Stores safari package information
CREATE TABLE IF NOT EXISTS public.safaris (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  duration TEXT NOT NULL,
  price NUMERIC NOT NULL,
  rating NUMERIC DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  image TEXT NOT NULL,
  description TEXT NOT NULL,
  highlights TEXT[] DEFAULT ARRAY[]::TEXT[],
  category TEXT NOT NULL,
  stripe_price_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS safaris_category_idx ON public.safaris(category);
CREATE INDEX IF NOT EXISTS safaris_location_idx ON public.safaris(location);

-- Enable Row Level Security
ALTER TABLE public.safaris ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view safaris
CREATE POLICY "Everyone can view safaris"
  ON public.safaris FOR SELECT
  USING (true);

-- Policy: Admins can insert safaris
CREATE POLICY "Admins can insert safaris"
  ON public.safaris FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can update safaris
CREATE POLICY "Admins can update safaris"
  ON public.safaris FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can delete safaris
CREATE POLICY "Admins can delete safaris"
  ON public.safaris FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 3. DESTINATIONS TABLE
-- ============================================
-- Stores destination information
CREATE TABLE IF NOT EXISTS public.destinations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  safari_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS destinations_country_idx ON public.destinations(country);

-- Enable Row Level Security
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view destinations
CREATE POLICY "Everyone can view destinations"
  ON public.destinations FOR SELECT
  USING (true);

-- Policy: Admins can insert destinations
CREATE POLICY "Admins can insert destinations"
  ON public.destinations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can update destinations
CREATE POLICY "Admins can update destinations"
  ON public.destinations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can delete destinations
CREATE POLICY "Admins can delete destinations"
  ON public.destinations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 4. BLOGS TABLE
-- ============================================
-- Stores blog posts
CREATE TABLE IF NOT EXISTS public.blogs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  image TEXT NOT NULL,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  read_time TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS blogs_category_idx ON public.blogs(category);
CREATE INDEX IF NOT EXISTS blogs_date_idx ON public.blogs(date);

-- Enable Row Level Security
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view blogs
CREATE POLICY "Everyone can view blogs"
  ON public.blogs FOR SELECT
  USING (true);

-- Policy: Admins can insert blogs
CREATE POLICY "Admins can insert blogs"
  ON public.blogs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can update blogs
CREATE POLICY "Admins can update blogs"
  ON public.blogs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can delete blogs
CREATE POLICY "Admins can delete blogs"
  ON public.blogs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 5. BOOKINGS TABLE
-- ============================================
-- Stores booking information
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  safari_id TEXT NOT NULL,
  safari_title TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  guests INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  notes TEXT,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS bookings_user_id_idx ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON public.bookings(status);
CREATE INDEX IF NOT EXISTS bookings_safari_id_idx ON public.bookings(safari_id);
CREATE INDEX IF NOT EXISTS bookings_preferred_date_idx ON public.bookings(preferred_date);

-- Enable Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own bookings
CREATE POLICY "Users can view own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own bookings
CREATE POLICY "Users can insert own bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own bookings
CREATE POLICY "Users can update own bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Admins can view all bookings
CREATE POLICY "Admins can view all bookings"
  ON public.bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can update all bookings
CREATE POLICY "Admins can update all bookings"
  ON public.bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can delete bookings
CREATE POLICY "Admins can delete bookings"
  ON public.bookings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 6. INQUIRY_SUBMISSIONS TABLE
-- ============================================
-- Stores inquiry and contact form submissions
CREATE TABLE IF NOT EXISTS public.inquiry_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  inquiry_type TEXT NOT NULL CHECK (inquiry_type IN ('booking', 'contact')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT,
  safari_id TEXT,
  safari_title TEXT,
  preferred_date DATE,
  guests TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'synced', 'sync_failed', 'read')),
  google_sync_attempted_at TIMESTAMP WITH TIME ZONE,
  google_sync_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS inquiry_submissions_status_idx ON public.inquiry_submissions(status);
CREATE INDEX IF NOT EXISTS inquiry_submissions_type_idx ON public.inquiry_submissions(inquiry_type);
CREATE INDEX IF NOT EXISTS inquiry_submissions_email_idx ON public.inquiry_submissions(email);

-- Enable Row Level Security
ALTER TABLE public.inquiry_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can insert (for submit-inquiry function)
CREATE POLICY "Service role can insert inquiries"
  ON public.inquiry_submissions FOR INSERT
  WITH CHECK (true);

-- Policy: Admins can view all inquiries
CREATE POLICY "Admins can view all inquiries"
  ON public.inquiry_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can update inquiries
CREATE POLICY "Admins can update inquiries"
  ON public.inquiry_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can delete inquiries
CREATE POLICY "Admins can delete inquiries"
  ON public.inquiry_submissions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 7. CAROUSEL_IMAGES TABLE
-- ============================================
-- Stores hero carousel images for admin management
CREATE TABLE IF NOT EXISTS public.carousel_images (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS carousel_images_order_idx ON public.carousel_images("order");

-- Enable Row Level Security
ALTER TABLE public.carousel_images ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view carousel images
CREATE POLICY "Everyone can view carousel images"
  ON public.carousel_images FOR SELECT
  USING (true);

-- Policy: Admins can insert carousel images
CREATE POLICY "Admins can insert carousel images"
  ON public.carousel_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can update carousel images
CREATE POLICY "Admins can update carousel images"
  ON public.carousel_images FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can delete carousel images
CREATE POLICY "Admins can delete carousel images"
  ON public.carousel_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- TRIGGER: Update updated_at timestamp
-- ============================================
-- Function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_safaris_updated_at BEFORE UPDATE ON public.safaris
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_destinations_updated_at BEFORE UPDATE ON public.destinations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blogs_updated_at BEFORE UPDATE ON public.blogs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inquiry_submissions_updated_at BEFORE UPDATE ON public.inquiry_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_carousel_images_updated_at BEFORE UPDATE ON public.carousel_images
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- STORAGE BUCKETS
-- ============================================
-- Create storage buckets for images if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('safari-images', 'safari-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('destination-images', 'destination-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public can view blog images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

CREATE POLICY "Admins can upload blog images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'blog-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete blog images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'blog-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Public can view safari images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'safari-images');

CREATE POLICY "Admins can upload safari images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'safari-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete safari images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'safari-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Public can view destination images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'destination-images');

CREATE POLICY "Admins can upload destination images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'destination-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete destination images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'destination-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Create safaris storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('safaris', 'safaris', false)
ON CONFLICT (id) DO NOTHING;

-- Create carousel-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('carousel-images', 'carousel-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for safaris bucket
CREATE POLICY "Public Read Access on safaris" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'safaris');

CREATE POLICY "Authenticated Upload Access on safaris" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'safaris');

CREATE POLICY "Authenticated Update Access on safaris" ON storage.objects
FOR UPDATE
TO authenticated
WITH CHECK (bucket_id = 'safaris');

CREATE POLICY "Authenticated Delete Access on safaris" ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'safaris');

-- RLS Policies for carousel-images bucket
CREATE POLICY "Public Read Access on carousel-images" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'carousel-images');

CREATE POLICY "Authenticated Upload Access on carousel-images" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'carousel-images');

CREATE POLICY "Admin Update Access on carousel-images" ON storage.objects
FOR UPDATE
TO authenticated
WITH CHECK (
  bucket_id = 'carousel-images' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admin Delete Access on carousel-images" ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'carousel-images' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- ============================================
-- SAMPLE DATA (OPTIONAL)
-- ============================================
-- Uncomment to insert sample data for testing

-- -- Insert sample safaris
-- INSERT INTO public.safaris (id, title, location, duration, price, rating, reviews, image, description, highlights, category)
-- VALUES
--   ('safari-1', 'Masai Mara Safari', 'Kenya', '5 days', 1200, 4.8, 120, '/images/maasai-mara-real.webp', 'Experience the Great Migration in the world-famous Masai Mara.', ARRAY['Game drives', 'Hot air balloon', 'Cultural visits'], 'Adventure'),
--   ('safari-2', 'Serengeti Adventure', 'Tanzania', '7 days', 1800, 4.9, 85, '/images/wildbeast-migration-1.webp', 'Witness the Big Five in the vast Serengeti plains.', ARRAY['Game drives', 'Bush walks', 'Night drives'], 'Adventure'),
--   ('safari-3', 'Beach Holiday', 'Kenya', '3 days', 600, 4.7, 200, '/images/Diani Beach (2).webp', 'Relax on pristine white sand beaches along the Kenyan coast.', ARRAY['Beach relaxation', 'Water sports', 'Sunset cruises'], 'Beach');

-- -- Insert sample destinations
-- INSERT INTO public.destinations (id, name, country, description, image, safari_count)
-- VALUES
--   ('dest-1', 'Masai Mara', 'Kenya', 'Kenya''s most famous game reserve, home to the Great Migration.', '/images/maasai-mara-real.webp', 15),
--   ('dest-2', 'Serengeti', 'Tanzania', 'Vast savanna plains teeming with wildlife.', '/images/wildbeast-migration-1.webp', 12),
--   ('dest-3', 'Amboseli', 'Kenya', 'Famous for its large elephant herds and views of Mount Kilimanjaro.', '/images/destiations/Amboseli/Amboseli Elephant.webp', 8);

-- -- Insert sample carousel images
-- INSERT INTO public.carousel_images (id, url, title, description, "order")
-- VALUES
--   ('carousel-1', '/images/maasai-mara-real.webp', 'Masai Mara Safari', 'Experience the Great Migration', 0),
--   ('carousel-2', '/images/Diani Beach (2).webp', 'Beach Paradise', 'Relax on pristine beaches', 1),
--   ('carousel-3', '/images/wildbeast-migration-1.webp', 'Wildlife Adventure', 'Witness nature''s greatest spectacle', 2);
