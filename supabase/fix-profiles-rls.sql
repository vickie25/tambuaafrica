-- Fix infinite recursion in profiles table RLS policies
-- Run this in Supabase SQL Editor

-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create a fixed policy that doesn't query profiles within profiles
-- This policy allows authenticated users to view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Create a policy for admins to view all profiles
-- This uses a simpler check without querying profiles table
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    -- Check if user email is admin (bypasses profiles table)
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'tambuaafrica@gmail.com'
  );

-- Create update policy
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create insert policy
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Verify the policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';
