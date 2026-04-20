-- Fix: Add missing currency column to bookings table
-- Run this in Supabase SQL Editor

ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'bookings' AND column_name = 'currency';