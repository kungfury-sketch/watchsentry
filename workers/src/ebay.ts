// Phase 0 type-only stub. Real implementation lands in Task 2.4 when eBay
// Developer App is activated and EBAY_APP_ID / EBAY_CERT_ID secrets are set.
// repo.ts depends on these types; keeping them here means Task 2.4 can drop
// in the functions without touching repo.ts.

export type ConditionTier = "new" | "unworn" | "very_good" | "good" | "fair";

export type SoldComp = {
  sourceListingId: string;
  soldPriceUsd: number;
  conditionTier: ConditionTier;
  soldAt: string;
};
