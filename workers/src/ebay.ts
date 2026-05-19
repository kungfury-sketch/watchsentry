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

export async function fetchEbaySoldComps(args: {
  brand: string;
  reference: string;
  token: string;
  fetchImpl?: typeof fetch;
}): Promise<SoldComp[]> {
  const fetchImpl = args.fetchImpl ?? fetch;
  const q = encodeURIComponent(`${args.brand} ${args.reference}`);
  const url = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${q}&filter=conditionIds:{1000|1500|2000|2500|3000|4000|5000|6000},buyingOptions:{FIXED_PRICE}&limit=200`;
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
      price: { value: string; currency: string };
      condition?: string;
      itemEndDate?: string;
    }>;
  };
  return (data.itemSummaries ?? [])
    .filter((i) => i.price.currency === "USD")
    .map((i) => ({
      sourceListingId: i.itemId,
      soldPriceUsd: Number.parseFloat(i.price.value),
      conditionTier: normalizeCondition(i.condition ?? "fair"),
      soldAt: i.itemEndDate ?? new Date().toISOString(),
    }));
}
