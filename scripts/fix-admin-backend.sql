-- Admin backend reliability fix
-- Run this in Supabase SQL Editor.

begin;

-- 1) Ensure every auth user has a profile row (required by admin role checks).
insert into public.profiles (id, full_name, role, created_at, updated_at)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', split_part(coalesce(u.email, ''), '@', 1), 'User'),
  case
    when lower(coalesce(u.email, '')) in ('info@tambua-africa.com', 'isaac@tambua-africa.com', 'jorim@tambua-africa.com')
      then 'admin'
    else 'user'
  end,
  now(),
  now()
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- 2) Ensure storage buckets exist and are public for frontend image rendering.
insert into storage.buckets (id, name, public)
values ('safaris', 'safaris', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('carousel-images', 'carousel-images', true)
on conflict (id) do update set public = true;

-- 3) Allow authenticated users (admins in your UI) to upload/update/delete images.
-- Note: if you want stricter policies, replace "authenticated" with a custom role check.
drop policy if exists "authenticated_upload_safaris" on storage.objects;
create policy "authenticated_upload_safaris"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'safaris');

drop policy if exists "authenticated_update_safaris" on storage.objects;
create policy "authenticated_update_safaris"
on storage.objects
for update
to authenticated
using (bucket_id = 'safaris')
with check (bucket_id = 'safaris');

drop policy if exists "authenticated_delete_safaris" on storage.objects;
create policy "authenticated_delete_safaris"
on storage.objects
for delete
to authenticated
using (bucket_id = 'safaris');

drop policy if exists "authenticated_upload_carousel_images" on storage.objects;
create policy "authenticated_upload_carousel_images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'carousel-images');

drop policy if exists "authenticated_update_carousel_images" on storage.objects;
create policy "authenticated_update_carousel_images"
on storage.objects
for update
to authenticated
using (bucket_id = 'carousel-images')
with check (bucket_id = 'carousel-images');

drop policy if exists "authenticated_delete_carousel_images" on storage.objects;
create policy "authenticated_delete_carousel_images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'carousel-images');

commit;
