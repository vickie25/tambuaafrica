-- Adds draft/published workflow for blogs.
-- Run in Supabase SQL editor.

begin;

alter table if exists public.blogs
add column if not exists status text default 'published';

update public.blogs
set status = 'published'
where status is null or btrim(status) = '';

alter table public.blogs
alter column status set not null;

alter table public.blogs
drop constraint if exists blogs_status_check;

alter table public.blogs
add constraint blogs_status_check
check (status in ('draft', 'published'));

create index if not exists blogs_status_idx on public.blogs(status);

commit;
