import { extractProductFromJsonLd } from "./jsonld";
import { parsePriceAndCurrency } from "./price";

export type CrownAndCaliberListing = {
  brand: string;
  referenceNumber: string;
  model?: string;
  conditionTier: "new" | "unworn" | "very_good" | "good" | "fair";
  listedPrice: number | null;
  listedCurrency: string | null;
};

export function parseCrownAndCaliberListing(doc: Document): CrownAndCaliberListing | null {
  const ld = extractProductFromJsonLd(doc);
  if (ld?.brand && ld.reference) {
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
  return tryDomFallback(doc);
}

function tryDomFallback(doc: Document): CrownAndCaliberListing | null {
  const specs = readSpecRows(doc);
  const brand = specs.get("brand");
  const ref = specs.get("reference") ?? specs.get("reference number");
  if (!brand || !ref) return null;
  const dom = extractPriceFromDom(doc);
  return {
    brand,
    referenceNumber: ref,
    model: specs.get("model"),
    conditionTier: mapCondition(specs.get("condition") ?? ""),
    listedPrice: dom.price,
    listedCurrency: dom.currency,
  };
}

function readSpecRows(doc: Document): Map<string, string> {
  const out = new Map<string, string>();
  const rows = doc.querySelectorAll(".spec-row");
  for (const row of Array.from(rows)) {
    const label = row.querySelector(".spec-label")?.textContent?.trim().toLowerCase();
    const value = row.querySelector(".spec-value")?.textContent?.trim();
    if (label && value) out.set(label, value);
  }
  return out;
}

function extractPriceFromDom(doc: Document): { price: number | null; currency: string | null } {
  const txt = doc.querySelector(".price__current, .product__price")?.textContent ?? "";
  return parsePriceAndCurrency(txt);
}

function mapCondition(c: string): CrownAndCaliberListing["conditionTier"] {
  const x = c.toLowerCase();
  if (/\bnew\b|brand\s+new/.test(x)) return "new";
  if (/unworn|nos/.test(x)) return "unworn";
  if (/excellent|mint|certified/.test(x)) return "very_good";
  if (/pre[-\s]owned|used|good/.test(x)) return "good";
  return "very_good";
}
