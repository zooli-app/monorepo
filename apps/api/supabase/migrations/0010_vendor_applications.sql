-- =========================================================================
-- Vendor registration applications.
-- A prospective vendor fills in the service-specific registration form
-- (food, rides, home services, shifting, parcel, tuition, hotels, resorts)
-- BEFORE they have a Zooli login, so these rows aren't tied to auth.users.
-- The full answer set is kept as JSONB (each service has a different
-- shape — see packages/zooli-vendor-forms); the columns below are just the
-- searchable summary the admin list needs.
-- =========================================================================

create type application_status as enum (
  'pending', 'under_review', 'needs_info', 'approved', 'rejected'
);

create table vendor_applications (
  id             uuid primary key default uuid_generate_v4(),
  reference      text not null unique,            -- shown to the applicant, e.g. ZV-2610-K3F9QA
  service        text not null,                   -- food | rides | home | shifting | parcel | tuition | hotel | resort
  status         application_status not null default 'pending',
  applicant_name text not null,
  business_name  text,
  mobile         text not null,
  email          text,
  city           text,
  district       text,
  data           jsonb not null,                  -- every answer + uploaded-file URLs
  admin_notes    text,
  reviewed_by    uuid references profiles(id) on delete set null,
  reviewed_at    timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index vendor_applications_status_idx  on vendor_applications(status, created_at desc);
create index vendor_applications_service_idx on vendor_applications(service);
create index vendor_applications_mobile_idx  on vendor_applications(mobile, service);

-- Applications contain Aadhaar / PAN / bank details. RLS is on with NO
-- policies, so anon/authenticated clients can't read or write at all;
-- only the API's service-role client (submit + admin review routes) can.
alter table vendor_applications enable row level security;

create or replace function set_vendor_applications_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger vendor_applications_updated_at
  before update on vendor_applications
  for each row execute function set_vendor_applications_updated_at();
