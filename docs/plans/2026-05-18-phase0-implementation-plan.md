# WatchSentry Phase 0 — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Use `superpowers:test-driven-development` for every code task. Use `superpowers:verification-before-completion` before claiming any task done.

**Goal:** Ship WatchSentry Phase 0 to the Chrome Web Store — a manifest-v3 Chrome extension that injects a fair-value badge on chrono24.com listing pages, backed by a Cloudflare Workers + D1 + KV stack that derives 90-day weighted median prices from eBay Browse API sold-comps for the top-50 seeded watch references.

**Architecture:** Two-folder monorepo. `extension/` is a Vite + crxjs + TypeScript + Preact MV3 Chrome ext that parses the Chrono24 DOM and calls one Workers endpoint, `/enrich`. `workers/` is a Hono router on Cloudflare Workers backed by D1 (SQLite catalog + sold-comps + audit) and KV (6-hour enrichment cache); a daily Cron Trigger pulls fresh sold-comps from eBay Browse API. `landing/` is a tiny static Cloudflare Pages site for privacy policy, terms, and mailing-list capture (required for CWS publishing).

**Tech Stack:** Manifest V3, Vite, @crxjs/vite-plugin, TypeScript, Preact (UI), Hono (Workers router), Cloudflare Workers + D1 + KV + Cron + Pages + Web Analytics + Registrar, eBay Browse API, Vitest (test runner — default; swap if user objects), Biome (lint + format — default; swap if user objects), npm (package manager — keep simple).

**Linked design:** [T4a niche pick + product design](../../../passive-income-empire/docs/plans/2026-05-18-t4a-niche-design.md)
**Linked session log:** [Session 3 — T4a niche design](../../../passive-income-empire/sessions/2026-05-18-t4a-niche-design.md)
**GitHub repo:** https://github.com/kungfury-sketch/watchsentry (private)

---

## Layout addendum (ratified 2026-05-18, after this plan was first written)

The final folder layout differs from the path examples in early tasks below. Use this as the canonical structure:

- `extension/` — Chrome ext (unchanged)
- `workers/` — Cloudflare Workers + D1 migrations (unchanged)
- `landing/` — Cloudflare Pages site (unchanged)
- `cws/` — Chrome Web Store submission assets (**renamed from `cws-submission/`** in early plan drafts)
- `docs/plans/`, `docs/decisions/`, `docs/runbooks/`, `docs/anonymity-audit.md`
- `progress/session-log.md`
- `.github/workflows/ci.yml`

**Credentials policy diff vs. early plan:**
- `wrangler.toml` is **gitignored** (was previously committed in Task 1.9). Commit `wrangler.example.toml` template instead. Already done as part of foundation setup.
- `.dev.vars`, `.env*`, `.wrangler/` all gitignored.
- Cloudflare resource IDs (D1 database_id, KV namespace id) treated strictly as no-commit per user's no-credentials rule.

---

## Hard rules applied to this plan

- **Strict anonymity** (`feedback_anonymity_strict.md`): every external account uses brand display name; commit author email is the GitHub `noreply` address; commit author name is `WatchSentry Bot`; domain WHOIS privacy on; support email is `support@<brand>.com`. Anonymity-audit checkpoint at end of Week 5 BEFORE any public artifact (CWS submission, landing-page DNS go-live).
- **Strict project isolation** (`feedback_strict_project_isolation.md`): every artifact in this plan lives under `<repo>\` (or final-named folder). Nothing leaks into the `passive-income-empire/` workspace.
- **Cloudflare-native** (`reference_cloudflare_account.md`): no Fly.io / Railway / Hetzner / Supabase / Vercel. Browser Rendering deferred to Phase 1.
- **Hours envelope:** 40–60 hrs total over 5–7 weeks at 7–10 hrs/week.
- **Per-session progress log:** end every work session by appending to `progress/session-log.md` with: date, hours, tasks completed, blockers, next-session entry point. (Per `feedback_working_style.md`.)
- **TDD:** every code task is test-first. No production code without a failing test that calls it.
- **Frequent commits:** commit at the end of each task (the granularity below).

---

## Open question to resolve BEFORE Week 1 Task 1.1

**Brand name + domain.** Several Week 1 + Week 5 tasks depend on this.

**Recommendation:** accept `WatchSentry` as the working name and `watchsentry.app` (or `.app` if `.com` is taken) as the domain. Risk of needing to rename later is low; folder/repo/account renames are mechanical. If the user wants a different name, pause at Task 1.2 and the rest of Week 1 unblocks immediately once a name is chosen.

---

## Week 1 — Foundations, accounts, scaffold (target: 8–10 hrs)

### Task 1.1 — Pre-flight anonymity decision checklist

**Files:**
- Create: `<repo>\docs\anonymity-audit.md`

**Step 1: Verify each public-facing surface has an anonymity plan**

Open the design doc §7 (Strict anonymity audit) and confirm the seven mitigation rows are still accurate. If anything has changed, update before proceeding.

**Step 2: Write the anonymity audit checklist to file**

Content for `docs/anonymity-audit.md`:

```markdown
# Anonymity audit — WatchSentry

Every public-facing surface needs a mitigation. Audit BEFORE shipping any artifact.

- [ ] Domain WHOIS — Cloudflare Registrar, privacy ON (default)
- [ ] CWS developer profile display name — brand, not real name
- [ ] CWS support email — `support@watchsentry.app`
- [ ] GitHub repo — private
- [ ] Git author email — `<id>+<gh-username>@users.noreply.github.com`
- [ ] Git author name — `WatchSentry Bot`
- [ ] Landing page footer — brand only, no operator name
- [ ] Privacy policy contact — brand email only
- [ ] Terms of service signing party — brand entity name
- [ ] Any tracking/analytics — internal only, never publicly exposed dashboards
- [ ] Cloudflare account profile — fine as-is (internal)
- [ ] Lemon Squeezy (Phase 1) — brand product page; real KYC kept internal

Re-run this checklist at the end of Week 5 (anonymity-audit checkpoint) and before any new public-facing artifact ships in Phase 1+.
```

**Step 3: Commit (after Task 1.3 creates the repo — defer this commit until Task 1.5 along with the rest of the docs/)**

---

### Task 1.2 — Brand name + domain decision

**No files.**

**Step 1: Confirm brand name**

If user has not chosen a name, accept `WatchSentry` as the working name. Document the decision in `progress/session-log.md` (created in Task 1.6).

**Step 2: Check `.com` and `.app` availability via Cloudflare Registrar**

Do this manually in the Cloudflare dashboard: Domain Registration → Register Domain → search `watchsentry.app`, `watchsentry.app`, `watch-sentry.com`, `watchsentry.io`. Note prices and availability.

**Step 3: DO NOT buy yet**

Domain purchase happens in Task 6.3 after CWS submission. Reason: domain renewal hits the budget; we want the ext nearly ready before paying.

---

### Task 1.3 — Create root folder structure

**Files:**
- Create: `<repo>\` (root)
- Create: `<repo>\extension\`
- Create: `<repo>\workers\`
- Create: `<repo>\landing\`
- Create: `<repo>\docs\`
- Create: `<repo>\progress\`

**Step 1: Create the folder tree**

PowerShell:
```powershell
New-Item -ItemType Directory -Path "<repo>\extension" -Force
New-Item -ItemType Directory -Path "<repo>\workers" -Force
New-Item -ItemType Directory -Path "<repo>\landing" -Force
New-Item -ItemType Directory -Path "<repo>\docs" -Force
New-Item -ItemType Directory -Path "<repo>\progress" -Force
```

The plan doc (this file) is already at `docs/plans/`. Anonymity audit lives at `docs/anonymity-audit.md` from Task 1.1.

**Step 2: Verify with `ls`**

PowerShell:
```powershell
Get-ChildItem <workspace>\watchsentry
```

Expected output: five subfolders (`docs`, `extension`, `landing`, `progress`, `workers`).

---

### Task 1.4 — Root README + .gitignore

**Files:**
- Create: `<repo>\README.md`
- Create: `<repo>\.gitignore`

**Step 1: Write README.md**

```markdown
# WatchSentry

Chrome extension that protects mid-market watch buyers on Chrono24 by overlaying fair-value, cross-marketplace alternatives, and seller risk evidence on every listing.

**Status:** Phase 0 — pre-launch.

See `docs/plans/2026-05-18-phase0-implementation-plan.md` for the active build plan.

## Layout

- `extension/` — Manifest v3 Chrome extension (Vite + crxjs + TS + Preact)
- `workers/` — Cloudflare Workers API + D1 + KV + Cron (Hono + TS)
- `landing/` — Cloudflare Pages static site (privacy/terms/mailing-list)
- `docs/` — design and plan documents
- `progress/` — per-session work log
```

**Step 2: Write .gitignore**

```
node_modules/
dist/
.dev.vars
.wrangler/
.env
.env.*
*.local
.DS_Store
.vscode/
.idea/
coverage/
*.log
```

**Step 3: Verify files exist**

PowerShell:
```powershell
Get-ChildItem <workspace>\watchsentry -Force
```

Expected: see `.gitignore`, `README.md`, plus the 5 folders.

---

### Task 1.5 — Init git repo with anonymity configured

**Files:** none new; modifies repo state.

**Step 1: Init git**

```powershell
git -C <workspace>\watchsentry init
```

Expected: `Initialized empty Git repository in <repo>/.git/`

**Step 2: User retrieves their GitHub noreply email**

User action: Go to https://github.com/settings/emails → "Keep my email address private" → copy the `<id>+<username>@users.noreply.github.com` value. Tell Claude the value (or set it directly via Step 3).

**Step 3: Configure git author identity to brand + noreply**

```powershell
git -C <workspace>\watchsentry config user.email "<paste-noreply-email>"
git -C <workspace>\watchsentry config user.name "WatchSentry Bot"
```

**Step 4: Verify config**

```powershell
git -C <workspace>\watchsentry config user.email
git -C <workspace>\watchsentry config user.name
```

Expected: noreply email + "WatchSentry Bot". If a real name or personal email appears, STOP and re-run Step 3 — anonymity audit failed.

**Step 5: Initial commit**

```powershell
git -C <workspace>\watchsentry add .
git -C <workspace>\watchsentry commit -m "chore: initial scaffold"
```

**Step 6: Verify author identity on the commit**

```powershell
git -C <workspace>\watchsentry log -1 --pretty=fuller
```

Expected: `Author: WatchSentry Bot <<id>+<username>@users.noreply.github.com>`. If anything else, reset and redo.

---

### Task 1.6 — Create private GitHub repo and push

**Files:** none new.

**Step 1: User creates a private GitHub repo**

User action: Go to https://github.com/new → name `watchsentry` (or final-named) → **Private** → DO NOT add README/license/.gitignore (we already have them).

**Step 2: Get the SSH or HTTPS URL and add as remote**

```powershell
git -C <workspace>\watchsentry remote add origin git@github.com:<gh-username>/watchsentry.git
```

**Step 3: Push**

```powershell
git -C <workspace>\watchsentry branch -M main
git -C <workspace>\watchsentry push -u origin main
```

**Step 4: Verify on GitHub**

User action: open the repo page; confirm visibility = Private; confirm last commit author shows the noreply email + brand name.

**Step 5: Create the per-session log file**

`progress/session-log.md`:

```markdown
# WatchSentry — per-session progress log

## 2026-05-18 — Session 0 (planning + scaffold start)

- **Hours:** ~1
- **Done:** Folder structure, README, .gitignore, git init with anonymized identity, private GitHub repo pushed.
- **Blockers:** None.
- **Next session:** Task 1.7 (Wrangler + Cloudflare).
```

Commit:

```powershell
git -C <workspace>\watchsentry add progress/session-log.md
git -C <workspace>\watchsentry commit -m "docs: start per-session progress log"
git -C <workspace>\watchsentry push
```

---

### Task 1.7 — Install Wrangler + bind to Cloudflare account

**Files:** none.

**Step 1: Install Wrangler globally**

```powershell
npm install -g wrangler
```

**Step 2: Authenticate**

```powershell
wrangler login
```

Expected: opens browser, completes OAuth handshake with existing Cloudflare account, terminal prints `Successfully logged in`.

**Step 3: Verify**

```powershell
wrangler whoami
```

Expected: email + account ID of user's Cloudflare account.

---

### Task 1.8 — Create D1 database + KV namespace

**Files:** none yet; will reference in workers/wrangler.toml in Task 1.9.

**Step 1: Create D1 database**

```powershell
wrangler d1 create watchsentry-db
```

Expected output (sample):
```
✅ Successfully created DB 'watchsentry-db'
[[d1_databases]]
binding = "DB"
database_name = "watchsentry-db"
database_id = "<uuid>"
```

Copy this `<uuid>` — needed for wrangler.toml.

**Step 2: Create KV namespace for enrichment cache**

```powershell
wrangler kv namespace create CACHE
```

Expected output (sample):
```
✅ Success!
[[kv_namespaces]]
binding = "CACHE"
id = "<id>"
```

Copy this `<id>`.

**Step 3: Note both bindings for wrangler.toml in Task 1.9**

Write the IDs into `docs/cloudflare-bindings.md`:

```markdown
# Cloudflare bindings

- D1 database `watchsentry-db`: `<uuid>`
- KV namespace `CACHE`: `<id>`

(Not committed to git — referenced from wrangler.toml only.)
```

Add `docs/cloudflare-bindings.md` to `.gitignore`:

```powershell
Add-Content <repo>\.gitignore "docs/cloudflare-bindings.md`n"
```

---

### Task 1.9 — Workers project scaffold (Hono + TS)

**Files:**
- Create: `<repo>\workers\package.json`
- Create: `<repo>\workers\tsconfig.json`
- Create: `<repo>\workers\wrangler.toml`
- Create: `<repo>\workers\src\index.ts`
- Create: `<repo>\workers\biome.json`

**Step 1: Init Node project**

```powershell
cd <repo>\workers
npm init -y
```

**Step 2: Install Hono + Workers + types + Biome + Vitest**

```powershell
npm install hono
npm install -D wrangler @cloudflare/workers-types typescript @biomejs/biome vitest @vitest/coverage-v8
```

**Step 3: tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022"],
    "types": ["@cloudflare/workers-types"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["src/**/*.ts", "tests/**/*.ts"]
}
```

**Step 4: wrangler.toml**

```toml
name = "watchsentry-api"
main = "src/index.ts"
compatibility_date = "2026-05-01"

[[d1_databases]]
binding = "DB"
database_name = "watchsentry-db"
database_id = "<paste-from-Task-1.8>"

[[kv_namespaces]]
binding = "CACHE"
id = "<paste-from-Task-1.8>"

[triggers]
crons = ["0 4 * * *"]  # daily 04:00 UTC — eBay sold-comp refresh

[observability]
enabled = true
```

**Step 5: biome.json**

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "formatter": { "indentStyle": "space", "indentWidth": 2, "lineWidth": 100 },
  "linter": { "enabled": true, "rules": { "recommended": true } },
  "organizeImports": { "enabled": true },
  "files": { "include": ["src/**/*.ts", "tests/**/*.ts"] }
}
```

**Step 6: Minimal Hono entry — src/index.ts**

```ts
import { Hono } from "hono";

export type Env = {
  DB: D1Database;
  CACHE: KVNamespace;
  EBAY_APP_ID: string;
  EBAY_CERT_ID: string;
};

const app = new Hono<{ Bindings: Env }>();

app.get("/health", (c) => c.json({ ok: true, name: "watchsentry-api" }));

export default {
  fetch: app.fetch,
  scheduled: async (_event: ScheduledEvent, _env: Env, _ctx: ExecutionContext) => {
    // Cron entry — filled in Task 2.5
  },
};
```

**Step 7: Add npm scripts to workers/package.json**

```json
{
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "biome check src tests",
    "fmt": "biome format --write src tests",
    "typecheck": "tsc --noEmit"
  }
}
```

**Step 8: Smoke test the worker locally**

```powershell
npm run dev
```

In another terminal:

```powershell
curl http://localhost:8787/health
```

Expected: `{"ok":true,"name":"watchsentry-api"}`. If anything else, debug before continuing.

**Step 9: Stop dev server (Ctrl+C). Commit.**

```powershell
git -C <workspace>\watchsentry add workers .gitignore
git -C <workspace>\watchsentry commit -m "feat(workers): scaffold Hono app + Cloudflare bindings"
git -C <workspace>\watchsentry push
```

---

### Task 1.10 — Vitest harness + first green test

**Files:**
- Create: `<repo>\workers\vitest.config.ts`
- Create: `<repo>\workers\tests\health.test.ts`

**Step 1: vitest.config.ts**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    coverage: { provider: "v8" },
    include: ["tests/**/*.test.ts"],
  },
});
```

**Step 2: Write the failing test — tests/health.test.ts**

```ts
import { describe, expect, it } from "vitest";
import worker from "../src/index";

describe("health endpoint", () => {
  it("returns ok=true", async () => {
    const req = new Request("http://x/health");
    const env = {} as never;
    const res = await worker.fetch(req, env, {} as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true, name: "watchsentry-api" });
  });
});
```

**Step 3: Run test — verify pass**

```powershell
npm test
```

Expected: 1 test passing.

**Step 4: Commit**

```powershell
git -C <workspace>\watchsentry add workers/vitest.config.ts workers/tests
git -C <workspace>\watchsentry commit -m "test(workers): add vitest + health smoke"
git -C <workspace>\watchsentry push
```

---

### Week 1 — review checkpoint

Before moving to Week 2, verify ALL of the following:

- [ ] Folder structure matches the layout in README
- [ ] Git config shows `WatchSentry Bot` + noreply email (`git config user.email`, `user.name`)
- [ ] Last commit on `main` was authored by `WatchSentry Bot`
- [ ] GitHub repo is PRIVATE
- [ ] `wrangler whoami` shows the user's Cloudflare account
- [ ] D1 + KV namespace IDs captured in `docs/cloudflare-bindings.md` (gitignored)
- [ ] `npm test` in `workers/` returns 1 passing test
- [ ] `npm run typecheck` in `workers/` passes
- [ ] `npm run lint` in `workers/` passes
- [ ] `progress/session-log.md` has been updated

If any check fails, fix before proceeding.

---

## Week 2 — Data backend: schema, seed, eBay (target: 8–10 hrs)

### Task 2.1 — D1 schema migration

**Files:**
- Create: `<repo>\workers\migrations\0001_init.sql`
- Create: `<repo>\workers\tests\schema.test.ts`

**Step 1: Write the schema — 0001_init.sql**

```sql
-- WatchSentry D1 schema v1
-- All ISO-8601 UTC strings for timestamps (D1 has no native datetime).

CREATE TABLE IF NOT EXISTS watch_references (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  reference_number TEXT NOT NULL,
  display_name TEXT NOT NULL,
  added_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(brand, reference_number)
);

CREATE INDEX IF NOT EXISTS idx_refs_brand_ref ON watch_references(brand, reference_number);

CREATE TABLE IF NOT EXISTS sold_comps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference_id INTEGER NOT NULL,
  condition_tier TEXT NOT NULL CHECK (condition_tier IN ('new', 'unworn', 'very_good', 'good', 'fair')),
  sold_price_usd REAL NOT NULL,
  sold_at TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('ebay', 'chrono24_dealer')),
  source_listing_id TEXT,
  ingested_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (reference_id) REFERENCES watch_references(id),
  UNIQUE(source, source_listing_id)
);

CREATE INDEX IF NOT EXISTS idx_sold_comps_ref_tier_sold_at
  ON sold_comps(reference_id, condition_tier, sold_at DESC);

CREATE TABLE IF NOT EXISTS listings_snapshot (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference_id INTEGER,
  source TEXT NOT NULL,
  source_listing_id TEXT NOT NULL,
  listed_price_usd REAL,
  condition_tier TEXT,
  seller_id TEXT,
  observed_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (reference_id) REFERENCES watch_references(id),
  UNIQUE(source, source_listing_id, observed_at)
);

CREATE TABLE IF NOT EXISTS users (
  anonymous_id TEXT PRIMARY KEY,
  installed_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  enrichment_count_today INTEGER NOT NULL DEFAULT 0,
  counter_day TEXT NOT NULL DEFAULT (date('now'))
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  payload_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_type_time ON audit_log(event_type, created_at DESC);
```

**Step 2: Apply migration to remote D1**

```powershell
cd <repo>\workers
wrangler d1 execute watchsentry-db --remote --file=./migrations/0001_init.sql
```

Expected: lists all CREATE statements as executed.

**Step 3: Apply to local dev D1 too**

```powershell
wrangler d1 execute watchsentry-db --local --file=./migrations/0001_init.sql
```

**Step 4: Write a schema test that asserts tables exist**

`tests/schema.test.ts` (uses Miniflare via wrangler unstable_dev — alternative: skip integration test and rely on the migration file as source of truth + a manual `wrangler d1 execute --command="select name from sqlite_master where type='table'"` check; pick the simpler path):

Simpler path — just run a smoke query manually:

```powershell
wrangler d1 execute watchsentry-db --remote --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
```

Expected: 5 tables (`audit_log`, `listings_snapshot`, `sold_comps`, `users`, `watch_references`).

**Step 5: Commit**

```powershell
git -C <workspace>\watchsentry add workers/migrations
git -C <workspace>\watchsentry commit -m "feat(db): initial D1 schema"
git -C <workspace>\watchsentry push
```

---

### Task 2.2 — Seed top-50 watch references

**Files:**
- Create: `<repo>\workers\migrations\0002_seed_refs.sql`

**Step 1: Write the seed SQL**

```sql
-- Top-50 references seeded for Phase 0.
-- Format: brand, model, reference_number, display_name
INSERT OR IGNORE INTO watch_references (brand, model, reference_number, display_name) VALUES
  ('Rolex', 'Submariner', '124060', 'Rolex Submariner No-Date 124060'),
  ('Rolex', 'Submariner', '126610LN', 'Rolex Submariner Date 126610LN'),
  ('Rolex', 'Submariner', '126610LV', 'Rolex Submariner Date 126610LV (Starbucks)'),
  ('Rolex', 'GMT-Master II', '126710BLRO', 'Rolex GMT-Master II 126710BLRO (Pepsi)'),
  ('Rolex', 'GMT-Master II', '126710BLNR', 'Rolex GMT-Master II 126710BLNR (Batman)'),
  ('Rolex', 'GMT-Master II', '126711CHNR', 'Rolex GMT-Master II 126711CHNR (Root Beer)'),
  ('Rolex', 'Daytona', '116500LN', 'Rolex Daytona 116500LN (White)'),
  ('Rolex', 'Daytona', '116500LN-black', 'Rolex Daytona 116500LN (Black)'),
  ('Rolex', 'Datejust', '126334', 'Rolex Datejust 41 126334'),
  ('Rolex', 'Datejust', '126200', 'Rolex Datejust 36 126200'),
  ('Rolex', 'Day-Date', '228238', 'Rolex Day-Date 40 228238'),
  ('Rolex', 'Explorer', '224270', 'Rolex Explorer 40 224270'),
  ('Rolex', 'Explorer II', '226570', 'Rolex Explorer II 226570'),
  ('Rolex', 'Sea-Dweller', '126600', 'Rolex Sea-Dweller 126600'),
  ('Rolex', 'Yacht-Master', '126622', 'Rolex Yacht-Master 40 126622'),
  ('Rolex', 'Air-King', '126900', 'Rolex Air-King 126900'),
  ('Omega', 'Speedmaster', '310.30.42.50.01.001', 'Omega Speedmaster Moonwatch 310.30.42.50.01.001'),
  ('Omega', 'Speedmaster', '311.30.42.30.01.005', 'Omega Speedmaster Moonwatch 311.30.42.30.01.005'),
  ('Omega', 'Seamaster 300M', '210.30.42.20.01.001', 'Omega Seamaster Diver 300M 210.30.42.20.01.001'),
  ('Omega', 'Seamaster 300M', '210.30.42.20.06.001', 'Omega Seamaster Diver 300M 210.30.42.20.06.001'),
  ('Omega', 'Aqua Terra', '220.10.41.21.03.001', 'Omega Seamaster Aqua Terra 220.10.41.21.03.001'),
  ('Omega', 'Constellation', '131.10.39.20.02.001', 'Omega Constellation 39mm 131.10.39.20.02.001'),
  ('Tudor', 'Black Bay 58', '79030N', 'Tudor Black Bay 58 79030N (Black)'),
  ('Tudor', 'Black Bay 58', '79030B', 'Tudor Black Bay 58 79030B (Blue)'),
  ('Tudor', 'Black Bay', 'M79230N', 'Tudor Black Bay 41 M79230N'),
  ('Tudor', 'Pelagos', '25600TN', 'Tudor Pelagos 25600TN'),
  ('Tudor', 'Pelagos', '25407N', 'Tudor Pelagos FXD 25407N'),
  ('Tudor', 'GMT', 'M79830RB', 'Tudor Black Bay GMT M79830RB'),
  ('Cartier', 'Tank', 'WSTA0041', 'Cartier Tank Must WSTA0041'),
  ('Cartier', 'Santos', 'WSSA0009', 'Cartier Santos WSSA0009'),
  ('Cartier', 'Ballon Bleu', 'WSBB0039', 'Cartier Ballon Bleu WSBB0039'),
  ('Audemars Piguet', 'Royal Oak', '15500ST.OO.1220ST.01', 'AP Royal Oak Selfwinding 41 15500ST.OO.1220ST.01'),
  ('Audemars Piguet', 'Royal Oak', '15510ST.OO.1320ST.01', 'AP Royal Oak Jumbo 15510ST.OO.1320ST.01'),
  ('Patek Philippe', 'Nautilus', '5711/1A-010', 'Patek Philippe Nautilus 5711/1A-010'),
  ('Patek Philippe', 'Aquanaut', '5167A-001', 'Patek Philippe Aquanaut 5167A-001'),
  ('Patek Philippe', 'Calatrava', '5227G-001', 'Patek Philippe Calatrava 5227G-001'),
  ('IWC', 'Pilot Mark XX', 'IW328201', 'IWC Pilot Mark XX IW328201'),
  ('IWC', 'Portugieser', 'IW358304', 'IWC Portugieser Chronograph IW358304'),
  ('Breitling', 'Navitimer', 'AB0139211C1A1', 'Breitling Navitimer B01 Chronograph 43 AB0139211C1A1'),
  ('Breitling', 'Superocean', 'A17376211B1A1', 'Breitling Superocean 42 A17376211B1A1'),
  ('Grand Seiko', 'Heritage', 'SBGA413', 'Grand Seiko Heritage SBGA413 (Shunbun)'),
  ('Grand Seiko', 'Heritage', 'SBGA407', 'Grand Seiko Heritage SBGA407'),
  ('Grand Seiko', 'Sport', 'SBGE271', 'Grand Seiko Sport SBGE271'),
  ('Panerai', 'Luminor', 'PAM01312', 'Panerai Luminor Marina PAM01312'),
  ('Panerai', 'Submersible', 'PAM01209', 'Panerai Submersible PAM01209'),
  ('Hublot', 'Big Bang', '301.SX.130.RX', 'Hublot Big Bang 44 301.SX.130.RX'),
  ('Vacheron Constantin', 'Overseas', '4500V/110A-B128', 'Vacheron Constantin Overseas 4500V/110A-B128'),
  ('A. Lange & Söhne', 'Lange 1', '191.039', 'A. Lange & Söhne Lange 1 191.039'),
  ('Jaeger-LeCoultre', 'Reverso', 'Q397848J', 'Jaeger-LeCoultre Reverso Classic Q397848J'),
  ('Zenith', 'El Primero', '03.3100.3600/69.M3100', 'Zenith Chronomaster Original 03.3100.3600/69.M3100');
```

**Step 2: Apply seed to remote + local**

```powershell
wrangler d1 execute watchsentry-db --remote --file=./migrations/0002_seed_refs.sql
wrangler d1 execute watchsentry-db --local --file=./migrations/0002_seed_refs.sql
```

**Step 3: Verify**

```powershell
wrangler d1 execute watchsentry-db --remote --command="SELECT COUNT(*) AS n FROM watch_references;"
```

Expected: `n = 50`.

**Step 4: Commit**

```powershell
git -C <workspace>\watchsentry add workers/migrations/0002_seed_refs.sql
git -C <workspace>\watchsentry commit -m "feat(db): seed top-50 watch references"
git -C <workspace>\watchsentry push
```

---

### Task 2.3 — eBay Developer App registration (manual)

**Files:**
- Modify: `progress/session-log.md` (append next-session note)

**Step 1: Register at developer.ebay.com**

User action: developer.ebay.com → My Account → Production keyset → request approval. Brand-named app: `watchsentry`. Use brand support email (which won't exist until domain is bought — use a temporary `<gh-username>@users.noreply.github.com` placeholder; update after domain). Approval typically same-day to 48 hours.

**Step 2: Capture App ID + Cert ID**

When approved, copy `App ID` (Client ID) and `Cert ID` (Client Secret).

**Step 3: Store as Wrangler secrets (NOT in wrangler.toml)**

```powershell
cd <repo>\workers
wrangler secret put EBAY_APP_ID
# paste App ID at prompt
wrangler secret put EBAY_CERT_ID
# paste Cert ID at prompt
```

**Step 4: Smoke-test the OAuth token endpoint**

```powershell
$pair = "$(wrangler secret get EBAY_APP_ID):$(wrangler secret get EBAY_CERT_ID)"
$b64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($pair))
Invoke-WebRequest -Uri "https://api.ebay.com/identity/v1/oauth2/token" `
  -Method POST `
  -Headers @{ "Authorization" = "Basic $b64"; "Content-Type" = "application/x-www-form-urlencoded" } `
  -Body "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope"
```

NOTE: `wrangler secret get` may not exist in all versions; if not, just hand-construct the Basic auth header from your local copy of the values for this one-time check. Don't commit values.

Expected: HTTP 200 with `access_token` field. If 401, double-check the credentials.

**Step 5: Append to session log**

`progress/session-log.md`:

```markdown
## 2026-05-2X — Session N (eBay app reg + Week 2 backend)

- **Hours:** ~2 (waiting on approval) + ~Y for backend work
- **Done:** eBay Production app approved, secrets stored in Wrangler. Token endpoint smoke-tested OK.
- **Blockers:** none.
- **Next session:** Task 2.4 (eBay API wrapper module).
```

---

### Task 2.4 — eBay API wrapper module

**Files:**
- Create: `<repo>\workers\src\ebay.ts`
- Create: `<repo>\workers\tests\ebay.test.ts`

**Step 1: Write the failing test — tests/ebay.test.ts**

```ts
import { describe, expect, it, vi } from "vitest";
import { fetchEbaySoldComps, normalizeCondition } from "../src/ebay";

describe("normalizeCondition", () => {
  it("maps NEW to 'new'", () => {
    expect(normalizeCondition("NEW")).toBe("new");
  });
  it("maps NEW_OTHER to 'unworn'", () => {
    expect(normalizeCondition("NEW_OTHER")).toBe("unworn");
  });
  it("maps USED_EXCELLENT to 'very_good'", () => {
    expect(normalizeCondition("USED_EXCELLENT")).toBe("very_good");
  });
  it("maps USED_GOOD to 'good'", () => {
    expect(normalizeCondition("USED_GOOD")).toBe("good");
  });
  it("maps unknown to 'fair' as conservative default", () => {
    expect(normalizeCondition("WEIRD")).toBe("fair");
  });
});

describe("fetchEbaySoldComps", () => {
  it("returns parsed comps from a mocked Browse API response", async () => {
    const mockFetch = vi.fn(async () => new Response(JSON.stringify({
      itemSummaries: [{
        itemId: "v1|123|0",
        price: { value: "9450.00", currency: "USD" },
        condition: "USED_EXCELLENT",
        itemEndDate: "2026-04-20T18:00:00Z",
      }],
    }), { status: 200 }));
    const comps = await fetchEbaySoldComps({
      brand: "Rolex",
      reference: "124060",
      token: "stub-token",
      fetchImpl: mockFetch,
    });
    expect(comps).toHaveLength(1);
    expect(comps[0]).toMatchObject({
      sourceListingId: "v1|123|0",
      soldPriceUsd: 9450,
      conditionTier: "very_good",
      soldAt: "2026-04-20T18:00:00Z",
    });
  });
});
```

**Step 2: Run — verify it fails**

```powershell
npm test
```

Expected: 5 failures (functions not defined).

**Step 3: Implement src/ebay.ts**

```ts
export type ConditionTier = "new" | "unworn" | "very_good" | "good" | "fair";

export function normalizeCondition(ebayCondition: string): ConditionTier {
  switch (ebayCondition) {
    case "NEW": return "new";
    case "NEW_OTHER": return "unworn";
    case "USED_EXCELLENT": return "very_good";
    case "USED_GOOD": return "good";
    case "USED_ACCEPTABLE": return "fair";
    default: return "fair";
  }
}

export type SoldComp = {
  sourceListingId: string;
  soldPriceUsd: number;
  conditionTier: ConditionTier;
  soldAt: string;
};

export async function getEbayAppToken(
  appId: string,
  certId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  const basic = btoa(`${appId}:${certId}`);
  const res = await fetchImpl("https://api.ebay.com/identity/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
  });
  if (!res.ok) throw new Error(`eBay token error: ${res.status}`);
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export async function fetchEbaySoldComps(args: {
  brand: string;
  reference: string;
  token: string;
  fetchImpl?: typeof fetch;
}): Promise<SoldComp[]> {
  const fetchImpl = args.fetchImpl ?? fetch;
  const q = encodeURIComponent(`${args.brand} ${args.reference}`);
  const url = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${q}&filter=conditionIds:{1000|1500|2000|2500|3000|4000|5000|6000},buyingOptions:{FIXED_PRICE}&limit=200`;
  const res = await fetchImpl(url, {
    headers: {
      Authorization: `Bearer ${args.token}`,
      "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
    },
  });
  if (!res.ok) throw new Error(`eBay search error: ${res.status}`);
  const data = (await res.json()) as {
    itemSummaries?: Array<{
      itemId: string;
      price: { value: string; currency: string };
      condition?: string;
      itemEndDate?: string;
    }>;
  };
  return (data.itemSummaries ?? [])
    .filter((i) => i.price.currency === "USD")
    .map((i) => ({
      sourceListingId: i.itemId,
      soldPriceUsd: Number.parseFloat(i.price.value),
      conditionTier: normalizeCondition(i.condition ?? "fair"),
      soldAt: i.itemEndDate ?? new Date().toISOString(),
    }));
}
```

Note: eBay Browse API technically returns LIVE listings, not sold listings. For Phase 0, "active listings filtered to verified-seller + condition" is a reasonable price-floor signal — true sold-comps require the eBay Marketplace Insights API (RESTRICTED). Plan flags this in §Open Risks. We'll iterate post-launch if signal isn't tight enough.

**Step 4: Run tests — verify pass**

```powershell
npm test
```

Expected: all 6 tests pass (5 condition + 1 fetch).

**Step 5: Commit**

```powershell
git -C <workspace>\watchsentry add workers/src/ebay.ts workers/tests/ebay.test.ts
git -C <workspace>\watchsentry commit -m "feat(workers): eBay Browse API client"
git -C <workspace>\watchsentry push
```

---

### Task 2.5 — Fair-value calculation

**Files:**
- Create: `<repo>\workers\src\fair-value.ts`
- Create: `<repo>\workers\tests\fair-value.test.ts`

**Step 1: Failing test**

```ts
import { describe, expect, it } from "vitest";
import { computeFairValue } from "../src/fair-value";

describe("computeFairValue", () => {
  it("returns null when no comps", () => {
    expect(computeFairValue([])).toBeNull();
  });
  it("returns median of single comp", () => {
    const r = computeFairValue([{ soldPriceUsd: 9000, soldAt: "2026-05-01T00:00:00Z" }]);
    expect(r?.medianUsd).toBe(9000);
    expect(r?.sampleSize).toBe(1);
  });
  it("weights recent comps higher than old", () => {
    const recent = { soldPriceUsd: 10000, soldAt: "2026-05-15T00:00:00Z" };
    const old = { soldPriceUsd: 8000, soldAt: "2026-02-15T00:00:00Z" };
    const r = computeFairValue([recent, old]);
    // weighted median: recent dominates; result should sit closer to 10k than 9k
    expect(r?.medianUsd).toBeGreaterThan(9000);
  });
  it("ignores comps older than 90 days", () => {
    const recent = { soldPriceUsd: 10000, soldAt: "2026-05-15T00:00:00Z" };
    const ancient = { soldPriceUsd: 5000, soldAt: "2025-01-01T00:00:00Z" };
    const r = computeFairValue([recent, ancient]);
    expect(r?.medianUsd).toBe(10000);
    expect(r?.sampleSize).toBe(1);
  });
});
```

**Step 2: Run — verify fail**

```powershell
npm test
```

Expected: 4 failures.

**Step 3: Implementation**

```ts
export type FairValueInput = {
  soldPriceUsd: number;
  soldAt: string;
};

export type FairValue = {
  medianUsd: number;
  sampleSize: number;
  windowDays: number;
};

const WINDOW_DAYS = 90;
const NOW = () => Date.now();

export function computeFairValue(
  comps: FairValueInput[],
  now: number = NOW(),
): FairValue | null {
  const cutoff = now - WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const recent = comps.filter((c) => new Date(c.soldAt).getTime() >= cutoff);
  if (recent.length === 0) return null;

  // weighted median where weight decays linearly with age
  const weighted: Array<{ price: number; weight: number }> = recent.map((c) => {
    const ageDays = (now - new Date(c.soldAt).getTime()) / (1000 * 60 * 60 * 24);
    const weight = Math.max(0.1, 1 - ageDays / WINDOW_DAYS);
    return { price: c.soldPriceUsd, weight };
  });
  weighted.sort((a, b) => a.price - b.price);
  const total = weighted.reduce((s, w) => s + w.weight, 0);
  let acc = 0;
  for (const w of weighted) {
    acc += w.weight;
    if (acc >= total / 2) {
      return { medianUsd: Math.round(w.price), sampleSize: recent.length, windowDays: WINDOW_DAYS };
    }
  }
  // fallback (shouldn't hit)
  const last = weighted[weighted.length - 1];
  return { medianUsd: Math.round(last!.price), sampleSize: recent.length, windowDays: WINDOW_DAYS };
}
```

**Step 4: Run — verify pass**

```powershell
npm test
```

Expected: all tests pass.

**Step 5: Commit**

```powershell
git -C <workspace>\watchsentry add workers/src/fair-value.ts workers/tests/fair-value.test.ts
git -C <workspace>\watchsentry commit -m "feat(workers): fair-value weighted-median calc"
git -C <workspace>\watchsentry push
```

---

### Task 2.6 — D1 repository module + tests

**Files:**
- Create: `<repo>\workers\src\repo.ts`
- Create: `<repo>\workers\tests\repo.test.ts` (uses Miniflare-emulated D1 via `wrangler dev --local`; OR test the SQL strings statically + rely on integration test in Task 2.8)

For Phase 0 simplicity, write the repo module and rely on the deploy-side integration smoke (Task 2.8) instead of unit tests for repo.ts. Mark this as accepted tradeoff in `docs/anonymity-audit.md` style debt note.

**Step 1: src/repo.ts**

```ts
import type { ConditionTier, SoldComp } from "./ebay";
import type { FairValueInput } from "./fair-value";

export type WatchRef = {
  id: number;
  brand: string;
  model: string;
  referenceNumber: string;
  displayName: string;
};

export async function findReference(
  db: D1Database,
  brand: string,
  referenceNumber: string,
): Promise<WatchRef | null> {
  const row = await db
    .prepare("SELECT id, brand, model, reference_number, display_name FROM watch_references WHERE brand = ? AND reference_number = ?")
    .bind(brand, referenceNumber)
    .first<{ id: number; brand: string; model: string; reference_number: string; display_name: string }>();
  if (!row) return null;
  return {
    id: row.id,
    brand: row.brand,
    model: row.model,
    referenceNumber: row.reference_number,
    displayName: row.display_name,
  };
}

export async function listAllReferences(db: D1Database): Promise<WatchRef[]> {
  const rs = await db
    .prepare("SELECT id, brand, model, reference_number, display_name FROM watch_references")
    .all<{ id: number; brand: string; model: string; reference_number: string; display_name: string }>();
  return (rs.results ?? []).map((r) => ({
    id: r.id,
    brand: r.brand,
    model: r.model,
    referenceNumber: r.reference_number,
    displayName: r.display_name,
  }));
}

export async function insertSoldComps(
  db: D1Database,
  referenceId: number,
  comps: SoldComp[],
): Promise<number> {
  if (comps.length === 0) return 0;
  const stmt = db.prepare(
    "INSERT OR IGNORE INTO sold_comps (reference_id, condition_tier, sold_price_usd, sold_at, source, source_listing_id) VALUES (?1, ?2, ?3, ?4, 'ebay', ?5)",
  );
  const batch = comps.map((c) =>
    stmt.bind(referenceId, c.conditionTier, c.soldPriceUsd, c.soldAt, c.sourceListingId),
  );
  const result = await db.batch(batch);
  return result.reduce((s, r) => s + (r.meta.rows_written ?? 0), 0);
}

export async function getFairValueInputsFor(
  db: D1Database,
  referenceId: number,
  conditionTier: ConditionTier,
): Promise<FairValueInput[]> {
  const rs = await db
    .prepare(
      "SELECT sold_price_usd, sold_at FROM sold_comps WHERE reference_id = ? AND condition_tier = ? AND sold_at >= datetime('now', '-90 days') ORDER BY sold_at DESC LIMIT 500",
    )
    .bind(referenceId, conditionTier)
    .all<{ sold_price_usd: number; sold_at: string }>();
  return (rs.results ?? []).map((r) => ({ soldPriceUsd: r.sold_price_usd, soldAt: r.sold_at }));
}
```

**Step 2: Commit**

```powershell
git -C <workspace>\watchsentry add workers/src/repo.ts
git -C <workspace>\watchsentry commit -m "feat(workers): D1 repository module"
git -C <workspace>\watchsentry push
```

---

### Task 2.7 — Cron handler: daily eBay refresh

**Files:**
- Modify: `<repo>\workers\src\index.ts`
- Create: `<repo>\workers\src\cron.ts`

**Step 1: src/cron.ts**

```ts
import { fetchEbaySoldComps, getEbayAppToken } from "./ebay";
import { insertSoldComps, listAllReferences } from "./repo";
import type { Env } from "./index";

export async function runDailyRefresh(env: Env): Promise<{ comps: number; refs: number }> {
  const token = await getEbayAppToken(env.EBAY_APP_ID, env.EBAY_CERT_ID);
  const refs = await listAllReferences(env.DB);
  let totalInserted = 0;
  for (const r of refs) {
    try {
      const comps = await fetchEbaySoldComps({
        brand: r.brand,
        reference: r.referenceNumber,
        token,
      });
      const inserted = await insertSoldComps(env.DB, r.id, comps);
      totalInserted += inserted;
      // throttle: stay well under eBay's 5000 calls/day
      await new Promise((res) => setTimeout(res, 300));
    } catch (e) {
      // log to audit and continue; one ref failing shouldn't kill the run
      await env.DB.prepare(
        "INSERT INTO audit_log (event_type, payload_json) VALUES (?, ?)",
      )
        .bind("cron_ebay_ref_error", JSON.stringify({ refId: r.id, error: String(e) }))
        .run();
    }
  }
  await env.DB.prepare(
    "INSERT INTO audit_log (event_type, payload_json) VALUES (?, ?)",
  )
    .bind("cron_ebay_refresh_done", JSON.stringify({ refs: refs.length, inserted: totalInserted }))
    .run();
  return { comps: totalInserted, refs: refs.length };
}
```

**Step 2: Wire cron into src/index.ts**

Replace the placeholder `scheduled` handler:

```ts
import { runDailyRefresh } from "./cron";

// ... existing app

export default {
  fetch: app.fetch,
  scheduled: async (_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) => {
    await runDailyRefresh(env);
  },
};
```

**Step 3: Deploy worker to Cloudflare**

```powershell
cd <repo>\workers
npm run deploy
```

Expected: `Published watchsentry-api (X sec)` + URL like `https://watchsentry-api.<subdomain>.workers.dev`.

**Step 4: Manually trigger the cron once for first data**

```powershell
wrangler trigger watchsentry-api --schedule="0 4 * * *"
```

OR run it via a temporary HTTP endpoint:

Add to `src/index.ts` (TEMPORARY — remove after):

```ts
app.get("/debug/cron", async (c) => {
  if (c.req.query("key") !== "first-seed-2026") return c.text("nope", 403);
  const r = await runDailyRefresh(c.env);
  return c.json(r);
});
```

Redeploy, then:

```powershell
curl "https://watchsentry-api.<subdomain>.workers.dev/debug/cron?key=first-seed-2026"
```

Expected: `{"comps": N, "refs": 50}` where N is some positive integer.

**Step 5: Verify D1 has data**

```powershell
wrangler d1 execute watchsentry-db --remote --command="SELECT COUNT(*) AS n FROM sold_comps;"
```

Expected: positive N. If 0, debug eBay API responses before continuing.

**Step 6: REMOVE the /debug/cron endpoint and redeploy**

Delete the debug route from `src/index.ts`. Redeploy.

**Step 7: Commit**

```powershell
git -C <workspace>\watchsentry add workers/src
git -C <workspace>\watchsentry commit -m "feat(workers): daily cron eBay refresh + audit log"
git -C <workspace>\watchsentry push
```

---

### Task 2.8 — Enrich endpoint

**Files:**
- Modify: `<repo>\workers\src\index.ts`
- Create: `<repo>\workers\src\enrich.ts`
- Create: `<repo>\workers\tests\enrich.test.ts`

**Step 1: Failing test — tests/enrich.test.ts**

```ts
import { describe, expect, it } from "vitest";
import { enrichmentCacheKey } from "../src/enrich";

describe("enrichmentCacheKey", () => {
  it("builds a deterministic key", () => {
    const k = enrichmentCacheKey({ brand: "Rolex", reference: "124060", condition: "very_good" });
    expect(k).toBe("enrich:Rolex:124060:very_good");
  });
  it("is case-sensitive on brand/ref", () => {
    expect(enrichmentCacheKey({ brand: "rolex", reference: "124060", condition: "new" }))
      .not.toBe(enrichmentCacheKey({ brand: "Rolex", reference: "124060", condition: "new" }));
  });
});
```

**Step 2: Verify fail**

```powershell
npm test
```

Expected: 2 failures.

**Step 3: Implement src/enrich.ts**

```ts
import { z } from "zod";
import type { Env } from "./index";
import type { ConditionTier } from "./ebay";
import { computeFairValue, type FairValue } from "./fair-value";
import { findReference, getFairValueInputsFor } from "./repo";

export const enrichRequestSchema = z.object({
  brand: z.string().min(1).max(50),
  reference: z.string().min(1).max(50),
  condition: z.enum(["new", "unworn", "very_good", "good", "fair"]),
  listedPriceUsd: z.number().positive().max(10_000_000).optional(),
  anonymousId: z.string().uuid().optional(),
});

export type EnrichRequest = z.infer<typeof enrichRequestSchema>;

export type EnrichResponse = {
  status: "ok" | "no_data" | "unknown_reference";
  fairValue?: FairValue;
  delta?: { absoluteUsd: number; percent: number };
  reference?: { brand: string; model: string; displayName: string };
};

export function enrichmentCacheKey(args: { brand: string; reference: string; condition: ConditionTier }): string {
  return `enrich:${args.brand}:${args.reference}:${args.condition}`;
}

export async function enrich(env: Env, req: EnrichRequest): Promise<EnrichResponse> {
  const cacheKey = enrichmentCacheKey({ brand: req.brand, reference: req.reference, condition: req.condition });
  const cached = await env.CACHE.get<EnrichResponse>(cacheKey, "json");
  if (cached) {
    return maybeAttachDelta(cached, req.listedPriceUsd);
  }

  const ref = await findReference(env.DB, req.brand, req.reference);
  if (!ref) {
    const resp: EnrichResponse = { status: "unknown_reference" };
    await env.CACHE.put(cacheKey, JSON.stringify(resp), { expirationTtl: 60 * 60 * 6 });
    return resp;
  }

  const comps = await getFairValueInputsFor(env.DB, ref.id, req.condition);
  const fv = computeFairValue(comps);
  if (!fv) {
    const resp: EnrichResponse = {
      status: "no_data",
      reference: { brand: ref.brand, model: ref.model, displayName: ref.displayName },
    };
    await env.CACHE.put(cacheKey, JSON.stringify(resp), { expirationTtl: 60 * 60 * 6 });
    return resp;
  }

  const resp: EnrichResponse = {
    status: "ok",
    fairValue: fv,
    reference: { brand: ref.brand, model: ref.model, displayName: ref.displayName },
  };
  await env.CACHE.put(cacheKey, JSON.stringify(resp), { expirationTtl: 60 * 60 * 6 });
  return maybeAttachDelta(resp, req.listedPriceUsd);
}

function maybeAttachDelta(resp: EnrichResponse, listedPriceUsd?: number): EnrichResponse {
  if (resp.status !== "ok" || !resp.fairValue || listedPriceUsd === undefined) return resp;
  const abs = listedPriceUsd - resp.fairValue.medianUsd;
  const pct = (abs / resp.fairValue.medianUsd) * 100;
  return { ...resp, delta: { absoluteUsd: Math.round(abs), percent: Math.round(pct * 10) / 10 } };
}
```

Add to package.json deps:

```powershell
npm install zod
```

**Step 4: Wire endpoint in src/index.ts**

```ts
import { enrich, enrichRequestSchema } from "./enrich";

app.post("/enrich", async (c) => {
  const body = await c.req.json();
  const parsed = enrichRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "invalid_request", details: parsed.error.flatten() }, 400);
  }
  const result = await enrich(c.env, parsed.data);
  return c.json(result);
});
```

**Step 5: Run tests + verify**

```powershell
npm test
```

Expected: all green (cache-key tests + earlier suites).

**Step 6: Deploy + integration smoke**

```powershell
npm run deploy
curl -X POST "https://watchsentry-api.<subdomain>.workers.dev/enrich" `
  -H "Content-Type: application/json" `
  -d '{"brand":"Rolex","reference":"124060","condition":"very_good","listedPriceUsd":9500}'
```

Expected: HTTP 200 with `status: "ok"`, `fairValue.medianUsd: <number>`, `delta: {...}` if listedPriceUsd was sent.

**Step 7: Commit**

```powershell
git -C <workspace>\watchsentry add workers
git -C <workspace>\watchsentry commit -m "feat(workers): /enrich endpoint with KV cache + zod validation"
git -C <workspace>\watchsentry push
```

---

### Week 2 — review checkpoint

- [ ] `wrangler d1 execute --remote --command="SELECT COUNT(*) FROM sold_comps;"` returns >0
- [ ] `wrangler d1 execute --remote --command="SELECT COUNT(*) FROM audit_log WHERE event_type='cron_ebay_refresh_done';"` returns ≥1
- [ ] `curl` to deployed `/enrich` returns a real fair-value response for `Rolex 124060`
- [ ] All Vitest tests pass
- [ ] Cron is scheduled at `0 4 * * *` (verify via `wrangler crons` or dashboard)
- [ ] No `EBAY_APP_ID` / `EBAY_CERT_ID` values in git history (`git log -p | grep -i ebay`)
- [ ] Session log updated

---

## Week 3 — Chrome extension skeleton (target: 8–10 hrs)

### Task 3.1 — Extension scaffold (Vite + crxjs + TS + Preact)

**Files:**
- Create: `<repo>\extension\package.json`
- Create: `<repo>\extension\tsconfig.json`
- Create: `<repo>\extension\vite.config.ts`
- Create: `<repo>\extension\manifest.config.ts`
- Create: `<repo>\extension\src\content\index.tsx`
- Create: `<repo>\extension\src\background\index.ts`
- Create: `<repo>\extension\src\popup\index.html`
- Create: `<repo>\extension\src\popup\popup.tsx`

**Step 1: Init project**

```powershell
cd <repo>\extension
npm init -y
npm install preact zod
npm install -D vite @crxjs/vite-plugin typescript @types/chrome @biomejs/biome vitest @testing-library/preact @testing-library/dom jsdom
```

**Step 2: tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "preserve",
    "jsxImportSource": "preact",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["chrome", "vite/client"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["src/**/*", "manifest.config.ts", "vite.config.ts"]
}
```

**Step 3: manifest.config.ts**

```ts
import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

export default defineManifest({
  manifest_version: 3,
  name: "WatchSentry",
  version: pkg.version,
  description: "Fair-value, cross-marketplace alternatives, and seller risk for every Chrono24 listing.",
  icons: { 16: "icons/16.png", 48: "icons/48.png", 128: "icons/128.png" },
  action: { default_popup: "src/popup/index.html", default_icon: "icons/48.png" },
  background: { service_worker: "src/background/index.ts", type: "module" },
  content_scripts: [
    {
      matches: ["https://www.chrono24.com/*"],
      js: ["src/content/index.tsx"],
      run_at: "document_idle",
    },
  ],
  permissions: ["storage"],
  host_permissions: ["https://watchsentry-api.*.workers.dev/*"],
});
```

**Step 4: vite.config.ts**

```ts
import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.config";

export default defineConfig({
  plugins: [preact(), crx({ manifest })],
  build: { sourcemap: true },
});
```

Install missing dep:

```powershell
npm install -D @preact/preset-vite
```

**Step 5: Minimal content script entry — src/content/index.tsx**

```tsx
function init() {
  console.log("WatchSentry loaded on", location.href);
}

init();
```

**Step 6: Minimal background — src/background/index.ts**

```ts
console.log("WatchSentry service worker started");
```

**Step 7: Minimal popup**

`src/popup/index.html`:

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>WatchSentry</title>
  </head>
  <body style="width: 280px; font-family: system-ui;">
    <div id="root"></div>
    <script type="module" src="./popup.tsx"></script>
  </body>
</html>
```

`src/popup/popup.tsx`:

```tsx
import { render } from "preact";

function App() {
  return (
    <div style={{ padding: 12 }}>
      <h1 style={{ fontSize: 16, margin: "0 0 8px" }}>WatchSentry</h1>
      <p style={{ fontSize: 12, color: "#555" }}>
        Open a Chrono24 listing to see the fair-value badge.
      </p>
    </div>
  );
}

render(<App />, document.getElementById("root") as HTMLElement);
```

**Step 8: Add npm scripts**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "biome check src",
    "fmt": "biome format --write src",
    "typecheck": "tsc --noEmit"
  }
}
```

**Step 9: First build**

```powershell
npm run build
```

Expected: `dist/` folder created with built ext.

**Step 10: Load unpacked in Chrome**

User action: `chrome://extensions` → toggle Developer Mode → "Load unpacked" → select `<repo>\extension\dist`. WatchSentry should appear; visit any chrono24.com listing; open DevTools console → see "WatchSentry loaded on ...".

**Step 11: Commit**

```powershell
git -C <workspace>\watchsentry add extension
git -C <workspace>\watchsentry commit -m "feat(extension): MV3 scaffold (Vite+crxjs+Preact)"
git -C <workspace>\watchsentry push
```

---

### Task 3.2 — DOM parser for Chrono24 listing page

**Files:**
- Create: `<repo>\extension\src\parsers\chrono24-listing.ts`
- Create: `<repo>\extension\tests\parsers\chrono24-listing.test.ts`
- Create: `<repo>\extension\tests\fixtures\chrono24-listing-rolex-124060.html` (saved snapshot of a real listing page; user provides via right-click → "Save page as" in Chrome on a representative listing)

**Step 1: Capture a real-page fixture (one-time)**

User action: open any active chrono24.com listing for `Rolex Submariner 124060`; Save As → Webpage Complete → save HTML file as `chrono24-listing-rolex-124060.html` into the `extension/tests/fixtures/` folder. Strip any personal session cookies from the file by re-saving as HTML-only or hand-editing.

**Step 2: Failing test**

```ts
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseChrono24Listing } from "../../src/parsers/chrono24-listing";

const FIXTURE = readFileSync(
  join(__dirname, "../fixtures/chrono24-listing-rolex-124060.html"),
  "utf8",
);

describe("parseChrono24Listing", () => {
  it("extracts brand from the saved Rolex 124060 listing fixture", () => {
    const doc = new DOMParser().parseFromString(FIXTURE, "text/html");
    const r = parseChrono24Listing(doc);
    expect(r?.brand).toBe("Rolex");
  });
  it("extracts reference number", () => {
    const doc = new DOMParser().parseFromString(FIXTURE, "text/html");
    const r = parseChrono24Listing(doc);
    expect(r?.referenceNumber).toBe("124060");
  });
  it("extracts a USD price", () => {
    const doc = new DOMParser().parseFromString(FIXTURE, "text/html");
    const r = parseChrono24Listing(doc);
    expect(r?.listedPriceUsd).toBeGreaterThan(0);
  });
  it("returns null on a page that isn't a listing", () => {
    const doc = new DOMParser().parseFromString("<html><body>not a listing</body></html>", "text/html");
    expect(parseChrono24Listing(doc)).toBeNull();
  });
});
```

Also enable jsdom in vitest:

`extension/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import preact from "@preact/preset-vite";

export default defineConfig({
  plugins: [preact()],
  test: { environment: "jsdom", include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"] },
});
```

**Step 3: Verify fail**

```powershell
npm test
```

Expected: 4 failures (parser undefined).

**Step 4: Implement src/parsers/chrono24-listing.ts**

```ts
export type Chrono24Listing = {
  brand: string;
  referenceNumber: string;
  model?: string;
  conditionTier: "new" | "unworn" | "very_good" | "good" | "fair";
  listedPriceUsd: number | null;
  sellerId?: string;
  listingId?: string;
};

export function parseChrono24Listing(doc: Document): Chrono24Listing | null {
  // Chrono24 listing pages embed structured data in <script type="application/ld+json">
  const ldNodes = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
  for (const node of ldNodes) {
    try {
      const data = JSON.parse(node.textContent ?? "");
      const type = Array.isArray(data["@type"]) ? data["@type"][0] : data["@type"];
      if (type !== "Product") continue;

      const brand = data.brand?.name ?? data.brand;
      const sku = data.sku ?? data.mpn ?? data.model;
      if (!brand || !sku) continue;

      const offer = Array.isArray(data.offers) ? data.offers[0] : data.offers;
      const priceUsd = offer?.priceCurrency === "USD" ? Number.parseFloat(offer.price) : null;

      const condition = mapSchemaCondition(offer?.itemCondition);

      return {
        brand: String(brand),
        referenceNumber: String(sku),
        model: data.model ? String(data.model) : undefined,
        conditionTier: condition,
        listedPriceUsd: priceUsd,
        listingId: data.productID ? String(data.productID) : undefined,
      };
    } catch {
      // continue to next script tag
    }
  }
  return null;
}

function mapSchemaCondition(c: string | undefined): Chrono24Listing["conditionTier"] {
  switch (c) {
    case "https://schema.org/NewCondition": return "new";
    case "https://schema.org/UsedCondition": return "good";
    case "https://schema.org/RefurbishedCondition": return "very_good";
    case "https://schema.org/DamagedCondition": return "fair";
    default: return "very_good"; // Chrono24 default for pre-owned-excellent
  }
}
```

**Step 5: Verify pass**

```powershell
npm test
```

Expected: 4 passing. If fixture parse fails, inspect actual ld+json structure in the fixture and adjust parsing.

**Step 6: Commit**

```powershell
git -C <workspace>\watchsentry add extension/src/parsers extension/tests
git -C <workspace>\watchsentry commit -m "feat(ext): Chrono24 listing parser w/ ld+json"
git -C <workspace>\watchsentry push
```

---

### Task 3.3 — API client module in extension

**Files:**
- Create: `<repo>\extension\src\api\client.ts`
- Create: `<repo>\extension\tests\api\client.test.ts`

**Step 1: Failing test**

```ts
import { describe, expect, it, vi } from "vitest";
import { enrichListing } from "../../src/api/client";

describe("enrichListing", () => {
  it("posts to /enrich and returns the response body", async () => {
    const mock = vi.fn(async () =>
      new Response(JSON.stringify({ status: "ok", fairValue: { medianUsd: 9200, sampleSize: 12, windowDays: 90 } }), { status: 200 }));
    const r = await enrichListing(
      { brand: "Rolex", reference: "124060", condition: "very_good", listedPriceUsd: 9500 },
      { apiBase: "https://api.example.com", fetchImpl: mock },
    );
    expect(r.status).toBe("ok");
    expect(r.fairValue?.medianUsd).toBe(9200);
    expect(mock).toHaveBeenCalledTimes(1);
  });
});
```

**Step 2: Implement src/api/client.ts**

```ts
export type EnrichResponse = {
  status: "ok" | "no_data" | "unknown_reference";
  fairValue?: { medianUsd: number; sampleSize: number; windowDays: number };
  delta?: { absoluteUsd: number; percent: number };
  reference?: { brand: string; model: string; displayName: string };
};

export async function enrichListing(
  payload: { brand: string; reference: string; condition: string; listedPriceUsd?: number; anonymousId?: string },
  opts: { apiBase: string; fetchImpl?: typeof fetch },
): Promise<EnrichResponse> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const res = await fetchImpl(`${opts.apiBase}/enrich`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`enrich error: ${res.status}`);
  return (await res.json()) as EnrichResponse;
}
```

**Step 3: Verify pass**

```powershell
npm test
```

Expected: green.

**Step 4: Commit**

```powershell
git -C <workspace>\watchsentry add extension/src/api extension/tests/api
git -C <workspace>\watchsentry commit -m "feat(ext): API client for /enrich"
git -C <workspace>\watchsentry push
```

---

### Task 3.4 — Badge component + injection

**Files:**
- Create: `<repo>\extension\src\components\Badge.tsx`
- Create: `<repo>\extension\src\components\badge.css`
- Modify: `<repo>\extension\src\content\index.tsx`

**Step 1: Badge component — src/components/Badge.tsx**

```tsx
import "./badge.css";

export type BadgeProps = {
  status: "ok" | "no_data" | "unknown_reference" | "loading";
  medianUsd?: number;
  listedPriceUsd?: number;
  sampleSize?: number;
  deltaPercent?: number;
};

export function Badge(props: BadgeProps) {
  if (props.status === "loading") {
    return <div class="ws-badge ws-loading">WatchSentry…</div>;
  }
  if (props.status === "unknown_reference") {
    return <div class="ws-badge ws-neutral">WatchSentry: reference not yet tracked</div>;
  }
  if (props.status === "no_data") {
    return <div class="ws-badge ws-neutral">WatchSentry: not enough sold-comps yet</div>;
  }
  const tone = props.deltaPercent === undefined ? "neutral" : props.deltaPercent <= -5 ? "good" : props.deltaPercent >= 10 ? "bad" : "neutral";
  return (
    <div class={`ws-badge ws-${tone}`}>
      <div class="ws-row">
        <span class="ws-label">Fair value</span>
        <strong>${props.medianUsd?.toLocaleString()}</strong>
      </div>
      {props.deltaPercent !== undefined && (
        <div class="ws-row">
          <span class="ws-label">Listing vs fair</span>
          <strong>{props.deltaPercent > 0 ? "+" : ""}{props.deltaPercent.toFixed(1)}%</strong>
        </div>
      )}
      <div class="ws-foot">based on {props.sampleSize} sold-comp{props.sampleSize === 1 ? "" : "s"} · 90d window</div>
    </div>
  );
}
```

**Step 2: badge.css**

```css
.ws-badge {
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size: 13px;
  line-height: 1.4;
  padding: 10px 12px;
  margin: 12px 0;
  border-radius: 8px;
  border: 1px solid #d0d7de;
  background: #f6f8fa;
  color: #1f2328;
  max-width: 380px;
}
.ws-good { border-color: #2da44e; background: #dafbe1; }
.ws-bad { border-color: #cf222e; background: #ffebe9; }
.ws-neutral { border-color: #d0d7de; background: #f6f8fa; }
.ws-loading { color: #6e7781; }
.ws-row { display: flex; justify-content: space-between; gap: 12px; padding: 2px 0; }
.ws-label { color: #6e7781; }
.ws-foot { color: #6e7781; font-size: 11px; margin-top: 6px; }
```

**Step 3: Wire into src/content/index.tsx**

```tsx
import { render } from "preact";
import { Badge } from "../components/Badge";
import { parseChrono24Listing } from "../parsers/chrono24-listing";
import { enrichListing } from "../api/client";

const API_BASE = "https://watchsentry-api.<your-subdomain>.workers.dev";

function injectMountPoint(): HTMLElement {
  // Mount above the price block on Chrono24 listing pages.
  // Selector may need adjustment based on actual DOM — fallback to body.
  const anchor = document.querySelector(".js-detail-page-price-section") ?? document.body;
  const mount = document.createElement("div");
  mount.id = "watchsentry-mount";
  anchor.parentElement?.insertBefore(mount, anchor);
  return mount;
}

async function run() {
  const parsed = parseChrono24Listing(document);
  if (!parsed) return;

  const mount = injectMountPoint();
  render(<Badge status="loading" />, mount);

  try {
    const enriched = await enrichListing(
      {
        brand: parsed.brand,
        reference: parsed.referenceNumber,
        condition: parsed.conditionTier,
        listedPriceUsd: parsed.listedPriceUsd ?? undefined,
      },
      { apiBase: API_BASE },
    );
    render(
      <Badge
        status={enriched.status}
        medianUsd={enriched.fairValue?.medianUsd}
        listedPriceUsd={parsed.listedPriceUsd ?? undefined}
        sampleSize={enriched.fairValue?.sampleSize}
        deltaPercent={enriched.delta?.percent}
      />,
      mount,
    );
  } catch {
    render(<Badge status="no_data" />, mount);
  }
}

run();
```

**Step 4: Build + reload + manual smoke**

```powershell
npm run build
```

User action: in `chrome://extensions`, click "Reload" on WatchSentry. Navigate to a real Chrono24 listing matching a seeded reference (e.g., Rolex Submariner 124060). The badge should appear above the price section showing a fair-value number.

**Step 5: Commit**

```powershell
git -C <workspace>\watchsentry add extension/src
git -C <workspace>\watchsentry commit -m "feat(ext): badge component + content-script injection"
git -C <workspace>\watchsentry push
```

---

### Week 3 — review checkpoint

- [ ] Loading WatchSentry unpacked + visiting a seeded Chrono24 listing shows the fair-value badge with real data
- [ ] Visiting an unseeded reference shows "reference not yet tracked"
- [ ] Visiting any non-listing page (search, homepage) doesn't render the badge
- [ ] All Vitest tests green; typecheck + lint pass
- [ ] Session log updated

---

## Week 4 — Search-results page + polish (target: 6–8 hrs)

### Task 4.1 — DOM parser for search-results page

**Files:**
- Create: `<repo>\extension\src\parsers\chrono24-search.ts`
- Create: `<repo>\extension\tests\parsers\chrono24-search.test.ts`
- Create: `<repo>\extension\tests\fixtures\chrono24-search-rolex-submariner.html` (fresh fixture)

**Step 1: User captures search-page fixture**

User action: visit `chrono24.com` → search "Rolex Submariner" → Save As → HTML → place at `extension/tests/fixtures/chrono24-search-rolex-submariner.html`.

**Step 2: Failing test**

```ts
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseChrono24Search } from "../../src/parsers/chrono24-search";

const FIXTURE = readFileSync(
  join(__dirname, "../fixtures/chrono24-search-rolex-submariner.html"),
  "utf8",
);

describe("parseChrono24Search", () => {
  it("returns at least one card", () => {
    const doc = new DOMParser().parseFromString(FIXTURE, "text/html");
    const cards = parseChrono24Search(doc);
    expect(cards.length).toBeGreaterThan(0);
  });
  it("each card has a reference number (or null) and a price", () => {
    const doc = new DOMParser().parseFromString(FIXTURE, "text/html");
    const cards = parseChrono24Search(doc);
    for (const c of cards) {
      expect(c.listingElement).toBeInstanceOf(HTMLElement);
      expect(typeof c.referenceNumber === "string" || c.referenceNumber === null).toBe(true);
    }
  });
});
```

**Step 3: Implement src/parsers/chrono24-search.ts**

(Selectors will need to be adjusted against the saved fixture — the canonical placeholder below assumes Chrono24's article-card structure.)

```ts
export type Chrono24SearchCard = {
  listingElement: HTMLElement;
  brand: string | null;
  referenceNumber: string | null;
  listedPriceUsd: number | null;
};

export function parseChrono24Search(doc: Document): Chrono24SearchCard[] {
  const cards = Array.from(doc.querySelectorAll<HTMLElement>("article.article-item, .article-item"));
  return cards.map((el) => ({
    listingElement: el,
    brand: extractBrand(el),
    referenceNumber: extractReference(el),
    listedPriceUsd: extractPrice(el),
  }));
}

function extractBrand(el: HTMLElement): string | null {
  const txt = el.querySelector(".article-item-brand, [data-test=article-brand]")?.textContent?.trim();
  return txt || null;
}

function extractReference(el: HTMLElement): string | null {
  // reference often appears in subtitle text like "Ref. 124060"
  const sub = el.textContent ?? "";
  const m = sub.match(/Ref\.?\s*([A-Za-z0-9-./]+)/i);
  return m ? m[1] : null;
}

function extractPrice(el: HTMLElement): number | null {
  const priceText = el.querySelector(".price, [data-test=article-price]")?.textContent ?? "";
  const m = priceText.replace(/[\s,]/g, "").match(/\$?([0-9]+(?:\.[0-9]{1,2})?)/);
  return m ? Number.parseFloat(m[1]) : null;
}
```

**Step 4: Run, adjust selectors against fixture, commit**

```powershell
npm test
```

Iterate until tests pass. Then commit:

```powershell
git -C <workspace>\watchsentry add extension/src/parsers/chrono24-search.ts extension/tests
git -C <workspace>\watchsentry commit -m "feat(ext): Chrono24 search-results parser"
git -C <workspace>\watchsentry push
```

---

### Task 4.2 — Compact badge for search-result cards

**Files:**
- Create: `<repo>\extension\src\components\BadgeCompact.tsx`
- Modify: `<repo>\extension\src\content\index.tsx`

**Step 1: BadgeCompact component**

```tsx
import "./badge.css";

export function BadgeCompact(props: { status: string; deltaPercent?: number }) {
  if (props.status !== "ok" || props.deltaPercent === undefined) return null;
  const tone = props.deltaPercent <= -5 ? "good" : props.deltaPercent >= 10 ? "bad" : "neutral";
  return (
    <div class={`ws-badge-compact ws-${tone}`}>
      {props.deltaPercent > 0 ? "+" : ""}{props.deltaPercent.toFixed(1)}% vs fair
    </div>
  );
}
```

Add to badge.css:

```css
.ws-badge-compact {
  display: inline-block;
  font-family: system-ui, sans-serif;
  font-size: 11px;
  padding: 3px 6px;
  border-radius: 4px;
  margin-top: 4px;
  border: 1px solid;
}
```

**Step 2: Wire into content script**

In `src/content/index.tsx`, detect search-page URL and render compact badges per card. Add daily-cap protection — only enrich the first 50 cards per page render to stay under the soft cap.

```tsx
import { parseChrono24Search } from "../parsers/chrono24-search";
import { BadgeCompact } from "../components/BadgeCompact";

async function runSearch() {
  const cards = parseChrono24Search(document).slice(0, 50);
  for (const card of cards) {
    if (!card.referenceNumber || !card.brand) continue;
    try {
      const enriched = await enrichListing(
        {
          brand: card.brand,
          reference: card.referenceNumber,
          condition: "very_good",
          listedPriceUsd: card.listedPriceUsd ?? undefined,
        },
        { apiBase: API_BASE },
      );
      const mount = document.createElement("span");
      card.listingElement.appendChild(mount);
      render(<BadgeCompact status={enriched.status} deltaPercent={enriched.delta?.percent} />, mount);
    } catch {
      // ignore single-card failures
    }
  }
}

// Route by URL shape:
if (location.pathname.startsWith("/search/")) runSearch();
else run(); // existing listing-page flow
```

**Step 3: Build, reload, manual smoke**

User: load `chrono24.com/search/index.htm?query=Submariner`, badges per card should render where data is available.

**Step 4: Commit**

```powershell
git -C <workspace>\watchsentry commit -am "feat(ext): compact badges on search-results page"
git -C <workspace>\watchsentry push
```

---

### Task 4.3 — Settings popup + storage

**Files:**
- Modify: `<repo>\extension\src\popup\popup.tsx`
- Create: `<repo>\extension\src\storage.ts`

**Step 1: Storage helper**

```ts
export type Settings = {
  enabled: boolean;
  anonymousId: string;
};

const DEFAULTS: Settings = { enabled: true, anonymousId: crypto.randomUUID() };

export async function getSettings(): Promise<Settings> {
  const stored = await chrome.storage.local.get(["enabled", "anonymousId"]);
  return {
    enabled: stored.enabled ?? DEFAULTS.enabled,
    anonymousId: stored.anonymousId ?? DEFAULTS.anonymousId,
  };
}

export async function setSettings(patch: Partial<Settings>): Promise<void> {
  await chrome.storage.local.set(patch);
}

export async function ensureAnonymousId(): Promise<string> {
  const cur = await getSettings();
  if (!cur.anonymousId || cur.anonymousId === DEFAULTS.anonymousId) {
    const id = crypto.randomUUID();
    await setSettings({ anonymousId: id });
    return id;
  }
  return cur.anonymousId;
}
```

**Step 2: Popup UI**

```tsx
import { render } from "preact";
import { useEffect, useState } from "preact/hooks";
import { getSettings, setSettings } from "../storage";

function App() {
  const [enabled, setEnabled] = useState(true);
  useEffect(() => { getSettings().then((s) => setEnabled(s.enabled)); }, []);
  return (
    <div style={{ padding: 12 }}>
      <h1 style={{ fontSize: 16, margin: "0 0 8px" }}>WatchSentry</h1>
      <label style={{ display: "block", fontSize: 13 }}>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => {
            const v = (e.currentTarget as HTMLInputElement).checked;
            setEnabled(v);
            setSettings({ enabled: v });
          }}
        />
        {" "}Enable on Chrono24
      </label>
      <p style={{ fontSize: 11, color: "#666", marginTop: 8 }}>
        Open a Chrono24 listing to see the fair-value badge.
      </p>
    </div>
  );
}

render(<App />, document.getElementById("root") as HTMLElement);
```

**Step 3: Honor `enabled` flag in content script**

In `src/content/index.tsx` top:

```ts
import { getSettings } from "../storage";
(async () => {
  const s = await getSettings();
  if (!s.enabled) return;
  // existing logic
})();
```

**Step 4: Build, reload, smoke**

Test that toggling off in popup makes the badge disappear on next page load.

**Step 5: Commit**

```powershell
git -C <workspace>\watchsentry commit -am "feat(ext): settings popup + storage helper + enable/disable"
git -C <workspace>\watchsentry push
```

---

### Task 4.4 — Anonymous user ID + per-user daily-cap counter

**Files:**
- Modify: `<repo>\extension\src\content\index.tsx`
- Modify: `<repo>\workers\src\enrich.ts`

**Step 1: Send anonymousId on enrich**

In content script, pull from storage:

```ts
import { ensureAnonymousId } from "../storage";
const anonymousId = await ensureAnonymousId();
// pass to enrichListing(...)
```

**Step 2: Increment counter in Workers**

In `workers/src/enrich.ts`, add user touch + daily-cap check:

```ts
async function touchUser(env: Env, anonymousId: string): Promise<{ count: number; capped: boolean }> {
  const today = new Date().toISOString().slice(0, 10);
  const existing = await env.DB
    .prepare("SELECT enrichment_count_today, counter_day FROM users WHERE anonymous_id = ?")
    .bind(anonymousId)
    .first<{ enrichment_count_today: number; counter_day: string }>();
  if (!existing) {
    await env.DB.prepare(
      "INSERT INTO users (anonymous_id, enrichment_count_today, counter_day) VALUES (?, 1, ?)",
    ).bind(anonymousId, today).run();
    return { count: 1, capped: false };
  }
  const count = existing.counter_day === today ? existing.enrichment_count_today + 1 : 1;
  await env.DB.prepare(
    "UPDATE users SET enrichment_count_today = ?, counter_day = ?, last_seen_at = datetime('now') WHERE anonymous_id = ?",
  ).bind(count, today, anonymousId).run();
  return { count, capped: count > 50 };
}
```

Wire it into `enrich()`:

```ts
if (req.anonymousId) {
  const u = await touchUser(env, req.anonymousId);
  if (u.capped) return { status: "no_data" };
  // pass through to enrichment
}
```

**Step 3: Verify end-to-end**

Build ext; in Chrome reload; visit 5+ listings on Chrono24; check `wrangler d1 execute watchsentry-db --remote --command="SELECT * FROM users LIMIT 5;"` shows your anonymousId with incrementing count.

**Step 4: Commit**

```powershell
git -C <workspace>\watchsentry commit -am "feat(workers,ext): anonymous user ID + 50/day soft cap"
git -C <workspace>\watchsentry push
```

---

### Week 4 — review checkpoint

- [ ] Listing badge renders on real Chrono24 listings
- [ ] Search-results badges render where data exists
- [ ] Popup enable/disable works
- [ ] anonymousId persists across page loads
- [ ] D1 `users` table shows a row for your test session
- [ ] 51st enrichment in a day returns no_data (cap working)
- [ ] All tests green; lint + typecheck pass
- [ ] Session log updated

---

## Week 5 — Landing page + CWS prep + anonymity audit (target: 6–8 hrs)

### Task 5.1 — Cloudflare Pages static site

**Files:**
- Create: `<repo>\landing\index.html`
- Create: `<repo>\landing\privacy.html`
- Create: `<repo>\landing\terms.html`
- Create: `<repo>\landing\styles.css`
- Create: `<repo>\landing\_routes.json` (Cloudflare Pages config)

**Step 1: index.html — single-page landing**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>WatchSentry — Fair-value protection for watch buyers on Chrono24</title>
  <meta name="description" content="A Chrome extension that shows fair value, cross-marketplace alternatives, and seller risk for every Chrono24 watch listing." />
  <link rel="stylesheet" href="/styles.css" />
</head>
<body>
  <main>
    <h1>WatchSentry</h1>
    <p class="lead">Don't overpay on Chrono24. Fair value on every listing, in your browser.</p>
    <p>
      <a class="cta" href="https://chromewebstore.google.com/detail/<extension-id-after-cws-approval>">Install for Chrome</a>
    </p>
    <h2>How it works</h2>
    <p>Open any Chrono24 listing. WatchSentry compares the listed price to a 90-day weighted median of comparable eBay sold-comps and shows you whether you're above or below market. No account needed.</p>
    <h2>Coming soon</h2>
    <ul>
      <li>Cross-marketplace alternatives</li>
      <li>Seller risk score</li>
      <li>Want-list monitor + alerts</li>
    </ul>
    <form action="/api/subscribe" method="post">
      <label for="email">Get notified when paid tier launches:</label>
      <input type="email" name="email" id="email" required />
      <button type="submit">Notify me</button>
    </form>
    <footer>
      <p><a href="/privacy.html">Privacy</a> · <a href="/terms.html">Terms</a> · <a href="mailto:support@watchsentry.app">support@watchsentry.app</a></p>
      <p style="font-size: 11px; color: #888">WatchSentry is an independent tool and is not affiliated with Chrono24, eBay, or any watch brand.</p>
    </footer>
  </main>
</body>
</html>
```

**Step 2: privacy.html — privacy policy draft**

(This is a starting point — review against jurisdiction-specific requirements before publishing.)

```html
<!doctype html>
<html lang="en">
<head><meta charset="utf-8" /><title>WatchSentry — Privacy</title><link rel="stylesheet" href="/styles.css" /></head>
<body>
<main>
<h1>Privacy Policy</h1>
<p>Last updated: 2026-05-18.</p>

<h2>What data we collect</h2>
<ul>
  <li><strong>Anonymous user ID</strong> — a randomly generated UUID stored locally in your browser. We do NOT collect your name, email, IP address, or any personally identifying information.</li>
  <li><strong>Listing data</strong> — when you view a Chrono24 listing, the extension extracts the brand, reference number, condition, and listed price from the page and sends it to our API to look up fair value. We do not log or store individual queries by user; only aggregate per-day usage counts per anonymous ID.</li>
</ul>

<h2>What we do NOT collect</h2>
<ul>
  <li>Your real name, email, IP address (Cloudflare may log IP at the network layer for DDoS protection but we do not access or retain those logs)</li>
  <li>Your browsing history outside Chrono24</li>
  <li>Any data from any other website</li>
  <li>Your watch purchases or transactions</li>
</ul>

<h2>Third-party services</h2>
<p>Our backend runs on Cloudflare. Pricing data comes from eBay's public Browse API. Neither service receives your anonymous ID or any data that could identify you.</p>

<h2>Contact</h2>
<p>Privacy questions: <a href="mailto:support@watchsentry.app">support@watchsentry.app</a></p>
</main>
</body>
</html>
```

**Step 3: terms.html — minimal terms**

```html
<!doctype html>
<html lang="en">
<head><meta charset="utf-8" /><title>WatchSentry — Terms</title><link rel="stylesheet" href="/styles.css" /></head>
<body>
<main>
<h1>Terms of Service</h1>
<p>Last updated: 2026-05-18.</p>

<h2>What WatchSentry is</h2>
<p>WatchSentry is a free Chrome extension that displays estimated fair-value data on Chrono24 listing pages. The displayed values are derived from public eBay Browse API listings filtered to comparable conditions, and are presented as informational estimates only. They are NOT appraisals, valuations, or financial advice.</p>

<h2>No warranty</h2>
<p>WatchSentry is provided "as is" with no warranty of accuracy, fitness for purpose, or availability. We expressly disclaim liability for any decision made based on data presented by this extension. Always verify fair-market-value with an independent professional before making a significant purchase.</p>

<h2>Acceptable use</h2>
<p>You may not use WatchSentry to scrape, copy, or redistribute the data we display. The extension is for personal, non-commercial use only.</p>

<h2>Changes</h2>
<p>We may update these terms at any time. Continued use after an update constitutes acceptance.</p>

<h2>Contact</h2>
<p><a href="mailto:support@watchsentry.app">support@watchsentry.app</a></p>
</main>
</body>
</html>
```

**Step 4: styles.css — minimal**

```css
* { box-sizing: border-box; }
body { font-family: system-ui, sans-serif; max-width: 720px; margin: 48px auto; padding: 0 16px; color: #1f2328; line-height: 1.55; }
h1 { font-size: 32px; margin-bottom: 8px; }
.lead { font-size: 20px; color: #555; margin-top: 0; }
.cta { display: inline-block; padding: 12px 24px; background: #1f6feb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
footer { margin-top: 64px; padding-top: 24px; border-top: 1px solid #d0d7de; color: #6e7781; font-size: 13px; }
form { margin-top: 16px; }
input[type=email] { padding: 8px; border: 1px solid #d0d7de; border-radius: 6px; min-width: 220px; }
button { padding: 8px 16px; background: #1f6feb; color: white; border: none; border-radius: 6px; cursor: pointer; }
```

**Step 5: Deploy to Cloudflare Pages**

```powershell
cd <repo>\landing
wrangler pages deploy . --project-name=watchsentry-landing
```

First-time run creates the project; subsequent runs deploy.

Note the preview URL e.g. `https://watchsentry-landing.pages.dev`.

**Step 6: Commit**

```powershell
git -C <workspace>\watchsentry add landing
git -C <workspace>\watchsentry commit -m "feat(landing): static site with privacy + terms"
git -C <workspace>\watchsentry push
```

---

### Task 5.2 — Mailing-list subscribe handler (small Workers function in /landing)

**Files:**
- Create: `<repo>\landing\functions\api\subscribe.ts`

This uses Pages Functions (Workers within Pages projects) so the landing site has the subscribe endpoint built-in without a separate Worker.

**Step 1: functions/api/subscribe.ts**

```ts
type Env = { DB: D1Database };

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const form = await ctx.request.formData();
  const email = form.get("email");
  if (typeof email !== "string" || !email.includes("@")) {
    return new Response("Invalid email", { status: 400 });
  }
  await ctx.env.DB.prepare(
    "INSERT OR IGNORE INTO audit_log (event_type, payload_json) VALUES ('newsletter_signup', ?)",
  ).bind(JSON.stringify({ email, ip: ctx.request.headers.get("CF-Connecting-IP") })).run();
  return Response.redirect(`${new URL(ctx.request.url).origin}/?subscribed=1`, 303);
};
```

**Step 2: Bind D1 to Pages project**

```powershell
wrangler pages project list
# verify name
wrangler pages deployment tail watchsentry-landing
```

In Cloudflare dashboard: Pages → watchsentry-landing → Settings → Functions → D1 bindings → Add binding `DB` = `watchsentry-db`. (Wrangler CLI alternative: see CF docs.)

**Step 3: Redeploy + smoke**

```powershell
wrangler pages deploy . --project-name=watchsentry-landing
```

Smoke: visit deployed URL, submit a test email, check D1 audit_log for entry.

**Step 4: Commit**

```powershell
git -C <workspace>\watchsentry add landing/functions
git -C <workspace>\watchsentry commit -m "feat(landing): subscribe endpoint via Pages Functions"
git -C <workspace>\watchsentry push
```

---

### Task 5.3 — CWS listing assets (copy + screenshots + demo video)

**Files:**
- Create: `<repo>\cws-submission\listing-copy.md`
- Capture: `<repo>\cws-submission\screenshots\` (5 PNGs, 1280×800)
- Capture: `<repo>\cws-submission\demo.mp4` (~30 sec)

**Step 1: listing-copy.md**

```markdown
# Chrome Web Store listing copy

## Name
WatchSentry — Fair-value on every Chrono24 listing

## Short description (132 chars max)
See whether a Chrono24 watch listing is above or below market in one glance. Based on 90-day eBay sold-comps.

## Detailed description
WatchSentry adds a small badge to every Chrono24 listing showing a 90-day weighted median price from comparable eBay sold-listings. Don't overpay; don't miss a deal.

Free during launch. No account needed. No data leaves your browser except the brand, reference number, and condition of the listing you're viewing.

Currently supports the top 50 most-searched references across Rolex, Omega, Tudor, Cartier, Audemars Piguet, Patek Philippe, IWC, Breitling, Grand Seiko, Panerai, Hublot, Vacheron Constantin, A. Lange & Söhne, Jaeger-LeCoultre, and Zenith. More references rolling out weekly.

Coming soon: cross-marketplace alternatives (eBay, Bezel, Bob's Watches), seller risk score, and want-list monitoring.

## Category
Shopping

## Language
English

## Privacy policy URL
https://watchsentry.app/privacy.html
(or .pages.dev URL until domain go-live)

## Support URL
mailto:support@watchsentry.app

## Permissions justification
- `storage`: stores user settings (enable toggle) + an anonymous random ID. Never personal data.
- `host_permissions: https://watchsentry-api.*.workers.dev/*`: API endpoint for fair-value lookup.
- `content_scripts: https://www.chrono24.com/*`: render the fair-value badge on listing pages.

No remote code execution. No user-data exfiltration. No advertising. No tracking SDKs.
```

**Step 2: Screenshot script** (user-action; record 5 at 1280×800)

1. Listing page with green "good deal" badge (-7%)
2. Listing page with red "above market" badge (+15%)
3. Listing page for unseeded reference ("not yet tracked")
4. Search-results page with multiple compact badges
5. Settings popup open

**Step 3: Demo video** (user-action; ~30s)

Screen-record: navigate to chrono24.com → click into a Rolex Submariner listing → badge appears → scroll back to search → see compact deltas. Tools: OBS Studio (free), Loom (free tier), or Windows Game Bar (Win+G).

**Step 4: Commit assets**

```powershell
git -C <workspace>\watchsentry add cws-submission
git -C <workspace>\watchsentry commit -m "docs(cws): listing copy + screenshots + demo video"
git -C <workspace>\watchsentry push
```

---

### Task 5.4 — ANONYMITY AUDIT CHECKPOINT

This is the mandatory anonymity gate before any public artifact ships.

**Files:**
- Modify: `<repo>\docs\anonymity-audit.md` (mark all items confirmed)

**Step 1: Walk every public surface and verify brand-only**

For each row in `docs/anonymity-audit.md`, confirm:

1. **Domain WHOIS** — domain not yet bought (Task 6.3). Confirm Cloudflare Registrar privacy is default-on when buying.
2. **CWS developer profile display name** — dev account not yet registered (Task 6.1). Plan to use brand name only.
3. **CWS support email** — `support@watchsentry.app` requires domain MX first; if domain not yet bought at submission time, temporarily use a Cloudflare Email Routing forwarder once domain lands (Task 6.4). FOR INITIAL CWS SUBMISSION ONLY, can use `<gh-username>@users.noreply.github.com` — flag this as audit debt to swap before publishing.
4. **GitHub repo** — verify `Settings → Visibility → Private`. Verify `git log -1 --pretty=fuller` shows `WatchSentry Bot` author.
5. **Git author email** — `git log -p | grep -v noreply | grep -E "@(gmail|yahoo|hotmail|outlook|protonmail)"` should return empty. If anything personal leaks, rewrite history before pushing (use `git filter-repo` — destructive; user-approved only).
6. **Landing page footer/contact** — visual check: `support@watchsentry.app` is the only email; no operator name appears.
7. **Privacy policy contact** — same.
8. **Terms signing party** — currently says "We" — leave as-is for individual-operator brand; do NOT add personal name.
9. **Cloudflare account profile** — internal-only; OK.
10. **Lemon Squeezy** — defer to Phase 1.
11. **Analytics dashboards** — Cloudflare Web Analytics → never publicly exposed.

**Step 2: Update audit doc**

In `docs/anonymity-audit.md`, check off each row. Note any "audit debt" (temporary exceptions) explicitly with the remediation plan and deadline.

**Step 3: Commit**

```powershell
git -C <workspace>\watchsentry commit -am "audit: anonymity checkpoint pre-CWS-submission"
git -C <workspace>\watchsentry push
```

---

### Week 5 — review checkpoint

- [ ] Landing page is live on `*.pages.dev`, all 3 pages render
- [ ] Subscribe form writes to D1 audit_log
- [ ] CWS listing copy reviewed and free of personal info
- [ ] 5 screenshots captured at 1280×800
- [ ] Demo video ~30 sec recorded
- [ ] Anonymity audit doc has all rows checked or has explicit debt notes
- [ ] All tests green
- [ ] Session log updated

---

## Week 6 — Submit to CWS + domain (target: 2–4 hrs, mostly waiting)

### Task 6.1 — Chrome Web Store developer account

**Step 1:** Go to https://chrome.google.com/webstore/devconsole. Sign in with a Google account.

**Step 2:** Pay the $5 one-time developer registration fee.

**Step 3:** In Developer profile, set:
- **Publisher display name:** WatchSentry
- **Publisher contact email:** `support@watchsentry.app` (defer setup if domain not yet purchased — see Task 5.4 audit debt)

**Step 4:** Optional but recommended: set up a Group Publisher if you anticipate ever transferring ownership.

---

### Task 6.2 — Submit extension for review

**Step 1: Build production**

```powershell
cd <repo>\extension
npm run build
```

**Step 2: Zip the dist folder**

```powershell
Compress-Archive -Path <repo>\extension\dist\* -DestinationPath <repo>\cws-submission\watchsentry-v0.1.0.zip -Force
```

**Step 3: Upload via Web Store Developer Dashboard**

1. New item → upload `watchsentry-v0.1.0.zip`
2. Fill listing per `cws-submission/listing-copy.md`
3. Upload 5 screenshots + demo video
4. Privacy policy URL → Cloudflare Pages URL (or final domain if Task 6.3 completed first)
5. Distribution: Public
6. Pricing: Free
7. Submit

**Step 4: Review wait**

Typical CWS review = 3–14 days. While waiting, work on Task 6.3 + 6.4.

---

### Task 6.3 — Buy domain + connect to Pages

**Step 1: Confirm name availability + purchase**

Cloudflare dashboard → Domain Registration → register `watchsentry.app` (or your chosen variant). WHOIS privacy default-on — verify in cart before paying.

Cost: ~$9-15/yr.

**Step 2: Connect to Pages**

Cloudflare dashboard → Pages → `watchsentry-landing` → Custom domains → Add `watchsentry.app` and `www.watchsentry.app`. DNS records auto-populated since the domain is also on Cloudflare.

**Step 3: Verify TLS + redirect**

After DNS propagates (typically <5 min on CF-to-CF), check:
- `https://watchsentry.app/` loads
- `https://watchsentry.app/privacy.html` loads
- `http://watchsentry.app/` redirects to HTTPS

**Step 4: Update CWS listing privacy/support URLs**

Edit CWS listing → privacy policy URL → `https://watchsentry.app/privacy.html`. Save (will trigger another short review).

---

### Task 6.4 — Email routing for support@watchsentry.app

**Step 1: Cloudflare dashboard → Email Routing → Enable → set destination address to user's personal email (this is internal-only, NOT public).**

**Step 2: Create routing rule: `support@watchsentry.app` → user's personal email.**

**Step 3: Smoke**

Send a test email to `support@watchsentry.app`; verify it arrives at user's inbox.

**Step 4: Re-audit anonymity**

The `support@` address is now public. The DESTINATION is private (Cloudflare-only mapping). Document this in `docs/anonymity-audit.md` as a resolved item: "audit debt resolved: CWS support email is now `support@watchsentry.app` backed by Cloudflare Email Routing."

```powershell
git -C <workspace>\watchsentry commit -am "audit: support@ email routing live; CWS submission updated"
git -C <workspace>\watchsentry push
```

---

### Week 6 — review checkpoint

- [ ] CWS submission accepted (Pending Review or Published)
- [ ] Domain registered, WHOIS-private
- [ ] Landing page live on `watchsentry.app`
- [ ] Email routing live; `support@` arrives at user's inbox
- [ ] No personal info found in CWS listing, landing page, repo
- [ ] Session log updated

---

## Week 7 — Post-review + launch (target: 2–4 hrs)

### Task 7.1 — Address any CWS review feedback

**Possible feedback patterns:**

| Issue | Likely fix |
|---|---|
| "Manifest permissions too broad" | Tighten host_permissions to specific Workers URL |
| "Privacy policy doesn't disclose Cloudflare/eBay" | Update privacy.html — these services are already disclosed; reword more explicitly |
| "Description over-promises features not yet in build" | Soften language about cross-market alternatives (Phase 1) |
| "Demo video shows external watermarks/branding" | Re-record without third-party branding |

Apply fix → bump manifest version (0.1.0 → 0.1.1) → rebuild → re-upload → resubmit.

---

### Task 7.2 — Go-live monitoring (first 48 hrs)

**Step 1: Cloudflare Workers tail**

```powershell
wrangler tail watchsentry-api
```

Watch for: errors, unusual traffic patterns, 4xx/5xx spikes.

**Step 2: D1 sanity queries**

```powershell
wrangler d1 execute watchsentry-db --remote --command="SELECT COUNT(DISTINCT anonymous_id) AS unique_users, SUM(enrichment_count_today) AS enrichments FROM users WHERE counter_day = date('now');"
wrangler d1 execute watchsentry-db --remote --command="SELECT event_type, COUNT(*) AS n FROM audit_log WHERE created_at >= datetime('now','-1 day') GROUP BY event_type ORDER BY n DESC;"
```

**Step 3: CWS dashboard install count**

Check first-day installs. Note in session log.

**Step 4: First-day kill-metric reading**

Phase 0 kill is at 120 days, so this is informational only. Note install count + any 1-star reviews for context.

---

### Task 7.3 — Update design doc + session log with launch state

**Files:**
- Modify: `<workspace>\passive-income-empire\sessions\2026-05-18-t4a-niche-design.md` (append launch addendum)
- Modify: `<repo>\progress\session-log.md` (capture launch session)

Add a "Launch Addendum" section to the session log:

```markdown
## Launch addendum — <YYYY-MM-DD>

- CWS published: <link>
- Cloudflare Workers URL: <url>
- Domain: watchsentry.app
- D1 db: `watchsentry-db` (production)
- Day-1 installs: <n>
- Day-1 review count: <n>
- 60-day kill-metric review scheduled: <YYYY-MM-DD+60>
- 120-day kill-metric review scheduled: <YYYY-MM-DD+120>
```

Commit:

```powershell
git -C <workspace>\watchsentry commit -am "docs: Phase 0 launch addendum"
git -C <workspace>\watchsentry push
```

---

### Week 7 — review checkpoint

- [ ] Extension is Published on CWS (public URL)
- [ ] No errors in `wrangler tail` first 48 hrs (other than expected 4xx for malformed requests)
- [ ] Launch addendum captured in session log
- [ ] 60-day + 120-day kill-metric review dates calendared (user's task)
- [ ] **Phase 0 complete.** Pause; do NOT begin Phase 1 until 60-day signal data is in.

---

## Phase 0 closeout

When Week 7 review checkpoint passes:

1. **Tag the release** in git: `git tag v0.1.0 && git push --tags`
2. **Phase 0 retrospective** appended to `progress/session-log.md`:
   - Total hours spent (vs 40–60 estimate)
   - What surprised us
   - What we'd do differently
3. **Wait for kill-metric reads.** Do not start Phase 1 until 60-day install signal is in. Per design doc §6, Phase 1 is gated by:
   - 500+ installs at 90 days → continue confidently
   - <200 installs + <5 reviews + <1% DAU at 120 days → kill or pivot to Wedge 🅱
4. **Update sessions/README.md** in `passive-income-empire/` to mark Session 3 closed; open Session 4 if anything substantive happens.

---

## Appendix A — Manifest v3 permissions justification (for CWS review)

| Permission | Why we need it |
|---|---|
| `storage` | Local-only: persists "enabled" toggle + anonymous random UUID. Never holds personal data. |
| `host_permissions: https://watchsentry-api.*.workers.dev/*` | The Workers API for fair-value lookup. Sole external network destination. |
| `content_scripts: https://www.chrono24.com/*` | Render the badge on Chrono24 listing pages. No other site touched. |

**Permissions we do NOT request and could have:** `tabs`, `webRequest`, `cookies`, `history`, `bookmarks`, `<all_urls>`. Refusing these is the privacy posture.

---

## Appendix B — CWS submission checklist (final pre-submit)

- [ ] dist/ built with production manifest version
- [ ] zip created at `cws-submission/watchsentry-v0.1.0.zip`
- [ ] Name, short description, detailed description all in CWS listing
- [ ] 5 screenshots (1280×800 PNG)
- [ ] 1 demo video (≤30 sec)
- [ ] Privacy policy URL set to live Cloudflare Pages or final domain
- [ ] Support email set to `support@<brand>.com`
- [ ] Publisher display name = brand (NOT real name)
- [ ] Category: Shopping
- [ ] Visibility: Public
- [ ] Pricing: Free
- [ ] Permissions justification documented in submission

---

## Appendix C — Anonymity audit re-run trigger list

Re-run the audit at end of Week 5 (Task 5.4) AND any time the following happens:
- New external account is registered
- New domain or subdomain is bought
- New public-facing surface ships (landing page changes, etc.)
- New scrape source is added that posts to a forum/Reddit
- Phase 1 begins (Lemon Squeezy KYC, paid-tier marketing copy)

---

## Appendix D — Risk + rollback playbook

| Risk | Detection | Rollback action |
|---|---|---|
| eBay API rate-limit hit | Cron run inserts < expected; audit log shows 429 errors | Halve cron frequency to every-other-day; or batch refs across 2 days |
| Chrono24 sends C&D for any scraping (server-side only) | Email notice | Remove any server-side Chrono24 crawl; ext-only reads remain (logged-in user view); reply professionally; document in audit log |
| CWS removes extension | Email from Google | Read removal reason; fix; resubmit. Backup distribution: serve as unlisted CRX from `watchsentry.app/unlisted` (less discoverable, still installable for users who hold link) |
| Lemon Squeezy KYC rejects (Phase 1) | Email from LS | Pivot billing to Paddle (similar MoR; less strict KYC) or Freemius (Chrome-ext specialist) |
| D1 free tier exceeded | Cloudflare dashboard alert | Migrate to D1 paid (\$5/mo) — already budgeted for Phase 1 |
| Daily-cap counter prevents legitimate use | User reports | Raise from 50 to 100 in config; revisit in Phase 1 when paid tier ships |

---

## Open questions for user (resolve as needed during execution)

1. **Final brand name** (default `WatchSentry`)
2. **Final domain** (default `watchsentry.app`)
3. **CWS publisher display name** (default brand name)
4. **Test runner / lint** (default Vitest + Biome — swap if preferred)
5. **UI lib** (default Preact + vanilla state — swap if preferred)

---

**Plan complete.**
