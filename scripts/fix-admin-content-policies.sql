-- Fix visibility and admin-write policies for content managed in Admin UI.
-- Run this in Supabase SQL Editor.

begin;

-- Helper note:
-- The policy checks below allow writes only for admin users from profiles.role = 'admin'
-- or known admin emails.

-- =========================
-- blogs
-- =========================
alter table public.blogs enable row level security;

drop policy if exists "public_read_blogs" on public.blogs;
create policy "public_read_blogs"
on public.blogs
for select
to anon, authenticated
using (true);

drop policy if exists "admin_write_blogs_insert" on public.blogs;
create policy "admin_write_blogs_insert"
on public.blogs
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and lower(coalesce(p.role, '')) = 'admin'
  )
  or lower(coalesce(auth.jwt() ->> 'email', '')) in ('info@tambua-africa.com', 'isaac@tambua-africa.com', 'jorim@tambua-africa.com')
);

drop policy if exists "admin_write_blogs_update" on public.blogs;
create policy "admin_write_blogs_update"
on public.blogs
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and lower(coalesce(p.role, '')) = 'admin'
  )
  or lower(coalesce(auth.jwt() ->> 'email', '')) in ('info@tambua-africa.com', 'isaac@tambua-africa.com', 'jorim@tambua-africa.com')
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and lower(coalesce(p.role, '')) = 'admin'
  )
  or lower(coalesce(auth.jwt() ->> 'email', '')) in ('info@tambua-africa.com', 'isaac@tambua-africa.com', 'jorim@tambua-africa.com')
);

drop policy if exists "admin_write_blogs_delete" on public.blogs;
create policy "admin_write_blogs_delete"
on public.blogs
for delete
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and lower(coalesce(p.role, '')) = 'admin'
  )
  or lower(coalesce(auth.jwt() ->> 'email', '')) in ('info@tambua-africa.com', 'isaac@tambua-africa.com', 'jorim@tambua-africa.com')
);

-- =========================
-- safaris
-- =========================
alter table public.safaris enable row level security;

drop policy if exists "public_read_safaris" on public.safaris;
create policy "public_read_safaris"
on public.safaris
for select
to anon, authenticated
using (true);

drop policy if exists "admin_write_safaris_insert" on public.safaris;
create policy "admin_write_safaris_insert"
on public.safaris
for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and lower(coalesce(p.role, '')) = 'admin'
  )
);

drop policy if exists "admin_write_safaris_update" on public.safaris;
create policy "admin_write_safaris_update"
on public.safaris
for update
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and lower(coalesce(p.role, '')) = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and lower(coalesce(p.role, '')) = 'admin'
  )
);

drop policy if exists "admin_write_safaris_delete" on public.safaris;
create policy "admin_write_safaris_delete"
on public.safaris
for delete
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and lower(coalesce(p.role, '')) = 'admin'
  )
);

-- =========================
-- destinations
-- =========================
alter table public.destinations enable row level security;

drop policy if exists "public_read_destinations" on public.destinations;
create policy "public_read_destinations"
on public.destinations
for select
to anon, authenticated
using (true);

drop policy if exists "admin_write_destinations_insert" on public.destinations;
create policy "admin_write_destinations_insert"
on public.destinations
for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and lower(coalesce(p.role, '')) = 'admin'
  )
);

drop policy if exists "admin_write_destinations_update" on public.destinations;
create policy "admin_write_destinations_update"
on public.destinations
for update
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and lower(coalesce(p.role, '')) = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and lower(coalesce(p.role, '')) = 'admin'
  )
);

drop policy if exists "admin_write_destinations_delete" on public.destinations;
create policy "admin_write_destinations_delete"
on public.destinations
for delete
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and lower(coalesce(p.role, '')) = 'admin'
  )
);

-- =========================
-- carousel_images
-- =========================
alter table public.carousel_images enable row level security;

drop policy if exists "public_read_carousel_images" on public.carousel_images;
create policy "public_read_carousel_images"
on public.carousel_images
for select
to anon, authenticated
using (true);

drop policy if exists "admin_write_carousel_images_insert" on public.carousel_images;
create policy "admin_write_carousel_images_insert"
on public.carousel_images
for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and lower(coalesce(p.role, '')) = 'admin'
  )
);

drop policy if exists "admin_write_carousel_images_update" on public.carousel_images;
create policy "admin_write_carousel_images_update"
on public.carousel_images
for update
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and lower(coalesce(p.role, '')) = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and lower(coalesce(p.role, '')) = 'admin'
  )
);

drop policy if exists "admin_write_carousel_images_delete" on public.carousel_images;
create policy "admin_write_carousel_images_delete"
on public.carousel_images
for delete
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and lower(coalesce(p.role, '')) = 'admin'
  )
);

commit;
