-- Links an approved application to the account created for it, keeps the last
-- message sent to the applicant, and records every sensitive action by an admin.
alter table vendor_applications
  add column vendor_user_id uuid references profiles(id) on delete set null,
  add column store_id       uuid references stores(id)   on delete set null,
  add column last_message   text,
  add column notified_at    timestamptz;

create table application_audit_log (
  id             uuid primary key default uuid_generate_v4(),
  application_id uuid not null references vendor_applications(id) on delete cascade,
  admin_id       uuid references profiles(id) on delete set null,
  action         text not null,        -- view | reveal:<field> | status:<new status>
  detail         text,
  created_at     timestamptz not null default now()
);
create index application_audit_log_app_idx on application_audit_log(application_id, created_at desc);

-- Service-role only (same as vendor_applications): RLS on, no policies.
alter table application_audit_log enable row level security;
