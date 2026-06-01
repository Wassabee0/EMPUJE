# Production Configuration Checklist

Last updated: 2026-06-01

Use this before any public production launch. The codebase now assumes a closed beta unless an explicit owner decision changes it.

## Supabase Auth

- [ ] Apply all migrations, including `20260601075345_beta_access_onboarding_quotas.sql`.
- [ ] Set Auth Hook `Before User Created` to Postgres function `app_private.require_beta_invite(event jsonb)`.
- [ ] Insert invited beta emails into `app_private.beta_invites` as normalized lowercase addresses with `status = 'pending'`.
- [ ] Keep email confirmation enabled.
- [ ] Keep Google OAuth disabled until the invite hook is verified against OAuth-created users.
- [ ] Enable CAPTCHA in Auth → Bot and Abuse Protection with Cloudflare Turnstile or hCaptcha.
- [ ] Review Auth → Rate Limits, especially signup confirmation, OTP/magic-link, email-send, token, and verify endpoints.
- [ ] Enable IP address forwarding for Auth rate limits if production traffic is behind Vercel/proxying.
- [ ] Confirm redirect URLs include only localhost development URLs and the production `/auth/callback` URL.

## Supabase Storage

- [ ] Confirm bucket `evidence` is private.
- [ ] Confirm bucket `evidence` keeps `file_size_limit = 10485760`.
- [ ] Confirm allowed MIME types are `image/png`, `image/jpeg`, `image/webp`, `application/pdf`, and `text/plain`.
- [ ] Confirm `storage.objects` policies allow users to insert/select only their own first path segment and admins to select evidence.
- [ ] Do not enable public evidence URLs, file previews, or server-side URL fetching without a separate malware/phishing review.

## Vercel

- [ ] Set `NEXT_PUBLIC_SUPABASE_URL`.
- [ ] Set `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- [ ] Set `SUPABASE_SECRET_KEY` as a server-only secret. Do not prefix it with `NEXT_PUBLIC_`.
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the production origin.
- [ ] Set `NEXT_PUBLIC_BETA_ACCESS_MODE=invite_only`.
- [ ] Do not set `DEV_ADMIN_ACCESS_CODE` in production.
- [ ] Build command is `npm run build`; production start path is Next.js/Vercel, not `server.js`.
- [ ] Confirm `npm run serve:legacy` is absent and `server.js` cannot start with `NODE_ENV=production`.

## Admin Creation

- [ ] Create the founder account through Supabase Auth or a vetted invite.
- [ ] Promote exactly the intended founder email in SQL:

```sql
update public.profiles
set role = 'admin', status = 'active'
where email = 'founder@example.com';
```

- [ ] Record the timestamp, operator, email, and reason for every admin promotion in the launch notes.
- [ ] Do not grant admin via user-editable metadata.
- [ ] Keep admin exports restricted to authenticated users with `profiles.role = 'admin'`.

## Logging And Alerting

- [ ] Route Vercel function logs to the chosen log sink.
- [ ] Alert on spikes in structured `security-events`: `onboarding_submit`, `onboarding_rejected`, `upload_quota_rejected`, and `admin_export`.
- [ ] Alert on Supabase Auth signup and magic-link/OTP spikes from Auth logs or dashboard metrics.
- [ ] Alert on Storage object-count and byte-growth spikes for bucket `evidence`.
- [ ] Alert on repeated admin CSV exports or exports outside expected review windows.
- [ ] Review Supabase Auth audit logs weekly during beta.

Suggested first beta thresholds:

- Signup/user-created attempts: any non-invited rejection burst above 10 per hour.
- Magic-link/OTP sends: more than 10 per hour total or 3 per hour for the same email.
- Onboarding submissions: more than 5 per hour total or 2 per day for the same user.
- Upload growth: more than 100 MB/day in `evidence`.
- Admin exports: more than 3/day or any export by an unexpected admin.
