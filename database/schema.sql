-- ============================================================================
-- CafeBook — Supabase PostgreSQL schema
-- Run this file once in the Supabase SQL Editor (or as a migration).
-- It creates extensions, tables, constraints, indexes, RLS policies,
-- triggers, and the transaction-safe booking functions.
-- ============================================================================

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

-- ----------------------------------------------------------------------------
-- profiles (one row per Supabase Auth user)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null check (char_length(trim(full_name)) between 2 and 80),
  email       text not null unique,
  phone       text check (phone is null or char_length(phone) between 7 and 20),
  role        text not null default 'customer' check (role in ('customer', 'admin')),
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- cafes
-- ----------------------------------------------------------------------------
create table if not exists public.cafes (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text not null,
  address       text not null,
  phone         text,
  email         text,
  opening_time  time not null default '10:00',
  closing_time  time not null default '22:00',
  timezone      text not null default 'Asia/Kolkata',
  facilities    text[] not null default '{}',
  image_url     text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  constraint cafes_hours_valid check (opening_time < closing_time)
);

-- ----------------------------------------------------------------------------
-- cafe_tables
-- ----------------------------------------------------------------------------
create table if not exists public.cafe_tables (
  id            uuid primary key default gen_random_uuid(),
  cafe_id       uuid not null references public.cafes (id) on delete cascade,
  table_number  integer not null check (table_number > 0),
  capacity      integer not null check (capacity between 1 and 20),
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  constraint cafe_tables_number_unique unique (cafe_id, table_number)
);

-- ----------------------------------------------------------------------------
-- menu_items
-- ----------------------------------------------------------------------------
create table if not exists public.menu_items (
  id            uuid primary key default gen_random_uuid(),
  cafe_id       uuid not null references public.cafes (id) on delete cascade,
  item_name     text not null check (char_length(trim(item_name)) between 2 and 100),
  description   text not null default '',
  price         numeric(10, 2) not null check (price >= 0),
  category      text not null check (
    category in ('Coffee', 'Tea', 'Cold Drinks', 'Breakfast', 'Mains', 'Desserts', 'Snacks')
  ),
  image_url     text,
  is_available  boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- bookings
-- The exclusion constraint is the hard guarantee against double-booking a
-- table for overlapping active reservations, even under concurrent requests.
-- ----------------------------------------------------------------------------
create table if not exists public.bookings (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.profiles (id) on delete cascade,
  cafe_id            uuid not null references public.cafes (id) on delete cascade,
  table_id           uuid not null references public.cafe_tables (id) on delete restrict,
  booking_date       date not null,
  start_time         time not null,
  end_time           time not null,
  guests             integer not null check (guests between 1 and 20),
  status             text not null default 'pending'
                       check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  booking_reference  text not null unique
                       check (booking_reference ~ '^CB-[A-Z0-9]{8}$'),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint bookings_time_valid check (start_time < end_time),
  constraint bookings_no_overlap
    exclude using gist (
      table_id with =,
      tsrange(booking_date + start_time, booking_date + end_time) with &&
    ) where (status in ('pending', 'confirmed'))
);

-- A customer cannot hold two active bookings for the same cafe + slot.
create unique index if not exists bookings_active_user_slot_unique
  on public.bookings (user_id, cafe_id, booking_date, start_time)
  where status in ('pending', 'confirmed');

create index if not exists bookings_table_date_idx
  on public.bookings (table_id, booking_date);
create index if not exists bookings_user_idx
  on public.bookings (user_id, booking_date desc);
create index if not exists bookings_status_idx
  on public.bookings (status);
create index if not exists bookings_date_idx
  on public.bookings (booking_date, start_time);
create index if not exists menu_items_cafe_idx
  on public.menu_items (cafe_id, category);
create index if not exists cafe_tables_cafe_idx
  on public.cafe_tables (cafe_id, is_active);

-- ----------------------------------------------------------------------------
-- Helper: updated_at maintenance
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Helper: role check used by RLS policies
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ----------------------------------------------------------------------------
-- Auto-create a customer profile whenever a Supabase Auth user is created.
-- Role is ALWAYS customer here; admin promotion happens server-side only.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone, role)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      split_part(new.email, '@', 1)
    ),
    new.email,
    nullif(trim(new.raw_user_meta_data ->> 'phone'), ''),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- create_booking
-- Single transaction: validates opening hours, past dates, capacity, duplicate
-- bookings, and relies on the exclusion constraint for overlapping slots.
-- Custom SQLSTATEs are mapped to friendly API errors by the Express backend.
-- ----------------------------------------------------------------------------
create or replace function public.create_booking(
  p_user_id       uuid,
  p_cafe_id       uuid,
  p_table_id      uuid,
  p_booking_date  date,
  p_start_time    time,
  p_guests        integer
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cafe       public.cafes%rowtype;
  v_table      public.cafe_tables%rowtype;
  v_booking    public.bookings%rowtype;
  v_now        timestamp;
  v_end_time   time;
  v_reference  text;
  v_minutes    numeric;
begin
  select * into v_cafe
  from public.cafes
  where id = p_cafe_id and is_active = true;

  if not found then
    raise exception 'CAFE_NOT_FOUND' using errcode = 'CB001';
  end if;

  select * into v_table
  from public.cafe_tables
  where id = p_table_id and cafe_id = p_cafe_id and is_active = true;

  if not found then
    raise exception 'TABLE_NOT_FOUND' using errcode = 'CB002';
  end if;

  if p_guests is null or p_guests < 1 then
    raise exception 'INVALID_GUESTS' using errcode = 'CB015';
  end if;

  if p_guests > v_table.capacity then
    raise exception 'CAPACITY_EXCEEDED' using errcode = 'CB003';
  end if;

  v_now := (now() at time zone v_cafe.timezone);

  if p_booking_date < v_now::date then
    raise exception 'PAST_DATE' using errcode = 'CB004';
  end if;

  if p_booking_date > v_now::date + 60 then
    raise exception 'DATE_TOO_FAR' using errcode = 'CB014';
  end if;

  if p_booking_date = v_now::date and p_start_time <= v_now::time then
    raise exception 'PAST_TIME' using errcode = 'CB005';
  end if;

  v_minutes := extract(hour from p_start_time) * 60 + extract(minute from p_start_time);
  if v_minutes::integer % 30 <> 0 or extract(second from p_start_time) <> 0 then
    raise exception 'INVALID_SLOT' using errcode = 'CB007';
  end if;

  if p_start_time < v_cafe.opening_time
     or p_start_time >= v_cafe.closing_time then
    raise exception 'OUTSIDE_HOURS' using errcode = 'CB006';
  end if;

  v_end_time := p_start_time + interval '90 minutes';

  if v_end_time > v_cafe.closing_time then
    raise exception 'OUTSIDE_HOURS' using errcode = 'CB006';
  end if;

  if exists (
    select 1 from public.bookings
    where user_id = p_user_id
      and cafe_id = p_cafe_id
      and booking_date = p_booking_date
      and start_time = p_start_time
      and status in ('pending', 'confirmed')
  ) then
    raise exception 'DUPLICATE_BOOKING' using errcode = 'CB008';
  end if;

  v_reference := 'CB-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  insert into public.bookings (
    user_id, cafe_id, table_id, booking_date,
    start_time, end_time, guests, status, booking_reference
  )
  values (
    p_user_id, p_cafe_id, p_table_id, p_booking_date,
    p_start_time, v_end_time, p_guests, 'pending', v_reference
  )
  returning * into v_booking;

  return v_booking;

exception
  when exclusion_violation then
    raise exception 'SLOT_TAKEN' using errcode = 'CB009';
  when unique_violation then
    raise exception 'DUPLICATE_BOOKING' using errcode = 'CB008';
end;
$$;

-- ----------------------------------------------------------------------------
-- cancel_booking (customer-owned cancellation)
-- ----------------------------------------------------------------------------
create or replace function public.cancel_booking(
  p_booking_id  uuid,
  p_user_id     uuid
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking  public.bookings%rowtype;
  v_cafe     public.cafes%rowtype;
  v_now      timestamp;
begin
  select * into v_booking
  from public.bookings
  where id = p_booking_id
  for update;

  if not found then
    raise exception 'BOOKING_NOT_FOUND' using errcode = 'CB010';
  end if;

  if v_booking.user_id <> p_user_id then
    raise exception 'FORBIDDEN' using errcode = 'CB011';
  end if;

  if v_booking.status not in ('pending', 'confirmed') then
    raise exception 'NOT_CANCELLABLE' using errcode = 'CB012';
  end if;

  select * into v_cafe from public.cafes where id = v_booking.cafe_id;
  v_now := (now() at time zone coalesce(v_cafe.timezone, 'Asia/Kolkata'));

  if (v_booking.booking_date + v_booking.start_time) <= v_now then
    raise exception 'ALREADY_STARTED' using errcode = 'CB013';
  end if;

  update public.bookings
  set status = 'cancelled'
  where id = p_booking_id
  returning * into v_booking;

  return v_booking;
end;
$$;

-- ----------------------------------------------------------------------------
-- complete_past_bookings — housekeeping called by the API before listings
-- so a finished reservation is shown (and counted) as completed.
-- ----------------------------------------------------------------------------
create or replace function public.complete_past_bookings()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  update public.bookings b
  set status = 'completed'
  from public.cafes c
  where b.cafe_id = c.id
    and b.status in ('pending', 'confirmed')
    and (b.booking_date + b.end_time) < (now() at time zone c.timezone);

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- These functions are only callable by the Express backend (service role).
revoke all on function public.create_booking(uuid, uuid, uuid, date, time, integer)
  from public, anon, authenticated;
revoke all on function public.cancel_booking(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.complete_past_bookings()
  from public, anon, authenticated;

grant execute on function public.create_booking(uuid, uuid, uuid, date, time, integer)
  to service_role;
grant execute on function public.cancel_booking(uuid, uuid) to service_role;
grant execute on function public.complete_past_bookings() to service_role;

-- ----------------------------------------------------------------------------
-- Row Level Security
-- The frontend never talks to Postgres directly; these policies are defense in
-- depth for any future Supabase client usage and for the anon API surface.
-- ----------------------------------------------------------------------------
alter table public.profiles     enable row level security;
alter table public.cafes        enable row level security;
alter table public.cafe_tables  enable row level security;
alter table public.menu_items   enable row level security;
alter table public.bookings     enable row level security;

-- profiles
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- cafes (public, active only)
drop policy if exists "cafes_public_read" on public.cafes;
create policy "cafes_public_read" on public.cafes
  for select to anon, authenticated using (is_active = true or public.is_admin());

drop policy if exists "cafes_admin_write" on public.cafes;
create policy "cafes_admin_write" on public.cafes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- cafe_tables
drop policy if exists "tables_public_read" on public.cafe_tables;
create policy "tables_public_read" on public.cafe_tables
  for select to anon, authenticated using (is_active = true or public.is_admin());

drop policy if exists "tables_admin_write" on public.cafe_tables;
create policy "tables_admin_write" on public.cafe_tables
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- menu_items
drop policy if exists "menu_public_read" on public.menu_items;
create policy "menu_public_read" on public.menu_items
  for select to anon, authenticated using (true);

drop policy if exists "menu_admin_write" on public.menu_items;
create policy "menu_admin_write" on public.menu_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- bookings: an authenticated user may only read their own; admins read all.
drop policy if exists "bookings_select_own" on public.bookings;
create policy "bookings_select_own" on public.bookings
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "bookings_admin_read" on public.bookings;
create policy "bookings_admin_read" on public.bookings
  for select to authenticated using (public.is_admin());

comment on table public.bookings is
  'Reservations. Overlapping active bookings per table are blocked by bookings_no_overlap.';

-- ----------------------------------------------------------------------------
-- Column-level privileges: a signed-in customer may read their own profile and
-- change only their name and phone. Role changes remain server-side only, so a
-- client can never promote itself to admin and reach the admin API.
-- ----------------------------------------------------------------------------
revoke insert, delete, update on public.profiles from anon, authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

