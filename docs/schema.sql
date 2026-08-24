-- La Diagonal — Supabase schema (documented for next iteration)
-- Apply after enabling: btree_gist, pg_cron

create extension if not exists btree_gist;
create extension if not exists pg_cron;

create type sport_type as enum (
  'futbol_5', 'futbol_7', 'futbol_8', 'futbol_9', 'futbol_11',
  'futsal', 'handball', 'padel'
);

create type reservation_status as enum (
  'hold', 'pending', 'confirmed', 'cancelled', 'expired'
);

create type payment_method as enum (
  'cash', 'deposit', 'transfer_full'
);

create type surface_type as enum (
  'cesped_sintetico', 'cesped_natural', 'cemento', 'parquet'
);

create table venues (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  address text not null,
  city text not null,
  province text not null default 'Tucumán',
  phone_e164 text not null,
  whatsapp_e164 text not null,
  timezone text not null default 'America/Argentina/Tucuman',
  plan_width_m numeric(8,2) not null check (plan_width_m > 0),
  plan_length_m numeric(8,2) not null check (plan_length_m > 0),
  deposit_percent numeric(5,2) not null default 10 check (deposit_percent >= 0 and deposit_percent <= 100),
  bank_alias text,
  bank_cbu text,
  bank_holder text,
  hold_ttl_minutes int not null default 15,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table courts (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references venues(id) on delete cascade,
  name text not null,
  sport sport_type not null,
  description text not null default '',
  surface surface_type not null default 'cesped_sintetico',
  has_lights boolean not null default true,
  slot_duration_minutes int not null check (slot_duration_minutes > 0),
  base_price_ars integer not null check (base_price_ars >= 0),
  plan_x_m numeric(8,2) not null default 0,
  plan_y_m numeric(8,2) not null default 0,
  plan_width_m numeric(8,2) not null check (plan_width_m > 0),
  plan_length_m numeric(8,2) not null check (plan_length_m > 0),
  plan_rotation_deg numeric(6,2) not null default 0,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index courts_venue_id_idx on courts(venue_id);
create index courts_venue_sport_idx on courts(venue_id, sport) where is_active;

-- day_of_week: 0 = Sunday … 6 = Saturday (JS convention)
create table venue_hours (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references venues(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  opens_at time not null,
  closes_at time not null,
  unique (venue_id, day_of_week)
);

create table court_hour_overrides (
  id uuid primary key default gen_random_uuid(),
  court_id uuid not null references courts(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  opens_at time,
  closes_at time,
  is_closed boolean not null default false,
  unique (court_id, day_of_week)
);

create table price_rules (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references venues(id) on delete cascade,
  court_id uuid references courts(id) on delete cascade,
  name text not null,
  days_of_week smallint[] not null default '{0,1,2,3,4,5,6}',
  starts_at time not null,
  ends_at time not null,
  price_ars integer,
  surcharge_ars integer,
  priority int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index price_rules_venue_priority_idx on price_rules(venue_id, priority desc) where is_active;

create table closures (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references venues(id) on delete cascade,
  court_id uuid references courts(id) on delete cascade,
  reason text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  check (ends_at > starts_at)
);

create index closures_court_range_idx on closures(court_id, starts_at, ends_at);
create index closures_venue_range_idx on closures(venue_id, starts_at, ends_at);

create table customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone_e164 text not null,
  auth_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index customers_email_lower_idx on customers (lower(email));
create index customers_phone_idx on customers(phone_e164);

create table reservations (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  venue_id uuid not null references venues(id),
  court_id uuid not null references courts(id),
  customer_id uuid not null references customers(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status reservation_status not null default 'hold',
  hold_expires_at timestamptz,
  payment_method payment_method not null,
  price_ars integer not null,
  deposit_ars integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index reservations_court_starts_idx on reservations(court_id, starts_at);
create index reservations_venue_starts_idx on reservations(venue_id, starts_at);
create index reservations_customer_starts_idx on reservations(customer_id, starts_at desc);
create index reservations_hold_expires_idx on reservations(hold_expires_at)
  where status = 'hold';

alter table reservations add constraint reservations_no_overlap
  exclude using gist (
    court_id with =,
    tstzrange(starts_at, ends_at) with &&
  ) where (status in ('hold', 'pending', 'confirmed'));

create table payment_receipts (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references reservations(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  uploaded_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'staff', 'customer')) default 'customer',
  full_name text,
  created_at timestamptz not null default now()
);

-- Expire holds every minute
select cron.schedule(
  'expire-reservation-holds',
  '* * * * *',
  $$
    update reservations
    set status = 'expired', updated_at = now()
    where status = 'hold'
      and hold_expires_at is not null
      and hold_expires_at < now();
  $$
);

-- RLS
alter table venues enable row level security;
alter table courts enable row level security;
alter table venue_hours enable row level security;
alter table price_rules enable row level security;
alter table closures enable row level security;
alter table customers enable row level security;
alter table reservations enable row level security;
alter table payment_receipts enable row level security;
alter table profiles enable row level security;

create policy venues_public_read on venues for select using (true);
create policy courts_public_read on courts for select using (is_active);
create policy venue_hours_public_read on venue_hours for select using (true);
create policy price_rules_public_read on price_rules for select using (is_active);

create or replace function is_staff()
returns boolean language sql stable as $$
  select exists (
    select 1 from profiles p
    where p.id = auth.uid() and p.role in ('admin', 'staff')
  );
$$;

create policy reservations_staff_all on reservations
  for all using (is_staff()) with check (is_staff());

create policy reservations_own_read on reservations
  for select using (
    customer_id in (
      select c.id from customers c where c.auth_user_id = auth.uid()
    )
  );

-- Inserts go through RPC create_reservation_hold (security definer), not direct client insert.
