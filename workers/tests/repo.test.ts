import { describe, expect, it, vi } from "vitest";
import {
  findReference,
  getFairValueInputsFor,
  getModelLevelComps,
  insertSoldComps,
} from "../src/repo";

// Captures the SQL text + bindings of each prepared statement so the queries' shape (the
// 90-day window, tier filter, ORDER/LIMIT) is pinned — a silent drop of any clause would
// otherwise pass the control-flow mocks in condition-fallback/model-fallback tests.
function mockDb(results: Array<Record<string, unknown>> = []) {
  const calls: Array<{ sql: string; binds: unknown[] }> = [];
  const prepare = vi.fn((sql: string) => ({
    bind: (...binds: unknown[]) => {
      calls.push({ sql, binds });
      return {
        all: async () => ({ results }),
        first: async () => results[0] ?? null,
      };
    },
  }));
  return { db: { prepare } as unknown as D1Database, calls };
}

describe("getFairValueInputsFor", () => {
  it("queries by reference + tier within the 90-day window, newest first, capped at 500", async () => {
    const { db, calls } = mockDb([{ sold_price_usd: 9000, sold_at: "2026-05-10T00:00:00Z" }]);
    const r = await getFairValueInputsFor(db, 42, "good");
    expect(r).toEqual([{ soldPriceUsd: 9000, soldAt: "2026-05-10T00:00:00Z" }]);
    const sql = calls[0]?.sql ?? "";
    expect(sql).toMatch(/FROM sold_comps/i);
    expect(sql).toMatch(/condition_tier\s*=\s*\?/i);
    expect(sql).toMatch(/sold_at >= datetime\('now', '-90 days'\)/i);
    expect(sql).toMatch(/ORDER BY sold_at DESC/i);
    expect(sql).toMatch(/LIMIT 500/i);
    expect(calls[0]?.binds).toEqual([42, "good"]);
  });
});

describe("getModelLevelComps", () => {
  it("joins references, filters brand+model+tier within 90 days, capped at 1000", async () => {
    const { db, calls } = mockDb([{ sold_price_usd: 12000, sold_at: "2026-05-10T00:00:00Z" }]);
    const r = await getModelLevelComps(db, "Rolex", "Submariner", "fair");
    expect(r).toEqual([{ soldPriceUsd: 12000, soldAt: "2026-05-10T00:00:00Z" }]);
    const sql = calls[0]?.sql ?? "";
    expect(sql).toMatch(/JOIN watch_references/i);
    expect(sql).toMatch(/sold_at >= datetime\('now', '-90 days'\)/i);
    expect(sql).toMatch(/LIMIT 1000/i);
    expect(calls[0]?.binds).toEqual(["Rolex", "Submariner", "fair"]);
  });
});

describe("findReference", () => {
  it("maps a row to a WatchRef and binds brand + reference", async () => {
    const { db, calls } = mockDb([
      {
        id: 7,
        brand: "Rolex",
        model: "Submariner",
        reference_number: "124060",
        display_name: "Rolex Submariner No-Date 124060",
      },
    ]);
    const ref = await findReference(db, "Rolex", "124060");
    expect(ref).toEqual({
      id: 7,
      brand: "Rolex",
      model: "Submariner",
      referenceNumber: "124060",
      displayName: "Rolex Submariner No-Date 124060",
    });
    expect(calls[0]?.binds).toEqual(["Rolex", "124060"]);
  });

  it("returns null when no row matches", async () => {
    const { db } = mockDb([]);
    expect(await findReference(db, "Rolex", "000000")).toBeNull();
  });
});

describe("insertSoldComps", () => {
  it("returns 0 for an empty batch without touching the db", async () => {
    const { db } = mockDb();
    expect(await insertSoldComps(db, 1, [])).toBe(0);
  });

  it("sums rows_written across the batch (distinct inserts, not attempts)", async () => {
    const batch = vi.fn(async (stmts: unknown[]) =>
      stmts.map(() => ({ meta: { rows_written: 1 } })),
    );
    const db = {
      prepare: vi.fn(() => ({ bind: (..._b: unknown[]) => ({}) })),
      batch,
    } as unknown as D1Database;
    const n = await insertSoldComps(db, 1, [
      { sourceListingId: "a", soldPriceUsd: 1, conditionTier: "fair", soldAt: "x" },
      { sourceListingId: "b", soldPriceUsd: 2, conditionTier: "fair", soldAt: "y" },
    ]);
    expect(n).toBe(2);
  });
});
