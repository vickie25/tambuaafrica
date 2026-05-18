-- Site marketing copy (homepage services strip + lodges service hero).
-- Run in Supabase SQL Editor once. Then edit text from Admin → "Home & services text".

create table if not exists public.site_marketing_blocks (
  id text primary key,
  eyebrow text not null default '',
  headline text not null default '',
  body text not null default '',
  updated_at timestamptz not null default now()
);

create or replace function public.set_site_marketing_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_site_marketing_updated_at on public.site_marketing_blocks;
create trigger trg_site_marketing_updated_at
  before update on public.site_marketing_blocks
  for each row
  execute function public.set_site_marketing_updated_at();


alter table public.site_marketing_blocks enable row level security;

drop policy if exists "public_read_site_marketing_blocks" on public.site_marketing_blocks;
create policy "public_read_site_marketing_blocks"
on public.site_marketing_blocks
for select
to anon, authenticated
using (true);

drop policy if exists "admin_insert_site_marketing_blocks" on public.site_marketing_blocks;
create policy "admin_insert_site_marketing_blocks"
on public.site_marketing_blocks
for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and lower(coalesce(p.role, '')) = 'admin'
  )
  or lower(coalesce(auth.jwt() ->> 'email', '')) in ('info@tambua-africa.com', 'isaac@tambua-africa.com', 'jorim@tambua-africa.com')
);

drop policy if exists "admin_update_site_marketing_blocks" on public.site_marketing_blocks;
create policy "admin_update_site_marketing_blocks"
on public.site_marketing_blocks
for update
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and lower(coalesce(p.role, '')) = 'admin'
  )
  or lower(coalesce(auth.jwt() ->> 'email', '')) in ('info@tambua-africa.com', 'isaac@tambua-africa.com', 'jorim@tambua-africa.com')
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and lower(coalesce(p.role, '')) = 'admin'
  )
  or lower(coalesce(auth.jwt() ->> 'email', '')) in ('info@tambua-africa.com', 'isaac@tambua-africa.com', 'jorim@tambua-africa.com')
);

insert into public.site_marketing_blocks (id, eyebrow, headline, body)
values
  (
    'home_services_intro',
    'Beyond the safari vehicle',
    'Ticketing, transfers & lodges',
    'Tambua Africa supports the full trip, not only game drives. We help clients with tickets, ground and air connections, and lodge reservations so logistics feel effortless.'
  ),
  (
    'lodges_service_hero',
    'On your behalf',
    'Lodge & camp booking in Kenya',
    'We reserve safari lodges, tented camps, Nairobi and Mombasa hotels, and selected campsites according to your budget, dates, and style, then align confirmations with your tickets and transfers.'
  )
on conflict (id) do nothing;
