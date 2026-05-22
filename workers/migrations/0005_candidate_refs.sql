-- Phase 1 auto-discovery: a "candidate" is a (brand, model, reference) tuple observed
-- in the wild (Chrono24 cards parsed by the extension) but not yet in watch_references.
-- The daily cron validates the top candidates against eBay sold-comps and promotes
-- valid ones into watch_references — letting the catalog self-grow toward what users
-- actually browse, without manual seeding.
--
-- Apply: wrangler d1 execute watchsentry-db --remote --file=./migrations/0005_candidate_refs.sql
--
-- Smoke after apply:
--   SELECT COUNT(*) FROM candidate_refs;       -- expect 0 initially; grows as users browse
--   PRAGMA index_list('candidate_refs');       -- expect uniq_candidate + obs_idx

CREATE TABLE IF NOT EXISTS candidate_refs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  reference_number TEXT NOT NULL,
  observation_count INTEGER NOT NULL DEFAULT 1,
  first_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  validated_at TEXT,
  validation_result TEXT,         -- 'promoted' | 'insufficient_comps' | 'fetch_error'
  promoted_at TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_candidate ON candidate_refs (brand, reference_number);
CREATE INDEX IF NOT EXISTS obs_idx ON candidate_refs (observation_count DESC, validated_at);
