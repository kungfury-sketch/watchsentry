# WatchSentry — Comprehensive Audit (2026-06-04)

**Auditor:** 3 parallel read-only agents (worker / extension / tests) + first-hand visual/UX review.
**Baseline at audit start (verified, not claimed):** Worker `/health` live; Workers **115/115** + Extension **106/106** tests green; typecheck + lint clean both packages; extension build clean (15.65 KB content bundle); git `main` clean + synced (`d16edef`).
**Verdict:** Product is in a known-good, well-engineered state. No Critical-severity *currently-firing* bug, but **one latent Critical** (wrong number on DOM drift), several High data-quality / abuse issues, and a large gap between "115 green" and real coverage (Worker 53% / Extension 66% line coverage; the orchestration paths that actually put a number on the page are ~0%). The biggest *product* gaps are **(a) a public honesty regression on the landing page** and **(b) the landing page has no real visual identity.**

Every finding below was re-verified against current code with file:line. Detail lives in the session transcript (3 agent reports). This doc is the synthesis + action plan.

---

## Findings by severity

### CRITICAL (latent — fires on Chrono24 DOM drift)
- **[C1] Chrono24 search can show the reference number as a six-figure price** — `extension/src/parsers/chrono24-search.ts:99`.
  `extractCardPrice` does `findPriceText(el) ?? el.textContent ?? ""`. When the price `<p>` class (`text-bold` + `text-md`) is renamed (Chrono24's recurring failure mode), it falls back to the whole card's text; `parsePriceAndCurrency` (`price.ts:9`) grabs the first digit cluster — the **reference** (`126610`) — and emits it as a `$126,610` listed price → a bright-red "+800%" badge on a fairly-priced watch. eBay-search and Watchfinder-search correctly fall back to `""`. **Fix:** remove the `?? el.textContent` fallback; a missing price node must suppress the delta, never fabricate one. *Verified.*

### HIGH
- **[H1] Price-range filter never runs on the read path → model-level fallback median is computed over an unfiltered, multi-reference price cloud** — `repo.ts:74-89` + `repo.ts:95-111`; fallback at `enrich.ts:211`. `filterByPriceRange` only runs at ingest. The model-fallback (the weakest number the product emits) spans every ref under brand+model (~$9k–$15k for Submariner) with no guard, and the ~46.8k legacy `fair` rows were never filtered. **Fix:** apply `filterByPriceRange` to comps on read (cleans legacy rows too). *Verified.*
- **[H2] `/discover` is unauthenticated + uncapped + attacker-rankable** — `index.ts` `/discover` handler, `discover.ts:15-27`, ranked by attacker-incrementable `observation_count` at `discover.ts:39-55`, spent by `cron.ts:46-67`. An attacker can bloat `candidate_refs` and pin junk refs to the front of the nightly eBay-quota-consuming validation queue, and potentially promote junk into `watch_references`. **Fix:** require `anonymousId` + daily cap on `/discover`; cap candidate growth; rank by distinct observers/recency, not raw count. *Verified.*
- **[H3] Daily cap is non-atomic + optional** — `enrich.ts:72-100` (SELECT→compute→UPDATE race) and `enrich.ts:142` (`if (req.anonymousId)`; omit/rotate id ⇒ no cap). Search fires up to 50 concurrent enrichments, so the race is real, not theoretical. **Fix:** atomic UPSERT with `RETURNING`; treat missing id as capped or fall back to IP bucket. *Verified.*
- **[H4] Content script runs once at `document_idle`, no MutationObserver / History hook** — `content/index.tsx:211`. On SPA navigation (Watchfinder Angular, eBay client-side search/pagination) badges never re-render; on late-hydrated DOM, no badge appears at all, silently. This is the structural root of "passed fixtures, broke on live." The `.ws-badge-compact` dedupe guard (`index.tsx:149`) is half-built plumbing for re-runs. **Fix:** debounced MutationObserver + `popstate`/pushState hook re-running route detection idempotently. *Verified.*
- **[H5] Reference regex only matches digit-leading 5–7-digit refs** — `chrono24-search.ts:94`, `ebay-search.ts`, `ebay-listing.ts`. Silently misses entire alphanumeric-ref brands already in the DB: Cartier `WSSA0009`, Breitling `AB0121211B1P1`, TAG `CBN2A1B.BA0643`, Patek `5711/1A-010`, Omega dotted/14-digit. No wrong number, but no value delivered. **Fix:** broaden to letter-leading + dotted/slashed forms with a digit-presence guard (worker `normalizeReferenceCandidates` already strips dots/dashes). *Verified.*

### MEDIUM
- **[M1] Search badge uses a different fair value than the listing badge for the same watch** — `content/index.tsx:155` hardcodes `condition:"very_good"` on cards while listing pages send the parsed tier; worker only falls back to `fair`. Same watch → different number on search vs detail. *Verified.*
- **[M2] No fetch timeout → listing badge can hang on "WatchSentry…" forever** — `api/client.ts:26`. Add an `AbortController` (~6s). *Verified.*
- **[M3] Cap + network + HTTP errors all collapse to the misleading "no_data" copy** — `enrich.ts:144`, `client.ts:31`, `content/index.tsx:134`. ~4 fresh search pages exhaust the 200/day cap, after which every card silently renders nothing. **Fix:** distinct worker `rate_limited` status + client distinguishes network/HTTP from genuine no-data, with honest copy. *Verified.*
- **[M4] Search page misclassified as a single listing if it carries any Product JSON-LD** — `content/route.ts:30/34/38` try the listing parser first. eBay injects JSON-LD on search. **Fix:** gate listing detection on a listing-specific signal (URL shape / single-item container). *Verified.*
- **[M5] Currency symbol detected independently of the number** — `price.ts:8-9,19-27`. "Was €9,500 now $8,900" → detects USD but grabs 9,500. **Fix:** anchor the number to the detected symbol / take the prominent price; reject mixed-symbol text. *Verified.*
- **[M6] eBay OAuth token fetch unguarded → one blip aborts the whole nightly refresh** — `cron.ts:25`, `index.ts` `scheduled`. Wrap in try/catch + log; wrap `scheduled`. *Verified.*
- **[M7] Price loses its delta when the currency symbol isn't in the same text node** — `price.ts:8`. **Fix:** default currency from host locale (ebay.com→USD, .co.uk→GBP, .de→EUR, watchfinder.co.uk→GBP). *Verified.*

### LOW
- **[L1] Landing meta still says "eBay sold-comps"** — `landing/index.html:7` — the dishonest copy the badge relabel was supposed to retire. (Integrity — promoted in the action plan.) *Verified.*
- **[L2] Popup + landing copy are Chrono24-only** — `popup.tsx:33,40,42`, `landing/index.html` title/h1/lead — product covers 3 marketplaces. *Verified.*
- **[L3] Dead `listedPriceUsd` prop on `<Badge>`** — `Badge.tsx:6` declared, never rendered, never passed, not returned by worker; `Badge.test.tsx:30` asserts on it (hollow). Delete prop + assertion. *Verified.*
- **[L4] `sold_at` window filter compares mismatched datetime formats** — `repo.ts:81/103` (`datetime('now',…)` space-format) vs `ebay.ts` ISO-`Z`. Backstopped by the JS re-filter in `fair-value.ts`; fragile + redundant. *Verified.*
- **[L5] Cron inserted-counter inflated by promotion branch** — `cron.ts:62` adds `result.comps.length` (returned, ≥50, incl. IGNORE'd dups) instead of `insertSoldComps`'s return. Observability only. *Verified.*
- **[L6] audit_log writes inside catch can re-throw and abort cron** — `cron.ts:20-22,39-41`. Best-effort wrap. *Verified.*
- **[L7] Empty `<span>` litter for non-ok search cards** — `content/index.tsx:168-173`. Only mount when ok. *Verified.*
- **[L8] Stale comment** — `content/index.tsx:42-44` claims active parsers emit `listedPriceUsd`; only the dormant parsers do. *Verified.*

### Test/coverage gaps
- **0%/near-0% on the paths that put a number on the page:** `content/index.tsx` `main/runListing/runSearch` (0%), `enrich()` orchestrator + `tryModelFallback` + `maybeAttachDelta` + `resolveListedPriceForEnv` (0%), `cron.ts runDailyRefresh` (2.7%), `client.ts reportDiscovery` (0%), `discover.ts pick/markValidated` (0%), `getEbayAppToken` (0%).
- **Hollow tests:** all parser tests are circular (synthetic fixtures shaped to the parser — cannot catch live-DOM drift, the failure that's bitten prod twice); `marketplaces.test.ts` exercises 28 assertions on DISABLED parsers; dead `listedPriceUsd` prop test; `validate.test.ts:126` tautology; condition/model-fallback mocks don't assert SQL; `fair-value` "weights recent" assertion only checks `>9000` (too loose).

---

## What is genuinely solid — do NOT "fix" these
- **Extension security/XSS posture:** no `innerHTML`/`dangerouslySetInnerHTML`/`eval`/`insertAdjacentHTML`; parsed page text is sent to the worker but **never rendered back**; only worker-returned numbers reach the DOM; static CSS. Manifest is least-privilege (`storage` only, host-scoped to the API + 6 marketplace origins). Hostname anti-spoofing regex (`route.ts:18-22`) is tested.
- **Worker money-path math:** FX direction + USD pass-through + null-on-unknown (`fx.ts`); weighted-median with age-decay + floor + unreachable-throw (`fair-value.ts`); delta computed fresh per request, cache key excludes price so a per-listing price never poisons the shared cache (`enrich.ts`); whole-dollar units end-to-end. The "never fabricate a delta when currency is unknown" invariant is exactly right.
- **SQL injection:** every query parameterized via `.bind`; eBay query `encodeURIComponent`'d. Zod bounds all inputs; malformed JSON handled.
- **`outlier.ts` / `normalize.ts` / `fx.ts` / `price.ts` parsing:** 100% covered, thoughtful edge cases (parts/lot guards, Omega ref splits, multi-locale price grouping). `processWithConcurrency` is race-free.

---

## Action plan

### Autonomous-safe (ship this session — code + tests + build + visual; no deploy/push)
1. **[C1]** Kill the Chrono24-search price→textContent fallback (TDD). *Trust-critical, one line.*
2. **Landing page: honesty + multi-marketplace + visual redesign** (`landing/`). Remove "sold-comps"; name Chrono24 + eBay + Watchfinder; give it a real premium identity (hero, badge preview, honest data note, refined type/color, proper CTA states). *The marquee "how it looks" deliverable.*
3. **Popup copy** generalized to all three marketplaces (`popup.tsx`).
4. **Extension robustness:** [M2] fetch timeout, [M3] honest failure states (client-side), [M5]+[M7] currency pairing + host-default, [H5] ref regex breadth, [L3/L7/L8] cleanups — each with tests.
5. **Worker hardening (code ready; DEPLOY user-gated):** [H1] price-range on read, [H3] atomic cap, [H2] `/discover` hardening, [M6] cron token/scheduled guards, [L5/L6] cron counter + best-effort logs — each with tests.
6. **Tests:** content `main()`, `enrich()` integration (incl. currency), `cron` runDailyRefresh, repo SQL assertions; fix hollow tests.
7. **[H4] MutationObserver + History hook** (with content `main()` test) — high leverage; attempt after the above.

### User-gated (NOT done autonomously — flagged for you)
- **Deploy** the worker (free-tier but a production change) — hardening fixes are inert until deployed.
- **Deploy** the landing page to Cloudflare Pages.
- **Push** commits to origin.
- **git-history PII scrub** (`git filter-repo`, destructive) — still pending before any repo publish.
- **CWS submission** — still paused per your call.

### Deferred / blocked
- **Real-DOM fixtures** (the single highest-value test): Chrono24 is Cloudflare-bot-blocked to automation; eBay/Watchfinder need a live browser (Chrome MCP domain grant) — blocked while you're away. Will attempt eBay via plain HTTP fetch; otherwise next session.
- Re-enable the 3 dormant dealers once their live DOM is captured + verified.
- True sold-price data (gated eBay Marketplace Insights API) — the "active asking ⇒ biases high" caveat is structural until then.
