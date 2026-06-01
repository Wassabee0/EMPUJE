# Production Hardening State

Last updated: 2026-06-01

## Objective

Fix production-blocking security findings from:

- `/tmp/codex-security-scans/Empuje/1419b14_20260530T203944Z/report.md`
- `/tmp/codex-security-scans/Empuje/1419b14_20260530T203944Z/report.html`

This file is the durable checkpoint for agent handoff and context compaction. Update it after each completed task group.

## Current Phase

All four task groups complete. Code verification and staging database verification passed for the linked staging project. Production launch remains blocked on external dashboard/legal readiness steps listed below.

## Completed

- [x] Legacy server disabled or removed from production path.
- [x] CSV formula injection fixed.
- [x] Evidence RLS ownership policy fixed.
- [x] Auth abuse controls implemented or explicitly configured.
- [x] Onboarding idempotency and quotas implemented.
- [x] Production configuration checklist completed.
- [x] Privacy/legal readiness checklist drafted.
- [x] Full verification passed.

## Decisions Needed

- CAPTCHA/bot challenge provider: configure Supabase Auth CAPTCHA in dashboard and set matching Vercel public CAPTCHA env vars; Cloudflare Turnstile preferred, hCaptcha acceptable.
- Rate-limit storage/backend: Supabase Auth dashboard rate limits for auth endpoints; app-side server action quotas for onboarding storage.
- Beta access model: invite-only in production. `NEXT_PUBLIC_BETA_ACCESS_MODE=invite_only`; Supabase `Before User Created` hook `public.require_beta_invite(event jsonb)` must be enabled before external traffic.
- Evidence upload quotas: 1 onboarding offer, 1 onboarding need, 8 evidence links, 5 evidence files, 20 MB total uploaded bytes per user, 10 MB per file at the Storage bucket.
- Disposable email policy: not separately implemented; invite-only email allowlist is the production gate.
- Production deployment target: Vercel, per README and production checklist.
- Supabase staging project: owner confirmed project ref `ifphiqzvslsxnqkatton`.

## Security Findings To Fix

1. Conditional high: legacy `server.js` static PIN export can expose beta data if deployed.
2. Medium: public Google OAuth, signup, and magic-link flows lack an app-owned hosted-abuse gate.
3. Medium: repeated onboarding can amplify records, files, and admin workload.
4. Medium: admin CSV export can carry member-controlled spreadsheet formulas.
5. Medium: `evidence_items` RLS lets a member attach pending evidence to another member's offer if they know the offer UUID.

## Suggested Task Groups

### Task Group 1: Hard Blockers

- Disable or remove the legacy `server.js` production path.
- Fix CSV formula neutralization in `lib/export.ts`.
- Fix `evidence_items` RLS ownership policy.
- Add focused tests for each fix.

### Task Group 2: Hosted Abuse Controls

- Decide beta access model.
- Add app-side rate limiting for auth-adjacent server-owned flows where applicable.
- Configure Supabase Auth CAPTCHA/rate-limit controls in production.
- Add onboarding idempotency.
- Add per-user quotas for offers, needs, evidence links, file count, and uploaded bytes.

### Task Group 3: Production Configuration Audit

- Review Supabase Auth signup, CAPTCHA, email confirmation, OAuth, redirect, and rate-limit settings.
- Review Supabase Storage bucket privacy, MIME limits, object size limits, and policies.
- Review Vercel environment variables and deployment commands.
- Confirm `server.js` is not deployed or reachable.
- Confirm admin creation process is manual and audited.
- Add logging/alerts for signup spikes, magic-link spikes, onboarding spikes, upload spikes, and admin exports.

### Task Group 4: Privacy And Incident Readiness

- Draft production privacy checklist.
- Draft terms/acceptable-use checklist prohibiting phishing, spam, impersonation, malware, and abusive uploads.
- Draft data retention and deletion notes.
- Draft incident-response checklist, including AEPD/GDPR breach triage.
- Add abuse contact and internal escalation notes.

## Files Changed

- `docs/security/production-hardening-state.md`: durable hardening checkpoint.
- `package.json`: removed `serve:legacy`.
- `server.js`: added explicit local-only startup gate for the legacy prototype server, refuses production/Vercel, removes query-string admin PIN support, and binds only to `127.0.0.1`.
- `README.md`: documented the legacy prototype as local-only and production-disabled.
- `lib/export.ts`: neutralizes formula-like CSV cells before delimiter quoting.
- `supabase/migrations/20260526163000_initial_empuje_beta.sql`: tightened `evidence_items` insert RLS for fresh databases.
- `supabase/migrations/20260601074955_fix_evidence_items_offer_ownership.sql`: reapplies tightened `evidence_items` insert RLS for already-migrated databases.
- `tests/domain/export.test.ts`: added CSV formula and carriage-return coverage.
- `tests/domain/legacy-server.test.ts`: added npm-script removal, explicit local-mode, production/Vercel refusal, header-only PIN, and query-string PIN rejection coverage.
- `tests/server-collection.spec.js`: opts into local legacy mode for the historical Playwright legacy fixture.
- `tests/domain/supabase-rls.test.ts`: added static RLS policy coverage.
- `.env.example`: documented production beta access mode.
- `components/auth-form.tsx`: hides public signup when production beta access is invite-only, prevents magic links from creating users in that mode, and passes CAPTCHA tokens to Supabase email/password and OTP auth requests when CAPTCHA is configured.
- `components/captcha-widget.tsx`: loads Cloudflare Turnstile or hCaptcha from public env configuration and returns provider tokens to the auth form.
- `tests/domain/auth-captcha.test.ts`: verifies CAPTCHA token wiring and public CAPTCHA env documentation.
- `app/globals.css`: reserves stable space for the CAPTCHA widget in auth forms.
- `lib/onboarding.ts`: validates HTTP(S) evidence links and rejects over-quota link submissions instead of truncating silently.
- `lib/onboarding-quotas.ts`: centralizes onboarding quota constants, URL normalization, dedupe, and write planning.
- `lib/repository.ts`: makes onboarding writes idempotent for the primary offer/need, dedupes evidence links and files, hashes files, stores evidence byte metadata, and enforces quotas before service-role writes.
- `lib/types.ts`: adds evidence metadata fields.
- `supabase/migrations/20260601075345_beta_access_onboarding_quotas.sql`: adds private beta invites, invite-only Auth hook function, onboarding idempotency keys, evidence metadata columns, uniqueness indexes, and revokes direct member mutations for offer/need/evidence tables.
- `supabase/migrations/20260601124314_revoke_authenticated_onboarding_table_ddl_privileges.sql`: revokes remaining `truncate`, `references`, and `trigger` privileges from `authenticated` on offer/need/evidence onboarding tables.
- `supabase/migrations/20260601134935_grant_auth_admin_usage_on_app_private.sql`: grants `supabase_auth_admin` schema usage on `app_private` so the private invite hook is discoverable/configurable by Supabase Auth.
- `supabase/migrations/20260601140636_public_invite_hook_wrapper.sql`: adds dashboard-selectable `public.require_beta_invite(event jsonb)` wrapper that delegates to the private invite hook and is executable only by Supabase Auth.
- `tests/domain/beta-access-migration.test.ts`: verifies invite hook and quota migration controls.
- `tests/domain/onboarding-quotas.test.ts`: verifies quota planning, dedupe, file count, and byte limits.
- `tests/domain/onboarding.test.ts`: verifies evidence URL validation and link quota rejection.
- `app/actions.ts`: emits structured security events for onboarding validation failures, quota/save failures, and successful submissions.
- `app/api/admin/export/route.ts`: emits structured security events for admin exports.
- `lib/security-events.ts`: centralizes redacted structured security event logging.
- `tests/domain/security-events.test.ts`: verifies security events omit sensitive metadata such as raw email.
- `docs/security/production-configuration-checklist.md`: production checklist for Supabase Auth, Storage, Vercel, admin creation, and logging/alerting.
- `docs/security/privacy-incident-readiness-checklist.md`: privacy/legal, acceptable-use, retention, and incident-response readiness checklist with legal-review flags.
- `docs/security/staging-verification-runbook.md`: exact staging verification commands and dashboard checks to run once Supabase/Vercel access exists.

## Pending Tasks

External production blockers remain:

- Enable and verify Supabase Auth `Before User Created` hook `public.require_beta_invite(event jsonb)`.
- Seed and test production `app_private.beta_invites` with invited and non-invited emails.
- Enable and verify Supabase CAPTCHA provider, set Vercel CAPTCHA public env vars, redeploy, and verify Auth rate limits.
- Confirm Google OAuth stays disabled until invite-hook behavior is tested for OAuth-created users.
- Confirm Supabase Storage bucket settings and policies in the production project.
- Configure Vercel log routing and alerts.
- Complete legal review and publication of privacy notice, acceptable-use policy, retention policy, and incident process.

External verification, 2026-06-01:

- `npm run test:e2e` was rerun after stopping the conflicting local Next dev server. Result: PASS, 12 Playwright tests.
- Supabase CLI is available through `npx supabase --version` as `2.103.0`.
- Supabase CLI is now logged in and linked to project ref `ifphiqzvslsxnqkatton` (`eneritzges@gmail.com's Project`, West Europe/London, created 2026-06-01 09:49:28 UTC).
- User confirmed `ifphiqzvslsxnqkatton` is staging and approved migration application.
- User applied the first five migrations externally; a follow-up migration was created and applied from this session.
- `npx supabase db push --linked` applied `20260601124314_revoke_authenticated_onboarding_table_ddl_privileges.sql`.
- `npx supabase migration list --linked` now shows remote entries through `20260601140636`.
- Remote privilege query confirms `authenticated` has `select=true` and `insert/update/delete/truncate/references/trigger=false` on `public.offers`, `public.needs`, and `public.evidence_items`.
- Remote `app_private.require_beta_invite(event jsonb)` exists, is `SECURITY DEFINER`, returns `jsonb`, and has `search_path=app_private, public`.
- Remote routine privileges for `app_private.require_beta_invite(jsonb)` are limited to `postgres` and `supabase_auth_admin`.
- Remote schema privilege query confirms `supabase_auth_admin` has `USAGE` on `app_private`, needed for Auth hook selection/discovery.
- Remote `public.require_beta_invite(event jsonb)` exists, is not `SECURITY DEFINER`, delegates to `app_private.require_beta_invite`, is executable by `supabase_auth_admin`, and is intended for the Supabase Dashboard hook selector under schema `public`.
- Direct function proof: non-invited email returns `{"error":{"http_code":403,"message":"Empuje beta is invite-only."}}`; an invited email inserted inside a rolled-back transaction returns `{}`; rollback left zero staging verification invites behind.
- Remote `evidence` Storage bucket exists, is private, has `file_size_limit=10485760`, and allows `image/png`, `image/jpeg`, `image/webp`, `application/pdf`, and `text/plain`.
- Remote Storage policies `evidence_storage_insert_own_folder` and `evidence_storage_select_own_or_admin` are present and scope object paths to the first folder segment equal to `auth.uid()`, with admin read access.
- Remote `offers`, `needs`, and `evidence_items` policies are present; `evidence_insert_own_pending` includes owned-offer enforcement.
- `npx supabase db advisors --linked --type security --fail-on none` returned `No issues found`.
- Earlier pre-application `db push --include-all` attempts hit a temporary Supabase pooler `ECIRCUITBREAKER`; sequential linked CLI queries and the final follow-up push now work. Avoid parallel `db query --linked` calls against this project.
- `npx supabase status` remains blocked because Docker is not installed/running in this environment.
- No Supabase MCP tools were available through tool discovery.
- Remaining staging dashboard checks: confirm the Auth hook is enabled in Dashboard, CAPTCHA/rate limits are configured, redirect URLs are constrained, and Google OAuth remains disabled until invited/non-invited OAuth signup is tested.
- Vercel project `eneritzges-gmailcoms-projects/empuje` is linked locally and production env names are configured for `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, and `NEXT_PUBLIC_BETA_ACCESS_MODE=invite_only`. CAPTCHA public env vars still need the provider site key.
- Production was redeployed to `https://empuje.vercel.app` after env configuration. A live `curl` check no longer finds the Supabase missing-key notice on the public page.
- Temporary key note: Vercel currently uses the legacy Supabase `SUPABASE_SERVICE_ROLE_KEY` fallback because Supabase CLI masks the newer `sb_secret` key after creation. Replace it with a freshly created `SUPABASE_SECRET_KEY` from the Supabase dashboard before final production launch.

Task Group 1 notes:

- `git status --short` was run before edits. Pre-existing unrelated local changes were present in `next-env.d.ts`, `docs/security/`, and `prototypes/*`; they were not reverted.
- Legacy path decision: keep `server.js` for local historical prototype compatibility, but remove npm exposure, require `LEGACY_SERVER_MODE=local`, refuse production and Vercel-like environments, bind only to `127.0.0.1`, and accept admin PINs only through `x-admin-pin`.
- CSV decision: preserve original text, prefix dangerous cells with an apostrophe, and quote formula-like cells. This covers `=`, `+`, `-`, `@`, leading tab/carriage return, and whitespace before formula triggers.
- RLS decision: allow nullable `offer_id` evidence rows to preserve the schema contract, but require any referenced offer to belong to the authenticated user.
- Runtime proof: staging policy inspection confirms the owned-offer RLS predicate is deployed. A full two-user Data API smoke test remains useful before production traffic, but direct member DML is currently revoked for the onboarding tables.

Task Group 2 notes:

- Beta access decision: production is invite-only. Signup UI is hidden when `NEXT_PUBLIC_BETA_ACCESS_MODE=invite_only`, and magic links use `shouldCreateUser: false` in that mode.
- Supabase Auth gate: migration `20260601075345_beta_access_onboarding_quotas.sql` creates `app_private.beta_invites` and `app_private.require_beta_invite(event jsonb)` for the `Before User Created` hook. Dashboard activation is still an external production step.
- Direct DML bypass decision: migrations revoke `insert`, `update`, `delete`, `truncate`, `references`, and `trigger` on `offers`, `needs`, and `evidence_items` from `authenticated` so onboarding writes go through the service-role server action and its quotas.
- Onboarding idempotency decision: each user has one primary onboarding offer and one primary onboarding need. Re-running onboarding updates those rows instead of appending new rows.
- Quota decision: 1 offer, 1 need, 8 evidence links, 5 evidence files, 20 MB total uploaded bytes, and 10 MB per file via Storage bucket settings.
- Runtime proof gap: Supabase Auth dashboard settings, the Auth hook activation, Auth rate/CAPTCHA enforcement after setting the public CAPTCHA site key, and final replacement of the legacy service-role fallback with `SUPABASE_SECRET_KEY` still need dashboard verification in the production project.

Task Group 3 notes:

- Production configuration checklist lives at `docs/security/production-configuration-checklist.md`.
- Supabase Auth checklist covers invite hook activation, invited-email seeding, email confirmation, CAPTCHA, rate limits, IP forwarding, OAuth gating, and redirect URLs.
- Supabase Storage checklist covers private `evidence` bucket, 10 MB object limit, allowed MIME types, storage RLS, and no public previews/fetching without a separate review.
- Vercel checklist covers env vars, `NEXT_PUBLIC_BETA_ACCESS_MODE=invite_only`, no `DEV_ADMIN_ACCESS_CODE`, and confirming the Next.js production path rather than `server.js`.
- Admin process remains manual SQL promotion with an audit note; no user metadata is used for admin authorization.
- Logging decision: app-owned security events are structured JSON through Vercel logs. External alerts still need to be configured in the chosen log sink and Supabase dashboard.

Task Group 4 notes:

- Privacy and incident checklist lives at `docs/security/privacy-incident-readiness-checklist.md`.
- It is explicitly not legal advice and marks privacy notice, lawful basis, processor/DPA, acceptable-use, retention, deletion, GDPR/AEPD, and notification decisions for legal review.
- Acceptable-use checklist prohibits phishing, spam, impersonation, malware, abusive automation, unauthorized third-party data, deceptive links, and abusive uploads.
- Retention draft for legal review: 90 days for rejected/abandoned applications and rejected evidence, active account plus 180 days for active member evidence, 180 days for security logs, and 7 days for local admin exports.
- Incident response checklist includes triage, evidence preservation, secret rotation, provider/route disablement, abusive evidence removal, account suspension, notification assessment, and post-incident review.

## Verification Commands

Run after each task group where applicable:

```bash
npm run lint
npm test
npm run build
npm audit --omit=dev --audit-level=moderate
```

For RLS changes, also run a Supabase-backed two-user policy test if a local or remote test project is available.

Latest focused verification, 2026-06-01:

```bash
npx vitest run tests/domain/export.test.ts
# PASS: 1 file, 4 tests.

npx vitest run tests/domain/legacy-server.test.ts
# PASS: 1 file, 7 tests.

npx vitest run tests/domain/supabase-rls.test.ts
# PASS: 1 file, 2 tests.

npx vitest run tests/domain/export.test.ts tests/domain/legacy-server.test.ts tests/domain/supabase-rls.test.ts tests/domain/beta-access-migration.test.ts tests/domain/onboarding.test.ts tests/domain/onboarding-quotas.test.ts tests/domain/security-events.test.ts
# PASS: 7 files, 27 tests.

npx vitest run tests/domain/beta-access-migration.test.ts tests/domain/onboarding.test.ts tests/domain/onboarding-quotas.test.ts
# PASS: 3 files, 13 tests.

npm run lint
# PASS: tsc --noEmit.

npx vitest run tests/domain/security-events.test.ts
# PASS: 1 file, 1 test.

npm run lint
# PASS after Task Group 3 logging changes: tsc --noEmit.

npx playwright test -c tests tests/server-collection.spec.js
# PASS: 2 tests. Note: this historical legacy Playwright fixture is outside the configured `tests/e2e` directory, so it was run with `-c tests`.

Full verification, 2026-06-01:

npm run lint
# PASS: tsc --noEmit.

npm test
# PASS: 20 files, 65 tests.

npm run build
# PASS: Next.js production build compiled, type-checked, and generated static pages.

npm audit --omit=dev --audit-level=moderate
# PASS: found 0 vulnerabilities.

npm run test:e2e
# PASS after stopping the conflicting local Next dev server: 12 Playwright tests.

npx supabase --version
# PASS: 2.103.0.

npx supabase status
# BLOCKED: cannot connect to Docker daemon; Docker is not installed/running in this environment.

npx supabase projects list
# PASS: linked project ref ifphiqzvslsxnqkatton visible.

npx vitest run tests/domain/beta-access-migration.test.ts
# RED before fix: 1 failed because no migration revoked truncate/references/trigger; GREEN after migration: 1 file, 3 tests.

npx supabase db push --linked
# PASS: applied 20260601124314_revoke_authenticated_onboarding_table_ddl_privileges.sql.

npx supabase migration list --linked
# PASS: remote migrations present through 20260601124314.

npx supabase db advisors --linked --type security --fail-on none
# PASS: No issues found.

npx vitest run tests/domain/beta-access-migration.test.ts
# RED before fix: 1 failed because no migration granted app_private schema usage to supabase_auth_admin; GREEN after migration: 1 file, 4 tests.

npx supabase db push --linked
# PASS: applied 20260601134935_grant_auth_admin_usage_on_app_private.sql.

npx supabase db query --linked "select n.nspname as schema, has_schema_privilege('supabase_auth_admin', n.oid, 'USAGE') as auth_admin_has_usage from pg_namespace n where n.nspname = 'app_private';"
# PASS: app_private auth_admin_has_usage=true.

npx supabase db advisors --linked --type security --fail-on none
# PASS: No issues found.

npx vitest run tests/domain/beta-access-migration.test.ts
# RED before fix: 1 failed because no public dashboard-selectable wrapper existed; GREEN after migration: 1 file, 5 tests.

npx supabase db push --linked
# PASS: applied 20260601140636_public_invite_hook_wrapper.sql.

npx supabase db query --linked "select n.nspname as schema, p.proname as function_name, pg_get_function_arguments(p.oid) as args, pg_get_function_result(p.oid) as result_type, p.prosecdef as security_definer, array_to_string(p.proconfig, ',') as config, has_function_privilege('supabase_auth_admin', p.oid, 'EXECUTE') as auth_admin_can_execute from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname in ('public','app_private') and p.proname = 'require_beta_invite' order by n.nspname;"
# PASS: app_private and public require_beta_invite functions exist; public wrapper is not security definer and supabase_auth_admin can execute it.

npx supabase db advisors --linked --type security --fail-on none
# PASS: No issues found.

npm test
# PASS: 18 files, 56 tests.

npm run lint
# PASS: tsc --noEmit.

npm run build
# PASS: Next.js production build compiled, type-checked, and generated static pages.

npm audit --omit=dev --audit-level=moderate
# PASS: found 0 vulnerabilities.

npm run test:e2e
# PASS: 4 Playwright tests. Warnings only: Node DEP0205 and NO_COLOR/FORCE_COLOR.

npx vitest run tests/domain/auth-captcha.test.ts
# RED before fix: 2 failed because auth requests did not include captchaToken and CAPTCHA env was undocumented; GREEN after fix: 1 file, 2 tests.

npm run lint
# PASS: tsc --noEmit.

npm test
# PASS: 19 files, 60 tests.

npm run build
# PASS: Next.js production build compiled, type-checked, and generated static pages.
```

## Context Compaction Guardrail

If context compacts, read this file first, then read:

1. `/tmp/codex-security-scans/Empuje/1419b14_20260530T203944Z/report.md`
2. `git status --short`
3. Any latest test output recorded in this file

Continue from `Pending Tasks`. Do not restart from scratch. Do not revert user changes. Do not modify production behavior without updating this state file and running the relevant verification commands.
