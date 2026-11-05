-- CompareX supplier catalogue, integration registry, payment ledger and fulfilment foundation.
-- Apply only after reviewing the seller model, privacy notice, retention and operational responsibilities.
-- All tables are server-only: no anon/authenticated policies are added.

create table if not exists public.comparex_suppliers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  display_name text not null,
  category text not null check (category in ('housing','mobile','transport','gym','streaming')),
  country_code char(2) not null default 'AT',
  contact_email text,
  public_website text,
  integration_status text not null default 'research'
    check (integration_status in ('research','contacted','negotiating','contracted','sandbox','live','paused','rejected')),
  integration_method text not null default 'manual'
    check (integration_method in ('manual','csv','partner_portal','rest_api','webhook','aggregator')),
  contract_verified boolean not null default false,
  resale_rights_verified boolean not null default false,
  fulfilment_tested boolean not null default false,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (not resale_rights_verified or contract_verified)
);

create table if not exists public.comparex_supplier_products (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.comparex_suppliers(id),
  supplier_product_ref text,
  sku text,
  title text not null,
  description text,
  category text not null check (category in ('housing','mobile','transport','gym','streaming')),
  country_code char(2) not null default 'AT',
  currency char(3) not null default 'EUR',
  retail_price numeric(12,2) not null check (retail_price >= 0),
  wholesale_cost numeric(12,2) check (wholesale_cost is null or wholesale_cost >= 0),
  billing_period text not null default 'one_time'
    check (billing_period in ('one_time','day','week','month','year','term','night')),
  setup_fee numeric(12,2) not null default 0 check (setup_fee >= 0),
  minimum_term_months integer check (minimum_term_months is null or minimum_term_months >= 0),
  cancellation_terms text,
  eligibility_rules jsonb not null default '{}'::jsonb,
  fulfilment_method text not null default 'manual'
    check (fulfilment_method in ('manual','supplier_portal','api','voucher','ticket_api','sim_activation')),
  sale_status text not null default 'comparison_only'
    check (sale_status in ('comparison_only','pending_partner_approval','sellable','paused','retired')),
  price_verified_at timestamptz,
  availability_checked_at timestamptz,
  contract_reference text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    sale_status <> 'sellable'
    or (price_verified_at is not null and contract_reference is not null)
  )
);

-- Seed researched Austrian supplier prospects as research-only records.
-- Do not mark any supplier contracted or sellable based on this seed data.
insert into public.comparex_suppliers (slug, display_name, category, country_code, contact_email, public_website, integration_method)
values
  ('home4students', 'Home4students', 'housing', 'AT', 'marketing@home4students.at', 'https://www.home4students.at/', 'manual'),
  ('stuwo', 'STUWO', 'housing', 'AT', 'info@stuwo.at', 'https://www.stuwo.at/', 'manual'),
  ('oead-student-housing', 'OeAD Student Housing', 'housing', 'AT', null, 'https://www.oeadstudenthousing.at/', 'manual'),
  ('akademikerhilfe', 'Akademikerhilfe', 'housing', 'AT', null, 'https://www.akademikerhilfe.at/', 'manual'),
  ('drei-wholesale', 'Drei Wholesale', 'mobile', 'AT', 'mvno@drei.com', 'https://www.drei.at/de/business/wholesale/', 'manual'),
  ('magenta-business-partners', 'Magenta Business Partners', 'mobile', 'AT', 'sales.businesspartner@magenta.at', 'https://www.magenta.at/business/unternehmen/partner', 'manual'),
  ('yesss-retail', 'yesss!', 'mobile', 'AT', null, 'https://www.yesss.at/handelspartner', 'manual'),
  ('spusu', 'spusu', 'mobile', 'AT', 'office@spusu.at', 'https://www.spusu.at/', 'manual'),
  ('wiener-linien', 'Wiener Linien', 'transport', 'AT', 'business@wienerlinien.at', 'https://www.wienerlinien.at/b2b/ticketvertriebsschnittstelle', 'rest_api'),
  ('rsg-group', 'RSG Group / McFIT', 'gym', 'AT', null, 'https://rsggroup.com/en/contact/', 'manual'),
  ('fitinn', 'FITINN', 'gym', 'AT', null, 'https://fitinn.at/', 'manual'),
  ('a1-select', 'A1 Select / digital service distribution', 'streaming', 'AT', null, 'https://www.a1.net/', 'manual')
on conflict (slug) do nothing;

create index if not exists comparex_supplier_products_supplier_idx
  on public.comparex_supplier_products(supplier_id);
create index if not exists comparex_supplier_products_sale_idx
  on public.comparex_supplier_products(sale_status, category, country_code);

-- Database-level gate: a product cannot become sellable until its supplier
-- has verified contractual resale rights and a tested fulfilment path.
create or replace function public.comparex_guard_sellable_supplier_product()
returns trigger
language plpgsql
as $function$
declare
  supplier_is_approved boolean;
begin
  if new.sale_status = 'sellable' then
    select (
      contract_verified
      and resale_rights_verified
      and fulfilment_tested
      and integration_status in ('contracted','sandbox','live')
    ) into supplier_is_approved
    from public.comparex_suppliers
    where id = new.supplier_id;

    if coalesce(supplier_is_approved, false) is not true then
      raise exception 'Supplier must have verified contract, resale rights and tested fulfilment before a product can be sold.';
    end if;
    if new.price_verified_at is null or new.contract_reference is null then
      raise exception 'Sellable products require a verified price and contract reference.';
    end if;
  end if;
  return new;
end;
$function$;

drop trigger if exists comparex_sellable_supplier_guard on public.comparex_supplier_products;
create trigger comparex_sellable_supplier_guard
before insert or update of sale_status, supplier_id, price_verified_at, contract_reference
on public.comparex_supplier_products
for each row execute function public.comparex_guard_sellable_supplier_product();

-- If a supplier's resale rights or fulfilment approval is withdrawn, immediately
-- pause its sellable products. This prevents old catalogue rows remaining purchasable.
create or replace function public.comparex_pause_products_when_supplier_unapproved()
returns trigger
language plpgsql
as $function$
begin
  if (
    not new.contract_verified
    or not new.resale_rights_verified
    or not new.fulfilment_tested
    or new.integration_status not in ('contracted','sandbox','live')
  ) then
    update public.comparex_supplier_products
      set sale_status = 'paused', updated_at = now()
      where supplier_id = new.id and sale_status = 'sellable';
  end if;
  return new;
end;
$function$;

drop trigger if exists comparex_supplier_approval_change on public.comparex_suppliers;
create trigger comparex_supplier_approval_change
after update of contract_verified, resale_rights_verified, fulfilment_tested, integration_status
on public.comparex_suppliers
for each row execute function public.comparex_pause_products_when_supplier_unapproved();



create table if not exists public.comparex_payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  event_type text not null,
  order_id uuid references public.package_order_drafts(id) on delete set null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_status text not null default 'received'
    check (processing_status in ('received','processed','ignored','failed')),
  safe_metadata jsonb not null default '{}'::jsonb,
  unique(provider, provider_event_id)
);

create table if not exists public.comparex_fulfilment_tasks (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.package_order_drafts(id) on delete restrict,
  order_item_index integer not null check (order_item_index >= 0),
  supplier_id uuid references public.comparex_suppliers(id),
  supplier_product_id uuid references public.comparex_supplier_products(id),
  status text not null default 'pending'
    check (status in ('pending','submitted','awaiting_supplier','confirmed','partially_fulfilled','fulfilled','failed','cancel_requested','cancelled')),
  integration_method text not null default 'manual'
    check (integration_method in ('manual','supplier_portal','api','voucher','ticket_api','sim_activation')),
  idempotency_key text not null unique,
  supplier_reference text,
  submitted_at timestamptz,
  confirmed_at timestamptz,
  last_error_code text,
  last_error_message text,
  safe_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists comparex_fulfilment_order_idx
  on public.comparex_fulfilment_tasks(order_id, order_item_index);
create index if not exists comparex_fulfilment_status_idx
  on public.comparex_fulfilment_tasks(status, created_at);

-- Extend existing draft rows without changing their current disabled-by-default behaviour.
alter table public.package_order_drafts
  add column if not exists currency char(3) not null default 'EUR',
  add column if not exists order_status text not null default 'draft',
  add column if not exists quote_snapshot jsonb not null default '{}'::jsonb,
  add column if not exists quote_expires_at timestamptz,
  add column if not exists checkout_request_id text,
  add column if not exists stripe_checkout_session_id text,
  add column if not exists stripe_payment_intent_id text,
  add column if not exists paid_at timestamptz,
  add column if not exists fulfilled_at timestamptz,
  add column if not exists customer_terms_version text,
  add column if not exists seller_terms_version text;

do $block$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'package_order_drafts_order_status_check'
      and conrelid = 'public.package_order_drafts'::regclass
  ) then
    alter table public.package_order_drafts
      add constraint package_order_drafts_order_status_check
      check (order_status in (
        'draft','awaiting_payment','paid','fulfilment_pending',
        'partially_fulfilled','fulfilled','cancellation_requested',
        'refund_pending','refunded','failed'
      ));
  end if;
end;
$block$;

create unique index if not exists package_order_drafts_checkout_request_uidx
  on public.package_order_drafts(checkout_request_id)
  where checkout_request_id is not null;

create unique index if not exists package_order_drafts_stripe_session_uidx
  on public.package_order_drafts(stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

alter table public.comparex_suppliers enable row level security;
alter table public.comparex_supplier_products enable row level security;
alter table public.comparex_payment_events enable row level security;
alter table public.comparex_fulfilment_tasks enable row level security;
revoke all on public.comparex_suppliers from anon, authenticated;
revoke all on public.comparex_supplier_products from anon, authenticated;
revoke all on public.comparex_payment_events from anon, authenticated;
revoke all on public.comparex_fulfilment_tasks from anon, authenticated;
revoke all on public.package_order_drafts from anon, authenticated;
