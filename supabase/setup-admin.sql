-- ============================================
-- Setup Admin User for Tambua Africa
-- ============================================
-- This script sets up the admin role for tambuaafrica@gmail.com
-- IMPORTANT: First create the user via Supabase Dashboard, then run this script
-- ============================================

-- Step 1: Create or update the profile with admin role
-- This assumes the user already exists in auth.users (created via Dashboard)

INSERT INTO public.profiles (id, full_name, phone, role)
SELECT
  id,
  'Tambua Africa Admin',
  '+254704548878',
  'admin'
FROM auth.users
WHERE email = 'tambuaafrica@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  full_name = 'Tambua Africa Admin',
  phone = '+254704548878',
  updated_at = now();

-- ============================================
-- Verification Query
-- ============================================
-- Run this to verify the admin user was created successfully

SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.full_name,
  p.phone,
  p.role,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'tambuaafrica@gmail.com';

-- ============================================
-- Alternative: Using Supabase Auth API
-- ============================================
-- If the above doesn't work, you can create the admin user via:
-- 1. Go to Supabase Dashboard -> Authentication
-- 2. Click "Add User" -> "Create New User"
-- 3. Email: tambuaafrica@gmail.com
-- 4. Password: Tambuaafrica@2026
-- 5. Check "Auto Confirm User"
-- 6. Click "Create User"
-- 
-- Then run this to set the admin role in the profile:
-- 
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'tambuaafrica@gmail.com');
