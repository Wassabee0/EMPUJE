do $$ begin
  create type public.contribution_category as enum (
    'physical_space_assets',
    'audience_channels',
    'product_stock',
    'professional_services',
    'validation_first_customers',
    'events_experiences',
    'operations_distribution',
    'relationship_capital',
    'specific_knowledge',
    'time_execution',
    'seed_contribution'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.offer_availability_status as enum (
    'active',
    'partial',
    'reserved',
    'in_agreement',
    'exhausted',
    'cooldown',
    'paused',
    'archived',
    'suspended'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.capacity_unit as enum (
    'slots_per_month',
    'hours_per_month',
    'units',
    'projects_per_month',
    'introductions',
    'spots',
    'other'
  );
exception when duplicate_object then null;
end $$;

alter table public.offers
  add column if not exists contribution_template_id text,
  add column if not exists contribution_category public.contribution_category,
  add column if not exists availability_status public.offer_availability_status not null default 'active',
  add column if not exists capacity_total integer check (capacity_total is null or capacity_total >= 0),
  add column if not exists capacity_used integer not null default 0 check (capacity_used >= 0),
  add column if not exists capacity_unit public.capacity_unit,
  add column if not exists available_from date,
  add column if not exists available_until date,
  add column if not exists next_review_at date,
  add column if not exists restrictions text;

do $$ begin
  alter table public.offers
    add constraint offers_capacity_used_within_total
    check (capacity_total is null or capacity_used <= capacity_total);
exception when duplicate_object then null;
end $$;

create index if not exists offers_availability_idx on public.offers(availability_status);
create index if not exists offers_template_idx on public.offers(contribution_template_id);
create index if not exists offers_next_review_idx on public.offers(next_review_at);

alter table public.match_candidates
  add column if not exists remaining_capacity integer check (remaining_capacity is null or remaining_capacity >= 0),
  add column if not exists capacity_label text;
