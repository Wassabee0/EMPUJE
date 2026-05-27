create table if not exists public.match_candidates (
  id uuid primary key default gen_random_uuid(),
  pair_key text not null unique,
  offerer_profile_id uuid not null references public.profiles(id) on delete cascade,
  needer_profile_id uuid not null references public.profiles(id) on delete cascade,
  offer_id uuid not null references public.offers(id) on delete cascade,
  need_id uuid not null references public.needs(id) on delete cascade,
  score numeric(5,2) not null default 0,
  status public.match_status not null default 'suggested',
  blocking_reasons text[] not null default '{}',
  overlap_tags text[] not null default '{}',
  score_breakdown jsonb not null default '{}'::jsonb,
  fit_score integer not null default 0 check (fit_score between 0 and 100),
  trust_score integer not null default 0 check (trust_score between 0 and 100),
  urgency_score integer not null default 0 check (urgency_score between 0 and 20),
  risk_penalty integer not null default 0 check (risk_penalty between 0 and 100),
  risk_level text not null default 'medium' check (risk_level in ('low', 'medium', 'high')),
  next_action text not null default 'review_manually' check (
    next_action in ('approve_candidate', 'request_evidence', 'review_manually', 'reject')
  ),
  automation_reason text not null default '',
  admin_notes text,
  dismissed_at timestamptz,
  promoted_match_id uuid references public.matches(id) on delete set null,
  generated_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint match_candidate_different_profiles check (offerer_profile_id <> needer_profile_id)
);

create index if not exists match_candidates_score_idx on public.match_candidates(score desc);
create index if not exists match_candidates_status_idx on public.match_candidates(status);
create index if not exists match_candidates_risk_idx on public.match_candidates(risk_level, next_action);
create index if not exists match_candidates_offer_idx on public.match_candidates(offer_id);
create index if not exists match_candidates_need_idx on public.match_candidates(need_id);
create index if not exists match_candidates_profiles_idx on public.match_candidates(offerer_profile_id, needer_profile_id);
create index if not exists match_candidates_overlap_tags_idx on public.match_candidates using gin(overlap_tags);

drop trigger if exists touch_match_candidates_updated_at on public.match_candidates;
create trigger touch_match_candidates_updated_at
before update on public.match_candidates
for each row execute function app_private.touch_updated_at();

grant select, insert, update, delete on public.match_candidates to authenticated;

alter table public.match_candidates enable row level security;

drop policy if exists "match_candidates_admin_only" on public.match_candidates;
create policy "match_candidates_admin_only"
on public.match_candidates for all to authenticated
using (app_private.is_admin())
with check (app_private.is_admin());
