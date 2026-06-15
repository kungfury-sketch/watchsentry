import { describe, expect, it } from "vitest";
import { enrich } from "../src/enrich";
import type { Env } from "../src/index";

// Within the 90-day window relative to the current date.
const RECENT = "2026-05-20T00:00:00Z";

// Minimal in-memory Env: findReference (.first) always misses so we exercise the
// model-level fallback path; getModelLevelComps (.all) returns the supplied comps.
function fakeEnv(modelComps: Array<{ sold_price_usd: number; sold_at: string }>): Env {
  return {
    DB: {
      prepare: (_sql: string) => ({
        bind: (..._binds: unknown[]) => ({
          first: async () => null,
          all: async () => ({ results: modelComps }),
          run: async () => ({}),
        }),
      }),
    },
    CACHE: {
      get: async () => null,
      put: async () => {},
    },
    EBAY_APP_ID: "x",
    EBAY_CERT_ID: "x",
  } as unknown as Env;
}

// Per-ref Env: findReference (.first) returns a ref so the per-ref path runs;
// getFairValueInputsFor / getModelLevelComps (.all) return the supplied comps.
function fakeEnvPerRef(comps: Array<{ sold_price_usd: number; sold_at: string }>): Env {
  const ref = {
    id: 1,
    brand: "Cartier",
    model: "Santos",
    reference_number: "WSSA0009",
    display_name: "Cartier Santos WSSA0009",
  };
  return {
    DB: {
      prepare: (_sql: string) => ({
        bind: (..._binds: unknown[]) => ({
          first: async () => ref,
          all: async () => ({ results: comps }),
          run: async () => ({}),
        }),
      }),
    },
    CACHE: { get: async () => null, put: async () => {} },
    EBAY_APP_ID: "x",
    EBAY_CERT_ID: "x",
  } as unknown as Env;
}

describe("enrich() suppresses thin per-ref samples [data-accuracy]", () => {
  it("returns no_data when a known ref has too few comps to trust the median", async () => {
    // 5 recent comps clears computeFairValue but is below the confidence floor — a single
    // listing is 20% of the sample and would swing the median. The model fallback (same 5
    // comps here) is also too thin, so the honest answer is no_data, not a confident number.
    const comps = [7900, 8000, 8100, 8200, 8300].map((p) => ({
      sold_price_usd: p,
      sold_at: RECENT,
    }));
    const res = await enrich(fakeEnvPerRef(comps), {
      brand: "Cartier",
      reference: "WSSA0009",
      condition: "good",
    });
    expect(res.status).toBe("no_data");
  });

  it("returns ok when a known ref clears the confidence floor", async () => {
    const comps = [7600, 7700, 7800, 7900, 8000, 8100, 8200, 8300, 8400, 8500].map((p) => ({
      sold_price_usd: p,
      sold_at: RECENT,
    }));
    const res = await enrich(fakeEnvPerRef(comps), {
      brand: "Cartier",
      reference: "WSSA0009",
      condition: "good",
    });
    expect(res.status).toBe("ok");
    expect(res.fairValue?.sampleSize).toBe(10);
  });
});

describe("enrich() applies the price-range filter on the read path [H1]", () => {
  it("drops junk-priced comps from the model-level fair value", async () => {
    const comps = [
      ...Array.from({ length: 60 }, () => ({ sold_price_usd: 12000, sold_at: RECENT })),
      // Straps / bezels / parts that share the model text but are far below the watch.
      ...Array.from({ length: 20 }, () => ({ sold_price_usd: 150, sold_at: RECENT })),
    ];
    const res = await enrich(fakeEnv(comps), {
      brand: "Rolex",
      reference: "999999-unknown-ref",
      condition: "good",
      model: "Submariner",
    });
    expect(res.status).toBe("ok");
    expect(res.modelFallback).toBe(true);
    // The 20 comps at $150 are >4x below the ~$12,000 median, so they must be filtered
    // out on read — sampleSize should reflect the 60 in-band comps, not all 80.
    expect(res.fairValue?.sampleSize).toBe(60);
    expect(res.fairValue?.medianUsd).toBe(12000);
  });
});
