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
  it("weights recent comps higher than older ones within the window", () => {
    // Inject `now` so the test is deterministic and BOTH comps are inside the 90-day window
    // (otherwise it would just be testing the window filter, not the weighting).
    const now = new Date("2026-06-04T00:00:00Z").getTime();
    const recent = { soldPriceUsd: 10000, soldAt: "2026-05-30T00:00:00Z" }; // ~5d old → heavy
    const older = { soldPriceUsd: 8000, soldAt: "2026-03-20T00:00:00Z" }; // ~76d old → light
    const r = computeFairValue([older, recent], now);
    expect(r?.sampleSize).toBe(2); // both counted → weighting, not filtering, is exercised
    expect(r?.medianUsd).toBe(10000); // the heavier recent comp wins the weighted median
  });
  it("ignores comps older than 90 days", () => {
    const recent = { soldPriceUsd: 10000, soldAt: "2026-05-15T00:00:00Z" };
    const ancient = { soldPriceUsd: 5000, soldAt: "2025-01-01T00:00:00Z" };
    const r = computeFairValue([recent, ancient]);
    expect(r?.medianUsd).toBe(10000);
    expect(r?.sampleSize).toBe(1);
  });
});
