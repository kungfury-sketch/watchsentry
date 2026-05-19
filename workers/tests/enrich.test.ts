import { describe, expect, it } from "vitest";
import { enrichRequestSchema, enrichmentCacheKey } from "../src/enrich";

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
});
