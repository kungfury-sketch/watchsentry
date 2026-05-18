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
    .prepare(
      "SELECT id, brand, model, reference_number, display_name FROM watch_references WHERE brand = ? AND reference_number = ?",
    )
    .bind(brand, referenceNumber)
    .first<{
      id: number;
      brand: string;
      model: string;
      reference_number: string;
      display_name: string;
    }>();
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
    .all<{
      id: number;
      brand: string;
      model: string;
      reference_number: string;
      display_name: string;
    }>();
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
  return (rs.results ?? []).map((r) => ({
    soldPriceUsd: r.sold_price_usd,
    soldAt: r.sold_at,
  }));
}
