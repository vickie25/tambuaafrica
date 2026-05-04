-- Run in Supabase SQL editor to enable admin CRUD for lodges.

begin;

create table if not exists public.destination_lodges (
  id text primary key,
  destination_id text not null,
  destination_name text not null,
  name text not null,
  category text not null check (category in ('luxury', 'mid-range', 'budget', 'camp')),
  description text not null,
  story text not null,
  features text[] default '{}'::text[],
  image text not null,
  images text[] default '{}'::text[],
  website text,
  "order" integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists destination_lodges_destination_idx on public.destination_lodges(destination_id);
create index if not exists destination_lodges_order_idx on public.destination_lodges("order");

alter table public.destination_lodges enable row level security;

drop policy if exists "Everyone can view destination lodges" on public.destination_lodges;
create policy "Everyone can view destination lodges"
  on public.destination_lodges for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can insert destination lodges" on public.destination_lodges;
create policy "Admins can insert destination lodges"
  on public.destination_lodges for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and lower(coalesce(p.role, '')) = 'admin'
    )
  );

drop policy if exists "Admins can update destination lodges" on public.destination_lodges;
create policy "Admins can update destination lodges"
  on public.destination_lodges for update
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

drop policy if exists "Admins can delete destination lodges" on public.destination_lodges;
create policy "Admins can delete destination lodges"
  on public.destination_lodges for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and lower(coalesce(p.role, '')) = 'admin'
    )
  );

create or replace function public.update_destination_lodges_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_destination_lodges_updated_at on public.destination_lodges;
create trigger update_destination_lodges_updated_at
before update on public.destination_lodges
for each row execute function public.update_destination_lodges_updated_at();

commit;
