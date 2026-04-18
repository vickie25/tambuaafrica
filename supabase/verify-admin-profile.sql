-- Verify admin user profile exists with correct role
-- Run this in Supabase SQL Editor

-- Check if the user exists in auth.users
SELECT 
  id,
  email,
  created_at
FROM auth.users 
WHERE email = 'tambuaafrica@gmail.com';

-- Check if the profile exists in public.profiles
SELECT 
  p.id,
  p.full_name,
  p.role,
  p.created_at,
  u.email
FROM public.profiles p
LEFT JOIN auth.users u ON u.id = p.id
WHERE u.email = 'tambuaafrica@gmail.com';

-- If profile doesn't exist or role is not 'admin', run this to fix:
-- INSERT INTO public.profiles (id, full_name, role)
-- VALUES (
--   (SELECT id FROM auth.users WHERE email = 'tambuaafrica@gmail.com'),
--   'Admin User',
--   'admin'
-- )
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Update role if profile exists but role is wrong
UPDATE public.profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'tambuaafrica@gmail.com');

-- Verify the fix
SELECT 
  p.id,
  p.full_name,
  p.role,
  u.email
FROM public.profiles p
LEFT JOIN auth.users u ON u.id = p.id
WHERE u.email = 'tambuaafrica@gmail.com';
