-- Lista de așteptare pentru lansare, cu double opt-in.
-- Accesată doar din rutele server (cheia secretă / service role). Fără acces public.
create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  confirm_token text not null unique default replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
  unsubscribe_token text not null unique default replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
  consent_text text not null,
  consented_at timestamptz not null default now(),
  confirmation_sent_at timestamptz,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  source text,
  created_at timestamptz not null default now()
);

create unique index waitlist_email_key on public.waitlist (lower(email));

alter table public.waitlist enable row level security;
revoke all on table public.waitlist from anon, authenticated;
