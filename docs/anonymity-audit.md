# Anonymity audit — WatchSentry

This is a living checklist. Re-run before every public-artifact ship (CWS submission, landing-page DNS go-live, paid-tier announcement, new public account creation).

## The rule (per `feedback_anonymity_strict.md` in user memory)

No personal information about the operator appears on any public-facing surface. Brand identity (`WatchSentry`) is the only name visible externally.

## Standing checklist

- [ ] Domain WHOIS — Cloudflare Registrar, privacy ON (default-on; confirm in cart at purchase time)
- [ ] CWS developer profile display name — `WatchSentry`, not real name
- [ ] CWS support email — `support@watchsentry.app` (backed by Cloudflare Email Routing to private inbox)
- [ ] GitHub repo visibility — PRIVATE
- [ ] Git author email — `<id>+kungfury-sketch@users.noreply.github.com`
- [ ] Git author name — `WatchSentry Bot`
- [ ] GitHub `kungfury-sketch` profile — brand-only (no real name in profile name, bio, gravatar, public email)
- [ ] Landing page footer — brand only, no operator name
- [ ] Privacy policy contact — brand email only
- [ ] Terms of service signing party — brand entity name, no real name
- [ ] Any tracking/analytics — internal only, never publicly exposed dashboards
- [ ] Cloudflare account profile — fine as-is (internal)
- [ ] Lemon Squeezy (Phase 1) — brand product page; real KYC kept internal

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
