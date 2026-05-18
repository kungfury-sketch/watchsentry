-- WatchSentry D1 schema v1
-- All timestamps stored as ISO-8601 UTC strings (D1 has no native datetime).
-- Apply: wrangler d1 execute watchsentry-db --remote --file=./migrations/0001_init.sql

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
