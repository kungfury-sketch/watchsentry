# Anonymity audit — WatchSentry

This is a living checklist. Re-run before every public-artifact ship (CWS submission, landing-page DNS go-live, paid-tier announcement, new public account creation).

## The rule (per `feedback_anonymity_strict.md` in user memory)

No personal information about the operator appears on any public-facing surface. Brand identity (`WatchSentry`) is the only name visible externally.

## Standing checklist

**Status as of 2026-05-18 (end of Session 0):**

- [x] Domain WHOIS — Cloudflare Registrar, privacy ON. `watchsentry.app` registered 2026-05-18 with default WHOIS privacy.
- [x] CWS developer profile display name — `WatchSentry`. Registered 2026-05-18.
- [x] CWS support email — `support@watchsentry.app` (verified via Cloudflare Email Routing → forwards to private gmail inbox).
- [x] GitHub repo visibility — PRIVATE. Confirmed at https://github.com/kungfury-sketch/watchsentry.
- [x] Git author email — `264698993+kungfury-sketch@users.noreply.github.com`. Verified via `git log --pretty=fuller` across all commits.
- [x] Git author name — `WatchSentry Bot`. Verified across all commits.
- [x] GitHub `kungfury-sketch` profile — brand-only. User-confirmed: no real name in profile name, no gravatar, no personal bio, no public email.
- [ ] Landing page footer — brand only, no operator name. **NOT APPLICABLE YET** (landing/ folder not created until Week 5, Task 5.1).
- [ ] Privacy policy contact — brand email only. **NOT APPLICABLE YET** (Week 5, Task 5.1).
- [ ] Terms of service signing party — brand entity name, no real name. **NOT APPLICABLE YET** (Week 5).
- [x] Any tracking/analytics — internal only, never publicly exposed dashboards. Pattern locked: Cloudflare Web Analytics (free, privacy-respecting) when landing site goes live; no third-party analytics SDKs.
- [x] Cloudflare account profile — fine as-is (internal). Login email visible only via `wrangler whoami`; account-level resources require authentication to view.
- [ ] Lemon Squeezy (Phase 1) — brand product page; real KYC kept internal. **NOT APPLICABLE YET** (Phase 1, post-Phase-0-launch).
- [x] eBay Developer App — `WatchSentry` as app name, `support@watchsentry.app` as compliance contact. Registered 2026-05-18, awaiting eBay activation (~24h).

## Re-run triggers

Re-run the full checklist whenever any of the following happens:

- A new external account is registered (CWS, eBay, Lemon Squeezy, Reddit, any analytics service)
- A new domain or subdomain is bought
- A new public-facing surface ships (landing page content changes, new public page, new app store listing)
- A new scrape source is added that posts to a forum / Reddit / etc. under a brand account
- Phase 1 begins (Lemon Squeezy KYC, paid-tier marketing copy, affiliate program)
- Any pre-existing audit row needs to change (e.g. moving away from `kungfury-sketch` GH alias to another)

## Audit-debt log

Use this section to record temporary exceptions (e.g. "CWS support email is `<gh-username>@users.noreply.github.com` until domain MX is live") with explicit remediation deadlines.

| Item | Reason | Remediation | Deadline |
|---|---|---|---|
| _(none yet)_ | | | |
