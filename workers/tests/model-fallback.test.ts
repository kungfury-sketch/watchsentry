import { describe, expect, it, vi } from "vitest";
import type { ConditionTier } from "../src/ebay";
import { enrichRequestSchema } from "../src/enrich";
import { getModelLevelComps } from "../src/repo";

type Row = { sold_price_usd: number; sold_at: string };

function mockDb(byKey: Record<string, Row[]>) {
  const lastBindings: Array<{ brand: string; model: string; tier: ConditionTier }> = [];
  const prepare = vi.fn((_sql: string) => ({
    bind: (brand: string, model: string, tier: ConditionTier) => ({
      all: async () => {
        lastBindings.push({ brand, model, tier });
        const key = `${brand}|${model}|${tier}`;
        return { results: byKey[key] ?? [] };
      },
    }),
  }));
  return { db: { prepare } as unknown as D1Database, lastBindings };
}

describe("getModelLevelComps", () => {
  it("returns sold_comps for the requested brand+model+tier", async () => {
    const { db, lastBindings } = mockDb({
      "Rolex|Submariner|good": [
        { sold_price_usd: 9000, sold_at: "2026-05-15T00:00:00Z" },
        { sold_price_usd: 9500, sold_at: "2026-05-10T00:00:00Z" },
        { sold_price_usd: 10000, sold_at: "2026-05-05T00:00:00Z" },
      ],
    });
    const comps = await getModelLevelComps(db, "Rolex", "Submariner", "good");
    expect(comps).toHaveLength(3);
    expect(comps[0]).toEqual({ soldPriceUsd: 9000, soldAt: "2026-05-15T00:00:00Z" });
    expect(lastBindings).toEqual([{ brand: "Rolex", model: "Submariner", tier: "good" }]);
  });

  it("returns empty when no comps exist for the model", async () => {
    const { db } = mockDb({});
    const comps = await getModelLevelComps(db, "Rolex", "Submariner", "good");
    expect(comps).toEqual([]);
  });

  it("isolates by brand+model combination", async () => {
    const { db } = mockDb({
      "Rolex|Submariner|good": [{ sold_price_usd: 9000, sold_at: "2026-05-15T00:00:00Z" }],
      "Rolex|GMT-Master II|good": [{ sold_price_usd: 14000, sold_at: "2026-05-15T00:00:00Z" }],
    });
    const subs = await getModelLevelComps(db, "Rolex", "Submariner", "good");
    expect(subs).toHaveLength(1);
    expect(subs[0]?.soldPriceUsd).toBe(9000);
  });

  it("isolates by condition tier", async () => {
    const { db } = mockDb({
      "Rolex|Submariner|good": [{ sold_price_usd: 9000, sold_at: "2026-05-15T00:00:00Z" }],
      "Rolex|Submariner|fair": [{ sold_price_usd: 7500, sold_at: "2026-05-15T00:00:00Z" }],
    });
    const r = await getModelLevelComps(db, "Rolex", "Submariner", "fair");
    expect(r).toHaveLength(1);
    expect(r[0]?.soldPriceUsd).toBe(7500);
  });
});

describe("enrichRequestSchema with model field", () => {
  it("accepts a request with optional model", () => {
    const r = enrichRequestSchema.safeParse({
      brand: "Rolex",
      reference: "16800",
      condition: "good",
      model: "Submariner",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.model).toBe("Submariner");
  });

  it("accepts a request without model (backward compat)", () => {
    const r = enrichRequestSchema.safeParse({
      brand: "Rolex",
      reference: "16800",
      condition: "good",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.model).toBeUndefined();
  });

  it("rejects an empty model string", () => {
    const r = enrichRequestSchema.safeParse({
      brand: "Rolex",
      reference: "16800",
      condition: "good",
      model: "",
    });
    expect(r.success).toBe(false);
  });
});
