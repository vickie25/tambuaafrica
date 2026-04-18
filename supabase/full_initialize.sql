-- FULL DATABASE INITIALIZATION SCRIPT
-- RUN THIS IN YOUR SUPABASE SQL EDITOR (https://supabase.com/dashboard/project/_/sql)

-- 1. CLEANUP (Optional: Only run if you want to reset EVERYTHING)
-- DROP TABLE IF EXISTS public.safaris CASCADE;
-- DROP TABLE IF EXISTS public.destinations CASCADE;
-- DROP TABLE IF EXISTS public.blogs CASCADE;

-- 2. CREATE TABLES

-- Safaris Table
CREATE TABLE IF NOT EXISTS public.safaris (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    duration TEXT NOT NULL,
    price INTEGER NOT NULL,
    rating NUMERIC DEFAULT 5.0,
    reviews INTEGER DEFAULT 0,
    image TEXT NOT NULL,
    description TEXT NOT NULL,
    highlights TEXT[] NOT NULL DEFAULT '{}',
    category TEXT NOT NULL,
    stripe_price_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Destinations Table
CREATE TABLE IF NOT EXISTS public.destinations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    description TEXT NOT NULL,
    story TEXT,
    features TEXT[] DEFAULT '{}',
    image TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    safari_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blogs Table
CREATE TABLE IF NOT EXISTS public.blogs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    image TEXT NOT NULL,
    date TEXT NOT NULL,
    category TEXT NOT NULL,
    read_time TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.safaris ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- 4. CREATE POLICIES

-- Safaris Policies
CREATE POLICY "Public Read Access" ON public.safaris FOR SELECT USING (true);
CREATE POLICY "Admin All Access" ON public.safaris FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Destinations Policies
CREATE POLICY "Public Read Access" ON public.destinations FOR SELECT USING (true);
CREATE POLICY "Admin All Access" ON public.destinations FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Blogs Policies
CREATE POLICY "Public Read Access" ON public.blogs FOR SELECT USING (true);
CREATE POLICY "Admin All Access" ON public.blogs FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
) WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 5. STORAGE BUCKET PERMISSIONS (Bucket named 'safaris')
-- Ensure bucket exists
INSERT INTO storage.buckets (id, name, public) VALUES ('safaris', 'safaris', true) ON CONFLICT DO NOTHING;

-- Storage Policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'safaris');
CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'safaris' AND EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin All" ON storage.objects FOR ALL USING (
  bucket_id = 'safaris' AND EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 6. SEED DATA (Optional: populates the DB with the current local website content)
-- Safaris
INSERT INTO public.safaris (id, title, location, duration, price, rating, reviews, image, description, highlights, category, stripe_price_id)
VALUES 
('2-days-masai-mara', '2 Days Masai Mara From Nairobi', 'Maasai Mara, Kenya', '2 Days / 1 Night', 500, 4.8, 142, '/images/maasai-mara-real.webp', 'A compact yet thrilling adventure offering game drives in the world-famous Maasai Mara to witness the Big Five.', ARRAY['Big Five Game Drives', 'Mara River', 'Savannah Sunsets'], 'Wildlife Safari', ''),
('3-days-masai-mara', '3 Days Masai Mara Safari', 'Maasai Mara, Kenya', '3 Days / 2 Nights', 900, 4.9, 215, '/images/maasai-mara-authentic.webp', 'Experience the ultimate Masai Mara safari spanning three days, allowing deep exploration of its incredible wildlife density.', ARRAY['Extended Game Drives', 'Optional Balloon Safari', 'Maasai Village Visit'], 'Wildlife Safari', ''),
('diani-beach-escape', 'Diani Beach & Coast Escape', 'Diani Beach, Kenya', '6 Days / 5 Nights', 2100, 4.9, 287, '/images/diani-beach-new.webp', 'Unwind on the pristine white sands of Diani Beach with turquoise waters, Swahili culture, and tropical relaxation.', ARRAY['White Sand Beaches', 'Snorkeling & Diving', 'Swahili Cuisine'], 'Beach Holiday', '')
ON CONFLICT (id) DO NOTHING;

-- Destinations
INSERT INTO public.destinations (id, name, country, description, story, features, image, images, safari_count)
VALUES 
('tsavo', 'Tsavo National Park', 'Kenya', 'A vast red-earth wilderness...', 'Tsavo is the wild Africa...', ARRAY['Africa''s largest park complex', 'Red elephant phenomenon'], '/images/destiations/Tsavo/voi safari lodge4.webp', ARRAY['/images/destiations/Tsavo/voi safari lodge4.webp'], 5),
('masai-mara', 'Maasai Mara', 'Kenya', 'The world-renowned home...', 'Masai Mara stands as the crown jewel...', ARRAY['The Great Migration', 'Exceptional predator viewing'], '/images/destiations/Maasai Mara/masai mara sopa lodge.webp', ARRAY['/images/destiations/Maasai Mara/masai mara sopa lodge.webp'], 6)
ON CONFLICT (id) DO NOTHING;
