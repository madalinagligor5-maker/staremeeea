create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.energy_level as enum ('low','medium','high');
create type public.task_status as enum ('todo','doing','done','reschedule');
create type public.content_access as enum ('free','plus');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text check (char_length(first_name) <= 80),
  avatar_path text,
  locale text not null default 'ro' check (locale in ('ro','en')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.user_preferences (
  id uuid primary key default gen_random_uuid(), user_id uuid not null unique references auth.users(id) on delete cascade,
  goals text[] not null default '{}', challenges text[] not null default '{}', daily_view text not null default 'important' check (daily_view in ('important','complete')),
  marketing_opt_in boolean not null default false, weekly_reflection_opt_in boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.wellbeing_consents (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  consented boolean not null, policy_version text not null, consented_at timestamptz not null default now(), withdrawn_at timestamptz
);
create table public.daily_checkins (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  checkin_date date not null default current_date, state text not null check (state in ('calm','foggy','agitated','overwhelmed','focused','sensitive','low_energy','well')),
  energy smallint not null check (energy between 1 and 5), focus smallint check (focus between 1 and 5), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id, checkin_date)
);
create table public.tasks (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 240), notes text, due_date date, estimated_minutes integer check (estimated_minutes > 0), energy public.energy_level, category text,
  priority smallint not null default 2 check (priority between 1 and 3), status public.task_status not null default 'todo', sort_order integer not null default 0, completed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.task_steps (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, task_id uuid not null references public.tasks(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 240), is_complete boolean not null default false, sort_order integer not null default 0, created_at timestamptz not null default now()
);
create table public.brain_dump_items (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000), bucket text not null default 'inbox' check (bucket in ('inbox','today','week','later')), sort_order integer not null default 0, converted_task_id uuid references public.tasks(id) on delete set null, created_at timestamptz not null default now()
);
create table public.focus_sessions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  task_label text not null check (char_length(task_label) <= 240), planned_minutes integer not null check (planned_minutes between 1 and 240), completed_minutes integer not null default 0 check (completed_minutes between 0 and 240), outcome text check (outcome in ('continued','break','done')), started_at timestamptz not null default now(), ended_at timestamptz
);
create table public.journal_entries (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null default 'free' check (mode in ('free','guided')), prompt_id uuid, title text, body text not null check (char_length(body) <= 50000), is_favorite boolean not null default false, entry_date date not null default current_date, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.calm_exercises (
  id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique, category text not null, minutes smallint not null check (minutes in (1,3,5,10)), body text not null,
  audio_url text, illustration_path text, access public.content_access not null default 'free', is_published boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.calm_sessions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, exercise_id uuid references public.calm_exercises(id) on delete set null,
  minutes smallint not null check (minutes between 1 and 60), completed boolean not null default false, created_at timestamptz not null default now()
);
create table public.resource_categories (id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique, sort_order integer not null default 0);
create table public.resources (
  id uuid primary key default gen_random_uuid(), category_id uuid references public.resource_categories(id) on delete set null, title text not null, slug text not null unique, excerpt text,
  body text, resource_type text not null check (resource_type in ('article','guide','workbook','audio','program')), access public.content_access not null default 'free', cover_path text, is_published boolean not null default false, published_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.programs (id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique, description text, access public.content_access not null default 'plus', is_published boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.program_modules (id uuid primary key default gen_random_uuid(), program_id uuid not null references public.programs(id) on delete cascade, day_number integer not null check (day_number > 0), title text not null, body text, exercise jsonb not null default '{}'::jsonb, checklist jsonb not null default '[]'::jsonb, journal_prompt text, unique(program_id, day_number));
create table public.program_progress (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, program_id uuid not null references public.programs(id) on delete cascade, module_id uuid not null references public.program_modules(id) on delete cascade, completed_at timestamptz not null default now(), unique(user_id,module_id));
create table public.templates (id uuid primary key default gen_random_uuid(), category text not null, title text not null, description text, access public.content_access not null default 'free', is_published boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.template_steps (id uuid primary key default gen_random_uuid(), template_id uuid not null references public.templates(id) on delete cascade, title text not null, sort_order integer not null default 0);
create table public.subscriptions (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, stripe_customer_id text not null, stripe_subscription_id text not null unique, status text not null, current_period_end timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.purchases (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, stripe_checkout_session_id text not null unique, product_key text, status text not null, created_at timestamptz not null default now());
create table public.entitlements (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, entitlement_key text not null, source text not null, source_id text, active boolean not null default true, granted_at timestamptz not null default now(), expires_at timestamptz, unique(user_id, entitlement_key, source_id));
create table public.testimonials (id uuid primary key default gen_random_uuid(), display_name text not null, quote text not null, verification_note text, is_verified boolean not null default false, is_published boolean not null default false, sort_order integer not null default 0, created_at timestamptz not null default now());
create table public.newsletter_subscribers (id uuid primary key default gen_random_uuid(), email text not null unique, marketing_consent boolean not null default false, consented_at timestamptz, created_at timestamptz not null default now());
create table public.site_content (id uuid primary key default gen_random_uuid(), content_key text not null unique, value jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now());
create table public.journal_prompts (id uuid primary key default gen_random_uuid(), prompt text not null, is_published boolean not null default false, sort_order integer not null default 0);

create or replace function private.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin insert into public.profiles (id, first_name) values (new.id, left(coalesce(new.raw_user_meta_data ->> 'first_name',''),80)); return new; end; $$;
revoke all on function private.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.wellbeing_consents enable row level security;
alter table public.daily_checkins enable row level security;
alter table public.tasks enable row level security;
alter table public.task_steps enable row level security;
alter table public.brain_dump_items enable row level security;
alter table public.focus_sessions enable row level security;
alter table public.journal_entries enable row level security;
alter table public.calm_sessions enable row level security;
alter table public.program_progress enable row level security;
alter table public.subscriptions enable row level security;
alter table public.purchases enable row level security;
alter table public.entitlements enable row level security;

do $$ declare t text; begin foreach t in array array['profiles','user_preferences','wellbeing_consents','daily_checkins','tasks','task_steps','brain_dump_items','focus_sessions','journal_entries','calm_sessions','program_progress'] loop
  execute format('create policy %I on public.%I for select to authenticated using ((select auth.uid()) = %s)', t||'_select_own', t, case when t='profiles' then 'id' else 'user_id' end);
  execute format('create policy %I on public.%I for insert to authenticated with check ((select auth.uid()) = %s)', t||'_insert_own', t, case when t='profiles' then 'id' else 'user_id' end);
  execute format('create policy %I on public.%I for update to authenticated using ((select auth.uid()) = %s) with check ((select auth.uid()) = %s)', t||'_update_own', t, case when t='profiles' then 'id' else 'user_id' end, case when t='profiles' then 'id' else 'user_id' end);
  execute format('create policy %I on public.%I for delete to authenticated using ((select auth.uid()) = %s)', t||'_delete_own', t, case when t='profiles' then 'id' else 'user_id' end);
end loop; end $$;

create policy subscriptions_select_own on public.subscriptions for select to authenticated using ((select auth.uid()) = user_id);
create policy purchases_select_own on public.purchases for select to authenticated using ((select auth.uid()) = user_id);
create policy entitlements_select_own on public.entitlements for select to authenticated using ((select auth.uid()) = user_id);

do $$ declare t text; begin foreach t in array array['calm_exercises','resource_categories','resources','programs','program_modules','templates','template_steps','testimonials','site_content','journal_prompts'] loop execute format('alter table public.%I enable row level security', t); end loop; end $$;
create policy calm_exercises_public_read on public.calm_exercises for select to anon, authenticated using (is_published);
create policy categories_public_read on public.resource_categories for select to anon, authenticated using (true);
create policy resources_public_read on public.resources for select to anon, authenticated using (is_published);
create policy programs_public_read on public.programs for select to anon, authenticated using (is_published);
create policy modules_public_read on public.program_modules for select to anon, authenticated using (exists(select 1 from public.programs p where p.id=program_id and p.is_published));
create policy templates_public_read on public.templates for select to authenticated using (is_published);
create policy template_steps_read on public.template_steps for select to authenticated using (exists(select 1 from public.templates t where t.id=template_id and t.is_published));
create policy testimonials_verified_read on public.testimonials for select to anon, authenticated using (is_verified and is_published);
create policy site_content_public_read on public.site_content for select to anon, authenticated using (true);
create policy journal_prompts_read on public.journal_prompts for select to authenticated using (is_published);

do $$ declare t text; begin foreach t in array array['calm_exercises','resource_categories','resources','programs','program_modules','templates','template_steps','testimonials','site_content','journal_prompts'] loop execute format('create policy %I on public.%I for all to authenticated using ((select auth.jwt()->''app_metadata''->>''role'') = ''admin'') with check ((select auth.jwt()->''app_metadata''->>''role'') = ''admin'')', t||'_admin_all', t); end loop; end $$;

alter table public.newsletter_subscribers enable row level security;
create policy newsletter_explicit_consent_insert on public.newsletter_subscribers for insert to anon, authenticated with check (marketing_consent = true and consented_at is not null);

create index daily_checkins_user_date_idx on public.daily_checkins(user_id, checkin_date desc);
create index tasks_user_due_idx on public.tasks(user_id, due_date, status);
create index focus_sessions_user_started_idx on public.focus_sessions(user_id, started_at desc);
create index journal_entries_user_date_idx on public.journal_entries(user_id, entry_date desc);
create index subscriptions_user_status_idx on public.subscriptions(user_id, status);

insert into public.calm_exercises (title, slug, category, minutes, body, access, is_published) values
('Respirația în patru colțuri','respiratia-in-patru-colturi','Sunt copleșită',3,'Așază-te confortabil. Inspiră blând numărând până la patru. Fă o pauză scurtă. Expiră lent până la patru. Repetă fără să forțezi ritmul.','free',true),
('Privește cinci lucruri','priveste-cinci-lucruri','Am prea multe gânduri',1,'Privește în jur și numește, în gând, cinci lucruri pe care le vezi. Nu trebuie să le descrii sau să le judeci.','free',true);
insert into public.templates (category,title,description,access,is_published) values ('Curățenie','Bucătăria, pas cu pas','Un început mic pentru o bucătărie care pare prea mult.','free',true);
insert into public.template_steps (template_id,title,sort_order) select id, step, ord from public.templates cross join lateral unnest(array['Pune cinci lucruri la loc.','Strânge vasele.','Aruncă gunoiul.','Curăță o singură suprafață.']) with ordinality s(step,ord) where title='Bucătăria, pas cu pas';
insert into public.journal_prompts (prompt,is_published,sort_order) values ('Ce îți ocupă mintea acum?',true,1),('Ce poți lăsa pentru mâine?',true,2),('Ce ai făcut mai bine decât crezi?',true,3);
