-- =========================================================================
-- Reviews & ratings, per-store business fields (GSTIN/zone/commission),
-- and wallet balances (cashback credited automatically on order/ride
-- completion). Three previously-mock-only features get real tables.
-- =========================================================================

-- ---------------------------------------------------------------------
-- Reviews — one per order, left by the customer after it's delivered/
-- completed. Denormalized rating_avg/rating_count on `stores` so listing
-- pages don't have to aggregate reviews on every read.
-- ---------------------------------------------------------------------
create table reviews (
  id          uuid primary key default uuid_generate_v4(),
  order_id    uuid not null unique references orders(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  store_id    uuid not null references stores(id) on delete cascade,
  rating      int not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now()
);
create index reviews_store_idx on reviews(store_id);

alter table stores
  add column rating_avg    numeric(2,1) not null default 0,
  add column rating_count  int not null default 0,
  add column gstin         text,
  add column zone          text,
  add column commission_rate numeric(4,2) not null default 15.00; -- percent; admin-controlled

-- ---------------------------------------------------------------------
-- Wallets — one per user. Cashback is credited automatically by the
-- order/ride status endpoints when a trip completes or an order is
-- delivered (see lib/wallet.ts) — there's no manual "earn" action.
-- ---------------------------------------------------------------------
create table wallets (
  user_id         uuid primary key references profiles(id) on delete cascade,
  balance         numeric(10,2) not null default 0,
  cashback_total  numeric(10,2) not null default 0,
  updated_at      timestamptz not null default now()
);

create table wallet_transactions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  amount      numeric(10,2) not null,   -- positive = credit, negative = debit
  reason      text not null,            -- 'cashback:order:<id>', 'cashback:ride:<id>', 'admin_adjustment'
  created_at  timestamptz not null default now()
);
create index wallet_tx_user_idx on wallet_transactions(user_id);
