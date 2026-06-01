create extension if not exists pgcrypto;

create schema if not exists app_private;

do $$ begin
  create type public.profile_status as enum ('pending_review', 'active', 'needs_evidence', 'rejected');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.business_type as enum ('local', 'brand', 'service', 'community', 'other');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.business_stage as enum ('idea', 'first_sales', 'running', 'growing');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.app_role as enum ('member', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.offer_status as enum ('unverified', 'pending', 'verified', 'rejected');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.evidence_status as enum ('pending', 'verified', 'rejected', 'needs_more');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.match_status as enum ('suggested', 'needs_evidence', 'approved', 'introduced', 'completed', 'rejected');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.intro_request_status as enum ('requested', 'approved', 'introduced', 'rejected');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  business_name text not null default '',
  city text not null default '',
  business_type public.business_type not null default 'other',
  stage public.business_stage not null default 'idea',
  status public.profile_status not null default 'pending_review',
  role public.app_role not null default 'member',
  consent_accepted boolean not null default false,
  consent_at timestamptz,
  trust_score integer not null default 20 check (trust_score between 0 and 100),
  admin_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  tags text[] not null default '{}',
  status public.offer_status not null default 'pending',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.needs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.evidence_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  offer_id uuid references public.offers(id) on delete cascade,
  label text not null default '',
  kind text not null check (kind in ('link', 'file', 'note')),
  url text,
  storage_path text,
  status public.evidence_status not null default 'pending',
  admin_notes text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint evidence_has_location check (url is not null or storage_path is not null or label <> '')
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  status public.match_status not null default 'suggested',
  score numeric(5,2) not null default 0,
  blocking_reasons text[] not null default '{}',
  score_breakdown jsonb not null default '{}'::jsonb,
  admin_notes text,
  created_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.match_participants (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('offerer', 'needer')),
  offer_id uuid references public.offers(id) on delete set null,
  need_id uuid references public.needs(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (match_id, role)
);

create table if not exists public.intro_requests (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  requested_by uuid not null references public.profiles(id) on delete cascade,
  message text not null default '',
  status public.intro_request_status not null default 'requested',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_notes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  match_id uuid references public.matches(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  note text not null,
  created_at timestamptz not null default now(),
  constraint admin_note_has_subject check (profile_id is not null or match_id is not null)
);

create table if not exists public.reputation_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null,
  score_delta integer not null default 0,
  reason text not null default '',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists profiles_status_idx on public.profiles(status);
create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists offers_profile_idx on public.offers(profile_id);
create index if not exists offers_tags_idx on public.offers using gin(tags);
create index if not exists offers_status_idx on public.offers(status);
create index if not exists needs_profile_idx on public.needs(profile_id);
create index if not exists needs_tags_idx on public.needs using gin(tags);
create index if not exists evidence_profile_idx on public.evidence_items(profile_id);
create index if not exists evidence_offer_idx on public.evidence_items(offer_id);
create index if not exists match_status_idx on public.matches(status);
create index if not exists match_participants_profile_idx on public.match_participants(profile_id);
create index if not exists intro_requests_match_idx on public.intro_requests(match_id);

create or replace function app_private.touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_profiles_updated_at on public.profiles;
create trigger touch_profiles_updated_at
before update on public.profiles
for each row execute function app_private.touch_updated_at();

drop trigger if exists touch_offers_updated_at on public.offers;
create trigger touch_offers_updated_at
before update on public.offers
for each row execute function app_private.touch_updated_at();

drop trigger if exists touch_needs_updated_at on public.needs;
create trigger touch_needs_updated_at
before update on public.needs
for each row execute function app_private.touch_updated_at();

drop trigger if exists touch_evidence_updated_at on public.evidence_items;
create trigger touch_evidence_updated_at
before update on public.evidence_items
for each row execute function app_private.touch_updated_at();

drop trigger if exists touch_matches_updated_at on public.matches;
create trigger touch_matches_updated_at
before update on public.matches
for each row execute function app_private.touch_updated_at();

drop trigger if exists touch_intro_requests_updated_at on public.intro_requests;
create trigger touch_intro_requests_updated_at
before update on public.intro_requests
for each row execute function app_private.touch_updated_at();

create or replace function app_private.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

grant usage on schema app_private to authenticated;
grant execute on function app_private.is_admin() to authenticated;
grant execute on function app_private.touch_updated_at() to authenticated;

grant select, insert, update, delete on
  public.profiles,
  public.offers,
  public.needs,
  public.evidence_items,
  public.matches,
  public.match_participants,
  public.intro_requests,
  public.admin_notes,
  public.reputation_events
to authenticated;

alter table public.profiles enable row level security;
alter table public.offers enable row level security;
alter table public.needs enable row level security;
alter table public.evidence_items enable row level security;
alter table public.matches enable row level security;
alter table public.match_participants enable row level security;
alter table public.intro_requests enable row level security;
alter table public.admin_notes enable row level security;
alter table public.reputation_events enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles for select to authenticated
using (id = (select auth.uid()) or app_private.is_admin());

drop policy if exists "profiles_insert_own_member" on public.profiles;
create policy "profiles_insert_own_member"
on public.profiles for insert to authenticated
with check (id = (select auth.uid()) and role = 'member');

drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update"
on public.profiles for update to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());

drop policy if exists "offers_select_own_or_admin" on public.offers;
create policy "offers_select_own_or_admin"
on public.offers for select to authenticated
using (profile_id = (select auth.uid()) or app_private.is_admin());

drop policy if exists "offers_insert_own_pending" on public.offers;
create policy "offers_insert_own_pending"
on public.offers for insert to authenticated
with check (profile_id = (select auth.uid()) and status in ('pending', 'unverified'));

drop policy if exists "offers_admin_update" on public.offers;
create policy "offers_admin_update"
on public.offers for update to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());

drop policy if exists "needs_select_own_or_admin" on public.needs;
create policy "needs_select_own_or_admin"
on public.needs for select to authenticated
using (profile_id = (select auth.uid()) or app_private.is_admin());

drop policy if exists "needs_insert_own" on public.needs;
create policy "needs_insert_own"
on public.needs for insert to authenticated
with check (profile_id = (select auth.uid()));

drop policy if exists "needs_admin_update" on public.needs;
create policy "needs_admin_update"
on public.needs for update to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());

drop policy if exists "evidence_select_own_or_admin" on public.evidence_items;
create policy "evidence_select_own_or_admin"
on public.evidence_items for select to authenticated
using (profile_id = (select auth.uid()) or app_private.is_admin());

drop policy if exists "evidence_insert_own_pending" on public.evidence_items;
create policy "evidence_insert_own_pending"
on public.evidence_items for insert to authenticated
with check (
  profile_id = (select auth.uid())
  and status = 'pending'
  and (
    offer_id is null
    or exists (
      select 1
      from public.offers o
      where o.id = evidence_items.offer_id
        and o.profile_id = (select auth.uid())
    )
  )
);

drop policy if exists "evidence_admin_update" on public.evidence_items;
create policy "evidence_admin_update"
on public.evidence_items for update to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());

drop policy if exists "matches_select_admin_or_member_approved" on public.matches;
create policy "matches_select_admin_or_member_approved"
on public.matches for select to authenticated
using (
  app_private.is_admin()
  or (
    status in ('approved', 'introduced', 'completed')
    and exists (
      select 1
      from public.match_participants mp
      where mp.match_id = matches.id
        and mp.profile_id = (select auth.uid())
    )
  )
);

drop policy if exists "matches_admin_insert_update" on public.matches;
create policy "matches_admin_insert_update"
on public.matches for all to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());

drop policy if exists "participants_select_admin_or_self_approved" on public.match_participants;
create policy "participants_select_admin_or_self_approved"
on public.match_participants for select to authenticated
using (
  app_private.is_admin()
  or (
    profile_id = (select auth.uid())
    and exists (
      select 1 from public.matches m
      where m.id = match_participants.match_id
        and m.status in ('approved', 'introduced', 'completed')
    )
  )
);

drop policy if exists "participants_admin_all" on public.match_participants;
create policy "participants_admin_all"
on public.match_participants for all to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());

drop policy if exists "intro_select_admin_or_requester" on public.intro_requests;
create policy "intro_select_admin_or_requester"
on public.intro_requests for select to authenticated
using (requested_by = (select auth.uid()) or app_private.is_admin());

drop policy if exists "intro_insert_participant" on public.intro_requests;
create policy "intro_insert_participant"
on public.intro_requests for insert to authenticated
with check (
  requested_by = (select auth.uid())
  and exists (
    select 1
    from public.match_participants mp
    join public.matches m on m.id = mp.match_id
    where mp.match_id = intro_requests.match_id
      and mp.profile_id = (select auth.uid())
      and m.status in ('approved', 'introduced', 'completed')
  )
);

drop policy if exists "intro_admin_update" on public.intro_requests;
create policy "intro_admin_update"
on public.intro_requests for update to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());

drop policy if exists "admin_notes_admin_only" on public.admin_notes;
create policy "admin_notes_admin_only"
on public.admin_notes for all to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());

drop policy if exists "reputation_select_own_or_admin" on public.reputation_events;
create policy "reputation_select_own_or_admin"
on public.reputation_events for select to authenticated
using (profile_id = (select auth.uid()) or app_private.is_admin());

drop policy if exists "reputation_admin_insert" on public.reputation_events;
create policy "reputation_admin_insert"
on public.reputation_events for insert to authenticated
with check (app_private.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'evidence',
  'evidence',
  false,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'text/plain']::text[]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "evidence_storage_insert_own_folder" on storage.objects;
create policy "evidence_storage_insert_own_folder"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'evidence'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "evidence_storage_select_own_or_admin" on storage.objects;
create policy "evidence_storage_select_own_or_admin"
on storage.objects for select to authenticated
using (
  bucket_id = 'evidence'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or app_private.is_admin()
  )
);
