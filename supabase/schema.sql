create table if not exists public.issues (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text not null,
  room_area text,
  room_detail text,
  responses text[] default '{}',
  unit text,
  street_number text not null,
  street_name text not null,
  city text not null,
  area text,
  postcode text,
  reported_to_landlord_on date not null,
  handle text default 'Anonymous',
  status text not null default 'open',
  resolved_at timestamptz,
  resolved_note text,
  manage_code text not null,
  hidden boolean not null default false,
  posted_at timestamptz not null default now(),
  photo_urls text[] default '{}'
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  message text not null,
  email text,
  created_at timestamptz not null default now(),
  read boolean not null default false
);

alter table public.issues enable row level security;
alter table public.contact_messages enable row level security;

-- Public visitors do not talk to the tables directly.
-- The Next.js server uses the service role key.

insert into storage.buckets (id, name, public)
values ('issue-photos', 'issue-photos', true)
on conflict (id) do nothing;
