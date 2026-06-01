do $$ begin
  create type app_private.beta_invite_status as enum ('pending', 'accepted', 'revoked');
exception when duplicate_object then null;
end $$;

create table if not exists app_private.beta_invites (
  email text primary key,
  status app_private.beta_invite_status not null default 'pending',
  invited_by uuid references public.profiles(id) on delete set null,
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  expires_at timestamptz,
  notes text not null default '',
  constraint beta_invites_email_normalized check (email = lower(trim(email))),
  constraint beta_invites_has_email check (position('@' in email) > 1)
);

revoke all on app_private.beta_invites from public, anon, authenticated;

create or replace function app_private.require_beta_invite(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = app_private, public
as $$
declare
  invite_email text := lower(trim(coalesce(event->'user'->>'email', '')));
  invite_found boolean;
begin
  if invite_email = '' then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 403,
        'message', 'Empuje beta requires an invited email address.'
      )
    );
  end if;

  select exists (
    select 1
    from app_private.beta_invites i
    where i.email = invite_email
      and i.status = 'pending'
      and (i.expires_at is null or i.expires_at > now())
  )
  into invite_found;

  if not invite_found then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 403,
        'message', 'Empuje beta is invite-only.'
      )
    );
  end if;

  return '{}'::jsonb;
end;
$$;

revoke execute on function app_private.require_beta_invite(jsonb) from public, anon, authenticated;
grant execute on function app_private.require_beta_invite(jsonb) to supabase_auth_admin;

alter table public.offers
add column if not exists onboarding_key text;

alter table public.needs
add column if not exists onboarding_key text;

alter table public.evidence_items
add column if not exists normalized_url text,
add column if not exists content_hash text,
add column if not exists byte_size bigint not null default 0;

do $$ begin
  alter table public.evidence_items
  add constraint evidence_items_byte_size_nonnegative check (byte_size >= 0);
exception when duplicate_object then null;
end $$;

create unique index if not exists offers_one_primary_onboarding_per_profile
on public.offers(profile_id, onboarding_key)
where onboarding_key = 'primary';

create unique index if not exists needs_one_primary_onboarding_per_profile
on public.needs(profile_id, onboarding_key)
where onboarding_key = 'primary';

create unique index if not exists evidence_unique_profile_offer_link
on public.evidence_items(profile_id, offer_id, normalized_url)
where kind = 'link' and normalized_url is not null;

create unique index if not exists evidence_unique_profile_offer_file_hash
on public.evidence_items(profile_id, offer_id, content_hash)
where kind = 'file' and content_hash is not null;

revoke insert, update, delete on public.offers, public.needs, public.evidence_items from authenticated;
