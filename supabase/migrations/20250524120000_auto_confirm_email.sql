-- Auto-confirm new signups (app does not require email confirmation).
-- Also turn OFF "Confirm email" in Supabase Dashboard → Authentication → Providers → Email.

CREATE OR REPLACE FUNCTION public.auto_confirm_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
BEGIN
  UPDATE auth.users
  SET
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    updated_at = NOW()
  WHERE id = NEW.id
    AND email_confirmed_at IS NULL;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auto_confirm_auth_user_after_insert ON auth.users;
CREATE TRIGGER auto_confirm_auth_user_after_insert
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_auth_user();

-- Existing accounts stuck before this migration
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;
