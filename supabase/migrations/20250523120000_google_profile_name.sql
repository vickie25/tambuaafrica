-- Use Google display name when creating profiles (OAuth users).
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
    COALESCE(
      NULLIF(trim(NEW.raw_user_meta_data ->> 'full_name'), ''),
      NULLIF(trim(NEW.raw_user_meta_data ->> 'name'), ''),
      split_part(COALESCE(NEW.email, ''), '@', 1),
      ''
    ),
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'phone', ''), ''),
    CASE WHEN lower(COALESCE(NEW.email, '')) IN ('info@tambua-africa.com', 'isaac@tambua-africa.com', 'jorim@tambua-africa.com') THEN 'admin' ELSE 'user' END
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = CASE
      WHEN trim(public.profiles.full_name) = '' THEN EXCLUDED.full_name
      ELSE public.profiles.full_name
    END,
    phone = COALESCE(public.profiles.phone, EXCLUDED.phone),
    role = CASE WHEN public.profiles.role = 'admin' THEN 'admin' ELSE EXCLUDED.role END,
    updated_at = now();
  RETURN NEW;
END;
$$;
