export type FairValueInput = {
  soldPriceUsd: number;
  soldAt: string;
};

export type FairValue = {
  medianUsd: number;
  sampleSize: number;
  windowDays: number;
  // Interquartile typical-price range (p25-p75) of the in-window comps — surfaced so the
  // badge can show how tightly the market agrees (a confidence signal), not just a point.
  rangeLowUsd: number;
  rangeHighUsd: number;
};

const WINDOW_DAYS = 90;
const NOW = () => Date.now();

export function computeFairValue(comps: FairValueInput[], now: number = NOW()): FairValue | null {
  const cutoff = now - WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const recent = comps.filter((c) => new Date(c.soldAt).getTime() >= cutoff);
  if (recent.length === 0) return null;

  // Interquartile typical-price band (unweighted, descriptive): the middle 50% of comps.
  // A narrow band means the market agrees; a wide one means high variation — the badge
  // turns this into a confidence cue. Collapses to the single value for a one-comp ref.
  const sortedPrices = recent.map((c) => c.soldPriceUsd).sort((a, b) => a - b);
  const np = sortedPrices.length;
  const rangeLowUsd = Math.round(sortedPrices[Math.min(np - 1, Math.floor(np * 0.25))] ?? 0);
  const rangeHighUsd = Math.round(sortedPrices[Math.min(np - 1, Math.floor(np * 0.75))] ?? 0);

  // weighted median where weight decays linearly with age
  const weighted: Array<{ price: number; weight: number }> = recent.map((c) => {
    const ageDays = (now - new Date(c.soldAt).getTime()) / (1000 * 60 * 60 * 24);
    const weight = Math.max(0.1, 1 - ageDays / WINDOW_DAYS);
    return { price: c.soldPriceUsd, weight };
  });
  weighted.sort((a, b) => a.price - b.price);
  const total = weighted.reduce((s, w) => s + w.weight, 0);
  let acc = 0;
  for (const w of weighted) {
    acc += w.weight;
    if (acc >= total / 2) {
      return {
        medianUsd: Math.round(w.price),
        sampleSize: recent.length,
        windowDays: WINDOW_DAYS,
        rangeLowUsd,
        rangeHighUsd,
      };
    }
  }
  // Unreachable: the loop above hits `acc >= total / 2` on the last iteration
  // (acc converges to total, and total/2 <= total). If somehow it doesn't,
  // fail loudly rather than emit NaN.
  throw new Error("computeFairValue: weighted median did not converge");
}
