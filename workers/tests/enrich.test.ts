import { describe, expect, it } from "vitest";
import { enrichRequestSchema, enrichmentCacheKey, resolveListedPriceUsd } from "../src/enrich";

describe("enrichmentCacheKey", () => {
  it("builds a deterministic key", () => {
    const k = enrichmentCacheKey({
      brand: "Rolex",
      reference: "124060",
      condition: "very_good",
    });
    expect(k).toBe("enrich:Rolex:124060:very_good");
  });
  it("is case-sensitive on brand/ref", () => {
    expect(enrichmentCacheKey({ brand: "rolex", reference: "124060", condition: "new" })).not.toBe(
      enrichmentCacheKey({ brand: "Rolex", reference: "124060", condition: "new" }),
    );
  });
});

describe("enrichRequestSchema", () => {
  it("accepts a minimal valid request", () => {
    const r = enrichRequestSchema.safeParse({
      brand: "Rolex",
      reference: "124060",
      condition: "very_good",
    });
    expect(r.success).toBe(true);
  });
  it("accepts a request with listedPriceUsd", () => {
    const r = enrichRequestSchema.safeParse({
      brand: "Rolex",
      reference: "124060",
      condition: "very_good",
      listedPriceUsd: 9500,
    });
    expect(r.success).toBe(true);
  });
  it("rejects an invalid condition", () => {
    const r = enrichRequestSchema.safeParse({
      brand: "Rolex",
      reference: "124060",
      condition: "mint",
    });
    expect(r.success).toBe(false);
  });
  it("rejects a negative price", () => {
    const r = enrichRequestSchema.safeParse({
      brand: "Rolex",
      reference: "124060",
      condition: "new",
      listedPriceUsd: -100,
    });
    expect(r.success).toBe(false);
  });
  it("accepts and retains listedPrice + listedCurrency", () => {
    const r = enrichRequestSchema.safeParse({
      brand: "Omega",
      reference: "31030425001001",
      condition: "very_good",
      listedPrice: 6800,
      listedCurrency: "EUR",
    });
    expect(r.success && r.data.listedPrice).toBe(6800);
    expect(r.success && r.data.listedCurrency).toBe("EUR");
  });
  it("rejects a currency code that isn't a 3-letter ISO code", () => {
    const r = enrichRequestSchema.safeParse({
      brand: "Omega",
      reference: "x",
      condition: "new",
      listedPrice: 6800,
      listedCurrency: "EU",
    });
    expect(r.success).toBe(false);
  });
});

describe("resolveListedPriceUsd", () => {
  const rates = { USD: 1, EUR: 0.92, GBP: 0.79 };

  it("prefers an explicit listedPriceUsd (backward-compatible with old extension builds)", () => {
    expect(
      resolveListedPriceUsd(
        { listedPriceUsd: 9500, listedPrice: 8000, listedCurrency: "EUR" },
        rates,
      ),
    ).toBe(9500);
  });

  it("converts listedPrice + listedCurrency to USD when no explicit USD price is given", () => {
    expect(resolveListedPriceUsd({ listedPrice: 6800, listedCurrency: "EUR" }, rates)).toBe(7391);
  });

  it("passes a USD-denominated listedPrice straight through", () => {
    expect(resolveListedPriceUsd({ listedPrice: 9500, listedCurrency: "USD" }, rates)).toBe(9500);
  });

  it("returns undefined for a foreign price when rates are unavailable (KV cold) — no fake delta", () => {
    expect(
      resolveListedPriceUsd({ listedPrice: 6800, listedCurrency: "EUR" }, null),
    ).toBeUndefined();
  });

  it("returns undefined for an unknown currency rather than guessing", () => {
    expect(
      resolveListedPriceUsd({ listedPrice: 100000, listedCurrency: "JPY" }, rates),
    ).toBeUndefined();
  });

  it("returns undefined when neither a USD price nor a price+currency pair is present", () => {
    expect(resolveListedPriceUsd({}, rates)).toBeUndefined();
  });
});
