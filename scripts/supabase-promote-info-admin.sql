-- Promote info@tambuaafrica.com to admin in public.profiles and refresh is_admin().
-- Run in: Supabase Dashboard → SQL → New query.
--
-- Prerequisite: the user must already exist under Authentication → Users
-- (e.g. invite them or create via Dashboard / node update-admin.js with service role).
-- If this affects 0 rows, no matching auth.users email was found.

begin;

insert into public.profiles (id, full_name, phone, role, created_at, updated_at)
select
  u.id,
  coalesce(nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''), 'Tambua Africa Admin'),
  coalesce(nullif(trim(u.raw_user_meta_data ->> 'phone'), ''), ''),
  'admin',
  coalesce(u.created_at, now()),
  now()
from auth.users u
where lower(trim(coalesce(u.email, ''))) = 'info@tambuaafrica.com'
on conflict (id) do update set
  role = 'admin',
  full_name = coalesce(
    nullif(trim(excluded.full_name), ''),
    nullif(trim(public.profiles.full_name), ''),
    'Tambua Africa Admin'
  ),
  updated_at = now();

create or replace function public.is_admin(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = _user_id
      and lower(coalesce(p.role, '')) = 'admin'
  )
  or exists (
    select 1
    from auth.users u
    where u.id = _user_id
      and lower(trim(coalesce(u.email, ''))) = 'info@tambuaafrica.com'
  );
$$;

commit;
