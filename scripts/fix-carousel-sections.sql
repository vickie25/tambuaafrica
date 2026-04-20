-- Add section support for carousel images so admin can target
-- specific homepage sections (hero, activities, destinations).
-- Run in Supabase SQL editor.

begin;

alter table public.carousel_images
add column if not exists section text;

update public.carousel_images
set section = 'hero'
where section is null or btrim(section) = '';

alter table public.carousel_images
alter column section set default 'hero';

alter table public.carousel_images
alter column section set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'carousel_images_section_check'
  ) then
    alter table public.carousel_images
    add constraint carousel_images_section_check
    check (section in ('hero', 'activities', 'destinations'));
  end if;
end
$$;

commit;
