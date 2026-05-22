import { extractProductFromJsonLd } from "./jsonld";

export type WatchchartsListing = {
  brand: string;
  referenceNumber: string;
  model?: string;
  conditionTier: "new" | "unworn" | "very_good" | "good" | "fair";
  listedPriceUsd: number | null;
};

export function parseWatchchartsListing(doc: Document): WatchchartsListing | null {
  const ld = extractProductFromJsonLd(doc);
  if (ld?.brand && ld.reference) {
    return {
      brand: ld.brand,
      referenceNumber: ld.reference,
      model: ld.model,
      conditionTier: ld.condition ?? "good",
      listedPriceUsd: ld.priceUsd ?? extractPriceFromDom(doc),
    };
  }
  return tryDomFallback(doc);
}

function tryDomFallback(doc: Document): WatchchartsListing | null {
  const specs = readSpecsTable(doc);
  const brand = specs.get("brand");
  const ref = specs.get("reference number") ?? specs.get("reference");
  if (!brand || !ref) return null;
  return {
    brand,
    referenceNumber: ref,
    model: specs.get("model"),
    conditionTier: mapCondition(specs.get("condition") ?? ""),
    listedPriceUsd: extractPriceFromDom(doc),
  };
}

function readSpecsTable(doc: Document): Map<string, string> {
  const out = new Map<string, string>();
  const rows = doc.querySelectorAll(".wc-specs tr");
  for (const row of Array.from(rows)) {
    const th = row.querySelector("th")?.textContent?.trim().toLowerCase();
    const td = row.querySelector("td")?.textContent?.trim();
    if (th && td) out.set(th, td);
  }
  return out;
}

function extractPriceFromDom(doc: Document): number | null {
  const txt = doc.querySelector(".wc-price")?.textContent ?? "";
  const m = txt.replace(/[\s,]/g, "").match(/\$?([0-9]+(?:\.[0-9]{1,2})?)/);
  return m?.[1] ? Number.parseFloat(m[1]) : null;
}

function mapCondition(c: string): WatchchartsListing["conditionTier"] {
  const x = c.toLowerCase();
  if (/\bnew\b|brand\s+new/.test(x)) return "new";
  if (/unworn|nos/.test(x)) return "unworn";
  if (/excellent|mint/.test(x)) return "very_good";
  if (/pre[-\s]owned|used|good/.test(x)) return "good";
  return "good";
}
