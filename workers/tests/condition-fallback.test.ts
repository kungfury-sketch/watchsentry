import { describe, expect, it, vi } from "vitest";
import type { ConditionTier } from "../src/ebay";
import { getCompsWithFallback } from "../src/enrich";

type Row = { sold_price_usd: number; sold_at: string };
type FixtureByTier = Partial<Record<ConditionTier, Row[]>>;

function mockDb(byTier: FixtureByTier) {
  const calls: ConditionTier[] = [];
  const prepare = vi.fn((_sql: string) => ({
    bind: (_refId: number, tier: ConditionTier) => ({
      all: async () => {
        calls.push(tier);
        return { results: byTier[tier] ?? [] };
      },
    }),
  }));
  return { db: { prepare } as unknown as D1Database, calls };
}

describe("getCompsWithFallback", () => {
  it("returns requested-tier comps when present", async () => {
    const { db, calls } = mockDb({
      very_good: [{ sold_price_usd: 12000, sold_at: "2026-05-10T00:00:00Z" }],
    });
    const r = await getCompsWithFallback(db, 1, "very_good");
    expect(r.comps).toHaveLength(1);
    expect(r.actualTier).toBe("very_good");
    expect(r.fallbackUsed).toBe(false);
    expect(calls).toEqual(["very_good"]);
  });

  it("falls back to 'fair' when requested tier is empty", async () => {
    const { db, calls } = mockDb({
      fair: [{ sold_price_usd: 8000, sold_at: "2026-05-10T00:00:00Z" }],
    });
    const r = await getCompsWithFallback(db, 1, "very_good");
    expect(r.comps).toHaveLength(1);
    expect(r.actualTier).toBe("fair");
    expect(r.fallbackUsed).toBe(true);
    expect(calls).toEqual(["very_good", "fair"]);
  });

  it("does not fall back when requested tier is already 'fair'", async () => {
    const { db, calls } = mockDb({});
    const r = await getCompsWithFallback(db, 1, "fair");
    expect(r.comps).toHaveLength(0);
    expect(r.actualTier).toBe("fair");
    expect(r.fallbackUsed).toBe(false);
    expect(calls).toEqual(["fair"]);
  });

  it("returns empty when both requested and fair are empty", async () => {
    const { db, calls } = mockDb({});
    const r = await getCompsWithFallback(db, 1, "new");
    expect(r.comps).toHaveLength(0);
    expect(r.actualTier).toBe("fair");
    expect(r.fallbackUsed).toBe(true);
    expect(calls).toEqual(["new", "fair"]);
  });
});
