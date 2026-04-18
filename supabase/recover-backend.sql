-- Tambua Next Wave backend recovery
-- Non-destructive: creates missing tables/policies, backfills profiles, and repairs storage.
-- Run this in the Supabase SQL Editor for the affected project.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Core helpers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  avatar_url text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name text NOT NULL DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin'));

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = _user_id
      AND p.role = 'admin'
  )
  OR EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE u.id = _user_id
      AND lower(coalesce(u.email, '')) IN (
        'tambuaafrica@gmail.com',
        'admin@tambua.africa',
        'admin@tambuaafrica.com'
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''), split_part(COALESCE(NEW.email, ''), '@', 1), ''),
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'phone', ''), ''),
    CASE
      WHEN lower(COALESCE(NEW.email, '')) IN (
        'tambuaafrica@gmail.com',
        'admin@tambua.africa',
        'admin@tambuaafrica.com'
      ) THEN 'admin'
      ELSE 'user'
    END
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    phone = COALESCE(public.profiles.phone, EXCLUDED.phone),
    role = CASE
      WHEN public.profiles.role = 'admin' THEN 'admin'
      ELSE EXCLUDED.role
    END,
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.profiles (id, full_name, phone, role, created_at, updated_at)
SELECT
  u.id,
  COALESCE(NULLIF(u.raw_user_meta_data ->> 'full_name', ''), split_part(COALESCE(u.email, ''), '@', 1), ''),
  COALESCE(NULLIF(u.raw_user_meta_data ->> 'phone', ''), ''),
  CASE
    WHEN lower(COALESCE(u.email, '')) IN (
      'tambuaafrica@gmail.com',
      'admin@tambua.africa',
      'admin@tambuaafrica.com'
    ) THEN 'admin'
    ELSE 'user'
  END,
  COALESCE(u.created_at, now()),
  now()
FROM auth.users u
ON CONFLICT (id) DO UPDATE
SET
  full_name = EXCLUDED.full_name,
  phone = COALESCE(public.profiles.phone, EXCLUDED.phone),
  role = CASE
    WHEN public.profiles.role = 'admin' THEN 'admin'
    ELSE EXCLUDED.role
  END,
  updated_at = now();

-- Content tables
CREATE TABLE IF NOT EXISTS public.safaris (
  id text PRIMARY KEY,
  title text NOT NULL,
  location text NOT NULL,
  duration text NOT NULL,
  price numeric NOT NULL,
  rating numeric NOT NULL DEFAULT 5.0,
  reviews integer NOT NULL DEFAULT 0,
  image text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  highlights text[] NOT NULL DEFAULT '{}',
  category text NOT NULL DEFAULT 'Wildlife Safari',
  stripe_price_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.safaris ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT '';
ALTER TABLE public.safaris ADD COLUMN IF NOT EXISTS location text NOT NULL DEFAULT '';
ALTER TABLE public.safaris ADD COLUMN IF NOT EXISTS duration text NOT NULL DEFAULT '';
ALTER TABLE public.safaris ADD COLUMN IF NOT EXISTS price numeric NOT NULL DEFAULT 0;
ALTER TABLE public.safaris ADD COLUMN IF NOT EXISTS rating numeric NOT NULL DEFAULT 5.0;
ALTER TABLE public.safaris ADD COLUMN IF NOT EXISTS reviews integer NOT NULL DEFAULT 0;
ALTER TABLE public.safaris ADD COLUMN IF NOT EXISTS image text NOT NULL DEFAULT '';
ALTER TABLE public.safaris ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';
ALTER TABLE public.safaris ADD COLUMN IF NOT EXISTS highlights text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.safaris ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'Wildlife Safari';
ALTER TABLE public.safaris ADD COLUMN IF NOT EXISTS stripe_price_id text;
ALTER TABLE public.safaris ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.safaris ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS public.destinations (
  id text PRIMARY KEY,
  name text NOT NULL,
  country text NOT NULL,
  description text NOT NULL DEFAULT '',
  story text,
  features text[] DEFAULT '{}',
  image text NOT NULL DEFAULT '',
  images text[] DEFAULT '{}',
  safari_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.destinations ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '';
ALTER TABLE public.destinations ADD COLUMN IF NOT EXISTS country text NOT NULL DEFAULT '';
ALTER TABLE public.destinations ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';
ALTER TABLE public.destinations ADD COLUMN IF NOT EXISTS story text;
ALTER TABLE public.destinations ADD COLUMN IF NOT EXISTS features text[] DEFAULT '{}';
ALTER TABLE public.destinations ADD COLUMN IF NOT EXISTS image text NOT NULL DEFAULT '';
ALTER TABLE public.destinations ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';
ALTER TABLE public.destinations ADD COLUMN IF NOT EXISTS safari_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.destinations ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.destinations ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS public.blogs (
  id text PRIMARY KEY,
  title text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT '',
  date text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  read_time text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT '';
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS excerpt text NOT NULL DEFAULT '';
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS image text NOT NULL DEFAULT '';
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS date text NOT NULL DEFAULT '';
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT '';
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS read_time text NOT NULL DEFAULT '';
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS content text NOT NULL DEFAULT '';
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  safari_id text NOT NULL,
  safari_title text NOT NULL,
  preferred_date date NOT NULL,
  guests integer NOT NULL DEFAULT 1 CHECK (guests > 0),
  total_amount integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  notes text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS safari_id text NOT NULL DEFAULT '';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS safari_title text NOT NULL DEFAULT '';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS preferred_date date;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS guests integer NOT NULL DEFAULT 1;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS total_amount integer NOT NULL DEFAULT 0;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'usd';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_status_check CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'));

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_session_id text,
  stripe_payment_intent_id text,
  amount integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  receipt_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS stripe_session_id text;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS amount integer NOT NULL DEFAULT 0;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'usd';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS receipt_url text;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE public.payments
  ADD CONSTRAINT payments_status_check CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded'));

CREATE TABLE IF NOT EXISTS public.inquiry_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_type text NOT NULL CHECK (inquiry_type IN ('booking', 'contact')),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text,
  safari_id text,
  safari_title text,
  preferred_date date,
  guests text,
  status text NOT NULL DEFAULT 'pending',
  google_sync_attempted_at timestamptz,
  google_sync_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.inquiry_submissions ADD COLUMN IF NOT EXISTS inquiry_type text NOT NULL DEFAULT 'contact';
ALTER TABLE public.inquiry_submissions ADD COLUMN IF NOT EXISTS full_name text NOT NULL DEFAULT '';
ALTER TABLE public.inquiry_submissions ADD COLUMN IF NOT EXISTS email text NOT NULL DEFAULT '';
ALTER TABLE public.inquiry_submissions ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.inquiry_submissions ADD COLUMN IF NOT EXISTS subject text;
ALTER TABLE public.inquiry_submissions ADD COLUMN IF NOT EXISTS message text;
ALTER TABLE public.inquiry_submissions ADD COLUMN IF NOT EXISTS safari_id text;
ALTER TABLE public.inquiry_submissions ADD COLUMN IF NOT EXISTS safari_title text;
ALTER TABLE public.inquiry_submissions ADD COLUMN IF NOT EXISTS preferred_date date;
ALTER TABLE public.inquiry_submissions ADD COLUMN IF NOT EXISTS guests text;
ALTER TABLE public.inquiry_submissions ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.inquiry_submissions ADD COLUMN IF NOT EXISTS google_sync_attempted_at timestamptz;
ALTER TABLE public.inquiry_submissions ADD COLUMN IF NOT EXISTS google_sync_error text;
ALTER TABLE public.inquiry_submissions ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.inquiry_submissions ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.inquiry_submissions DROP CONSTRAINT IF EXISTS inquiry_submissions_inquiry_type_check;
ALTER TABLE public.inquiry_submissions
  ADD CONSTRAINT inquiry_submissions_inquiry_type_check CHECK (inquiry_type IN ('booking', 'contact'));

ALTER TABLE public.inquiry_submissions DROP CONSTRAINT IF EXISTS inquiry_submissions_status_check;
ALTER TABLE public.inquiry_submissions
  ADD CONSTRAINT inquiry_submissions_status_check CHECK (
    status IN ('pending', 'synced', 'sync_failed', 'unread', 'read', 'replied')
  );

CREATE TABLE IF NOT EXISTS public.carousel_images (
  id text PRIMARY KEY,
  url text NOT NULL,
  title text NOT NULL,
  description text,
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.carousel_images ADD COLUMN IF NOT EXISTS url text NOT NULL DEFAULT '';
ALTER TABLE public.carousel_images ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT '';
ALTER TABLE public.carousel_images ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.carousel_images ADD COLUMN IF NOT EXISTS "order" integer NOT NULL DEFAULT 0;
ALTER TABLE public.carousel_images ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.carousel_images ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_safaris_category ON public.safaris(category);
CREATE INDEX IF NOT EXISTS idx_safaris_created_at ON public.safaris(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_destinations_country ON public.destinations(country);
CREATE INDEX IF NOT EXISTS idx_destinations_created_at ON public.destinations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON public.blogs(category);
CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON public.blogs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(preferred_date);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_inquiry_submissions_status ON public.inquiry_submissions(status);
CREATE INDEX IF NOT EXISTS idx_inquiry_submissions_created_at ON public.inquiry_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_carousel_images_order ON public.carousel_images("order");

-- Updated-at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_safaris_updated_at ON public.safaris;
CREATE TRIGGER update_safaris_updated_at
  BEFORE UPDATE ON public.safaris
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_destinations_updated_at ON public.destinations;
CREATE TRIGGER update_destinations_updated_at
  BEFORE UPDATE ON public.destinations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_blogs_updated_at ON public.blogs;
CREATE TRIGGER update_blogs_updated_at
  BEFORE UPDATE ON public.blogs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_inquiry_submissions_updated_at ON public.inquiry_submissions;
CREATE TRIGGER update_inquiry_submissions_updated_at
  BEFORE UPDATE ON public.inquiry_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_carousel_images_updated_at ON public.carousel_images;
CREATE TRIGGER update_carousel_images_updated_at
  BEFORE UPDATE ON public.carousel_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Row-level security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safaris ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carousel_images ENABLE ROW LEVEL SECURITY;

-- Drop conflicting policies before recreating the canonical set
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

DROP POLICY IF EXISTS "Public can view safaris" ON public.safaris;
DROP POLICY IF EXISTS "Admins can manage safaris" ON public.safaris;
DROP POLICY IF EXISTS "Everyone can view safaris" ON public.safaris;
DROP POLICY IF EXISTS "Admins can insert safaris" ON public.safaris;
DROP POLICY IF EXISTS "Admins can update safaris" ON public.safaris;
DROP POLICY IF EXISTS "Admins can delete safaris" ON public.safaris;

DROP POLICY IF EXISTS "Public can view destinations" ON public.destinations;
DROP POLICY IF EXISTS "Admins can manage destinations" ON public.destinations;
DROP POLICY IF EXISTS "Everyone can view destinations" ON public.destinations;
DROP POLICY IF EXISTS "Admins can insert destinations" ON public.destinations;
DROP POLICY IF EXISTS "Admins can update destinations" ON public.destinations;
DROP POLICY IF EXISTS "Admins can delete destinations" ON public.destinations;

DROP POLICY IF EXISTS "Public can view blogs" ON public.blogs;
DROP POLICY IF EXISTS "Admins can manage blogs" ON public.blogs;
DROP POLICY IF EXISTS "Everyone can view blogs" ON public.blogs;
DROP POLICY IF EXISTS "Admins can insert blogs" ON public.blogs;
DROP POLICY IF EXISTS "Admins can update blogs" ON public.blogs;
DROP POLICY IF EXISTS "Admins can delete blogs" ON public.blogs;

DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can insert own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can update all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can delete bookings" ON public.bookings;

DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;

DROP POLICY IF EXISTS "No direct client select on inquiry submissions" ON public.inquiry_submissions;
DROP POLICY IF EXISTS "No direct client insert on inquiry submissions" ON public.inquiry_submissions;
DROP POLICY IF EXISTS "No direct client update on inquiry submissions" ON public.inquiry_submissions;
DROP POLICY IF EXISTS "No direct client delete on inquiry submissions" ON public.inquiry_submissions;
DROP POLICY IF EXISTS "Public can submit inquiries" ON public.inquiry_submissions;
DROP POLICY IF EXISTS "Users can create inquiries" ON public.inquiry_submissions;
DROP POLICY IF EXISTS "Service role can insert inquiries" ON public.inquiry_submissions;
DROP POLICY IF EXISTS "Admins can view all inquiries" ON public.inquiry_submissions;
DROP POLICY IF EXISTS "Admins can update inquiries" ON public.inquiry_submissions;
DROP POLICY IF EXISTS "Admins can delete inquiries" ON public.inquiry_submissions;

DROP POLICY IF EXISTS "Public can view carousel images" ON public.carousel_images;
DROP POLICY IF EXISTS "Admins can manage carousel images" ON public.carousel_images;
DROP POLICY IF EXISTS "Everyone can view carousel images" ON public.carousel_images;
DROP POLICY IF EXISTS "Admins can insert carousel images" ON public.carousel_images;
DROP POLICY IF EXISTS "Admins can update carousel images" ON public.carousel_images;
DROP POLICY IF EXISTS "Admins can delete carousel images" ON public.carousel_images;

-- Canonical policies
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Public can view safaris"
  ON public.safaris
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage safaris"
  ON public.safaris
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Public can view destinations"
  ON public.destinations
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage destinations"
  ON public.destinations
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Public can view blogs"
  ON public.blogs
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage blogs"
  ON public.blogs
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Users can view own bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings"
  ON public.bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all bookings"
  ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete bookings"
  ON public.bookings
  FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view own payments"
  ON public.payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments"
  ON public.payments
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Public can submit inquiries"
  ON public.inquiry_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (inquiry_type IN ('booking', 'contact'));

CREATE POLICY "Admins can view all inquiries"
  ON public.inquiry_submissions
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update inquiries"
  ON public.inquiry_submissions
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete inquiries"
  ON public.inquiry_submissions
  FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Public can view carousel images"
  ON public.carousel_images
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage carousel images"
  ON public.carousel_images
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('safaris', 'safaris', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

INSERT INTO storage.buckets (id, name, public)
VALUES ('carousel-images', 'carousel-images', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Storage policies
DROP POLICY IF EXISTS "Public Read Access on safaris" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Access on safaris" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Access on safaris" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Access on safaris" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload safari images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete safari images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view safari images" ON storage.objects;

DROP POLICY IF EXISTS "Public Read Access on carousel-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Access on carousel-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Access on carousel-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Access on carousel-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Access on carousel-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Access on carousel-images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view carousel images" ON storage.objects;

CREATE POLICY "Public Read Access on safaris"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'safaris');

CREATE POLICY "Admin Upload Access on safaris"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'safaris' AND public.is_admin(auth.uid()));

CREATE POLICY "Admin Update Access on safaris"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'safaris' AND public.is_admin(auth.uid()))
  WITH CHECK (bucket_id = 'safaris' AND public.is_admin(auth.uid()));

CREATE POLICY "Admin Delete Access on safaris"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'safaris' AND public.is_admin(auth.uid()));

CREATE POLICY "Public Read Access on carousel-images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'carousel-images');

CREATE POLICY "Admin Upload Access on carousel-images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'carousel-images' AND public.is_admin(auth.uid()));

CREATE POLICY "Admin Update Access on carousel-images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'carousel-images' AND public.is_admin(auth.uid()))
  WITH CHECK (bucket_id = 'carousel-images' AND public.is_admin(auth.uid()));

CREATE POLICY "Admin Delete Access on carousel-images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'carousel-images' AND public.is_admin(auth.uid()));

-- Verification helpers
SELECT 'profiles' AS table_name, COUNT(*) AS row_count FROM public.profiles
UNION ALL
SELECT 'safaris', COUNT(*) FROM public.safaris
UNION ALL
SELECT 'destinations', COUNT(*) FROM public.destinations
UNION ALL
SELECT 'blogs', COUNT(*) FROM public.blogs
UNION ALL
SELECT 'bookings', COUNT(*) FROM public.bookings
UNION ALL
SELECT 'inquiry_submissions', COUNT(*) FROM public.inquiry_submissions
UNION ALL
SELECT 'carousel_images', COUNT(*) FROM public.carousel_images;

SELECT id, email
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

SELECT id, name, public
FROM storage.buckets
WHERE id IN ('safaris', 'carousel-images');
