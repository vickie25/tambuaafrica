-- Align destination_lodges RLS with other admin tables (case-insensitive role, authenticated role).
-- Run in Supabase SQL Editor if inserts/updates/deletes fail for admins whose profile role is not exactly 'admin'.

begin;

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
      where p.id = auth.uid()
        and lower(coalesce(p.role, '')) = 'admin'
    )
  );

drop policy if exists "Admins can update destination lodges" on public.destination_lodges;
create policy "Admins can update destination lodges"
  on public.destination_lodges for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and lower(coalesce(p.role, '')) = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and lower(coalesce(p.role, '')) = 'admin'
    )
  );

drop policy if exists "Admins can delete destination lodges" on public.destination_lodges;
create policy "Admins can delete destination lodges"
  on public.destination_lodges for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and lower(coalesce(p.role, '')) = 'admin'
    )
  );

commit;
