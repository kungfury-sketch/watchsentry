# Anonymity audit — WatchSentry

This is a living checklist. Re-run before every public-artifact ship (CWS submission, landing-page DNS go-live, paid-tier announcement, new public account creation).

## The rule (per `feedback_anonymity_strict.md` in user memory)

No personal information about the operator appears on any public-facing surface. Brand identity (`WatchSentry`) is the only name visible externally.

## Standing checklist

**Status as of 2026-05-20 (post-Session-5 re-audit — pre-CWS-submission checkpoint):**

- [x] Domain WHOIS — Cloudflare Registrar, privacy ON. `watchsentry.app` registered 2026-05-18 with default WHOIS privacy.
- [x] CWS developer profile display name — `WatchSentry`. Registered 2026-05-18.
- [x] CWS support email — `support@watchsentry.app` (verified via Cloudflare Email Routing → forwards to private gmail inbox).
- [x] GitHub repo visibility — PRIVATE. Confirmed at https://github.com/kungfury-sketch/watchsentry.
- [x] Git author email — `264698993+kungfury-sketch@users.noreply.github.com`. Verified 2026-05-20 across all commits since last audit (real-DOM fix + CORS + parser robustness + UI polish + worker cap tuning + CWS docs + session-log closeout). Zero personal-domain emails in author/committer fields anywhere.
- [x] Git author name — `WatchSentry Bot`. Verified 2026-05-20 across all commits.
- [x] GitHub `kungfury-sketch` profile — brand-only. User-confirmed: no real name in profile name, no gravatar, no personal bio, no public email.
- [x] Landing page footer — brand only. Reviewed 2026-05-19: `landing/index.html` shows brand name, support email, privacy/terms links. NO operator name anywhere.
- [x] Privacy policy contact — `support@watchsentry.app` only. Reviewed 2026-05-19: `landing/privacy.html` has zero personal info; uses "we" / brand language only.
- [x] Terms of service signing party — `landing/terms.html` uses "we" + brand language only, no real name. NO operator identity revealed.
- [x] CWS listing copy — `cws/listing-copy.md` reviewed 2026-05-20. All copy refers to "WatchSentry" only; no operator name. Support contact uses brand email or GitHub noreply as documented audit debt.
- [x] CWS screenshot plan — `cws/screenshot-plan.md` explicitly directs the human capturing screenshots to use a clean Chrome profile (no bookmarks, no autocomplete, no avatar). PII-leak risk gated by capture-time discipline.
- [x] CWS demo video shot list — `cws/demo-shotlist.md` directs the recorder to use Unlisted YouTube + anonymous channel name.
- [x] Any tracking/analytics — internal only. Pattern locked: Cloudflare Web Analytics (free, privacy-respecting) when landing site goes live; no third-party analytics SDKs.
- [x] Cloudflare account profile — internal-only. Login email visible only via `wrangler whoami`; account-level resources require authentication to view.
- [x] Cloudflare Worker deployment author metadata — internal dashboard metadata only (`cil.omerr@gmail.com` appears in `wrangler deployments list` but is NOT exposed on any public surface). Flagged as awareness item, NOT a violation. Re-confirmed 2026-05-20: two new deploys this session (afc8d1c6 with CORS, 31280a03 with cap tuning), neither changed public-facing surfaces.
- [x] No PII grep across all tracked files (excluding the documented audit-debt files) — ran 2026-05-20: `git ls-files | grep -v -E '(docs/anonymity-audit|docs/plans/2026-05-18|progress/session-log)' | xargs grep -l -i -E 'omer|cil|hotmail|@gmail|claude|anthropic|kungfury|264698993'` returned ZERO matches. Clean.
- [ ] Lemon Squeezy (Phase 1) — brand product page; real KYC kept internal. **NOT APPLICABLE YET** (Phase 1, post-Phase-0-launch).
- [x] eBay Developer App — `WatchSentry` as app name, `support@watchsentry.app` as compliance contact. Registered 2026-05-18, **ACTIVATED 2026-05-19**.
- [x] No PII grep on landing source — ran 2026-05-19 against `landing/`: zero matches for `omer/cil/hotmail/gmail/claude/anthropic` outside the legitimate `support@watchsentry.app` brand email.

## Re-run triggers

Re-run the full checklist whenever any of the following happens:

- A new external account is registered (CWS, eBay, Lemon Squeezy, Reddit, any analytics service)
- A new domain or subdomain is bought
- A new public-facing surface ships (landing page content changes, new public page, new app store listing)
- A new scrape source is added that posts to a forum / Reddit / etc. under a brand account
- Phase 1 begins (Lemon Squeezy KYC, paid-tier marketing copy, affiliate program)
- Any pre-existing audit row needs to change (e.g. moving away from `kungfury-sketch` GH alias to another)
- Any `wrangler deploy` or `wrangler pages deploy` happens — re-verify nothing leaked into bundled output

## Audit-debt log

Use this section to record temporary exceptions (e.g. "CWS support email is `<gh-username>@users.noreply.github.com` until domain MX is live") with explicit remediation deadlines.

| Item | Reason | Remediation | Deadline |
|---|---|---|---|
| Operator workspace path `C:\omerprojects\watchsentry\` appears in committed plan, progress log, and audit doc | Session 0 plan was written with literal local paths; pre-existing finding | Strip `omerprojects` prefix from committed docs (mass find-replace to `<repo>\` or similar) **before** any change to repo visibility, OR move operational docs (plan, progress, audit) into a separate private repo | Before any change to repo visibility / before open-sourcing the extension |
| Placeholder extension icons (1×1 transparent PNGs) in `extension/icons/` | Session 4 manifest needed icons to build; brand-design phase deferred | Replace with branded 16/48/128 PNGs before CWS submission | Week 6 / Task 6.2 |
| Synthetic Chrono24 listing fixture in `extension/tests/fixtures/` | Session 4 lacked a user-captured real-page; parser tests use schema.org-compliant synthetic HTML | Re-capture real Chrono24 listing + search pages, re-verify parsers | Before Phase 1 paid tier ships |
| `workers_dev = true` + `preview_urls = true` are implicit Wrangler defaults | Session 2 first remote deploy left these at defaults | Make explicit in `wrangler.toml`; consider setting `preview_urls = false` to reduce attack surface | Before `https://watchsentry-api.txrz.workers.dev` URL is linked from any public surface (landing CTA, CWS listing, README) |
| `*.workers.dev` subdomain `txrz` is account-level (auto-generated, opaque) | All workers on the user's Cloudflare account share the `txrz` subdomain — does NOT visibly tie WatchSentry to other projects but enumeration of `*.txrz.workers.dev` would | Cut over to `api.watchsentry.app` custom Worker route; disable `workers_dev = true` once the custom route is the only entry point | Before CWS publish (Week 5/6) |
| CTA link on `landing/index.html` is a placeholder ("Coming soon to Chrome Web Store") | Real chromewebstore.google.com/detail/<id> URL only exists after CWS approval | Replace placeholder with the real CWS detail URL after CWS submission lands | Week 6 / immediately post-CWS-approval |
| Cloudflare Worker deployment metadata shows `cil.omerr@gmail.com` as Author | Internal dashboard data only; not exposed on any public surface. Tied to the Cloudflare account holder; cannot be hidden without account-level changes | None required (acceptable). Avoid screenshotting `wrangler deployments list` or the CF dashboard publicly | n/a — awareness only |
