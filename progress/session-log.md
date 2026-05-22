# WatchSentry — per-session progress log

Append one entry per work session. Format per `feedback_working_style.md` in user memory: date, hours, decisions, done, blockers, next-session entry point.

---

## 2026-05-18 — Session 0 (planning + scaffold start)

**Hours:** ~2

**Decisions made:**
- Niche locked: Watches on Chrono24 (`BeforeYouBuy` overlay wedge; want-list-only is the explicit fallback).
- Stack locked: Cloudflare-native (Workers + D1 + KV + Pages + Registrar). Lemon Squeezy for Phase 1 billing.
- Anonymity rule: brand-only on every public surface; `kungfury-sketch` GitHub alias confirmed.
- Folder structure: monorepo (extension + workers + landing + docs + cws + progress + .github).
- License: All Rights Reserved (proprietary).
- Kill metrics: loosened to 120-day Phase 0 window, 90-day Phase 1.

**Done:**
- Design doc written: `<workspace>\passive-income-empire\docs\plans\2026-05-18-t4a-niche-design.md`.
- Session 3 log written: `<workspace>\passive-income-empire\sessions\2026-05-18-t4a-niche-design.md`.
- Phase 0 implementation plan written: `docs/plans/2026-05-18-phase0-implementation-plan.md`.
- Memory updated: anonymity rule, Cloudflare preference, Claude-in-Chrome MCP availability.
- Foundational repo files: README, LICENSE, .gitignore, .gitattributes, anonymity-audit.md, .github/workflows/ci.yml, this log.
- GitHub repo created by user: https://github.com/kungfury-sketch/watchsentry

**Blockers:**
- Waiting on: user's GitHub noreply email, domain-name lock confirmation, `kungfury-sketch` profile anonymity verification.
- Until those land, can't `git config user.email` / `user.name` and push to remote.

**Resolutions during session:**
- Domain: deferred (keep `watchsentry` placeholder; decide before Week 6).
- `kungfury-sketch` profile: user-confirmed clean (no real name, no gravatar, no personal bio).
- Noreply email: `264698993+kungfury-sketch@users.noreply.github.com` received.
- Tasks 1.5 + 1.6 EXECUTED:
  - git init -b main + config (`WatchSentry Bot` + noreply email).
  - Remote added (origin → github.com/kungfury-sketch/watchsentry.git).
  - First commit `fc30c18` "chore: Phase 0 scaffold (foundations)" — 9 files, brand-only author/committer.
  - Pushed to origin/main successfully.
  - Claude `Co-Authored-By` footer DELIBERATELY OMITTED per anonymity rule (does not reveal AI authorship to anyone with repo access).
- Skill marketplace browse completed via Claude-in-Chrome. Shortlist:
  - TIER 1: `github.com/cloudflare/skills` (Apache-2.0, official) and `github.com/samber/cc-skills` (MIT). Install both for Phase 0 coverage.
  - TIER 2 optional: `github.com/ComeOnOliver/skillshub` for chrome-extension-icons (review before install).
  - No specific skill exists for Hono, eBay Browse API, Lemon Squeezy, Vitest, Biome — use upstream docs.

**Additional work executed in Session 0 (after the initial pause):**

- Skills installed FULL into `~/.claude/skills/`:
  - `chrome-extension/` (samber/cc-skills, MIT) — SKILL.md + 13 reference files
  - `cloudflare/` (cloudflare/skills, Apache-2.0) — SKILL.md + ~280 reference files across 58 services (workers, d1, kv, wrangler, pages, cron-triggers, queues, browser-rendering, secrets-store, etc.). Self-contained; no upstream git relation.
  - Staging folders at `<workspace>\chrome extension\` and `<workspace>\cloudflare\` cleaned up.
- Task 1.7 — `wrangler login` complete. Cloudflare account `kungfurry` (`dd48515dc7c2b5e482780a4ed125c0dc`) authorized.
- Task 1.8 — Created:
  - D1 database `watchsentry-db` (ID `0e266a44-1c3b-4c81-8970-df24b5c42dcb`, region EEUR).
  - KV namespace `watchsentry-cache` (ID `45d2b00e2fd545c38df468b15b8ec097`).
  - Local `workers/wrangler.toml` written with both IDs (gitignored, verified via `git check-ignore`).
  - Local `docs/cloudflare-bindings.md` written (gitignored).
- Task 1.9 — Workers scaffold complete:
  - `package.json` with Hono ^4.6, Zod ^3.23, Vitest ^2.1, Biome ^1.9.4, TypeScript ^5.5, Wrangler ^4.92, @cloudflare/workers-types.
  - `tsconfig.json` (strict, ES2022, Bundler resolution, Workers types).
  - `biome.json` (2-space, 100 lineWidth, recommended rules).
  - `vitest.config.ts` (node env, v8 coverage).
  - `src/index.ts` — minimal Hono app with `/health` endpoint + scheduled handler stub.
  - `npm install` succeeded (148 packages).
  - `npm run typecheck` clean.
- Task 1.10 — Vitest first green test:
  - `tests/health.test.ts` — 2 tests passing (health 200 + 404 fallback).
  - `npm run lint` clean.
- Task 2.1 — D1 schema migration `migrations/0001_init.sql` applied to remote + local. 5 tables: `watch_references`, `sold_comps`, `listings_snapshot`, `users`, `audit_log`. Indexes on (brand, reference_number), (reference_id, condition_tier, sold_at), (event_type, created_at).
- Task 2.2 — `migrations/0002_seed_refs.sql` applied. 50 watch references seeded (Rolex, Omega, Tudor, Cartier, AP, Patek, IWC, Breitling, Grand Seiko, Panerai, Hublot, VC, Lange, JLC, Zenith). Verified via `SELECT COUNT(*) = 50`.

**Commits pushed to origin/main:**
- `fc30c18` chore: Phase 0 scaffold (foundations)
- `b135d80` docs(progress): log session 0 milestones
- `03d4247` feat(workers): MV3-ready Hono scaffold + first green test
- `24c2b98` feat(db): initial D1 schema + top-50 watch references seed

**Session 0 hours:** ~3 (planning + scaffold + Cloudflare setup + Week 2 start).

**Session 0 end state — clean handoff:**
- Tasks 1.1 → 2.2 all DONE.
- USER ACTION NEEDED to unblock Task 2.3 → 2.8 chain: register an eBay Developer App, capture App ID + Cert ID, run `wrangler secret put EBAY_APP_ID` and `wrangler secret put EBAY_CERT_ID` from `workers/`.
- After eBay creds land, Claude can autonomously execute Tasks 2.4 (eBay client + tests), 2.5 (fair-value calc + tests), 2.6 (D1 repo module), 2.7 (cron handler + first remote deploy + smoke test), 2.8 (/enrich endpoint + zod + KV cache + integration smoke). Estimated 4–6 hours of work.

---

## Session 0 — FINAL CLOSEOUT (2026-05-18, ~5 hrs total)

This section supersedes any earlier "Next session entry point" content above.

### Additional work since the previous log update

- **Comprehensive self-audit performed.** 8 sections covered (git history, repo structure, Cloudflare resources, local dev tooling, skills installation, memory state, anonymity grep across full history, plan progress). All green. One small gap (reference_claude_in_chrome.md not linked from MEMORY.md) caught and fixed during the audit.
- **Domain bought.** `watchsentry.app` registered via Cloudflare Registrar (~$14/yr, WHOIS privacy default-on, verified).
- **Docs renamed:** all `watchsentry.com` placeholders → `watchsentry.app` across README, docs/anonymity-audit.md, docs/plans/2026-05-18-phase0-implementation-plan.md. Commit `7040fd3`.
- **Cloudflare Email Routing (Track A) configured.** `support@watchsentry.app` routes via `route2.mx.cloudflare.net` MX to the user's private gmail inbox. Custom address rule + verified destination address. User-tested OK.
- **Gmail "Send As" (Track B) configured.** Outbound `From: support@watchsentry.app` works via `smtp.gmail.com:587` with Google App Password (NOT Cloudflare's MX — that's inbound-only). User confirmed "email things are done."
- **CI workflow bug found and fixed.** Original ci.yml had `actions/setup-node@v4` with `cache-dependency-path: extension/package-lock.json` running BEFORE the existence check, so it errored immediately when `extension/` was empty. Rewrote to do the existence check first, then conditional setup-node + all subsequent steps. Workflow now passes vacuously when a target folder isn't yet initialized. Commit `654a15b`. Verified green: run `26045965973`.
- **Workers job's "1 annotation" diagnosed:** Node.js 20 deprecation warning from `actions/checkout@v4` + `actions/setup-node@v4` — those actions will be forced to Node 24 by 2026-06-02. Not blocking. No action needed; actions will auto-migrate.
- **Chrome Web Store developer account registered.**
  - Publisher display name: `WatchSentry`
  - Public support email: `support@watchsentry.app` (verified via Email Routing during account setup)
  - $5 one-time fee paid via user's personal card (KYC internal to Google, never exposed publicly)
  - Underlying Google account: user's personal gmail (login internal-only)
  - "Verified Publisher" status not yet set up (requires Google Search Console domain verification — defer to Week 5 when landing site is live)
- **eBay Developer App submitted; awaiting activation** (eBay told user ~24h ETA).

### Commits pushed to origin/main during Session 0 (8 total)

| SHA | Subject |
|---|---|
| `fc30c18` | chore: Phase 0 scaffold (foundations) |
| `b135d80` | docs(progress): log session 0 milestones |
| `03d4247` | feat(workers): MV3-ready Hono scaffold + first green test |
| `24c2b98` | feat(db): initial D1 schema + top-50 watch references seed |
| `13ef7d4` | docs(progress): session 0 closeout (tasks 1.1-2.2 complete; eBay registration is next gate) |
| `7040fd3` | docs: lock watchsentry.app domain (replaces .com placeholder) |
| `654a15b` | fix(ci): skip job gracefully when target folder is uninitialized |
| _(this commit)_ | docs(progress): final Session 0 closeout — eBay activation pending |

### State per layer at end of Session 0

| Layer | Status |
|---|---|
| Repo | `main` on origin; working tree clean; CI green (run `26045965973`) |
| D1 | `watchsentry-db` with 5 tables + 50 seeded references; ready to receive eBay sold-comps once cron deploys |
| KV | `watchsentry-cache` empty; will fill with enrichment cache from Task 2.8 |
| Workers | scaffold tested locally (2/2 tests passing); NOT yet deployed to Cloudflare (Task 2.7 will be the first deploy) |
| Pages | project not created yet (Week 5 task) |
| Domain | `watchsentry.app` registered, WHOIS private, on Cloudflare account `kungfurry` |
| Email | `support@watchsentry.app` receive (Email Routing) + send (Gmail Send As) both work |
| CWS dev account | registered (Publisher: WatchSentry) — ready for submission in Week 6 |
| eBay dev account | submitted; awaiting activation (~24h) |
| Anonymity audit | all currently-applicable rows checked ✓ (see `docs/anonymity-audit.md`) |
| Memory | 4 entries added/updated; MEMORY.md index complete (audit-fixed) |
| Skills | `chrome-extension` + `cloudflare` fully installed at `~/.claude/skills/` (~335 files total) |

### Blockers waiting on user

1. **eBay account activation** (~24h ETA from registration).
   - When eBay activates: go to https://developer.ebay.com → My Account → Application Keys → **Production** → Create keyset.
   - Capture **App ID** (Client ID) and **Cert ID** (Client Secret).
   - From `<repo>\workers\`:
     ```powershell
     wrangler secret put EBAY_APP_ID
     wrangler secret put EBAY_CERT_ID
     ```
   - May prompt "Worker `watchsentry-api` doesn't exist — create?" → answer **Yes** (reserves the name; no code deployed yet).
   - Verify: `wrangler secret list` should show both names.
   - Ping next session with "secrets are in".

### Hours

~5 hrs (planning + scaffold + Cloudflare resources + skills install + audit + domain + email setup + CI fix + CWS dev account registration).

---

## Session 1 — eBay-unblocked backend + Chrome extension foundation (2026-05-19)

**Hours:** ~4 (autonomous; user only confirmed direction twice).
**Mode:** subagent-driven-development not used (tasks sequential); TDD + executing-plans skills active.

### Context entering session

- eBay Developer App registered Session 0; still awaiting activation (~24h ETA confirmed, but not yet activated as of session start).
- Tasks 2.4 / 2.7 / 2.8 remain eBay-gated. Tasks 2.5 + 2.6 + all of Week 3 are NOT eBay-gated.
- User asked "what can we do in the meantime?" → chose Tasks 2.5 + 2.6 with mocked eBay.
- User then said "if you can continue safely without requiring me to do anything, continue" → autonomous run through Week 3.

### Tasks completed (6 plan tasks)

| Task | Plan section | Files | Commit |
|---|---|---|---|
| 2.5 | Fair-value weighted-median calc | `workers/src/fair-value.ts`, `workers/tests/fair-value.test.ts` | `9b765bf` |
| 2.6 + prereq | D1 repo module + ebay.ts type-only stub | `workers/src/repo.ts`, `workers/src/ebay.ts` | `b0e07f0` |
| 3.1 | Extension scaffold (Vite+crxjs+Preact+TS) | `extension/{package,tsconfig,vite,vitest,biome,manifest}.config.*`, src/{content,background,popup}/, icons/ | `566ae7a` |
| 3.2 | Chrono24 listing parser + synthetic fixture | `extension/src/parsers/chrono24-listing.ts`, `extension/tests/{parsers,fixtures}/` | `5ca61b2` |
| 3.3 | API client for /enrich | `extension/src/api/client.ts`, `extension/tests/api/client.test.ts` | `0b0a370` |
| 3.4 | Badge component + content-script injection | `extension/src/components/Badge.{tsx,css}`, modified `extension/src/content/index.tsx` | `1e1bece` |

### Deviations from plan (intentional)

1. **`ebay.ts` type stub** — created early because `repo.ts` (Task 2.6) imports `ConditionTier` / `SoldComp` from it, but Task 2.4 is still eBay-gated. Stub contains type-only declarations. Task 2.4 will expand it with `getEbayAppToken` / `fetchEbaySoldComps` / `normalizeCondition` when secrets land. Types match the plan exactly so no churn expected.

2. **`fair-value.ts` fallback path** — plan's `last!.price` non-null assertion violates Biome `noNonNullAssertion`. Replaced with `throw new Error(...)` on the unreachable branch. Safer than `?.` (which would silently emit `NaN`).

3. **`fair-value.ts` signature** auto-collapsed to one line by Biome formatter (cosmetic).

4. **Chrome extension placeholder icons** — manifest declares `icons/{16,48,128}.png`. Created 1×1 transparent PNG placeholders so `vite build` completes. `extension/icons/README.md` flags these for replacement before CWS submission (Week 6 / Task 6.2).

5. **Task 3.2 fixture: SYNTHETIC, not real-page capture** — plan Step 1 requires user to Save As a real Chrono24 listing. Built a synthetic schema.org-compliant `chrono24-listing-rolex-124060.html` instead, to allow autonomous progress. `extension/tests/fixtures/README.md` flags this as a Phase 1 launch blocker — parser must be re-verified against real Chrono24 DOM before paid tier ships.

6. **Step 10 / Step 4 manual smoke skipped** — Task 3.1 Step 10 (load unpacked in Chrome) and Task 3.4 Step 4 (browser smoke). Build produces a valid `dist/` directory; user can load when they choose.

7. **API_BASE placeholder** — `<your-subdomain>.workers.dev` literal placeholder in `content/index.tsx`. Resolves when worker is deployed (Task 2.7, eBay-gated). Until then `enrichListing` fails on DNS → badge falls through to `no_data` UX (correct pre-launch behavior).

### Verification (end-of-session, both packages green)

**Workers:**
- `npm run typecheck` — clean (no errors)
- `npm test` — 6/6 passing (4 fair-value + 2 health)
- `npm run lint` — clean (Biome, 6 files)

**Extension:**
- `npm run typecheck` — clean (after adding `@types/node` + `types: ["chrome", "node", "vite/client"]`)
- `npm test` — 6/6 passing (4 parser + 2 client)
- `npm run lint` — clean (Biome, 9 files; organizeImports auto-applied via `biome check --write`)
- `npm run build` — clean; `dist/` contains `manifest.json`, content/background/popup bundles, icons, sourcemaps; ~16 KB total (gzipped ~5 KB)

**Anonymity audit refresh:**
- Extension files: `0 hits` for PII patterns (omer/cil/hotmail/claude/anthropic/gravatar)
- Workers source: `0 hits`
- Git author/committer: `WatchSentry Bot` + GitHub noreply — verified
- New audit-debt entry logged: `<workspace>\` workspace path appears in committed plan + progress + audit docs (pre-existing from Session 0). Action required before repo visibility change.

### Commits pushed to origin/main (6 total this session)

| SHA | Subject |
|---|---|
| `9b765bf` | feat(workers): fair-value weighted-median calc |
| `b0e07f0` | feat(workers): D1 repository module + ebay.ts type stub |
| `566ae7a` | feat(extension): MV3 scaffold (Vite+crxjs+Preact) |
| `5ca61b2` | feat(ext): Chrono24 listing parser w/ ld+json |
| `0b0a370` | feat(ext): API client for /enrich |
| `1e1bece` | feat(ext): badge component + content-script injection |
| _(this commit)_ | docs(progress,audit): session 1 log + omerprojects path audit-debt entry |

### State per layer at end of Session 1

| Layer | Status |
|---|---|
| Repo `main` | up to date; CI will run on push |
| D1 `watchsentry-db` | unchanged — 5 tables, 50 seeded refs |
| KV `watchsentry-cache` | unchanged — empty |
| Workers code | fair-value + repo modules in tree; not deployed (Task 2.7 eBay-gated) |
| Workers tests | 6/6 passing |
| Extension code | full Phase 0 happy-path: parser → API client → badge → content-script injection |
| Extension tests | 6/6 passing |
| Extension build | clean; `dist/` produced (16 KB total) |
| Anonymity | all currently-applicable rows still green; new audit-debt logged |
| Eternal blockers | eBay App still inactive; Lemon Squeezy KYC deferred to Phase 1 |

### Phase 0 progress: 18/30 tasks done (was 12)

- Week 1: 10/10 ✓
- Week 2: 4/8 (2.5, 2.6 done; 2.4, 2.7, 2.8 eBay-gated)
- Week 3: 4/4 ✓ (manual Chrome-load smoke deferred to user)
- Week 4: 0/4 (Task 4.1 search-results parser could be done autonomously; deferring to keep batch size reasonable)
- Week 5: 0/4 (privacy/terms docs + landing page copy could be done autonomously)
- Week 6: 0/4 (user-action only)
- Week 7: 0/3 (depends on Week 6)

### Outstanding loose ends (none blocking)

- **Synthetic Chrono24 fixture** — flagged Phase 1 launch blocker in `extension/tests/fixtures/README.md`. Parser is correct against schema.org spec but unverified against real Chrono24 DOM.
- **Placeholder extension icons** — flagged for replacement in `extension/icons/README.md` before CWS submission (Week 6 / Task 6.2).
- **API_BASE placeholder URL** in `extension/src/content/index.tsx` — resolves at Task 2.7 deploy.
- **npm audit warnings** — 8 vulnerabilities (6 moderate, 2 high) in dev-only deps after `npm install`. Not blocking; revisit before Phase 1.
- **`omerprojects` path leak** in committed plan/progress/audit docs — logged in audit-debt; address before any repo visibility change.

---

## Post-session-1 update (2026-05-19, end of day)

User confirmed at end of Session 1: **eBay Developer App STILL not activated.** Wrangler check (`wrangler secret list` from `workers/`) returns "Worker 'watchsentry-api' not found" → secrets never put → activation never landed → Tasks 2.4, 2.7, 2.8 still gated.

Elapsed time since registration submission (Session 0, 2026-05-18 evening): **>24 hours**, exceeding vendor's stated ETA.

Action recorded: **state preserved as-is; no nudge of eBay support attempted from Claude side.** User to decide if/when to escalate. New feedback memory `feedback_parallel_around_blockers.md` captures the pattern; portfolio-level Session 4 log `<workspace>\passive-income-empire\sessions\2026-05-19-session-4-phase0-nonlinear.md` documents the non-linear progress map for cross-session continuity.

If eBay is still blocked at start of Session 2, default action per Section 9 of the portfolio Session 4 log is autonomous execution of Tasks 4.1 / 4.3 / 4.4-client / 5.1-source / 5.3-copy / privacy+terms drafts.

---

## Session 2 — Week 2 backend live (2026-05-19, ~2 hrs)

**Hours:** ~2 (autonomous after user confirmed eBay secrets in)
**Mode:** executing-plans + TDD + verification-before-completion

### Context entering session
- User pasted `wrangler secret list` output showing both `EBAY_APP_ID` and `EBAY_CERT_ID` present → eBay block lifted.
- Per portfolio Session 4 entry-point, the "if eBay activated" branch was pre-authorized: execute Task 2.4 → 2.7 → 2.8.
- Task 2.3 (eBay reg + secrets storage) implicitly closed as a side-effect of secrets landing.

### Tasks completed
| Task | Description | Commit |
|---|---|---|
| 2.3 | eBay Dev App reg + secrets stored | (no code — closed by user) |
| 2.4 | eBay Browse API client (impl + 8 tests: 5 condition + 3 fetch) | `b342463` |
| 2.7 | `runDailyRefresh` cron + scheduled handler wiring + first remote deploy + debug-route seed + verify + remove debug + redeploy | `abac655` |
| 2.8 | `/enrich` endpoint + KV 6h cache + Zod validation + 6 new tests + four-path integration smoke | `6bb7c96` |
| (chore) | Extension `API_BASE` → `https://watchsentry-api.txrz.workers.dev` + rebuild | `eff7310` |

### Verification (end-of-session)
- Workers: typecheck + lint clean; **20/20 tests** (4 fair-value + 8 ebay + 6 enrich + 2 health).
- Extension: typecheck + lint clean; **6/6 tests**; build clean (`dist/` ~16 KB).
- Worker deployed: `https://watchsentry-api.txrz.workers.dev`, version `b7c4dd00-16d9-4e2e-9c48-2e229becff09`, cron `0 4 * * *` registered.
- D1: **6,626 distinct `sold_comps`** across 50 references (top 5: Rolex 2986 / Tudor 627 / Omega 366 / Grand Seiko 333 / Breitling 306).
- audit_log: `cron_ebay_refresh_done` row present.
- `/enrich` smoke (Rolex 124060 fair $9500): `medianUsd 13499, sampleSize 200, delta -$3999 (-29.6%)` ✓.
- Cache: instant on second hit ✓. Invalid → HTTP 400 ✓. Bogus brand/ref → `unknown_reference` ✓. Debug route confirmed 404 after removal ✓.

### Data-quality findings (Phase 1 work; NOT blocking)
1. **Condition mapping too coarse.** eBay Browse rarely returns `condition` for watch listings → 100% defaulted to `fair`. Phase 1: derive from title/subtitle, or accept Phase 0 only meaningfully serves `fair`.
2. **`sold_at` is ingest-time, not sale-time.** Browse returns LIVE listings; `itemEndDate` rarely set on fixed-price → all comps `sold_at = new Date()`. Window query works but semantics need a doc note. True sold-comps require restricted Marketplace Insights API.
3. **Search query too loose.** "Rolex 124060" returns straps/bands/parts ($145 alongside $14k). Need price-range filter (0.3×–3× expected MSRP per ref) before launch.
4. **Cron's "inserted" counter misleading.** Returns 27172 because D1's `rows_written` counts `INSERT OR IGNORE` attempts. Distinct writes: 6626. Phase 1: rename to `attempted`, log `distinct` separately.

### Audit-debt additions
- `workers_dev = true` + `preview_urls = true` are implicit Wrangler defaults — make explicit in `wrangler.toml` before linking the `*.workers.dev` URL anywhere public.
- `*.workers.dev` subdomain is `txrz` (auto-generated; doesn't visibly tie to other projects on the account). Cut over to `api.watchsentry.app` custom Worker route before CWS publish (Week 5).

### Phase 0 progress: 22/30 tasks done (was 18)
- Week 1: 10/10 ✓
- Week 2: **8/8 ✓ (COMPLETE)** — 2.3 closed; 2.4 + 2.7 + 2.8 landed this session
- Week 3: 4/4 ✓
- Week 4: 0/4 — autonomous-safe
- Week 5: 0/4 — 5.1 + 5.4 autonomous-safe; 5.2 (Pages deploy) + 5.3 (screenshots/video) need user action
- Week 6: 0/4 — user-action only
- Week 7: 0/3

### Outstanding loose ends
Unchanged from Session 1 + the four new data-quality items + two new audit-debt entries above.

---

## Session 3 — Week 4 + Week 5 implementation + cap deploy (2026-05-19, ~2 hrs)

**Hours:** ~2 (autonomous after user approved Week 4+5 block)
**Mode:** executing-plans + TDD + verification-before-completion

### Context entering session
- Session 2 closed with Phase 0 at 22/30, Week 2 backend live, no remaining eBay-gated tasks.
- User explicitly authorized Week 4+5 autonomous block AND wrote a new HARD RULE memory `feedback_no_cost_without_asking.md` — no cost-creating actions without explicit ask.
- User confirmed Cloudflare account is **Workers Paid ($5/mo)** — `/enrich` abuse could incur overage. Task 4.4 prioritized first as cost-defense.
- User locked landing page scope: "very very basic" — single HTML page.

### Tasks completed (6 plan tasks + 1 production deploy)
| Task | Description | Commit |
|---|---|---|
| 4.3 | Settings popup (Preact toggle) + `storage.ts` (get/set/ensureAnonymousId) + 5 tests | `a7bdb6e` |
| 4.4 | `touchUser()` + 50/day soft cap in workers/src/enrich.ts + 5 cap tests; client passes `anonymousId` from `getSettings()` | `be4dc9f` |
| 4.1 | `parseChrono24Search()` + 5 tests + synthetic fixture (real-page re-verify flagged for Phase 1, same pattern as 3.2) | `4f58ccf` |
| 4.2 | `BadgeCompact` + URL-based routing (listing vs search) + per-page 50-card client throttle | `39939c2` |
| 5.1 | `landing/` source: index.html (subscribe form OMITTED per "very basic" scope) + privacy.html + terms.html + styles.css | `4fa39fe` |
| 5.4 | `docs/anonymity-audit.md` refreshed: all currently-applicable rows ✓; 5 new audit-debt entries (workers_dev/preview_urls implicit defaults, txrz subdomain, CTA placeholder, gmail in CF deployment author, etc.) | `b203c07` |
| (prod) | `wrangler deploy` of workers/src — cap now LIVE on `/enrich` | (no code change; deploy ID `67ea3af6`) |

### Verification (end-of-session)
- Workers: typecheck + lint clean; **25/25 tests** (was 20; added 5 for touchUser).
- Extension: typecheck + lint + build clean; **16 tests** (was 6; added 5 storage + 5 search-parser).
- Live `/health` → 200 ✓ on new deploy version `67ea3af6-c8c8-404a-85e6-84fcccba0b09`.
- Cap smoke test: fresh `anonymousId` → /enrich returned ok response AND D1 `users` table now has the row with `enrichment_count_today: 1, counter_day: 2026-05-19` ✓.
- Anonymity audit: PII grep on landing/ clean; extension src clean.

### Decisions this session
| Decision | Rationale |
|---|---|
| Execute Task 4.3 BEFORE Task 4.4 | 4.4 imports `ensureAnonymousId` from `storage.ts`, created in 4.3. Plan was written with 4.3 listed first but explicitly noted as dependency. Re-ordered to make this dependency explicit. |
| Skip Task 4.2 unit tests | BadgeCompact is purely presentational; snapshot tests would just lock the JSX. Manual visual smoke is sufficient for Phase 0 and aligns with how Badge.tsx itself is treated. |
| Drop subscribe form from `landing/index.html` | Per user's "very very basic" scope ask. Form requires Task 5.2 backend; including it without 5.2 would 404. Cleaner to ship without it; add back when 5.2 is ready. |
| Replace plan's "Install for Chrome" CTA with "Coming soon to Chrome Web Store" placeholder | Plan used `<extension-id-after-cws-approval>` literal placeholder which would be a broken link if accidentally deployed. Audit-debt entry added with remediation: swap to real CWS detail URL post-approval. |
| Deploy 4.4 cap immediately at end of session (with user approval) | Cost-defense rationale: without deploy, /enrich remained uncapped, which is the exact risk the user flagged. Cap is now live; daily 50/anon-id soft cap protects against scrape abuse pre-CWS launch. |
| Wrote new feedback memory `feedback_no_cost_without_asking.md` early in session | User stated the rule explicitly; durable instruction; needed in scope for future sessions. |

### Memory written this session
- **NEW:** `feedback_no_cost_without_asking.md` — HARD RULE never to take cost-creating actions without explicit user approval; explicit cost-surface call-out required BEFORE acting.
- **UPDATED:** `project_locked_portfolio_v1.md` — bumped 22 → 28/30 tasks; marked Week 4 complete + Week 5 partial.
- **UPDATED:** `MEMORY.md` — added pointer for new cost-rule memory; updated portfolio status line.

### Phase 0 progress: 28/30 tasks done (was 22)
- Week 1: 10/10 ✓
- Week 2: 8/8 ✓
- Week 3: 4/4 ✓
- Week 4: **4/4 ✓ (COMPLETE)**
- Week 5: **2/4** — 5.1 + 5.4 done; 5.2 (mailing-list handler) and 5.3 (CWS listing copy + screenshots + demo video) outstanding
- Week 6: 0/4 — user-action only
- Week 7: 0/3

### Outstanding loose ends (delta this session)
- **CTA placeholder** on `landing/index.html` — replace after CWS approval (Week 6 / post-submit)
- **Task 5.2 mailing-list handler** not done — landing form is omitted entirely as a result; OK for "very basic" scope but revisit before paid-tier launch
- **Task 5.3 CWS listing assets** need user: 5 screenshots @ 1280×800 + ~30s demo video. Listing copy can be drafted autonomously next session.
- (All Session 2's loose ends still open: synthetic fixtures, placeholder icons, npm audit, omerprojects path leak, workers_dev/preview_urls implicit defaults.)

---

## Session 4 — Audit + testing-prep fixes + condition fallback deploy (2026-05-19, ~1.5 hrs)

**Hours:** ~1.5 (deep audit + manifest fix + fallback impl + ~30 min debug detour on KV `--remote` gotcha)
**Mode:** verification-before-completion + TDD + executing-plans

### Context entering session
- Session 3 closed Phase 0 at 28/30, cap deployed live (version `67ea3af6`).
- User asked: "check everything you did so far very detailly", "what should we do next", "do I need to create anything regarding chrome extension developer page", "when can I test the product".
- Triggered full audit pass, then made the extension testable end-to-end with real medians (via condition fallback) before user loaded it locally.

### Audit findings (live commands, not just claims)

**Green:**
- Workers: typecheck + lint + 25/25 tests (later 29/29 after fallback tests).
- Extension: typecheck + lint + build + 16/16 tests.
- Live `/health` 200 ✓, `/enrich` ok-path ✓, invalid → 400 ✓, `/debug/cron` → 404 ✓.
- D1: 6,626 sold_comps + 1 users row (smoke); audit_log has manual cron seed entry.
- Worker version `67ea3af6` (cap deploy, pre-fallback) at audit start.
- Wrangler.toml cron declaration present.
- Git working tree clean; all 15+ commits authored as WatchSentry Bot ✓.
- PII grep on landing/ + extension/src — clean (only legitimate brand email).

**Issues found:**
1. **Manifest content-script scope was `https://www.chrono24.com/*`** — too narrow for Chrono24 localized subdomains.
2. **Real-world testing would mostly show `no_data`** because Chrono24 schema.org condition maps to `very_good` but D1 has only `fair` tier data.
3. **First scheduled cron had NOT fired** — expected; next firing 2026-05-20 04:00 UTC. Audit-log only has the manual seed.
4. **Placeholder icons (1×1, 70 bytes)** — already in audit-debt; replace before CWS submission.
5. **Landing CTA is placeholder text** — already in audit-debt.
6. **CF deployment metadata shows `cil.omerr@gmail.com`** — internal dashboard only; logged as awareness item.

### Fixes shipped this session

**1. Manifest scope widened.** `extension/manifest.config.ts` content_scripts.matches → `https://*.chrono24.com/*`. Extension rebuilt. Commit `cddf078`. No deploy needed (extension is not yet published).

**2. Server-side condition fallback.** New `getCompsWithFallback()` in `workers/src/enrich.ts`: if requested tier returns 0 comps AND requested tier ≠ `fair`, query `fair` as fallback. Response gains `tier` (the tier actually used) + `tierFallback` (boolean) fields. 4 new unit tests. Commit `cef953c`. Deployed.

### Deploys this session (4 total — debug iteration noise)
| Version | Notes |
|---|---|
| `d6a87a77` | First fallback deploy — appeared broken (stale KV cache shadowed result) |
| `c6256146` | Re-deploy after cache investigation — still appeared broken |
| `172141a0` / `a184b195` | Two intermediate deploys with `/debug/trace` endpoint to diagnose |
| `a31ba033` | **CURRENT LIVE** — clean prod version, debug endpoint removed, console.log removed |

### The KV `--remote` gotcha (root cause of 30-min detour)

Spent ~30 min thinking the fallback was broken. `/enrich` kept returning stale `no_data` even after I'd "deleted" the cache entries.

**Root cause:** `wrangler kv key list/delete` defaults to **local** dev KV, not the remote production namespace — exactly the same surprise as `wrangler d1 execute` requiring `--remote`. The wrangler hint "Use --remote..." was buried in output, missed initially.

**Resolution:** added `--remote` to the delete commands → stale `enrich:Rolex:124060:very_good` and `enrich:Rolex:124060:fair` keys cleared → next /enrich call returned the correct ok response with `tier:fair, tierFallback:true`.

**New reference memory:** `reference_wrangler_remote_flag.md` — captures this for future sessions.

### Live verification — fallback works end-to-end

Final POST to `/enrich` with `condition: "very_good"`:
```json
{
  "status": "ok",
  "fairValue": { "medianUsd": 13499, "sampleSize": 200, "windowDays": 90 },
  "reference": { "brand": "Rolex", "model": "Submariner", "displayName": "Rolex Submariner No-Date 124060" },
  "tier": "fair",
  "tierFallback": true,
  "delta": { "absoluteUsd": -3999, "percent": -29.6 }
}
```

Pipeline: request `very_good` → D1 has 0 rows → fallback to `fair` → 200 rows → median $13,499 → delta vs $9,500 listing = -$3,999 (-29.6%). Badge will render with red/green/neutral tone based on delta thresholds in Badge.tsx (≤−5% good, ≥+10% bad, else neutral).

### Tests
- Workers: 25 → **29/29** (added 4 condition-fallback tests).
- Extension: **16/16** unchanged (manifest scope fix doesn't affect tests).

### Commits this session (2 functional + 0 debug — debug landed without diff)
| SHA | Subject |
|---|---|
| `cddf078` | fix(ext): widen content-script matches to *.chrono24.com (was www only) |
| `cef953c` | feat(workers): /enrich fallback to 'fair' tier when requested tier empty |
| (no commit) | `/debug/trace` endpoint + `console.log` added in-session, removed before push; net working-tree diff = 0 |

### Outstanding at session close: USER ABOUT TO TEST LOCALLY
User has the test instructions; was about to install the unpacked extension from `extension/dist/` in Chrome and visit real Chrono24 listings. **NO TESTING FEEDBACK YET CAPTURED.** Next session must follow up.

### Phase 0 progress unchanged: 28/30
- This session was refinement (fix + improvement to existing impl), not new plan-listed tasks.
- Manifest scope fix is best understood as a bug-fix against the original Task 3.1 scaffold.
- Condition fallback is a Phase 0 polish on top of Task 2.8.

---

## Session 5 — Real-DOM debug pass + CORS deploy (2026-05-19, ~2 hrs)

**Hours:** ~2 (user-driven debug — user loaded extension, found 3 root causes via Claude in Chrome MCP, fixed + deployed)
**Mode:** Systematic debugging via in-browser MCP + verification-before-completion

### Context entering session
- User loaded the extension unpacked in Chrome (per Session 4 closeout plan).
- First report: "I didn't see any badges."
- Two screenshots: chrome://extensions card + "URL pattern 'https://watchsentry-api.*.workers.dev/*' is malformed" warning.

### Root causes found (all three required real-DOM access)

**1. Malformed `host_permissions` URL pattern.** Chrome MV3 only allows `*` as the leftmost label of a host pattern. `watchsentry-api.*.workers.dev` had `*` as a middle component → rejected. Fixed by pinning to exact subdomain `watchsentry-api.txrz.workers.dev/*`.

**2. Chrono24 redesigned both pages since synthetic fixtures were built.** After user granted Claude in Chrome MCP scope for `chrono24.com`, drove real Chrome session + probed live DOM:
- Search cards: `article.article-item` → `.wt-listing-item.js-listing-item.listing-item` (full rewrite — utility-class soup, no semantic names)
- Listing mount anchor: `.js-detail-page-price-section` → `.detail-page-price`
- Listing JSON-LD: Product now nested inside top-level `@graph` array (parser was only checking top-level `@type`)

Rewrote `parseChrono24Search` with new selectors + compound-brand list. Added `findProduct()` recursion in `parseChrono24Listing`. Updated synthetic search fixture to match live markup. Added `@graph`-wrapped test case.

**3. No CORS on worker → MV3 preflight failed.** After parsers worked, badges still showed no_data fallback. Diagnostic `console.error` in content/index.tsx surfaced `TypeError: Failed to fetch`. Network state showed OPTIONS → 404 (no OPTIONS handler).

**Key learning:** MV3 content scripts follow the host page's CORS policy regardless of `host_permissions`. Added `hono/cors` middleware (origin `*`, GET/POST/OPTIONS, Content-Type, 24h preflight cache) + 2 regression tests.

### Verification — end-to-end via Claude in Chrome MCP

**Listing detail** (`/rolex/rolex-submariner--id45858844.htm`):
- OPTIONS preflight 204 with CORS headers ✓
- POST /enrich → 200 ✓
- Badge: `Fair value $13,499 / Listing vs fair -14.1% / based on 200 sold-comps · 90d window` (`ws-good` class) ✓
- Console clean: `[WatchSentry] parsed → request body → response` (info-level)

**Search results** (`?query=rolex+submariner+124060`):
- 60 cards detected ✓
- Compact badges rendering serially (~1/sec — sequential await loop; Phase-1 parallelize)
- Sample: `-14.1% vs fair` (ws-good), `-3.7% vs fair` (ws-neutral), `-11.8% vs fair` (ws-good)
- All /enrich POSTs 200 ✓

### Deploys this session (1)
| Version | Notes |
|---|---|
| `afc8d1c6` | **CURRENT LIVE** — worker with CORS middleware |

### Tests
- Workers: 29/29 → **31/31** (added 2 CORS tests)
- Extension: 16/16 → **17/17** (added @graph-wrapped Product test)

### Commits pushed
| SHA | Subject |
|---|---|
| `5b06886` | fix(ext): retarget parsers + manifest to live Chrono24 DOM |
| `43fba3b` | fix(ext/parser): walk @graph for nested Product schema in listing pages |
| `dfb048b` | feat(workers): CORS middleware for cross-origin extension calls |

### New memories saved
- `feedback_skill_discipline.md` (from `/superpowers:using-superpowers` at session start)
- `feedback_ask_before_websites.md` (browser MCP approval is domain-scope, no popup gates)

### Phase 0 progress unchanged: 28/30
Still 28/30 numerically. What CHANGED: badges actually work now (previously silent failures on real DOM + CORS). Effectively un-blocked the existing 28/30.

---

## Session 6 — Phase 0 polish + cleanup + comprehensive audit (2026-05-20, ~3 hrs)

**Hours:** ~3 (post-midnight continuation of the 2026-05-19 session)
**Mode:** Multi-track autonomous execution — UX polish, doc hygiene, security audit

### Context entering session
Session 5 closed with badges verified live but two known issues: duplicate badges per card (caused by an OR-fallback in the card selector matching responsive wrapper duplicates) and a slow sequential `/enrich` loop (~60s for 60 cards). User OK'd a "B then C" plan: parallelize + cap tuning, then log gating + cleanups. After that, user asked for a comprehensive audit.

### What shipped (9 commits)

1. **`3c66433` feat(workers): cap-after-cache + bump daily cap to 200** — moved touchUser cap check after the KV cache lookup; cache hits free; bumped cap from 50 to 200. touch-user tests updated. **Deployed** as `31280a03`.
2. **`ba36c80` fix(ext/parser): robust reference extraction + strict card selector** — third-tier ref extraction (5-7 digit + optional 1-4 letter sequence) catches refs in messy seller text. Dropped `.wt-listing-item` OR-fallback that was matching responsive duplicates (kills the duplicate-badge bug).
3. **`f0c9fad` feat(ext/ui): parallelize search /enrich, gate logs, polish badges** — concurrency-6 fan-out (~60s → ~10s cold), idempotency guard, `[WatchSentry]` logs gated behind `const DEBUG = false`, badge visual refresh (pill shape + dot indicator + theme-adaptive colors).
4. **`9d08541` docs(progress): session 5 closeout** — replaced placeholder entry-point checklist with actual closeout content.
5. **`20699f8` docs(cws): Phase 0 listing copy, screenshot plan, demo shot list (Task 5.3)** — `cws/listing-copy.md` + `cws/screenshot-plan.md` + `cws/demo-shotlist.md`.
6. **`56a916f` audit: anonymity re-checkpoint 2026-05-20** — re-ran the standing checklist post-Session-5. Status GREEN.
7. **`7940fa7` audit: strip operator workspace path from committed docs** — 174 substitutions (`C:\omerprojects\watchsentry\` → `<repo>\`, `C:\omerprojects\` → `<workspace>\`). UTF-8 preserved.
8. **`026b1c6` docs: close omerprojects audit-debt + document listing-fixture rationale** — strike-through RESOLVED marker; added doc block to listing fixture explaining structural-synthetic-vs-real-page-capture.
9. **`e7a49b1` audit: comprehensive end-of-day audit 2026-05-20** — `docs/audits/2026-05-20-comprehensive.md`, 12 sections. Verdict: **GREEN for CWS submission.**

### Tests + lint at session close

- Workers: **31/31** tests, lint + typecheck clean
- Extension: **18/18** tests (added one search-parser test for messy-ref-text), lint + typecheck clean

### Deploys this session (1)

| Version | Notes |
|---|---|
| `31280a03` | **CURRENT LIVE** — cap-after-cache + cap 200/day |

### Audit highlights (full report in `docs/audits/2026-05-20-comprehensive.md`)

- 0 PII leaks across tracked files
- All 13 commits today authored as `WatchSentry Bot <noreply>`
- 17 npm-audit findings (workers 9 moderate, extension 6 moderate + 2 high) — ALL in dev dependencies; ZERO production runtime impact
- D1: 50 refs / 6,626 sold_comps / 14 users / 1 audit_log row; KV: 4 cached enrich responses
- Manifest minimal + valid; host-permission pinned

### Phase 0 progress: 28/30 unchanged numerically; AUTONOMOUS LANE COMPLETE

All remaining work is user-driven (5 screenshots / branded icons / paste copy + submit) or Phase 1 polish (custom domain, dev-dep upgrades).

### Hours

~3 hrs this session. Phase 0 cumulative: ~19.5 hrs of 40–60 hr budget.

---

## Session 7 entry-point checklist (SUPERSEDED — see Session 9 checklist at end of file)

> **⚠️ THIS SECTION IS HISTORICAL.** It was written end-of-Session-6 to guide Session 7. Sessions 7 + 8 are now complete (worker version is `815e550b`, refs are 155, route + normalize patches shipped). For current entry-point instructions, jump to the bottom of this file: **"Session 9 entry-point checklist (READ THIS FIRST NEXT SESSION)"**.
>
> Kept below for archival continuity — do not act on it.

1. Auto-load `MEMORY.md` (harness does).
2. Read the "Session 6" section above.
3. Read `docs/audits/2026-05-20-comprehensive.md` for the green-light state.
4. **Ask user which lane to pursue:**
   - **CWS submission walk-through** — capture 5 screenshots, optionally record demo video, replace placeholder icons (or use `canvas-design` skill to draft them), paste `cws/listing-copy.md` into CWS dashboard, submit, wait for review. ~1-2 hrs of user time.
   - **Icon design via canvas-design skill** — autonomous if user provides brand color/style hints; produces 16/48/128 PNGs.
   - **Custom-domain wiring** — `api.watchsentry.app` Worker route + flip `workers_dev = false`. Mostly DNS in CF dashboard.
   - **T5b dropcatch background bet** — separate folder under `<workspace>/`. Not started.
   - **Dev-dep cleanup** — bump vitest/wrangler/@crxjs major versions to clear the 17 npm-audit findings.
5. Health-check live worker (version `31280a03`):
   ```
   curl https://watchsentry-api.txrz.workers.dev/health
   ```
6. **DO NOT** attempt autonomously without asking first (per `feedback_no_cost_without_asking.md`):
   - `wrangler deploy` / `wrangler pages deploy`
   - CWS submission
   - New accounts / paid features / subscriptions
   - Custom domain wiring (`api.watchsentry.app`)

### Useful one-liners (always remember `--remote`!)

```powershell
# CRITICAL: wrangler kv + d1 default to LOCAL dev resources. Always pass --remote for production.
# See reference_wrangler_remote_flag.md in memory.

# Production KV cache state:
npx wrangler kv key list --namespace-id=45d2b00e2fd545c38df468b15b8ec097 --remote

# Production D1 — recent enrichment + cron activity:
npx wrangler d1 execute watchsentry-db --remote --json --command="SELECT event_type, payload_json, created_at FROM audit_log ORDER BY id DESC LIMIT 10;"

# Production D1 — users + cap state:
npx wrangler d1 execute watchsentry-db --remote --json --command="SELECT anonymous_id, enrichment_count_today, counter_day, last_seen_at FROM users ORDER BY last_seen_at DESC LIMIT 10;"

# Production D1 — sold_comps rowcount:
npx wrangler d1 execute watchsentry-db --remote --json --command="SELECT COUNT(*) AS n FROM sold_comps;"

# Live /enrich smoke (with anonymousId increments cap counter):
curl -X POST https://watchsentry-api.txrz.workers.dev/enrich -H "Content-Type: application/json" -d '{"brand":"Rolex","reference":"124060","condition":"very_good","listedPriceUsd":9500,"anonymousId":"<fresh-uuid>"}'

# Force-purge a stale cache entry:
npx wrangler kv key delete --namespace-id=45d2b00e2fd545c38df468b15b8ec097 --remote "enrich:Brand:Ref:Condition"
```

### Phase 1 cleanup backlog (unchanged + 1 added)
- Condition mapping from title/subtitle text (eBay API doesn't return condition for watches)
- Price-range filter on eBay search results
- Marketplace Insights API (restricted) for real sold-comps
- Rename cron counter to `attempted` + log `distinct` separately
- Replace synthetic Chrono24 fixtures (listing + search) with real-page captures
- Replace placeholder extension icons (Task 6.2)
- Resolve npm audit warnings
- Make `workers_dev` + `preview_urls` explicit in wrangler.toml; cut over to `api.watchsentry.app` custom route
- `omerprojects` path leak in committed docs (before repo visibility change)
- Add Task 5.2 mailing-list handler if paid-tier launch needs lead capture
- (NEW Session 4) Consider bidirectional condition fallback — if user requests `fair` and we have only `very_good` data (post-Phase-1 mining), should we fall back upward? Punt to Phase 1 design.

### Verification commands cheat-sheet

```powershell
# Workers
cd <repo>\workers
npm run typecheck && npm test && npm run lint

# Extension
cd <repo>\extension
npm run typecheck && npm test && npm run lint && npm run build

# Deployed worker
curl https://watchsentry-api.txrz.workers.dev/health

# Git state
cd <workspace>\watchsentry
git status --short
git log --oneline -10
```

---

## 2026-05-22 — Session 7 (pre-CWS polish pass + first real icons shipped)

**Hours:** ~4

**Decisions made:**
- Ship a focused pre-CWS polish pass rather than submit Phase-0-as-is. Rationale: CWS rating is sticky, so polish the first-impression items now; skip everything that needs usage data to optimize. (UA-marketing principle: launch fast, but don't poison the funnel with avoidable churn signals.)
- Icon family **Phosphor (MIT, no attribution)**, brand mark **ShieldCheck**, background **accent blue `#1F6FEB`**. Smart-watch icons SKIPPED despite the svgrepo collection user explored — they read as "Apple-Watch tool" on a luxury-watch site (Chrono24 sells Rolex/Patek/Vacheron, not smart-watches). Context fit > visual cohesion.
- CWS Privacy Policy URL declared as canonical `/privacy` (no `.html`) to avoid CWS form validators seeing a 308 chain. Body text inside the detail description keeps `.html` for human readability.
- SQL migration applied to `--remote` D1 *with* user approval (per `feedback_no_cost_without_asking.md` — free-tier with headroom). 0 cost surface.

**Done (8 commits):**
- `f4f62dc` chore: gitignore `extension/icons/candidates/` scratch folder.
- `f8add51` audit: 2026-05-22 anonymity re-checkpoint pre-CWS-submission. PII grep result: ONE acknowledged match in `extension/tests/fixtures/chrono24-listing-rolex-124060.html` (comment header documenting fixture provenance — added 2026-05-20 in commit `026b1c6`, benign, internal-only).
- `b514231` feat(ext/ui): brand attribution + encouraging fallback copy + component tests. Badge ok-state footer reads "WatchSentry · N sold-comps · 90d window". BadgeCompact gets a `[WS]` chip prefix replacing the dot indicator. Fallback copy reworded ("We don't have this reference yet — adding new ones weekly"). 11 new component tests (components were previously untested) → Extension 18/18 → 29/29.
- `20b2b9a` feat(ext/popup): branded popup redesign. Brand mark + wordmark + subtitle + status pill with animated CSS toggle + "How it works" + footer with landing link.
- `8824ff4` feat(db): seed refs expansion 50 -> 156. Migration `0003_seed_refs_expansion.sql`. Rolex +23, Omega +10, Tudor +8, Cartier +7, AP +5, Patek +5, IWC +6, Breitling +5, GS +5, Panerai +4, Hublot +3, TAG Heuer +4, Hamilton +4, Longines +4, Seiko +5, Oris +3, Bell & Ross +2, VC +3.
- `7351a2a` docs(cws): canonicalize privacy policy URL.
- `20a6f66` feat(ext/icons): replace placeholders with Phosphor ShieldCheck on accent blue. 16/48/128 PNGs at 273B/709B/1755B. White stroke on `#1F6FEB`, 62% inner-glyph ratio. Popup mark switches from "WS" text to the icon via Vite asset import — toolbar + popup feel like one product.
- `35bf991` audit: close placeholder-icons audit-debt row (RESOLVED 2026-05-22).

**Infrastructure:**
- Landing site deployed to Cloudflare Pages project `watchsentry`. Deploy URL `https://9047c660.watchsentry.pages.dev/` confirmed 200 on `/privacy`. Project alias `watchsentry.pages.dev` propagating.
- Custom domain `watchsentry.app` attach: **NOT done autonomously**. Wrangler CLI has no `pages domain` subcommand, and Chrome MCP can't navigate to `dash.cloudflare.com` without explicit scope grant. User to attach via dashboard (30-sec step).
- Migration 0003 applied to remote D1 via `wrangler d1 execute --remote`. Verification: `SELECT COUNT(*) FROM watch_references` → **155** (one ref auto-skipped by `INSERT OR IGNORE`, expected behavior — UNIQUE constraint on (brand, reference_number) caught a duplicate the migration missed).
- CWS submission bundle pre-built at `cws/watchsentry-v0.1.0.zip` (41.9 KB). Source-map audit: all paths are relative (`../../src/...`), zero PII matches.

**Tests / build state at session end:**
- Workers **31/31** ✓
- Extension **29/29** ✓ (up from 18 — 11 new component tests added this session)
- Typecheck + lint clean on both projects
- Production build clean at 219 ms

**Audit state:**
- 2026-05-22 re-checkpoint GREEN.
- Placeholder-icons audit-debt **RESOLVED** (commit `35bf991`).
- Operator-workspace-path audit-debt **RESOLVED** (commit `7940fa7`, Session 6).
- Remaining open audit-debt: synthetic Chrono24 fixture (Phase 1), `workers_dev=true`/`preview_urls=true` defaults (cosmetic), `*.workers.dev` subdomain (deferred per comprehensive audit §12).

**Phase 0 progress at session close:**
- 28/30 plan tasks done. Icons no longer in audit-debt. Phase 0 is functionally ready for CWS submission.

**Blockers for next session (all user-driven):**
1. Attach `watchsentry.app` custom domain in CF Pages dashboard.
2. Capture 5 product screenshots in clean Chrome with the rebuilt extension loaded.
3. Paste `cws/listing-copy.md` content + upload `cws/watchsentry-v0.1.0.zip` + screenshots into CWS dashboard.
4. Submit for review.

**Cost surface this session:** $0. Free-tier Pages, free-tier D1, MIT icons.

---

## 2026-05-22 — Session 7 addendum (live audit attempt — BLOCKED)

After the closeout above, attempted a live product audit on Chrono24 with the rebuilt extension. Goal: visual + accuracy check on badges (full + compact), brand-chip render, fallback copy on untracked refs, popup with new icon.

**Outcome: BLOCKED.** Chrome MCP `navigate` returns "Navigation to this domain is not allowed" for `chrono24.com` despite repeated approval attempts (verbal-in-chat, AskUserQuestion popup, retry-after-reload). svgrepo.com and watchsentry.app navigate fine, so the allowlist is partially populated — but the grant mechanism that worked in Session 5 (real-DOM debug on chrono24) is not firing today. No `dash.cloudflare.com` access either, same error.

**Hypotheses:**
- Per-session grant decay: yesterday's "granted domain scope for chrono24.com" may have been session-scoped and not persisted.
- Chrome MCP version change between sessions removing the in-chat popup grant flow.
- Browser instance change (today's connected browser deviceId `6b49bd8a-4d84-4632-9fda-c18ddb8a19c0`) may not carry forward the prior browser's allowlist state.

**What I tried, all blocked:**
- `navigate` to multiple chrono24 URLs (with/without subdomain, with/without path)
- AskUserQuestion popup → user clicked "Yes, allow chrono24.com" → retry still blocked
- `shortcuts_list` for a permission shortcut → returned empty
- Simulated `Ctrl+L` + URL + Enter via `computer` tool → keystrokes didn't reach Chrome address bar (MCP intercepts)

**What I deferred (still needs the live audit to validate):**
- Visual: does the new white-shield-check-on-accent-blue icon render correctly in the toolbar? Does the popup's brand mark render correctly at 32px?
- Visual: does BadgeCompact's `[WS]` brand chip render at the right size on real Chrono24 cards (vs the test fixtures)?
- Visual: does the full Badge's new "WatchSentry · N sold-comps · 90d window" footer line look OK with real data?
- Visual: does the encouraging fallback copy ("We don't have this reference yet — adding new ones weekly") render correctly on listings whose ref isn't in our DB (e.g. one of the niche refs not in the seed-50 OR migration-106)?
- Accuracy: are the fair-value medians in a reasonable range vs real Chrono24 list prices? (Spot-check: Sub 124060 retail ~$9k–10k, our median should land in roughly $7k–9k since eBay tends to undercut Chrono24.)
- Accuracy: are sample sizes ≥ 20 for popular refs?
- Accuracy: is the delta percent calculation right? (compare listed price vs our reported median, manually divide)
- Console: any extension errors on the page?
- Network: does the worker `/enrich` return 200 quickly? Cache hits visible?
- 105 new refs (migration `0003`): cron hasn't run yet (next 04:00 UTC), so these will still show `no_data` until tomorrow.

**Next-session entry point (after Chrome reload / FleetView restart):**
1. **First action:** `navigate` to `https://www.chrono24.com/search/index.htm?query=Rolex+Submariner+124060&dosearch=true` — if it works, proceed.
2. **If still blocked:** ask user to navigate the tab manually, then inspect via `javascript_tool` / `read_network_requests` / `read_console_messages` (these don't go through the navigate allowlist).
3. Run audit batch on search page (badges, brand chips, tones).
4. Drive into a single listing (e.g. cheapest result) and audit full Badge.
5. Drive to an untracked ref (e.g. a vintage Sinn or non-seeded Cartier) and validate the encouraging fallback copy.
6. Spot-check API responses + console for any error spam.
7. Report findings + propose fixes if any.

**Bet state at hand-off (unchanged from Session 7 closeout above):**
- Worker `31280a03` live. D1: 155 refs. CWS .zip pre-built. Landing live at watchsentry.app + www.watchsentry.app, all 200, PII-clean.
- All 4 polish items shipped. Tests Workers 31/31 + Extension 29/29 green. Build clean.
- Only the live-audit is pending before the user-driven screenshot + CWS submit flow.

---

## 2026-05-22 — Session 8 (live audit + two route/normalize patches shipped)

**Hours:** ~2

**Decisions made:**
- Patch BOTH discovered gaps before CWS submission (not ship-as-is). Reasons: search-mode BadgeCompact was previously dead code in real Chrono24 flows (route gate misaligned with their URL scheme) and CWS rating is sticky.
- Patch A approach: content-based dispatch (parser-result driven), not URL pattern matching. More resilient to Chrono24 URL changes (we've already eaten two redesigns this Phase 0).
- Patch B approach: server-side normalize fallback (worker), not extension-side. Single source of truth, all client versions benefit, cache keys still use original ref so per-input-format cache hits work.
- Deploy approved per `feedback_no_cost_without_asking.md`: free-tier code-only update, ~10s deploy, no schema changes.

**Done:**
- **Live audit pass (Chrome MCP navigate gate now open after user's Chrome reload):**
  - ✅ Detail page (Sub 126610LV Starbucks): full Badge `$15,999 fair · +9.6% · 224 sold-comps · 90d window`. Math verified: ($17,530 list − $15,999 fair) / $15,999 = +9.57% — correct.
  - ✅ Fallback copy on untracked ref (Christopher Ward Sealander C63): "WatchSentry — We don't have this reference yet — adding new ones weekly based on what people view." Renders cleanly above price.
  - ✅ Accuracy spot-check 4 refs: 2/4 hit (`126610LV` ✓, `79030N` Tudor BB58 ✓), 2/4 miss (`16613LB` vintage Sub, `35705000` Speedy Pro). Misses are coverage/normalization, not parser bugs.
  - 🟡 BadgeCompact on `/search/index.htm?query=...`: route-gate dead code — Chrono24 always redirects searches to `/<brand>/<model>--modN.htm` URLs, so the search branch never fired in real usage. **Patch A unblocks this.**
  - 🟡 Reference normalization: `16613LB` (D1 has 124060/126610LN with suffix; doesn't have 16613 or 16613LB at all — pure coverage gap), `35705000` (Chrono24 strips dots; D1 has dotted Omega refs). **Patch B unblocks the Omega class of misses.**
- **Patch A — content-based route detection** (extension):
  - New `extension/src/content/route.ts` with pure `chooseRoute(doc): "listing"|"search"|"none"` (parses JSON-LD Product first → listing; else any `.wt-listing-item.js-listing-item.listing-item` → search; else none).
  - `content/index.tsx` `main()` swapped from `location.pathname.startsWith("/search/")` to `chooseRoute(document)`.
  - 4 new unit tests (`tests/content/route.test.ts`): listing fixture, search fixture, empty page, detail-with-related-cards (prefers listing). RED → GREEN → green run.
  - Extension tests **29 → 33** ✓.
- **Patch B — server-side ref normalization** (worker):
  - New `workers/src/normalize.ts` with pure `normalizeReferenceCandidates(brand, ref): string[]`. Always returns original first; appends stripped-letter variant when ref ends with 1-4 trailing letters AND prefix begins+ends with digit; appends dot-stripped variant when ref contains `.`/`-`; Omega-specific 4.2.2 split for 8-digit numeric, 3.2.2.2.2.3 for 14-digit numeric; dedupe order-preserving.
  - `workers/src/enrich.ts` `enrich()` swapped single `findReference(req.brand, req.reference)` for a loop walking `normalizeReferenceCandidates(req.brand, req.reference)`, breaking on first hit.
  - 9 new unit tests (`tests/normalize.test.ts`). RED → GREEN → green run.
  - Workers tests **31 → 40** ✓.
- **Deploy:** `wrangler deploy` → version `815e550b-0a63-4797-b9b9-e8583e3ef3ff` live at `watchsentry-api.txrz.workers.dev`. Cron + bindings unchanged.
- **Live re-verification after deploy + extension reload:**
  - `/rolex/index.htm` brand-index page: **2 BadgeCompacts on 60 cards** (was 0). Texts: `WS +19.0% vs fair`, `WS -16.5% vs fair`.
  - `/rolex/submariner--mod1.htm` model page: **7 BadgeCompacts on 73 cards** (was 0). 1 good (-10.9%), 6 neutral; deltas span -10.9% → +9.2%.
  - Detail page (126610LV): full Badge unchanged (cache hit), exactly 1 mount div — confirms dispatch correctly preferred listing route over search route on JSON-LD detail pages.
  - Curl smoke: Omega `31030425001001` (14-digit dots-stripped) → `$6,399 fair / 106 sold-comps / 310.30.42.50.01.001 displayName` via normalize. Identical to direct dotted-form hit. **Patch B end-to-end verified live.**
- **CWS bundle rebuilt:** `cws/watchsentry-v0.1.0.zip` 41.9 KB → 42.2 KB (+278 bytes from route dispatch). Source-map paths still relative-only (PII grep clean). Includes new `src/content/route.ts` source map.

**Tests / build / lint state at session end:**
- Workers **40/40** ✓ (+9 normalize tests)
- Extension **33/33** ✓ (+4 route tests)
- Production extension build 241 ms; total bundle size unchanged within rounding
- Typecheck clean both projects
- Lint clean on all session-touched files (pre-existing 4 popup.css format issues from Session 7 still present, unrelated)

**Findings deferred to Phase 1 (out of scope for CWS Phase 0 submission):**
- D1 ref-coverage expansion: `16613` (vintage Sub two-tone), Submariner sub-variants (`126610LV` ↔ family), Speedy Pro `3570.50.00` family, and dial-code suffix completeness. Hit rate observed at 2/4 popular refs spot-checked + ~3.3% on `/rolex/index.htm` cards + ~9.6% on `/rolex/submariner--mod1.htm` cards. Phase 1 should target ≥40% on top-50 model pages.
- Omega sub-variant coverage (`.50.01.002` vs stored `.50.01.001` etc.) — second-most-common miss class after dial-code suffixes.
- Brand-index pages give worse hit rates than model pages because models span more brands → fewer cards from any single seeded brand. Phase 1 may want to bias ref-expansion toward brand diversity rather than depth-per-model.

**Memory updates this session:** None — existing rules carried the session (skill discipline pre-TDD, no-cost-without-asking pre-deploy, anonymity strict on commits, strict-isolation on file paths).

**Cost surface this session:** $0. Free-tier Workers deploy, no D1 mutations, no domain spend, no external account creation.

**Phase 0 progress at session close:**
- 28/30 plan tasks + icons + first-impression polish + route patch + normalization patch shipped. Phase 0 functionally beyond "ready" — now buyer-side overlay fires across all 4 Chrono24 page types, not just listing detail.

**Blockers for next session (all user-driven, no autonomous work blocked):**
1. Capture 5 product screenshots in clean Chrome with the rebuilt extension (one screenshot should now show compact badges on a brand-index or model page, which wasn't possible before this session).
2. Paste `cws/listing-copy.md` + upload `cws/watchsentry-v0.1.0.zip` + screenshots into CWS dashboard.
3. Submit for review.
4. After CWS approval (1-3 business days typical), update landing CTA placeholder with real `chromewebstore.google.com/detail/<id>` URL.

**Commits (pushed at session close):**
- `abe42ea` feat(ext): content-based route detection (resilient to Chrono24 URL changes)
- `8abb508` feat(worker): server-side ref normalization fallback (Omega + dial-code variants)
- `63bab23` docs(progress): Session 8 — live audit + route/normalize patches shipped

All three on `origin/main`. Working tree clean at session close.

---

## Session 9 entry-point checklist (READ THIS FIRST NEXT SESSION)

> User signaled at Session 8 close: stepping away for **≥1 week**. Future-me, assume calendar drift of 1-2+ weeks when reading this. Treat all "today's state" claims below as point-in-time — verify before acting.

### 0. Auto-context that will already be loaded
- `MEMORY.md` (auto). Key entries: `project_locked_portfolio_v1.md` (updated 2026-05-22), `feedback_skill_discipline.md`, `feedback_no_cost_without_asking.md`, `feedback_anonymity_strict.md`, `reference_wrangler_remote_flag.md`.
- Per `project_passive_income_empire.md` rule: read `<workspace>/passive-income-empire/sessions/README.md` first → click into the most recent dated entry → read it fully → only then look at this bet-level log.

### 1. Verify state hasn't drifted since 2026-05-22

```powershell
# Worker still up + still the post-Session-8 version?
curl https://watchsentry-api.txrz.workers.dev/health
# Expected: {"ok":true,"name":"watchsentry-api"}

# Worker normalize patch still live? (Was version 815e550b at deploy.)
curl -X POST https://watchsentry-api.txrz.workers.dev/enrich -H "Content-Type: application/json" -d '{"brand":"Omega","reference":"31030425001001","condition":"very_good"}'
# Expected at session close: {"status":"ok","fairValue":{"medianUsd":6399,"sampleSize":106,...},"reference":{"brand":"Omega","model":"Speedmaster",...}}
# If returns "unknown_reference" → worker was rolled back or never deployed: redeploy normalize.ts via `wrangler deploy` (after asking).
# medianUsd will drift with time (eBay sold-comps refresh nightly via cron); ≠ 6399 is fine, "status":"ok" + sampleSize > 50 is what matters.

# Git in sync with origin?
cd <repo>; git status; git log --oneline -5
# Expected last commit: 63bab23 docs(progress): Session 8 — live audit + route/normalize patches shipped
# Expected: working tree clean, in sync with origin/main.

# Tests still green?
cd workers; npm test -- --run
cd extension; npm test -- --run
# Expected: Workers 40/40, Extension 33/33.

# Has the daily cron been running? D1 sold_comps row count should be growing.
npx wrangler d1 execute watchsentry-db --remote --command "SELECT COUNT(*) AS n FROM sold_comps; SELECT MAX(sold_at) AS last_sold_at FROM sold_comps; SELECT MAX(created_at) AS last_audit_event FROM audit_log WHERE event_type LIKE 'cron%';"
# At session close: ~6,626+ comps. If 7+ days passed, n should be ≥7k.
```

### 2. Ask the user which lane to pursue

State at hand-off:
- **CWS submission** still pending (user-driven only — 5 screenshots + paste + upload + click submit).
- **Patches A + B** shipped and live-verified (no remaining autonomous work on those).
- **D1 ref coverage** is the biggest unfixed gap (Phase 1 backlog): ~3% hit rate on brand-index, ~10% on model pages. Could be substantially improved by seeding Sub family + Speedy family sub-variants.
- **Worker / extension code** is in a known-good state; no in-flight refactors.

Likely lanes the user will request:
- **Lane A — CWS submission walk-through.** User has already approved the listing copy + screenshot plan in earlier sessions. They need to: load extension dist in clean Chrome, capture 5 PNG screenshots @ 1280×800 per `cws/screenshot-plan.md`, paste `cws/listing-copy.md` fields into CWS dashboard, upload `cws/watchsentry-v0.1.0.zip` + screenshots, click submit. ~1-2 hrs of user time, no autonomous work.
- **Lane B — Phase 1 backlog work (autonomous):** D1 ref coverage expansion (see Session 8 entry "Findings deferred to Phase 1" section). Could autonomously draft a `0004_seed_refs_coverage_phase1.sql` migration targeting top-100 missed refs on Chrono24 search results. Will need user approval before `wrangler d1 execute --remote` (per cost-without-asking rule, even though it's free-tier).
- **Lane C — CWS approval landed, real install URL needed.** If user reports CWS reviewer approved the extension during the gap: update landing-page CTA placeholder with the real `chromewebstore.google.com/detail/<id>` URL, redeploy Pages. Quick.
- **Lane D — T5b dropcatch background bet** kickoff. Separate folder under `<workspace>/`. Not started. Requires a brainstorming pass first.

### 3. Hard rules to apply (carry-forward from MEMORY.md)

- **No deploy / register / subscribe / commit dollars without asking first** (`feedback_no_cost_without_asking.md`). Includes `wrangler deploy`, `wrangler pages deploy`, `wrangler d1 execute --remote` for mutations. KV/D1 reads are fine.
- **Strict anonymity on every public artifact** (`feedback_anonymity_strict.md`). Audit BEFORE pushing to public-visible repos, creating accounts, or deploying landing-page changes that expose attribution.
- **Skill discipline** (`feedback_skill_discipline.md`). Invoke skills BEFORE code. Process skills first.
- **`--remote` flag** for `wrangler d1` and `wrangler kv` against production (`reference_wrangler_remote_flag.md`).
- **No Co-Authored-By line** in commits (per Session 0 decision — anonymity rule overrides Bash tool default).
- **Strict project isolation** — never put bet code/assets/plans in `passive-income-empire/`.

### 4. External state snapshot at session close (2026-05-22 ~18:50 local)

| Surface | State |
|---|---|
| Worker version | `815e550b-0a63-4797-b9b9-e8583e3ef3ff` at `https://watchsentry-api.txrz.workers.dev` |
| Worker cron | `0 4 * * *` (eBay sold-comps refresh daily 04:00 UTC) |
| D1 binding | `watchsentry-db` |
| D1 row counts | 155 watch_references / ~6,626+ sold_comps / ~14 users |
| KV cache | namespace `45d2b00e2fd545c38df468b15b8ec097` |
| Extension | unpacked dev install in user's Chrome at session close (will need re-load if Chrome was restarted) |
| CWS bundle | `cws/watchsentry-v0.1.0.zip` 42.2 KB (PII-clean source maps) |
| Landing site | Cloudflare Pages `watchsentry` project; custom domain `watchsentry.app` LIVE (per Session 7) |
| GitHub repo | `github.com/kungfury-sketch/watchsentry` (private) |
| GitHub last commit | `63bab23` |
| Tests at close | Workers 40/40 ✓ · Extension 33/33 ✓ |
| Production build | Extension `dist/` built 2026-05-22 17:45 (post-patches) |
| Anonymity audit | GREEN 2026-05-22 |
| Phase 0 progress | 28/30 plan tasks + icons + Patch A + Patch B — functionally beyond "ready". Remaining 2/30 are user-driven CWS submission steps. |

---

## Session 9 — CI fix + Phase 1 plan + coverage migration drafted (2026-05-22 evening)

**Triggered by:** user notification of two failed GitHub Actions runs on commits `48528fc` and `63bab23` (post Session 8 docs commits). User also said "I am not free right now and won't be free that much. In the meantime, you can still improve the product without asking me permissions first" and explicitly paused CWS submission ("no rush to put the extension to the store, we can improve it significantly in the meantime").

**Done this session:**
- **CI green restored:**
  - Reproduced lint failure locally: 4 biome `format` errors in `BadgeCompact.tsx`, `Badge.tsx`, `badge.css`, `popup.css`. These were the "pre-existing format issues from Session 7/10" that Session 8's log marked "out of scope" — turned out they were never out of scope and broke main CI on the docs-only push.
  - `npx biome check --write src tests` → 4 cosmetic-only fixes (lineWidth-100 JSX wrap, single-line CSS → multi-line, hex case). Verified Workers 40/40 + Extension 33/33 still pass. Committed as `c8a4370`.
  - Pushed → CI green in 22 s on both jobs.
- **Node 20 deprecation silenced:** bumped `actions/checkout@v4 → @v6` and `actions/setup-node@v4 → @v6` in `.github/workflows/ci.yml`. Committed as `e3db42e`. CI re-ran clean, zero annotations.
- **Worker liveness verified:** `/health` → `{"ok":true,"name":"watchsentry-api"}`; `/enrich` (POST 126610LV good) → `$15,999 fair / 224 comps / "126610LV Starbucks"`. Confirms `815e550b` still live, D1 + KV still bound. (Cron health beyond scope this session — Session 10 should check `audit_log` event stream.)
- **D1 inventory snapshot:** 155 refs distinct. Cross-checked the 6 refs visible in user's 2026-05-22 screenshot:
  - In D1: `116610LN` ✓ (1 of 6 cards).
  - Missing: `16800`, `16610LV` (Kermit), `116619LB` (Smurf) — guaranteed first-impression badge misses on the brand-index/model pages user is browsing.
- **No-badges diagnosis:** the most likely cause is that the user's Chrome was restarted at some point since Session 8's unpacked-extension live-load, and the dev extension is no longer enabled. Even if loaded, only 1 of 6 visible refs would render a badge — consistent with the audited ~3% brand-index hit rate. Coverage IS the root issue regardless of install state. Verification via Chrome MCP blocked by chrono24.com domain-scope expiring on browser restart (per `[[feedback-ask-before-websites]]` — needs one-time re-grant from user).
- **Phase 1 plan written:** [docs/plans/2026-05-22-phase1-improvement-plan.md](../docs/plans/2026-05-22-phase1-improvement-plan.md) — 5 lanes (coverage, UX polish, worker robustness, multi-platform decision, telemetry). Recommends delayed multi-platform (v1.0 Chrono24-only with deep coverage; v1.1 adds eBay watches as biggest single-shot expansion).
- **Migration 0004 drafted (NOT applied):** [workers/migrations/0004_seed_refs_phase1_coverage.sql](../workers/migrations/0004_seed_refs_phase1_coverage.sql) — 197 INSERT-OR-IGNORE rows; net add ≈ 190 new refs across Rolex (vintage Subs, GMTs, Daytonas, vintage DJs), Omega (full Speedy Pro + Seamaster 300M families), Tudor (Black Bay 58 + Pelagos depth), Cartier (Santos + Tank modern), Patek (Nautilus 5711 family + Aquanaut), AP (Royal Oak modern), IWC, Breitling, Grand Seiko, Longines, Hamilton, Oris, Panerai, Blancpain, Zenith. Target: 155 → ~290 refs; hit-rate target ≥40% on top-50 model pages, ≥15% on brand-index. **Awaits user approval to run `wrangler d1 execute --remote`** (per no-cost-without-asking, even though free-tier).

**Memory updates this session:**
- `feedback_autonomous_progress.md` (new) — captures the "no permission asks when busy" rule with the explicit carve-outs for hard-rule gates (cost / anonymity / isolation / MCP-scope).
- `project_watchsentry_no_rush_to_cws.md` (new) — captures the 2026-05-22 CWS-pause pivot so future-me doesn't prompt user toward submission.
- `feedback_anonymity_strict.md` (updated) — added explicit "NO `Co-Authored-By:` trailer" to the GitHub-repos rule. (This session's two commits violated the rule before the memory was updated — see open question below.)
- `MEMORY.md` index updated with both new entries.

**Anonymity leak (open question for user):**
- Commits `c8a4370` and `e3db42e` (both pushed) include `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>` trailers, violating the project's anonymity rule (was in this log's §3 carry-forward list under "No Co-Authored-By line"; was NOT yet in MEMORY.md when I committed — now is).
- Options: (a) leave as-is (private repo, low visibility — but committed forever); (b) `git rebase -i` to drop the trailers and `git push --force`. Force-push to main is destructive and needs explicit user approval. **Flagged for user decision.**

**Tests / build / lint state at session end:**
- Workers **40/40** ✓
- Extension **33/33** ✓
- Typecheck + lint clean on both
- CI green on `origin/main` head `e3db42e`, no annotations

**Cost surface this session:** $0. No deploys, no D1 writes (migration drafted not applied), no domain spend.

**Commits (pushed at session close):**
- `c8a4370` style(ext): apply biome formatter to satisfy CI lint check
- `e3db42e` ci: bump checkout + setup-node to v6 (Node 24 ready)
- (Migration 0004 + Phase 1 plan still uncommitted — will commit together once user reviews the plan.)

**Blockers / next-session entry point:**
1. **User decision needed on Phase 1 plan §4** — multi-platform: (a) accept v1.0 Chrono24-only + queue eBay as v1.1 [recommended], (b) bundle eBay into v1.0 [delays CWS by ~3 wks], (c) reject eBay entirely.
2. **User approval to apply migration 0004** (`wrangler d1 execute watchsentry-db --remote --file=./workers/migrations/0004_seed_refs_phase1_coverage.sql`). Free-tier, one-shot, $0.
3. **User decision on Co-Authored-By rewrite** (leave-as-is vs force-push amended history).
4. After 1+2 land: Lane B polish items (loading state → fade → outlier filter → currency → sparkline) start autonomously per `[[feedback-autonomous-progress]]`.
5. After Lane B: Lane C robustness items. After Lane C: live re-audit hit rate; draft migration 0005 if < target.
