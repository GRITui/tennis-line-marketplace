-- Tennis Marketplace MVP migration (0001)
-- Mock ledger + location_text only. PostGIS / location_geo deferred post-MVP.
-- Run in Supabase SQL editor.

create extension if not exists "pgcrypto";
-- create extension if not exists "postgis"; -- FUTURE post-MVP
create extension if not exists "btree_gist";

do $$ begin create type user_role as enum ('PLAYER','COACH','ADMIN'); exception when duplicate_object then null; end $$;
do $$ begin create type surface_type as enum ('HARD','CLAY','GRASS'); exception when duplicate_object then null; end $$;
do $$ begin create type slot_status as enum ('OPEN','HELD','BOOKED'); exception when duplicate_object then null; end $$;
do $$ begin create type payment_status as enum ('PENDING','ESCROW_HELD','COMPLETED','REFUNDED','FAILED'); exception when duplicate_object then null; end $$;
do $$ begin create type booking_source as enum ('LINE_LIFF','MANUAL_ADMIN'); exception when duplicate_object then null; end $$;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  line_uid text unique,
  role user_role not null default 'PLAYER',
  name text not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_users_line_uid on users(line_uid);

create table if not exists courts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  surface_type surface_type not null,
  location_text text not null,
  hourly_rate integer not null check (hourly_rate >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists slots (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references users(id) on delete restrict,
  court_id uuid not null references courts(id) on delete restrict,
  start_time timestamptz not null,
  end_time timestamptz not null check (end_time > start_time),
  bundled_price integer not null check (bundled_price >= 0),
  status slot_status not null default 'OPEN',
  held_expires_at timestamptz,
  held_by uuid references users(id),
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_slots_coach_time on slots(coach_id, start_time);
create index if not exists idx_slots_court_time on slots(court_id, start_time);
create index if not exists idx_slots_status_time on slots(status, start_time);

do $$ begin
  alter table slots add constraint no_overlap_coach
    exclude using gist (coach_id with =, tstzrange(start_time, end_time) with &&)
    where (status in ('OPEN','HELD','BOOKED'));
exception when duplicate_object then null; end $$;
do $$ begin
  alter table slots add constraint no_overlap_court
    exclude using gist (court_id with =, tstzrange(start_time, end_time) with &&)
    where (status in ('OPEN','HELD','BOOKED'));
exception when duplicate_object then null; end $$;

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references slots(id) on delete restrict,
  player_id uuid not null references users(id) on delete restrict,
  payment_status payment_status not null default 'PENDING',
  source booking_source not null default 'LINE_LIFF',
  amount_total integer not null check (amount_total >= 0),
  platform_fee integer not null default 0,
  coach_payout integer not null default 0,
  provider text not null default 'MOCK' check (provider in ('MOCK','OMISE')),
  omise_charge_id text unique,
  idempotency_key text unique not null default encode(gen_random_bytes(16),'hex'),
  escrow_release_at timestamptz,
  refunded_at timestamptz,
  reschedule_token uuid default null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(slot_id)
);
create index if not exists idx_bookings_player on bookings(player_id, created_at desc);
create index if not exists idx_bookings_release on bookings(escrow_release_at) where payment_status='ESCROW_HELD';

create table if not exists progress_logs (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  player_id uuid not null references users(id) on delete restrict,
  coach_id uuid not null references users(id) on delete restrict,
  focus_areas text[] not null default '{}',
  rating smallint check (rating between 1 and 5),
  notes text,
  media_url text,
  created_at timestamptz not null default now()
);
create index if not exists idx_logs_player on progress_logs(player_id, created_at desc);

create table if not exists commission_rules (
  id uuid primary key default gen_random_uuid(),
  platform_fee_percent numeric(5,2) not null default 15.00,
  flat_fee integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;
drop trigger if exists trg_users on users; create trigger trg_users before update on users for each row execute function touch_updated_at();
drop trigger if exists trg_courts on courts; create trigger trg_courts before update on courts for each row execute function touch_updated_at();
drop trigger if exists trg_slots on slots; create trigger trg_slots before update on slots for each row execute function touch_updated_at();
drop trigger if exists trg_bookings on bookings; create trigger trg_bookings before update on bookings for each row execute function touch_updated_at();

alter table users enable row level security;
alter table courts enable row level security;
alter table slots enable row level security;
alter table bookings enable row level security;
alter table progress_logs enable row level security;
alter table commission_rules enable row level security;

drop policy if exists "public read courts" on courts; create policy "public read courts" on courts for select using (is_active=true);
drop policy if exists "public read open slots" on slots; create policy "public read open slots" on slots for select using (status='OPEN');
drop policy if exists "public read commission" on commission_rules; create policy "public read commission" on commission_rules for select using (is_active=true);
