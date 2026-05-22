import { describe, expect, it, vi } from "vitest";
import type { SoldComp } from "../src/ebay";
import { type ValidationResult, promoteCandidate, validateCandidate } from "../src/validate";

type Row = Record<string, unknown>;

function mockDb(opts: { firstRow?: Row | null; runImpl?: ReturnType<typeof vi.fn> } = {}) {
  const captured: Array<{ sql: string; bindings: unknown[] }> = [];
  const runImpl =
    opts.runImpl ?? vi.fn(async () => ({ meta: { rows_written: 1, last_row_id: 999 } }));
  const prepare = vi.fn((sql: string) => ({
    bind: (...bindings: unknown[]) => {
      captured.push({ sql, bindings });
      return {
        run: runImpl,
        first: async () => opts.firstRow ?? null,
      };
    },
  }));
  return { db: { prepare } as unknown as D1Database, captured, runImpl };
}

function fakeComp(i: number): SoldComp {
  return {
    sourceListingId: `listing-${i}`,
    soldPriceUsd: 5000 + i * 10,
    conditionTier: "good",
    soldAt: "2026-05-15T00:00:00Z",
  };
}

describe("validateCandidate", () => {
  it("returns 'promoted' when eBay returns >=50 comps", async () => {
    const comps = Array.from({ length: 60 }, (_, i) => fakeComp(i));
    const ebayFetch = vi.fn(async () => comps);
    const result = await validateCandidate({
      brand: "Rolex",
      reference: "16800",
      token: "tk",
      ebayFetch,
    });
    expect(result.outcome).toBe("promoted");
    expect(result.comps).toHaveLength(60);
  });

  it("returns 'insufficient_comps' when eBay returns <50 comps", async () => {
    const comps = Array.from({ length: 12 }, (_, i) => fakeComp(i));
    const ebayFetch = vi.fn(async () => comps);
    const result = await validateCandidate({
      brand: "Rolex",
      reference: "rare-ref",
      token: "tk",
      ebayFetch,
    });
    expect(result.outcome).toBe("insufficient_comps");
    expect(result.comps).toHaveLength(12);
  });

  it("returns 'fetch_error' when eBay throws", async () => {
    const ebayFetch = vi.fn(async () => {
      throw new Error("eBay 503");
    });
    const result = await validateCandidate({
      brand: "Rolex",
      reference: "16800",
      token: "tk",
      ebayFetch,
    });
    expect(result.outcome).toBe("fetch_error");
  });

  it("returns exactly 50 comps as the promotion threshold (>= not >)", async () => {
    const comps = Array.from({ length: 50 }, (_, i) => fakeComp(i));
    const ebayFetch = vi.fn(async () => comps);
    const result = await validateCandidate({
      brand: "Rolex",
      reference: "16800",
      token: "tk",
      ebayFetch,
    });
    expect(result.outcome).toBe("promoted");
  });
});

describe("promoteCandidate", () => {
  it("inserts into watch_references and returns the new reference id", async () => {
    const runImpl = vi.fn(async () => ({ meta: { rows_written: 1, last_row_id: 401 } }));
    const { db, captured } = mockDb({ firstRow: { id: 401 }, runImpl });
    const refId = await promoteCandidate(db, {
      brand: "Rolex",
      model: "Submariner",
      reference: "16800",
    });
    expect(refId).toBe(401);
    expect(
      captured.some((c) => /INSERT\s+(OR\s+IGNORE\s+)?INTO\s+watch_references/i.test(c.sql)),
    ).toBe(true);
  });

  it("builds the display_name as '{brand} {model} {reference}'", async () => {
    const runImpl = vi.fn(async () => ({ meta: { rows_written: 1, last_row_id: 402 } }));
    const { db, captured } = mockDb({ firstRow: { id: 402 }, runImpl });
    await promoteCandidate(db, {
      brand: "Rolex",
      model: "Submariner",
      reference: "16800",
    });
    const insertCall = captured.find((c) =>
      /INSERT\s+(OR\s+IGNORE\s+)?INTO\s+watch_references/i.test(c.sql),
    );
    expect(insertCall?.bindings).toContain("Rolex Submariner 16800");
  });

  it("returns null if the reference already exists (race-condition guard)", async () => {
    const runImpl = vi.fn(async () => ({ meta: { rows_written: 0, last_row_id: 0 } }));
    const { db } = mockDb({ firstRow: null, runImpl });
    const refId = await promoteCandidate(db, {
      brand: "Rolex",
      model: "Submariner",
      reference: "16800",
    });
    expect(refId).toBeNull();
  });
});

describe("ValidationResult shape", () => {
  it("compiles with the documented outcome values", () => {
    const r: ValidationResult = { outcome: "promoted", comps: [] };
    expect(r.outcome).toBe("promoted");
  });
});
