-- Extend carousel section values to support homepage feature heroes:
-- - feature_wild
-- - feature_culture
-- - feature_luxury
--
-- Run this in Supabase SQL editor.

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
    'feature_wild',
    'feature_culture',
    'feature_luxury'
  )
);

commit;
