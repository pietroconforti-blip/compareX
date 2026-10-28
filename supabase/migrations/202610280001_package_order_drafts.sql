-- CompareX package-order draft storage.
-- Run in the Supabase SQL editor only after reviewing the privacy notice and data-retention policy.
-- The table is intentionally not exposed to anonymous/authenticated clients; writes use the server-only service role.
create table if not exists public.package_order_drafts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_name text not null check (char_length(customer_name) between 2 and 120),
  customer_email text not null check (char_length(customer_email) <= 254),
  customer_phone text null check (customer_phone is null or char_length(customer_phone) <= 40),
  destination text not null check (destination in ('Vienna', 'Milan')),
  items jsonb not null check (jsonb_typeof(items) = 'array'),
  estimated_monthly_total numeric(12,2) not null check (estimated_monthly_total >= 0),
  privacy_consent boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'pending_provider_confirmation', 'confirmed', 'cancelled')),
  payment_status text not null default 'not_started' check (payment_status in ('not_started', 'pending', 'paid', 'failed', 'refunded')),
  provider_order_refs jsonb not null default '[]'::jsonb
);

alter table public.package_order_drafts enable row level security;
revoke all on public.package_order_drafts from anon, authenticated;
-- Do not add public SELECT/INSERT policies. The server API accesses this table with SUPABASE_SERVICE_ROLE_KEY.
