alter table drivers         enable row level security;
alter table ride_fare_rules enable row level security;
alter table rides           enable row level security;

-- drivers: a driver manages only their own row. No public select — customers
-- get driver display info (name, vehicle, rating) through the ride API
-- response (server-side join via the admin client), not direct table access.
create policy "drivers_owner_all" on drivers for all
  using (auth.uid() = id) with check (auth.uid() = id);

-- fare rules: public read (needed for client-side fare display before booking)
create policy "fare_rules_select_all" on ride_fare_rules for select using (true);

-- rides: the requesting customer or the assigned driver can see it
create policy "rides_select_party" on rides for select
  using (auth.uid() = customer_id or auth.uid() = driver_id);
create policy "rides_insert_customer" on rides for insert
  with check (auth.uid() = customer_id);
-- status transitions are gated in application code (lib/auth.ts + route
-- handlers), not here — a driver accepting a ride is auth.uid() = driver_id
-- being SET, which RLS can't express as a plain USING clause, so that
-- specific transition runs through the admin client with an explicit
-- "still unassigned" WHERE guard (see app/api/rides/[rideId]/accept).
create policy "rides_update_party" on rides for update
  using (auth.uid() = customer_id or auth.uid() = driver_id);
