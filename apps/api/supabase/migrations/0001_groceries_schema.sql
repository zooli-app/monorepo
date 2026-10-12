-- =========================================================================
-- Zooli — Groceries vertical schema (vertical #1 of 3: groceries, ride, food)
-- Run against a Supabase Postgres project. Extends Supabase's built-in
-- `auth.users` table with app-level profile/role data.
-- =========================================================================

create extension if not exists "uuid-ossp";

create type user_role as enum ('customer', 'vendor', 'admin');
create type order_status as enum (
  'pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'
);
create type payment_status as enum ('unpaid', 'paid', 'refunded', 'failed');

-- ---------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        user_role not null default 'customer',
  full_name   text,
  phone       text unique,
  store_id    uuid, -- set once the store row exists (vendor role); FK added below
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Stores (a vendor's grocery store/dark-store)
-- ---------------------------------------------------------------------
create table stores (
  id          uuid primary key default uuid_generate_v4(),
  owner_id    uuid not null references profiles(id) on delete cascade,
  name        text not null,
  category    text not null default 'grocery',
  address     text,
  lat         double precision,
  lng         double precision,
  is_open     boolean not null default true,
  logo_url    text,
  created_at  timestamptz not null default now()
);

alter table profiles
  add constraint profiles_store_id_fkey foreign key (store_id) references stores(id) on delete set null;

-- ---------------------------------------------------------------------
-- Categories (grocery product categories, e.g. Fruits, Dairy, Snacks)
-- ---------------------------------------------------------------------
create table categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  parent_id   uuid references categories(id) on delete set null,
  sort_order  int not null default 0
);

-- ---------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------
create table products (
  id            uuid primary key default uuid_generate_v4(),
  store_id      uuid not null references stores(id) on delete cascade,
  category_id   uuid references categories(id) on delete set null,
  name          text not null,
  description   text,
  unit          text not null default 'pc',        -- pc, kg, g, l, ml, dozen...
  price         numeric(10,2) not null check (price >= 0),
  mrp           numeric(10,2),                      -- optional strike-through price
  stock_qty     int not null default 0 check (stock_qty >= 0),
  image_url     text,
  is_available  boolean not null default true,
  created_at    timestamptz not null default now()
);
create index products_store_idx on products(store_id);
create index products_category_idx on products(category_id);

-- ---------------------------------------------------------------------
-- Addresses (customer delivery addresses)
-- ---------------------------------------------------------------------
create table addresses (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  label       text not null default 'Home',
  line1       text not null,
  line2       text,
  city        text not null,
  state       text,
  pincode     text not null,
  lat         double precision,
  lng         double precision,
  is_default  boolean not null default false
);

-- ---------------------------------------------------------------------
-- Carts (one open cart per customer per store)
-- ---------------------------------------------------------------------
create table carts (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  store_id    uuid not null references stores(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, store_id)
);

create table cart_items (
  id          uuid primary key default uuid_generate_v4(),
  cart_id     uuid not null references carts(id) on delete cascade,
  product_id  uuid not null references products(id) on delete cascade,
  qty         int not null check (qty > 0),
  unique (cart_id, product_id)
);

-- ---------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------
create table orders (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references profiles(id) on delete restrict,
  store_id        uuid not null references stores(id) on delete restrict,
  address_id      uuid not null references addresses(id) on delete restrict,
  status          order_status not null default 'pending',
  payment_status  payment_status not null default 'unpaid',
  subtotal        numeric(10,2) not null,
  delivery_fee    numeric(10,2) not null default 0,
  total           numeric(10,2) not null,
  created_at      timestamptz not null default now()
);
create index orders_user_idx on orders(user_id);
create index orders_store_idx on orders(store_id);

create table order_items (
  id          uuid primary key default uuid_generate_v4(),
  order_id    uuid not null references orders(id) on delete cascade,
  product_id  uuid not null references products(id) on delete restrict,
  name        text not null,      -- snapshot at purchase time
  unit_price  numeric(10,2) not null,
  qty         int not null check (qty > 0)
);
