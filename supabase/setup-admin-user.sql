-- SETUP ADMIN USER
-- Run this AFTER running fresh-setup.sql
-- This creates the admin user with proper permissions

-- Update the profile role to admin for tambuaafrica@gmail.com
UPDATE public.profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'tambuaafrica@gmail.com');

-- Verify the admin user
SELECT 
  u.email,
  p.role,
  p.full_name
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'tambuaafrica@gmail.com';

-- If the user doesn't exist in auth.users, you need to create it in the Supabase Dashboard:
-- 1. Go to Authentication → Users
-- 2. Click "Add User" → "Create New User"
-- 3. Email: tambuaafrica@gmail.com
-- 4. Password: Tambuaafrica@2026
-- 5. Check "Auto Confirm User"
-- 6. Click "Create User"
-- 7. Then run this SQL again to set the role
