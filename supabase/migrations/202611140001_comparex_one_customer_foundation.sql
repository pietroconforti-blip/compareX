-- CompareX One: customer profile, saved package and mobile application draft foundation.
-- Additive only. This migration is committed for the preview branch but is NOT applied
-- to the connected Supabase project automatically. Review before applying to any database.
-- Do not store card numbers, CVVs, identity document images or provider passwords here.

create table if not exists public.comparex_customer_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 160),
  phone text not null default '' check (char_length(phone) <= 40),
  street_address text not null default '' check (char_length(street_address) <= 200),
  postal_code text not null default '' check (char_length(postal_code) <= 20),
  city text not null default 'Vienna' check (char_length(city) <= 100),
  country_code text not null default 'AT' check (char_length(country_code) between 2 and 5),
  student_status text not null default 'prospective_student' check (student_status in ('student','prospective_student','other')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.comparex_customer_packages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  destination text not null check (destination in ('Vienna','Milan')),
  budget text not null default '',
  items jsonb not null default '[]'::jsonb check (jsonb_typeof(items) = 'array'),
  created_at timestamptz not null default now()
);
create index if not exists comparex_customer_packages_user_created_idx on public.comparex_customer_packages(user_id, created_at desc);

create table if not exists public.comparex_mobile_application_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider_slug text not null check (provider_slug in ('spusu','yesss')),
  offer_id text not null,
  offer_snapshot jsonb not null check (jsonb_typeof(offer_snapshot) = 'object'),
  status text not null default 'draft' check (status in ('draft','ready_for_provider','submitted','accepted','rejected','cancelled')),
  provider_submission_status text not null default 'not_configured' check (provider_submission_status in ('not_configured','pending','submitted','accepted','rejected')),
  provider_application_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists comparex_mobile_drafts_user_created_idx on public.comparex_mobile_application_drafts(user_id, created_at desc);

create table if not exists public.comparex_customer_data_sharing_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider_slug text not null,
  purpose text not null,
  notice_version text not null,
  granted_at timestamptz not null default now(),
  withdrawn_at timestamptz,
  created_at timestamptz not null default now(),
  check (withdrawn_at is null or withdrawn_at >= granted_at)
);
create index if not exists comparex_data_sharing_consents_user_provider_idx on public.comparex_customer_data_sharing_consents(user_id, provider_slug);

alter table public.comparex_customer_profiles enable row level security;
alter table public.comparex_customer_packages enable row level security;
alter table public.comparex_mobile_application_drafts enable row level security;
alter table public.comparex_customer_data_sharing_consents enable row level security;

grant select, insert, update on public.comparex_customer_profiles to authenticated;
grant select, insert, update, delete on public.comparex_customer_packages to authenticated;
grant select, insert, update, delete on public.comparex_mobile_application_drafts to authenticated;
grant select, insert, update on public.comparex_customer_data_sharing_consents to authenticated;

drop policy if exists "Customers can read their own CompareX profile" on public.comparex_customer_profiles;
create policy "Customers can read their own CompareX profile" on public.comparex_customer_profiles for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "Customers can create their own CompareX profile" on public.comparex_customer_profiles;
create policy "Customers can create their own CompareX profile" on public.comparex_customer_profiles for insert to authenticated with check ((select auth.uid()) = id);
drop policy if exists "Customers can update their own CompareX profile" on public.comparex_customer_profiles;
create policy "Customers can update their own CompareX profile" on public.comparex_customer_profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "Customers can manage their own packages" on public.comparex_customer_packages;
create policy "Customers can manage their own packages" on public.comparex_customer_packages for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Customers can manage their own mobile drafts" on public.comparex_mobile_application_drafts;
create policy "Customers can manage their own mobile drafts" on public.comparex_mobile_application_drafts for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Customers can manage their own data sharing consents" on public.comparex_customer_data_sharing_consents;
create policy "Customers can manage their own data sharing consents" on public.comparex_customer_data_sharing_consents for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

revoke all on public.comparex_customer_profiles from anon;
revoke all on public.comparex_customer_packages from anon;
revoke all on public.comparex_mobile_application_drafts from anon;
revoke all on public.comparex_customer_data_sharing_consents from anon;
