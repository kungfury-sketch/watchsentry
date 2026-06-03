import { extractProductFromJsonLd } from "./jsonld";
import { parsePriceAndCurrency } from "./price";

export type HodinkeeListing = {
  brand: string;
  referenceNumber: string;
  model?: string;
  conditionTier: "new" | "unworn" | "very_good" | "good" | "fair";
  listedPrice: number | null;
  listedCurrency: string | null;
};

// Hodinkee Shop is Shopify-based; product pages always emit standard schema.org Product
// JSON-LD. No DOM fallback needed — if JSON-LD is missing the page isn't a watch product.
export function parseHodinkeeListing(doc: Document): HodinkeeListing | null {
  const ld = extractProductFromJsonLd(doc);
  if (!ld?.brand || !ld.reference) return null;
  const dom = extractPriceFromDom(doc);
  return {
    brand: ld.brand,
    referenceNumber: ld.reference,
    model: ld.model,
    conditionTier: ld.condition ?? "very_good",
    listedPrice: ld.price ?? dom.price,
    listedCurrency: ld.price != null ? (ld.currency ?? null) : dom.currency,
  };
}

function extractPriceFromDom(doc: Document): { price: number | null; currency: string | null } {
  const txt = doc.querySelector(".price-item--regular, .product__price")?.textContent ?? "";
  return parsePriceAndCurrency(txt);
}
