-- ─────────────────────────────────────────────────────────────
--  Marta's Halloween Night — RSVP guestbook schema
--  Run once in Supabase → SQL Editor (or `supabase db push`).
--  Safe to re-run: every statement is idempotent.
-- ─────────────────────────────────────────────────────────────

create extension if not exists pgcrypto;

-- The guestbook itself ------------------------------------------------------
create table if not exists public.rsvps (
  id              uuid primary key default gen_random_uuid(),
  name            text not null check (char_length(name) between 1 and 80),
  -- normalised, lower-cased name used to stop duplicate signatures
  name_key        text not null unique check (char_length(name_key) between 1 and 80),
  status          text not null check (status in ('yes', 'no', 'maybe')),
  note            text check (note is null or char_length(note) <= 500),
  -- sha-256 of the secret token the guest's browser keeps to edit their RSVP
  edit_token_hash text not null,
  -- salted hash of the submitter's IP (never the raw IP)
  ip_hash         text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists rsvps_status_idx on public.rsvps (status);
create index if not exists rsvps_created_at_idx on public.rsvps (created_at desc);

create or replace function public.rsvps_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists rsvps_touch_updated_at on public.rsvps;
create trigger rsvps_touch_updated_at
  before update on public.rsvps
  for each row execute function public.rsvps_touch_updated_at();

-- Rate-limit ledger (one row per write attempt) -----------------------------
create table if not exists public.rate_limit_events (
  id         bigint generated always as identity primary key,
  bucket     text not null,
  key_hash   text not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_events_lookup_idx
  on public.rate_limit_events (bucket, key_hash, created_at desc);

-- Row Level Security ---------------------------------------------------------
-- RLS is ON and there are deliberately NO policies for `anon` or
-- `authenticated`: the public Supabase API cannot read, insert, update or
-- delete a single row. Every operation goes through the website's server
-- routes, which use the service_role key (which bypasses RLS) and enforce
-- validation, rate limiting and admin authorisation themselves.
alter table public.rsvps enable row level security;
alter table public.rsvps force row level security;
alter table public.rate_limit_events enable row level security;
alter table public.rate_limit_events force row level security;

revoke all on table public.rsvps from anon, authenticated;
revoke all on table public.rate_limit_events from anon, authenticated;
grant all on table public.rsvps to service_role;
grant all on table public.rate_limit_events to service_role;

-- Housekeeping: drop rate-limit rows older than two days whenever new ones
-- arrive, so the ledger never grows unbounded.
create or replace function public.rate_limit_events_prune()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  delete from public.rate_limit_events where created_at < now() - interval '2 days';
  return null;
end;
$$;

drop trigger if exists rate_limit_events_prune on public.rate_limit_events;
create trigger rate_limit_events_prune
  after insert on public.rate_limit_events
  for each statement execute function public.rate_limit_events_prune();
