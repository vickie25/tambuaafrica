-- FRESH SUPABASE SETUP
-- Run this AFTER running reset-all.sql
-- This creates a clean schema with proper structure

-- ============================================
-- TABLES
-- ============================================

-- Profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Safaris table
CREATE TABLE public.safaris (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  duration TEXT NOT NULL,
  price NUMERIC NOT NULL,
  rating NUMERIC DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  image TEXT,
  description TEXT,
  highlights TEXT[],
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Destinations table
CREATE TABLE public.destinations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  description TEXT,
  image TEXT,
  safari_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Blogs table
CREATE TABLE public.blogs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT,
  image TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  safari_id TEXT REFERENCES public.safaris(id) NOT NULL,
  safari_title TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  total_amount NUMERIC NOT NULL,
  number_of_people INTEGER NOT NULL,
  travel_date DATE NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Carousel images table
CREATE TABLE public.carousel_images (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inquiry submissions table
CREATE TABLE public.inquiry_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  inquiry_type TEXT DEFAULT 'general',
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'responded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safaris ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carousel_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_submissions ENABLE ROW LEVEL SECURITY;

-- Profiles policies (NO RECURSION)
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'tambuaafrica@gmail.com'
  );

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Bookings policies
CREATE POLICY "Users can view own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings" ON public.bookings
  FOR SELECT USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'tambuaafrica@gmail.com'
  );

CREATE POLICY "Users can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all bookings" ON public.bookings
  FOR UPDATE USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'tambuaafrica@gmail.com'
  );

CREATE POLICY "Admins can delete bookings" ON public.bookings
  FOR DELETE USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'tambuaafrica@gmail.com'
  );

-- Safaris policies
CREATE POLICY "Public can view safaris" ON public.safaris
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage safaris" ON public.safaris
  FOR ALL USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'tambuaafrica@gmail.com'
  );

-- Destinations policies
CREATE POLICY "Public can view destinations" ON public.destinations
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage destinations" ON public.destinations
  FOR ALL USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'tambuaafrica@gmail.com'
  );

-- Blogs policies
CREATE POLICY "Public can view published blogs" ON public.blogs
  FOR SELECT TO public USING (published = true);

CREATE POLICY "Admins can manage blogs" ON public.blogs
  FOR ALL USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'tambuaafrica@gmail.com'
  );

-- Carousel images policies
CREATE POLICY "Public can view carousel images" ON public.carousel_images
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage carousel images" ON public.carousel_images
  FOR ALL USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'tambuaafrica@gmail.com'
  );

-- Inquiry submissions policies
CREATE POLICY "Users can create inquiries" ON public.inquiry_submissions
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Admins can view all inquiries" ON public.inquiry_submissions
  FOR SELECT USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'tambuaafrica@gmail.com'
  );

CREATE POLICY "Admins can update inquiries" ON public.inquiry_submissions
  FOR UPDATE USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'tambuaafrica@gmail.com'
  );

-- ============================================
-- TRIGGERS AND FUNCTIONS
-- ============================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
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

CREATE TRIGGER update_carousel_images_updated_at BEFORE UPDATE ON public.carousel_images
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inquiry_submissions_updated_at BEFORE UPDATE ON public.inquiry_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Create safaris bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('safaris', 'safaris', false)
ON CONFLICT (id) DO NOTHING;

-- Create carousel-images bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('carousel-images', 'carousel-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for safaris
CREATE POLICY "Public Read Access on safaris" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'safaris');

CREATE POLICY "Authenticated Upload Access on safaris" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'safaris');

CREATE POLICY "Authenticated Update Access on safaris" ON storage.objects
  FOR UPDATE TO authenticated WITH CHECK (bucket_id = 'safaris');

CREATE POLICY "Authenticated Delete Access on safaris" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'safaris');

-- Storage policies for carousel-images
CREATE POLICY "Public Read Access on carousel-images" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'carousel-images');

CREATE POLICY "Authenticated Upload Access on carousel-images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'carousel-images');

CREATE POLICY "Admin Update Access on carousel-images" ON storage.objects
  FOR UPDATE TO authenticated WITH CHECK (
    bucket_id = 'carousel-images' AND
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'tambuaafrica@gmail.com'
  );

CREATE POLICY "Admin Delete Access on carousel-images" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'carousel-images' AND
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'tambuaafrica@gmail.com'
  );

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'Fresh setup completed successfully' as status;
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
SELECT * FROM pg_policies WHERE schemaname = 'public';
SELECT * FROM storage.buckets;
