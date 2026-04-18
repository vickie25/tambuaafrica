-- ============================================
-- Create Admin Superuser
-- Run this SQL to create an admin user manually
-- ============================================

-- Option 1: If you already have a user in the auth.users table,
-- update their profile to be an admin:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';

-- Option 2: Create a new admin user (requires the user to sign up first via the UI)
-- After the user signs up, run:
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE id = 'USER_ID_FROM_AUTH.USERS';

-- To find the user ID after they sign up:
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Then update their profile:
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'THE_USER_ID';

-- ============================================
-- Example: Set tambuaafrica@gmail.com as admin
-- ============================================
-- First, ensure the user has signed up, then run:
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'tambuaafrica@gmail.com' LIMIT 1);