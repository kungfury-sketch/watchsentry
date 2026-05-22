import { extractProductFromJsonLd } from "./jsonld";

export type WatchfinderListing = {
  brand: string;
  referenceNumber: string;
  model?: string;
  conditionTier: "new" | "unworn" | "very_good" | "good" | "fair";
  listedPriceUsd: number | null;
};

export function parseWatchfinderListing(doc: Document): WatchfinderListing | null {
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

function tryDomFallback(doc: Document): WatchfinderListing | null {
  const specs = readDl(doc, ".prod-spec");
  const brand = specs.get("brand");
  const ref = specs.get("model number") ?? specs.get("reference") ?? specs.get("reference number");
  if (!brand || !ref) return null;
  return {
    brand,
    referenceNumber: ref,
    model: specs.get("model"),
    conditionTier: mapCondition(specs.get("condition") ?? ""),
    listedPriceUsd: extractPriceFromDom(doc),
  };
}

function readDl(doc: Document, selector: string): Map<string, string> {
  const out = new Map<string, string>();
  const root = doc.querySelector(selector);
  if (!root) return out;
  const dts = Array.from(root.querySelectorAll("dt"));
  for (const dt of dts) {
    const dd = dt.nextElementSibling;
    if (dd?.tagName === "DD") {
      const k = dt.textContent?.trim().toLowerCase();
      const v = dd.textContent?.trim();
      if (k && v) out.set(k, v);
    }
  }
  return out;
}

function extractPriceFromDom(doc: Document): number | null {
  const txt = doc.querySelector(".prod-price-figure, .prod-price")?.textContent ?? "";
  const m = txt.replace(/[\s,]/g, "").match(/\$?([0-9]+(?:\.[0-9]{1,2})?)/);
  return m?.[1] ? Number.parseFloat(m[1]) : null;
}

function mapCondition(c: string): WatchfinderListing["conditionTier"] {
  const x = c.toLowerCase();
  if (/\bnew\b|brand\s+new/.test(x)) return "new";
  if (/unworn|nos/.test(x)) return "unworn";
  if (/excellent|mint/.test(x)) return "very_good";
  if (/pre[-\s]owned|used|good|certified/.test(x)) return "good";
  return "good";
}
