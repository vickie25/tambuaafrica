-- Comprehensive fix: Add all missing columns to bookings table
-- Run this in Supabase SQL Editor

-- Add missing columns if they don't exist
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS safari_id TEXT,
ADD COLUMN IF NOT EXISTS safari_title TEXT,
ADD COLUMN IF NOT EXISTS preferred_date DATE,
ADD COLUMN IF NOT EXISTS guests INTEGER,
ADD COLUMN IF NOT EXISTS total_amount INTEGER,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS user_id UUID,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Verify all columns now exist
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
ORDER BY ordinal_position;