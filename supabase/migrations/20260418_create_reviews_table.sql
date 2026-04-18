-- ============================================
-- Reviews Table Migration
-- Creates table for storing testimonials/reviews
-- ============================================

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_name TEXT NOT NULL,
  author_title TEXT,
  author_avatar TEXT,
  quote TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  source TEXT DEFAULT 'manual' CHECK (source IN ('google', 'manual', 'tripadvisor')),
  source_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for active reviews
CREATE INDEX IF NOT EXISTS reviews_active_idx ON public.reviews(is_active) WHERE is_active = true;

-- Create index for display order
CREATE INDEX IF NOT EXISTS reviews_order_idx ON public.reviews(display_order);

-- Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view active reviews
CREATE POLICY "Everyone can view active reviews"
  ON public.reviews FOR SELECT
  USING (is_active = true);

-- Policy: Only admins can insert/update/delete reviews
CREATE POLICY "Admins can manage reviews"
  ON public.reviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert existing testimonials as manual reviews
INSERT INTO public.reviews (author_name, author_title, author_avatar, quote, rating, source, display_order) VALUES
('Dr. Odilliah Mwangi', 'Medical Professional, Nairobi', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80', 'Tambua Africa gave us an unforgettable family safari experience. The attention to detail and knowledge of the guides was exceptional. We saw the Big Five in just two days!', 5, 'manual', 1),
('Dr. Marco Palca', 'Wildlife Researcher, Italy', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80', 'As a wildlife researcher, I have worked with many tour operators across Africa. Tambua stands out for their deep respect for nature and commitment to sustainable tourism.', 5, 'manual', 2),
('Eng. Briscan Odhiambo', 'Engineer, Mombasa', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80', 'The beach holiday package was absolutely perfect. From the moment we arrived in Diani, everything was taken care of. Professional service from start to finish.', 5, 'manual', 3),
('Dr. Amos Kimutai', 'University Lecturer, Eldoret', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80', 'I have booked three different safaris with Tambua Africa over the past five years. Each experience has been unique and memorable. They truly understand what makes Kenya special.', 5, 'manual', 4),
('Sarah Thompson', 'Tourist, United Kingdom', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80', 'Our honeymoon in Kenya was magical thanks to Tambua Africa. The Masai Mara experience exceeded all expectations. The lodges were beautiful and the wildlife viewing was incredible.', 5, 'manual', 5),
('James Omondi', 'Business Executive, Kisumu', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80', 'Professional, reliable, and truly passionate about showing the best of Kenya. Our corporate retreat was perfectly organized. Will definitely book again for family trips.', 5, 'manual', 6),
('Elena Rodriguez', 'Travel Blogger, Spain', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80', 'I have traveled to 30+ countries and Tambua Africa provided one of the best tour experiences I have ever had. Their local knowledge and personalized service is unmatched.', 5, 'manual', 7),
('Peter Kamau', 'Photographer, Nakuru', 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&q=80', 'As a wildlife photographer, I need operators who understand lighting and animal behavior. Tambua guides knew exactly where to position us for the perfect shots at Lake Nakuru.', 5, 'manual', 8)
ON CONFLICT DO NOTHING;

-- Update safaris table reviews count (example - adjust based on actual data)
-- This can be done manually or via a script that counts reviews per safari