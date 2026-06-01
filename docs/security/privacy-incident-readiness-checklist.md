# Privacy And Incident Readiness Checklist

Last updated: 2026-06-01

This checklist is an operational readiness aid, not legal advice. Items marked **Legal review** should be reviewed by qualified counsel before production launch.

## Privacy And Legal Readiness

- [ ] **Legal review:** Publish a privacy notice for Empuje before collecting production beta data.
- [ ] **Legal review:** Identify the controller, contact email, and any processor relationships.
- [ ] **Legal review:** State purposes for processing: account access, onboarding review, evidence verification, matching, abuse prevention, security logging, and support.
- [ ] **Legal review:** State legal bases for each processing purpose, including consent where used and legitimate interests where applicable.
- [ ] **Legal review:** Describe categories of data: profile details, business data, offers, needs, evidence links/files, admin notes, match decisions, auth identifiers, and security logs.
- [ ] **Legal review:** Explain that evidence files and links may be reviewed manually by Empuje admins.
- [ ] **Legal review:** Document user rights and response process for access, rectification, deletion, objection, portability, and restriction.
- [ ] **Legal review:** Confirm whether a Data Processing Agreement is needed with Supabase, Vercel, email providers, logging providers, CAPTCHA providers, and analytics tools.
- [ ] Keep service-role keys and admin access limited to operators with a launch need.
- [ ] Document the abuse/security contact that members and third parties can use.

## Acceptable Use And Abuse Policy

- [ ] **Legal review:** Publish beta terms or acceptable-use rules before production launch.
- [ ] Prohibit phishing, spam, scams, credential harvesting, impersonation, malware, and abusive automation.
- [ ] Prohibit uploading illegal content, personal data of third parties without authority, secrets, credentials, or sensitive documents not needed for verification.
- [ ] Prohibit evidence links that point to malware, deceptive pages, credential prompts, or unauthorized private content.
- [ ] State that Empuje may reject profiles, remove evidence, suspend accounts, or preserve evidence for investigation.
- [ ] State that matches and introductions are manually reviewed and not guaranteed.
- [ ] Require members to have rights to the business claims, images, files, and links they submit.
- [ ] Provide an abuse-reporting email and internal escalation owner.

## Data Retention And Deletion

- [ ] **Legal review:** Define retention periods for rejected beta applicants, inactive members, evidence files, admin notes, security logs, and export artifacts.
- [ ] Do not keep downloaded admin exports longer than needed for operational review.
- [ ] Delete rejected-user evidence files after the approved retention period unless needed for abuse investigation or legal hold.
- [ ] Define a deletion workflow that removes Supabase Auth user, profile, offers, needs, evidence metadata, and Storage objects.
- [ ] Define how admin notes and security logs are handled when a user requests deletion.
- [ ] Review Storage bucket growth monthly during beta.
- [ ] Review `app_private.beta_invites` monthly and revoke expired or unused invites.

Suggested initial retention draft for legal review:

- Rejected or abandoned beta applications: 90 days.
- Evidence files for rejected applications: 90 days.
- Active member evidence: while the account is active plus 180 days after closure.
- Security logs: 180 days.
- Admin exports: delete local copies within 7 days unless needed for incident handling.

## Incident Response

- [ ] Name primary and backup incident responders.
- [ ] Keep a private incident log template with date/time, reporter, affected systems, data categories, containment actions, and decisions.
- [ ] Triage whether the event affects confidentiality, integrity, availability, or abuse of outbound trust.
- [ ] Preserve relevant Vercel logs, Supabase Auth logs, database audit data, Storage object metadata, and admin export history.
- [ ] Rotate exposed secrets immediately if service-role, OAuth, SMTP, or Vercel tokens may be involved.
- [ ] Disable affected Auth providers, invites, or routes if abuse is active.
- [ ] Remove malicious evidence links/files and suspend accounts involved in abuse.
- [ ] **Legal review:** For personal-data breaches, assess GDPR/AEPD notification duties promptly. Spanish controllers may need to notify reportable breaches within 72 hours after awareness.
- [ ] **Legal review:** Decide whether affected users, processors, partners, or regulators need notification.
- [ ] After containment, write a short post-incident review with root cause, impact, timeline, remediation, and follow-up owner.

## Launch Gate

- [ ] Privacy notice reviewed and published.
- [ ] Acceptable-use/abuse policy reviewed and published.
- [ ] Retention periods approved.
- [ ] Incident owner and backup named.
- [ ] Abuse contact email exists and is monitored.
- [ ] Processor list and DPAs reviewed.
- [ ] Dashboard controls from `docs/security/production-configuration-checklist.md` verified in production.
