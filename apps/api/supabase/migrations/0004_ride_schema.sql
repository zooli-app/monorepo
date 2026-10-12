-- =========================================================================
-- Zooli — Ride vertical schema (vertical #2 of 3)
-- =========================================================================

alter type user_role add value if not exists 'driver';

create type vehicle_type as enum ('bike', 'auto', 'sedan', 'suv');
create type ride_status as enum (
  'requested', 'searching', 'accepted', 'arrived', 'in_progress', 'completed', 'cancelled'
);

-- ---------------------------------------------------------------------
-- Drivers (1:1 with a profile that has role = 'driver')
-- Live lat/lng is NOT stored here — that lives in Redis (see lib/geo.ts)
-- since it changes every few seconds and doesn't need to be durable.
-- ---------------------------------------------------------------------
create table drivers (
  id              uuid primary key references profiles(id) on delete cascade,
  vehicle_type    vehicle_type not null,
  vehicle_number  text not null,
  license_number  text not null,
  is_online       boolean not null default false,
  rating_avg      numeric(2,1) not null default 5.0,
  rating_count    int not null default 0,
  created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Fare rules — one active row per vehicle type. Kept in Postgres (not
-- hardcoded) so pricing can change without a deploy.
-- ---------------------------------------------------------------------
create table ride_fare_rules (
  vehicle_type    vehicle_type primary key,
  base_fare       numeric(10,2) not null,
  per_km_rate     numeric(10,2) not null,
  per_min_rate    numeric(10,2) not null,
  min_fare        numeric(10,2) not null,
  is_active       boolean not null default true
);

insert into ride_fare_rules (vehicle_type, base_fare, per_km_rate, per_min_rate, min_fare) values
  ('bike',  15, 5,  0.5, 25),
  ('auto',  25, 8,  1.0, 40),
  ('sedan', 40, 12, 1.5, 60),
  ('suv',   60, 16, 2.0, 90);

-- ---------------------------------------------------------------------
-- Rides
-- ---------------------------------------------------------------------
create table rides (
  id                uuid primary key default uuid_generate_v4(),
  customer_id       uuid not null references profiles(id) on delete restrict,
  driver_id         uuid references drivers(id) on delete set null,
  vehicle_type      vehicle_type not null,
  status            ride_status not null default 'requested',

  pickup_address    text not null,
  pickup_lat        double precision not null,
  pickup_lng        double precision not null,
  drop_address      text not null,
  drop_lat          double precision not null,
  drop_lng          double precision not null,

  distance_km       numeric(6,2),
  fare_estimate     numeric(10,2) not null,
  fare_final        numeric(10,2),

  requested_at      timestamptz not null default now(),
  accepted_at       timestamptz,
  started_at        timestamptz,
  completed_at      timestamptz,
  cancelled_at      timestamptz,
  cancelled_by      uuid references profiles(id)
);
create index rides_customer_idx on rides(customer_id);
create index rides_driver_idx on rides(driver_id);
create index rides_status_idx on rides(status);
