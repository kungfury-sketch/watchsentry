import { describe, expect, it } from "vitest";
import { confidenceLabel, confidenceTier } from "../../src/components/confidence";

describe("confidenceTier", () => {
  it("rates a large sample with a tight spread as high", () => {
    expect(
      confidenceTier({
        sampleSize: 375,
        rangeLowUsd: 13253,
        rangeHighUsd: 15160,
        medianUsd: 14255,
      }),
    ).toBe("high");
  });

  it("rates a thin sample as limited regardless of spread", () => {
    expect(
      confidenceTier({ sampleSize: 10, rangeLowUsd: 7900, rangeHighUsd: 8300, medianUsd: 8100 }),
    ).toBe("limited");
  });

  it("rates a very wide spread as limited even with many comps", () => {
    expect(
      confidenceTier({ sampleSize: 80, rangeLowUsd: 9000, rangeHighUsd: 20000, medianUsd: 12000 }),
    ).toBe("limited");
  });

  it("rates a moderate sample with a normal spread as moderate", () => {
    expect(
      confidenceTier({ sampleSize: 20, rangeLowUsd: 9500, rangeHighUsd: 11000, medianUsd: 10000 }),
    ).toBe("moderate");
  });

  it("falls back to moderate when the range is unknown but the sample is healthy", () => {
    expect(confidenceTier({ sampleSize: 40 })).toBe("moderate");
  });
});

describe("confidenceLabel", () => {
  it("maps tiers to human-readable labels", () => {
    expect(confidenceLabel("high")).toMatch(/high/i);
    expect(confidenceLabel("moderate")).toMatch(/moderate/i);
    expect(confidenceLabel("limited")).toMatch(/limited/i);
  });
});
