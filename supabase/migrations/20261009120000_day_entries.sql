-- Cartea: o intrare pe zi și pe utilizator. Conținutul paginilor (Azi, Acum, Seara) stă în jsonb.
create table public.day_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  level text check (level in ('buna','obosita','grea')),
  azi jsonb not null default '{}'::jsonb,
  acum jsonb not null default '{}'::jsonb,
  seara jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, entry_date),
  check (pg_column_size(azi) < 65536 and pg_column_size(acum) < 65536 and pg_column_size(seara) < 65536)
);

create index day_entries_user_date_idx on public.day_entries (user_id, entry_date desc);

alter table public.day_entries enable row level security;

create policy day_entries_select_own on public.day_entries for select to authenticated using ((select auth.uid()) = user_id);
create policy day_entries_insert_own on public.day_entries for insert to authenticated with check ((select auth.uid()) = user_id);
create policy day_entries_update_own on public.day_entries for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy day_entries_delete_own on public.day_entries for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on table public.day_entries from anon, authenticated;
grant select, insert, update, delete on table public.day_entries to authenticated;
