import { isOutlierTitle } from "./outlier";

export type ConditionTier = "new" | "unworn" | "very_good" | "good" | "fair";

export type SoldComp = {
  sourceListingId: string;
  soldPriceUsd: number;
  conditionTier: ConditionTier;
  soldAt: string;
};

export function normalizeCondition(ebayCondition: string): ConditionTier {
  switch (ebayCondition) {
    case "NEW":
      return "new";
    case "NEW_OTHER":
      return "unworn";
    case "USED_EXCELLENT":
      return "very_good";
    case "USED_GOOD":
      return "good";
    case "USED_ACCEPTABLE":
      return "fair";
    default:
      return "fair";
  }
}

// Derives a condition tier from an eBay listing title, used when eBay omits the
// structured `condition` field (common for watches). Returns null when the title has no
// clear signal so the caller can fall back conservatively. Requires condition-context
// phrases ("mint condition", not a bare "mint" that may describe a dial colour).
export function conditionFromTitle(title: string | undefined): ConditionTier | null {
  if (!title) return null;
  const t = title.toLowerCase();
  if (/\b(brand new|bnib|new in box|factory sealed)\b/.test(t)) return "new";
  if (/\b(unworn|new old stock|nos|deadstock|new other)\b/.test(t)) return "unworn";
  if (/\b(mint condition|like new|near mint|excellent condition|pristine|immaculate)\b/.test(t)) {
    return "very_good";
  }
  if (/\b(pre[\s-]?owned|gently used|good condition|serviced|used)\b/.test(t)) return "good";
  if (/\b(well worn|heavily worn|patina|scratched|scratches)\b/.test(t)) return "fair";
  return null;
}

// Two-layer robust outlier filter (a comp must pass BOTH layers):
//   1. Coarse median band [0.25x, 4x] — kills gross junk (accessory/parts far below, multi-
//      watch lots far above) that the title-keyword filter misses. Still works when the IQR
//      collapses to zero because one price dominates >50% of the set.
//   2. Fine Tukey IQR fence [Q1 - 1.5*IQR, Q3 + 1.5*IQR] — trims same-reference *variant*
//      tails the wide band keeps: a $41k turquoise "Celebration" dial among $8-10k plain
//      Oyster Perpetual 124300s, or a precious-metal Daytona among steel ones. These share
//      the reference number but are a different watch and drag the median above the modal
//      configuration. Skipped when IQR <= 0 (degenerate spread → razor fence would over-trim).
// No-op below 4 comps, where neither centre nor quartiles are reliable. [data-quality]
const IQR_FENCE_K = 1.5;
const PRICE_BAND_LOW = 0.25;
const PRICE_BAND_HIGH = 4;
const MIN_COMPS_FOR_OUTLIER_FILTER = 4;

export function filterPriceOutliers<T extends { soldPriceUsd: number }>(comps: T[]): T[] {
  if (comps.length < MIN_COMPS_FOR_OUTLIER_FILTER) return comps;
  const prices = comps.map((c) => c.soldPriceUsd).sort((a, b) => a - b);
  const n = prices.length;
  const mid = Math.floor(n / 2);
  const median = n % 2 === 1 ? prices[mid] : ((prices[mid - 1] ?? 0) + (prices[mid] ?? 0)) / 2;
  const q1 = prices[Math.min(n - 1, Math.floor(n * 0.25))] ?? 0;
  const q3 = prices[Math.min(n - 1, Math.floor(n * 0.75))] ?? 0;
  const iqr = q3 - q1;

  const bandLo = (median ?? 0) > 0 ? (median ?? 0) * PRICE_BAND_LOW : Number.NEGATIVE_INFINITY;
  const bandHi = (median ?? 0) > 0 ? (median ?? 0) * PRICE_BAND_HIGH : Number.POSITIVE_INFINITY;
  const fenceLo = iqr > 0 ? q1 - IQR_FENCE_K * iqr : Number.NEGATIVE_INFINITY;
  const fenceHi = iqr > 0 ? q3 + IQR_FENCE_K * iqr : Number.POSITIVE_INFINITY;

  return comps.filter(
    (c) =>
      c.soldPriceUsd >= bandLo &&
      c.soldPriceUsd <= bandHi &&
      c.soldPriceUsd >= fenceLo &&
      c.soldPriceUsd <= fenceHi,
  );
}

export async function getEbayAppToken(
  appId: string,
  certId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  const basic = btoa(`${appId}:${certId}`);
  const res = await fetchImpl("https://api.ebay.com/identity/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
  });
  if (!res.ok) throw new Error(`eBay token error: ${res.status}`);
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

// ACCURACY NOTE — asking vs sold (measured 2026-06-15): the eBay Browse API returns ACTIVE
// listings, i.e. current *asking* prices, not realized sale prices. Asking sits systematically
// above sold (sellers list optimistically; stale inventory lingers high), so the fair value
// derived here biases ~+5-15% versus true market on clean references, and more on hyped or
// variant-heavy ones. filterPriceOutliers (IQR fence) and the per-ref sample floor (enrich.ts)
// strip variant/junk contamination and thin-sample noise, but they cannot remove the
// structural asking bias. The real fix is true sold-price data via eBay's Marketplace Insights
// API (buy/marketplace_insights/v1/item_sales/search), which is access-restricted — the
// operator must apply for it in the eBay developer program. Until then the delta (this listing
// vs the typical asking price) is the sound apples-to-apples signal; the absolute is an upper
// bound on market value, not a sold estimate.
export async function fetchEbaySoldComps(args: {
  brand: string;
  reference: string;
  token: string;
  fetchImpl?: typeof fetch;
}): Promise<SoldComp[]> {
  const fetchImpl = args.fetchImpl ?? fetch;
  const q = encodeURIComponent(`${args.brand} ${args.reference}`);
  // Restrict to the Wristwatches category (31387) so straps, bands, boxes and parts that
  // merely mention the reference number don't pollute the comp set and tank the median —
  // e.g. "Cartier WSSA0009" otherwise returns accessory listings at $24–$200. [data-quality]
  const url = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${q}&category_ids=31387&filter=conditionIds:{1000|1500|2000|2500|3000|4000|5000|6000},buyingOptions:{FIXED_PRICE}&limit=200`;
  const res = await fetchImpl(url, {
    headers: {
      Authorization: `Bearer ${args.token}`,
      "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
    },
  });
  if (!res.ok) throw new Error(`eBay search error: ${res.status}`);
  const data = (await res.json()) as {
    itemSummaries?: Array<{
      itemId: string;
      title?: string;
      price: { value: string; currency: string };
      condition?: string;
      itemEndDate?: string;
    }>;
  };
  const comps = (data.itemSummaries ?? [])
    .filter((i) => i.price.currency === "USD")
    .filter((i) => !isOutlierTitle(i.title))
    .map((i) => ({
      sourceListingId: i.itemId,
      soldPriceUsd: Number.parseFloat(i.price.value),
      // eBay rarely returns a structured condition for watches; when it's absent, derive
      // the tier from the title so comps don't all collapse to "fair".
      conditionTier: i.condition
        ? normalizeCondition(i.condition)
        : (conditionFromTitle(i.title) ?? "fair"),
      soldAt: i.itemEndDate ?? new Date().toISOString(),
    }));
  return filterPriceOutliers(comps);
}
