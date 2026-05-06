-- Showcase cards on /services/lodges-camps (image grid). Run once in Supabase SQL Editor.
-- If the table is empty, the app uses built-in defaults. Any row here replaces the whole grid with DB-backed cards.

create table if not exists public.lodges_service_cards (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  name text not null,
  area text not null,
  category text not null,
  note text not null,
  image_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_lodges_service_cards_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_lodges_service_cards_updated_at on public.lodges_service_cards;
create trigger trg_lodges_service_cards_updated_at
  before update on public.lodges_service_cards
  for each row
  execute function public.set_lodges_service_cards_updated_at();

create index if not exists lodges_service_cards_sort_idx on public.lodges_service_cards (sort_order);

alter table public.lodges_service_cards enable row level security;

drop policy if exists "public_read_lodges_service_cards" on public.lodges_service_cards;
create policy "public_read_lodges_service_cards"
on public.lodges_service_cards
for select
to anon, authenticated
using (true);

drop policy if exists "admin_insert_lodges_service_cards" on public.lodges_service_cards;
create policy "admin_insert_lodges_service_cards"
on public.lodges_service_cards
for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and lower(coalesce(p.role, '')) = 'admin'
  )
  or lower(coalesce(auth.jwt() ->> 'email', '')) in ('info@tambuaafrica.com')
);

drop policy if exists "admin_update_lodges_service_cards" on public.lodges_service_cards;
create policy "admin_update_lodges_service_cards"
on public.lodges_service_cards
for update
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and lower(coalesce(p.role, '')) = 'admin'
  )
  or lower(coalesce(auth.jwt() ->> 'email', '')) in ('info@tambuaafrica.com')
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and lower(coalesce(p.role, '')) = 'admin'
  )
  or lower(coalesce(auth.jwt() ->> 'email', '')) in ('info@tambuaafrica.com')
);

drop policy if exists "admin_delete_lodges_service_cards" on public.lodges_service_cards;
create policy "admin_delete_lodges_service_cards"
on public.lodges_service_cards
for delete
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and lower(coalesce(p.role, '')) = 'admin'
  )
  or lower(coalesce(auth.jwt() ->> 'email', '')) in ('info@tambuaafrica.com')
);
