-- Enables 'gallery' as a valid section for carousel_images.
-- Run this in Supabase SQL editor if gallery writes return 400.

begin;

alter table public.carousel_images
drop constraint if exists carousel_images_section_check;

alter table public.carousel_images
add constraint carousel_images_section_check
check (
  section in (
    'hero',
    'activities',
    'destinations',
    'gallery',
    'feature_wild',
    'feature_culture',
    'feature_luxury'
  )
);

commit;
