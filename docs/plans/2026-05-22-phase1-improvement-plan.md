# WatchSentry Phase 1 — Improvement Plan

> **For Claude:** REQUIRED SUB-SKILL: `superpowers:executing-plans` once user picks a lane. `superpowers:test-driven-development` for every code task. `superpowers:verification-before-completion` before claiming any task done.

**Status:** DRAFT — generated 2026-05-22 after user paused CWS submission ("no need to rush, improve significantly first"). Lanes prioritized by impact-per-hour given the user's 5–15 hrs/week envelope.

**Goal:** Bring v1.0 from "functionally ready" to "demonstrably valuable" before CWS submission, so the first 100 installs land on a product that delights instead of underwhelms.

**Inputs that shaped the plan:**
- Session 8 audit: ~3% badge hit rate on `/rolex/index.htm`, ~10% on `/rolex/submariner--mod1.htm`.
- 2026-05-22 user screenshot: 6 Rolex Submariner cards visible (16800, 16610LV Kermit, 116619LB Smurf, 116610LN + 2 unknown). Only 1 of 6 would have matched current D1 → consistent with the audited brand-index hit rate.
- User strategic question: "are we gonna be only utilizable by chrono24 or any other similar websites?" (answered in §4 below).

---

## §1. Lane A — Reference coverage expansion (HIGHEST CONFIDENCE)

**Problem:** The badge only fires when the seller's ref is in D1. At 155 refs we cover well under half the active Chrono24 catalog at the model-page level and well under 20% at the brand-index level. The user's screenshot is direct field evidence.

**Approach:** Ship migration `0004_seed_refs_phase1_coverage.sql` (drafted in this session — **awaits user approval to apply**). Adds ~190 references targeting:

1. **Screenshot misses** (16800, 16610LV Kermit, 116619LB Smurf — guaranteed first-impression wins).
2. **Sub-variant + dial-code completeness** on the highest-listing-volume models (Sub, GMT, Daytona, Datejust, Speedy Pro, Seamaster 300M, Black Bay 58).
3. **Vintage refs with strong eBay sold-comp density** (Daytona 6263/6265, Sub 5513, GMT 1675, DJ 1601) — pulls in collector traffic.
4. **Brand-diversity bias** — depth on Tudor, Cartier, Patek, AP, IWC, Breitling so brand-index pages spanning multiple brands return more hits.

**Target after this migration:** ~290 refs total → hit-rate target ≥40% on top-50 model pages, ≥15% on brand-index pages.

**Steps:**
1. User approves: `wrangler d1 execute watchsentry-db --remote --file=./workers/migrations/0004_seed_refs_phase1_coverage.sql`. Free-tier D1 write. One-shot.
2. Cron's nightly `0 4 * * *` fetch will populate `sold_comps` for new refs over the next 1–2 cycles.
3. Live re-audit on Chrono24 with Chrome MCP — measure new hit rate, capture screenshots.
4. Iterate: draft `0005_seed_refs_phase1_round2.sql` if hit rate < target.

**Cost surface:** $0. D1 free-tier well below row caps (155 → 290 refs; sold_comps will grow ~5k–10k rows total, still far below tier cap).

---

## §2. Lane B — UX polish (NO SCOPE CHANGE)

Pure code work, no infra touch. All can ship autonomously per `feedback_autonomous_progress.md`.

| Item | Why | Effort |
|---|---|---|
| Loading state on Badge while `/enrich` resolves | Currently the badge renders nothing for ~500ms then pops in — feels broken on slow networks | 20 min |
| Fade-in animation on badge mount (150ms ease-out) | Removes the visual "snap" | 10 min |
| Hover-revealed expanded card on BadgeCompact | Click-to-pin functionality so users can read full delta on listing-grid pages without opening the detail page | 1 hr |
| Currency conversion in Badge title (EUR / GBP listings → user-locale USD shown alongside) | Most Chrono24 listings outside US are EUR/GBP. Currently we show USD vs raw seller price → confusing | 1.5 hrs (Workers `/enrich` returns rate; extension formats) |
| Outlier filter improvements on sold_comps | "For parts" / "incomplete" / box-only listings pollute the median. Server-side title-regex exclusion | 1.5 hrs |
| Better empty-state when worker returns `unknown_reference` | Current fallback is encouraging copy. Could surface a "we don't track this yet — add to wishlist?" affordance | 30 min |
| Popup: small bar-chart sparkline of last 30 days median trend | Visualizes whether seller is asking above a rising or falling market | 2 hrs |

**Steps (one PR each, TDD discipline):**
1. Write failing tests (Vitest + Preact-testing-library).
2. Implement.
3. Local verify (typecheck + lint + test + build).
4. Commit, push, watch CI.

---

## §3. Lane C — Worker robustness

| Item | Why | Effort |
|---|---|---|
| Per-ref staleness check on serving | Currently we serve any cached fairValue regardless of how stale; reject and re-enrich if last fetch > 7d | 45 min |
| Condition-derivation from listing title text | Workers backlog from Session 5 (Phase 1 cleanup) — "Unworn", "Mint", "Like new" → tier mapping | 1 hr |
| Price-range filter on eBay search | Workers backlog from Session 5 — currently "Rolex 124060" returns straps/bands/parts. Filter [0.3× MSRP, 3× MSRP] | 45 min |
| Daily-cron audit-log surface in admin page (or `/audit?since=` query) | Currently `audit_log` writes happen but nothing reads them; small internal dashboard for self-monitoring | 1.5 hrs |
| Per-anon-id soft rate limit on `/enrich` (300/day vs 50 cap) | Power users hit the 50/day cap easily on a heavy browse session. Raise to 300/day on cached responses; keep 50 on uncached | 30 min |

---

## §4. Lane D — Multi-platform decision (STRATEGIC — needs user input)

**User's question, answered:**

WatchSentry today is Chrono24-only by design. The architecture does **not** force this — the worker takes `(brand, reference, condition)` and returns fair value, so any site whose listings expose those fields could be supported by adding a new parser + manifest entry.

### Candidates ranked by impact / effort

| Platform | Buyer-side volume | Sold-comp data source | Parser difficulty | Worth it? |
|---|---|---|---|---|
| **eBay watches** | 10× Chrono24 | **Same as today** (we already pull eBay Browse) | Medium — eBay redesigns more often, dynamic DOM | **High — biggest single-shot expansion** |
| Bring a Trailer Watches | ~5% of Chrono24 | eBay (would need BaT-specific weighting given auction model) | Easy — clean static HTML | Medium — enthusiast traffic, brand-strong |
| Watchcharts marketplace | ~10% of Chrono24 | eBay | Easy | Medium |
| Hodinkee Shop | Curated low volume | eBay | Easy | Low |
| Watchfinder / Crown & Caliber | Dealer-curated | eBay | Medium | Low |

### Recommendation: **delayed multi-platform**

Ship v1.0 Chrono24-only with deep coverage + polish (Lanes A + B + C), submit to CWS, get reviewed & approved. v1.1 (Phase 1.5) adds eBay watches as the second platform.

**Why not v1.0 multi-platform:**
1. **CWS reviewer surface.** Adding `*.ebay.com` to `host_permissions` triggers stricter privacy review (Google's MV3 reviewer checklists explicitly call out broad host scope). First-submission reviews are slower and reviewer-rejection rates higher with more permissions.
2. **Maintenance load.** Chrono24 has redesigned twice during Phase 0 alone. Each platform we add doubles the parser-maintenance risk. v1.0 with one parser means we can iterate on coverage/UX without firefighting layout changes on two sites.
3. **Differentiation.** "WatchSentry — Chrono24 fair-value overlay" is sharper than "WatchSentry — watch fair-value overlay". Specific positioning wins early. Multi-platform can be the v1.1 release-notes hero feature for a second wave of attention.

**Why eBay watches is the right v1.1 expansion (not BaT/Watchcharts):**
- eBay is the de-facto buyer-comparison ground truth — same data source already powering us means no new data integration.
- Volume — adding eBay multiplies our addressable installs by ~10×.
- The host-permission expansion to eBay can land alongside a marketing beat ("now also on eBay") instead of being buried in initial release.

**Decision needed from user (one of three):**
- **(a) Accept recommendation:** ship v1.0 Chrono24-only with Lanes A+B+C; queue eBay as v1.1.
- **(b) Bundle eBay into v1.0:** delays CWS submission by 2–3 weeks for parser + privacy-policy update + manifest expansion.
- **(c) Reject eBay entirely:** stay Chrono24-only forever, focus on Chrono24 depth.

---

## §5. Lane E — Telemetry hardening (low-priority but unblocking)

Currently we have no visibility into:
- Real-world hit rate (how often `/enrich` returns `status:ok` vs `unknown_reference`)
- Distribution of refs requested (informs which refs to seed next)
- Cache-hit ratio (informs cap tuning)

Server-side telemetry inside the existing `audit_log` table is already half-built. A tiny `/internal/stats` endpoint behind a shared-secret header would let us self-monitor without a dashboard.

**Effort:** ~1.5 hrs. **Cost:** $0.

---

## Suggested order of operations

If user accepts the recommendation in §4:

1. **Approve + apply migration 0004** (Lane A) — biggest visible-impact win, ~5 min user effort. **NEXT STEP.**
2. Ship Lane B polish items in order of effort (loading state → fade → outlier filter → currency → sparkline).
3. Ship Lane C robustness items (staleness, condition-derivation, price-range filter).
4. Live re-audit hit rate. If < target, draft migration 0005.
5. Telemetry endpoint (Lane E).
6. CWS submission walk-through (the deferred user-driven work).
7. v1.1 multi-platform sprint: eBay watches.

Estimated time from "today" to "ready for CWS submission with confidence": **15–25 hours of work** spread across 3–4 sessions. Substantially more polished than the current "submit now" path.

---

## Out of scope for this plan

- T5b dropcatch — separate bet, separate folder.
- Lemon Squeezy paid tier — Phase 2.
- Mobile/web app version of WatchSentry — explicitly skipped per user preference (mobile apps despite UA day job).
- Watch face / smartwatch context — out of scope.

---

## Memory cross-refs

- `[[project-watchsentry-no-rush-to-cws]]` — captures the 2026-05-22 pivot that triggered this plan.
- `[[feedback-autonomous-progress]]` — Lanes B and C are autonomous; Lane A needs explicit approval for the D1 write per `[[feedback-no-cost-without-asking]]`.
- `[[feedback-anonymity-strict]]` — host_permission expansion (Lane D bundle option) requires anonymity re-audit on landing page + privacy policy before launch.
- `[[reference-wrangler-remote-flag]]` — when applying migration 0004, MUST pass `--remote`.
