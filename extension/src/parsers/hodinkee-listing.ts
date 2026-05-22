import { extractProductFromJsonLd } from "./jsonld";

export type HodinkeeListing = {
  brand: string;
  referenceNumber: string;
  model?: string;
  conditionTier: "new" | "unworn" | "very_good" | "good" | "fair";
  listedPriceUsd: number | null;
};

// Hodinkee Shop is Shopify-based; product pages always emit standard schema.org Product
// JSON-LD. No DOM fallback needed — if JSON-LD is missing the page isn't a watch product.
export function parseHodinkeeListing(doc: Document): HodinkeeListing | null {
  const ld = extractProductFromJsonLd(doc);
  if (!ld?.brand || !ld.reference) return null;
  return {
    brand: ld.brand,
    referenceNumber: ld.reference,
    model: ld.model,
    conditionTier: ld.condition ?? "very_good",
    listedPriceUsd: ld.priceUsd ?? extractPriceFromDom(doc),
  };
}

function extractPriceFromDom(doc: Document): number | null {
  const txt = doc.querySelector(".price-item--regular, .product__price")?.textContent ?? "";
  const m = txt.replace(/[\s,]/g, "").match(/\$?([0-9]+(?:\.[0-9]{1,2})?)/);
  return m?.[1] ? Number.parseFloat(m[1]) : null;
}
