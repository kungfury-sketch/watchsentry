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
- Design doc written: `C:\omerprojects\passive-income-empire\docs\plans\2026-05-18-t4a-niche-design.md`.
- Session 3 log written: `C:\omerprojects\passive-income-empire\sessions\2026-05-18-t4a-niche-design.md`.
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
  - Staging folders at `C:\omerprojects\chrome extension\` and `C:\omerprojects\cloudflare\` cleaned up.
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
   - From `C:\omerprojects\watchsentry\workers\`:
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
- New audit-debt entry logged: `C:\omerprojects\` workspace path appears in committed plan + progress + audit docs (pre-existing from Session 0). Action required before repo visibility change.

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

Action recorded: **state preserved as-is; no nudge of eBay support attempted from Claude side.** User to decide if/when to escalate. New feedback memory `feedback_parallel_around_blockers.md` captures the pattern; portfolio-level Session 4 log `C:\omerprojects\passive-income-empire\sessions\2026-05-19-session-4-phase0-nonlinear.md` documents the non-linear progress map for cross-session continuity.

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

## Session 3 entry-point checklist (READ THIS FIRST NEXT SESSION)

1. Auto-load `MEMORY.md` (harness does).
2. Read "Session 2" section above (this file).
3. Confirm deploy still healthy: `curl https://watchsentry-api.txrz.workers.dev/health`.
4. Confirm scheduled cron ran overnight: `npx wrangler d1 execute watchsentry-db --remote --json --command="SELECT created_at FROM audit_log WHERE event_type='cron_ebay_refresh_done' ORDER BY id DESC LIMIT 2;"` — expect 2 rows including one from today.
5. **Default forward plan (Week 4 + Week 5 autonomous-safe):**
   - **Task 4.1** — Chrono24 search-results parser (analogue to 3.2, HTML fixture-based).
   - **Task 4.3** — Settings popup + `chrome.storage` wiring (pure client-side).
   - **Task 4.4** — Anonymous user ID + daily-cap counter (client UUID + server-side check; `anonymousId` already in `/enrich` zod schema).
   - **Task 5.1** — **VERY BASIC landing page** at `landing/index.html`. **Scope locked by user 2026-05-19:** single HTML page, hero + 3 bullets + `support@watchsentry.app` link + footer links to /privacy + /terms. Minimal CSS. NO marketing-site bloat. Source files only — no Pages deploy.
   - **Task 5.4** — Privacy policy + Terms markdown drafts in `docs/legal/`.
6. **DO NOT** attempt autonomously:
   - `wrangler pages deploy` (Week 6 — user-driven)
   - CWS submission (Week 6)
   - `api.watchsentry.app` custom Worker route (needs DNS, may need user)
   - Lemon Squeezy KYC (Phase 1)

### Phase 1 cleanup backlog (when Phase 0 ships)
- Condition mapping from title/subtitle text
- Price-range filter on eBay search results
- Marketplace Insights API (restricted) for real sold-comps
- Rename cron counter to `attempted` + log `distinct` separately
- Replace synthetic Chrono24 fixture with real-page capture
- Replace placeholder icons (Task 6.2)
- Resolve npm audit warnings
- Make `workers_dev` + `preview_urls` explicit in wrangler.toml
- `omerprojects` path leak in committed docs (before repo visibility change)

### Verification commands cheat-sheet

```powershell
# Workers
cd C:\omerprojects\watchsentry\workers
npm run typecheck && npm test && npm run lint

# Extension
cd C:\omerprojects\watchsentry\extension
npm run typecheck && npm test && npm run lint && npm run build

# Deployed worker
curl https://watchsentry-api.txrz.workers.dev/health

# Git state
cd C:\omerprojects\watchsentry
git status --short
git log --oneline -10
```
