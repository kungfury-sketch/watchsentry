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
