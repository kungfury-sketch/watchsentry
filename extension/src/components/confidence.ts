export type ConfidenceTier = "high" | "moderate" | "limited";

// Derives a confidence cue from BOTH how many comps back the estimate and how tightly they
// agree (the IQR width relative to the median). Many tight comps → high; thin OR very spread
// → limited. Surfaced in the badge so a buyer can weight the number accordingly.
const HIGH_MIN_SAMPLE = 30;
const LIMITED_MAX_SAMPLE = 15;
const TIGHT_SPREAD = 0.3; // IQR width <= 30% of median reads as the market agreeing
const WIDE_SPREAD = 0.55; // IQR width > 55% of median reads as high variation

export function confidenceTier(args: {
  sampleSize?: number;
  rangeLowUsd?: number;
  rangeHighUsd?: number;
  medianUsd?: number;
}): ConfidenceTier {
  const n = args.sampleSize ?? 0;
  const relSpread =
    args.rangeLowUsd != null && args.rangeHighUsd != null && args.medianUsd && args.medianUsd > 0
      ? (args.rangeHighUsd - args.rangeLowUsd) / args.medianUsd
      : undefined;

  if (n >= HIGH_MIN_SAMPLE && relSpread !== undefined && relSpread <= TIGHT_SPREAD) return "high";
  if (n < LIMITED_MAX_SAMPLE || (relSpread !== undefined && relSpread > WIDE_SPREAD)) {
    return "limited";
  }
  return "moderate";
}

export function confidenceLabel(tier: ConfidenceTier): string {
  switch (tier) {
    case "high":
      return "High confidence";
    case "moderate":
      return "Moderate confidence";
    case "limited":
      return "Limited confidence";
  }
}
