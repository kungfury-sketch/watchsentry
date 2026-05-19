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

## Session 6 entry-point checklist (READ THIS FIRST NEXT SESSION)

1. Auto-load `MEMORY.md` (harness does).
2. Read the "Session 5" section above.
3. **Ask user which lane to pursue:**
   - **Phase 0 finish:** Task 5.3 listing copy draft (autonomous markdown for CWS)
   - **Phase 1 polish:** Task #6 parallelize search /enrich + tune 50/day cap, Task #7 gate diagnostic logs
   - **CWS submission prep:** icon assets, real screenshots, copy (user-driven)
   - **T5b** dropcatch background bet (not started)
4. Health-check live worker (version `afc8d1c6`):
   ```
   curl https://watchsentry-api.txrz.workers.dev/health
   ```
5. **DO NOT** attempt autonomously without asking first (per `feedback_no_cost_without_asking.md`):
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
