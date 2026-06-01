# Staging Verification Runbook

Last updated: 2026-06-01

Use this runbook after a Supabase staging project and Vercel preview/staging deployment exist. Do not run these checks against production user data.

## Required Access

Set these in your shell or provide them through a secure secret manager:

```bash
export SUPABASE_ACCESS_TOKEN=...
export NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
export NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
export SUPABASE_SECRET_KEY=...
export NEXT_PUBLIC_SITE_URL=https://<staging-origin>
export NEXT_PUBLIC_BETA_ACCESS_MODE=invite_only
```

Optional for direct SQL checks:

```bash
export SUPABASE_DB_URL=postgresql://...
```

## Tooling Check

```bash
npx supabase --version
npx supabase projects list
npx supabase migration list --linked
```

If running local Supabase instead of staging:

```bash
docker --version
npx supabase start
```

## Migration Verification

Confirm the staging project has all migrations through:

- `20260601074955_fix_evidence_items_offer_ownership.sql`
- `20260601075345_beta_access_onboarding_quotas.sql`

Then verify the policy/function objects exist:

```sql
select schemaname, tablename, policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename = 'evidence_items'
  and policyname = 'evidence_insert_own_pending';

select routine_schema, routine_name, security_type
from information_schema.routines
where routine_schema = 'app_private'
  and routine_name = 'require_beta_invite';
```

Expected:

- `evidence_insert_own_pending` includes `profile_id = auth.uid()`, `status = 'pending'`, and an owned-offer `exists` check.
- `app_private.require_beta_invite` exists as a `SECURITY DEFINER` function.

## Auth Invite Hook Verification

1. In Supabase Dashboard, set Auth Hook `Before User Created` to `app_private.require_beta_invite(event jsonb)`.
2. Insert one invited staging email:

```sql
insert into app_private.beta_invites (email, status, notes)
values ('invited-staging@example.com', 'pending', 'staging verification')
on conflict (email) do update
set status = excluded.status,
    notes = excluded.notes,
    accepted_at = null,
    expires_at = null;
```

3. Attempt signup with `invited-staging@example.com`; expected: user creation allowed.
4. Attempt signup with `not-invited-staging@example.com`; expected: user creation rejected.
5. Keep Google OAuth disabled until the same invited/non-invited behavior is verified for OAuth-created users.

## Evidence RLS / Direct DML Verification

Current production access model revokes direct authenticated `insert`, `update`, and `delete` on `offers`, `needs`, and `evidence_items`. That means the safest expected result is:

- Direct authenticated insert into `evidence_items` fails.
- App-owned onboarding writes go through the server action and service-role quota/idempotency checks.

If a future migration restores direct `authenticated` inserts, run the stricter two-user RLS test:

- User A inserting pending evidence with `offer_id = null`: allowed.
- User A inserting pending evidence for User A's offer: allowed.
- User A inserting pending evidence for User B's offer: rejected.
- User A inserting non-pending evidence for User A's offer: rejected.

## Storage Verification

In Supabase Dashboard, confirm:

- Bucket `evidence` is private.
- File size limit is `10485760`.
- Allowed MIME types are `image/png`, `image/jpeg`, `image/webp`, `application/pdf`, `text/plain`.
- `storage.objects` policies keep user access scoped to the first path segment equal to `auth.uid()`.

## Vercel Verification

In Vercel staging/production settings, confirm:

- `NEXT_PUBLIC_BETA_ACCESS_MODE=invite_only`.
- `SUPABASE_SECRET_KEY` is server-only and not prefixed with `NEXT_PUBLIC_`.
- `DEV_ADMIN_ACCESS_CODE` is absent in production.
- Build command is `npm run build`.
- Runtime is Next/Vercel; `server.js` is not used.

## App Smoke Tests

Run locally or in CI after staging env vars are set:

```bash
npm run lint
npm test
npm run build
npm run test:e2e
npm audit --omit=dev --audit-level=moderate
```

Then manually verify:

- Signup UI does not expose public account creation in invite-only mode.
- Magic-link sign-in does not create a new user for a non-existing email.
- Onboarding resubmission updates the primary offer/need instead of appending duplicates.
- Admin CSV export opens with formula-like values neutralized as literal text.
