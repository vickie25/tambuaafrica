-- Adds gallery support for multiple destination images.
-- Run this in Supabase SQL editor.

alter table if exists public.destinations
add column if not exists images text[] default '{}'::text[];

-- Backfill existing cover image into gallery for rows that have none.
update public.destinations
set images = array[image]
where (images is null or cardinality(images) = 0)
  and image is not null
  and length(trim(image)) > 0;
