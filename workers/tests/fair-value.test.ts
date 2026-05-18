import { describe, expect, it } from "vitest";
import { computeFairValue } from "../src/fair-value";

describe("computeFairValue", () => {
  it("returns null when no comps", () => {
    expect(computeFairValue([])).toBeNull();
  });
  it("returns median of single comp", () => {
    const r = computeFairValue([{ soldPriceUsd: 9000, soldAt: "2026-05-01T00:00:00Z" }]);
    expect(r?.medianUsd).toBe(9000);
    expect(r?.sampleSize).toBe(1);
  });
  it("weights recent comps higher than old", () => {
    const recent = { soldPriceUsd: 10000, soldAt: "2026-05-15T00:00:00Z" };
    const old = { soldPriceUsd: 8000, soldAt: "2026-02-15T00:00:00Z" };
    const r = computeFairValue([recent, old]);
    // weighted median: recent dominates; result should sit closer to 10k than 9k
    expect(r?.medianUsd).toBeGreaterThan(9000);
  });
  it("ignores comps older than 90 days", () => {
    const recent = { soldPriceUsd: 10000, soldAt: "2026-05-15T00:00:00Z" };
    const ancient = { soldPriceUsd: 5000, soldAt: "2025-01-01T00:00:00Z" };
    const r = computeFairValue([recent, ancient]);
    expect(r?.medianUsd).toBe(10000);
    expect(r?.sampleSize).toBe(1);
  });
});
