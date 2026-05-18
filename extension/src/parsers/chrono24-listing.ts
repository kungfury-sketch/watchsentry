export type Chrono24Listing = {
  brand: string;
  referenceNumber: string;
  model?: string;
  conditionTier: "new" | "unworn" | "very_good" | "good" | "fair";
  listedPriceUsd: number | null;
  sellerId?: string;
  listingId?: string;
};

export function parseChrono24Listing(doc: Document): Chrono24Listing | null {
  // Chrono24 listing pages embed structured data in <script type="application/ld+json">
  const ldNodes = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
  for (const node of ldNodes) {
    try {
      const data = JSON.parse(node.textContent ?? "");
      const type = Array.isArray(data["@type"]) ? data["@type"][0] : data["@type"];
      if (type !== "Product") continue;

      const brand = data.brand?.name ?? data.brand;
      const sku = data.sku ?? data.mpn ?? data.model;
      if (!brand || !sku) continue;

      const offer = Array.isArray(data.offers) ? data.offers[0] : data.offers;
      const priceUsd = offer?.priceCurrency === "USD" ? Number.parseFloat(offer.price) : null;

      const condition = mapSchemaCondition(offer?.itemCondition);

      return {
        brand: String(brand),
        referenceNumber: String(sku),
        model: data.model ? String(data.model) : undefined,
        conditionTier: condition,
        listedPriceUsd: priceUsd,
        listingId: data.productID ? String(data.productID) : undefined,
      };
    } catch {
      // continue to next script tag
    }
  }
  return null;
}

function mapSchemaCondition(c: string | undefined): Chrono24Listing["conditionTier"] {
  switch (c) {
    case "https://schema.org/NewCondition":
      return "new";
    case "https://schema.org/UsedCondition":
      return "good";
    case "https://schema.org/RefurbishedCondition":
      return "very_good";
    case "https://schema.org/DamagedCondition":
      return "fair";
    default:
      return "very_good"; // Chrono24 default for pre-owned-excellent
  }
}
