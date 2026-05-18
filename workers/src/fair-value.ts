export type FairValueInput = {
  soldPriceUsd: number;
  soldAt: string;
};

export type FairValue = {
  medianUsd: number;
  sampleSize: number;
  windowDays: number;
};

const WINDOW_DAYS = 90;
const NOW = () => Date.now();

export function computeFairValue(comps: FairValueInput[], now: number = NOW()): FairValue | null {
  const cutoff = now - WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const recent = comps.filter((c) => new Date(c.soldAt).getTime() >= cutoff);
  if (recent.length === 0) return null;

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
      return { medianUsd: Math.round(w.price), sampleSize: recent.length, windowDays: WINDOW_DAYS };
    }
  }
  // Unreachable: the loop above hits `acc >= total / 2` on the last iteration
  // (acc converges to total, and total/2 <= total). If somehow it doesn't,
  // fail loudly rather than emit NaN.
  throw new Error("computeFairValue: weighted median did not converge");
}
