import { parsePriceAndCurrency } from "./price";

export type EbayListing = {
  brand: string;
  referenceNumber: string;
  model?: string;
  conditionTier: "new" | "unworn" | "very_good" | "good" | "fair";
  listedPrice: number | null;
  listedCurrency: string | null;
  listingId?: string;
};

// eBay detail pages encode the watch metadata in two places that we try in priority order:
//   1. JSON-LD <script type="application/ld+json"> with @type=Product (cleanest)
//   2. Item-specifics section with label/value rows
// Both are sometimes-present; the parser falls back to whichever path yields brand+ref.
export function parseEbayListing(doc: Document): EbayListing | null {
  const jsonLd = tryJsonLd(doc);
  if (jsonLd) return jsonLd;
  const specifics = tryItemSpecifics(doc);
  if (specifics) return specifics;
  return null;
}

function tryJsonLd(doc: Document): EbayListing | null {
  const nodes = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
  for (const node of nodes) {
    try {
      const data = JSON.parse(node.textContent ?? "");
      const product = findProduct(data);
      if (!product) continue;

      const brand = product.brand?.name ?? product.brand;
      const ref = product.mpn ?? product.sku ?? extractRefFromTitle(product.name);
      if (!brand || !ref) continue;

      const offer = Array.isArray(product.offers) ? product.offers[0] : product.offers;
      const listedPrice = parsePrice(offer?.price);
      const listedCurrency = offer?.priceCurrency ? String(offer.priceCurrency) : null;
      const condition = mapSchemaCondition(offer?.itemCondition);

      return {
        brand: String(brand),
        referenceNumber: String(ref),
        model: product.model ? String(product.model) : undefined,
        conditionTier: condition,
        listedPrice,
        listedCurrency,
        listingId: product.sku ? String(product.sku) : undefined,
      };
    } catch {
      // continue to next script tag
    }
  }
  return null;
}

// eBay item-specifics layout (circa 2026): each row is a `.ux-layout-section__row` containing
// `.ux-labels-values__labels` (the field name) and `.ux-labels-values__values` (the value).
function tryItemSpecifics(doc: Document): EbayListing | null {
  const specifics = readSpecifics(doc);
  const brand = specifics.get("brand");
  const ref = specifics.get("reference number") ?? specifics.get("reference");
  if (!brand || !ref) return null;

  const priceText = doc.querySelector(".x-price-primary")?.textContent ?? "";
  const { price, currency } = parsePriceAndCurrency(priceText);
  const conditionRaw = specifics.get("condition") ?? "";
  const conditionTier = mapStringCondition(conditionRaw);

  return {
    brand,
    referenceNumber: ref,
    model: specifics.get("model"),
    conditionTier,
    listedPrice: price,
    listedCurrency: currency,
  };
}

function readSpecifics(doc: Document): Map<string, string> {
  const out = new Map<string, string>();
  const rows = doc.querySelectorAll(".ux-layout-section__row");
  for (const row of Array.from(rows)) {
    const label = row.querySelector(".ux-labels-values__labels")?.textContent?.trim().toLowerCase();
    const value = row.querySelector(".ux-labels-values__values")?.textContent?.trim();
    if (label && value) out.set(label, value);
  }
  return out;
}

// biome-ignore lint/suspicious/noExplicitAny: walks unknown JSON-LD structure
function findProduct(node: any): any | null {
  if (!node || typeof node !== "object") return null;
  const type = Array.isArray(node["@type"]) ? node["@type"][0] : node["@type"];
  if (type === "Product") return node;
  if (Array.isArray(node["@graph"])) {
    for (const item of node["@graph"]) {
      const found = findProduct(item);
      if (found) return found;
    }
  }
  return null;
}

// Fallback ref extraction from a title string — pulls a 5-7 digit core with optional 1-4
// letter dial-code suffix. Skips 4-digit years.
function extractRefFromTitle(title: string | undefined): string | null {
  if (!title) return null;
  const m = title.match(/\b([0-9]{5,7}[A-Za-z]{0,4})\b/);
  return m?.[1] ?? null;
}

function parsePrice(text: string | undefined): number | null {
  if (!text) return null;
  const m = text.replace(/[\s,]/g, "").match(/\$?([0-9]+(?:\.[0-9]{1,2})?)/);
  return m?.[1] ? Number.parseFloat(m[1]) : null;
}

function mapSchemaCondition(c: string | undefined): EbayListing["conditionTier"] {
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
      return "good";
  }
}

// Maps eBay's free-text condition strings (from item-specifics) to our tier system.
// Covers eBay's documented condition codes plus common dealer phrasing.
function mapStringCondition(raw: string): EbayListing["conditionTier"] {
  const c = raw.toLowerCase();
  if (/\bnew\s*\(other\)|nos|unworn|deadstock/.test(c)) return "unworn";
  if (/\bnew\b|brand\s+new|never\s+used/.test(c)) return "new";
  if (/excellent|mint|like\s+new/.test(c)) return "very_good";
  if (/pre[-\s]owned|used|good|certified/.test(c)) return "good";
  if (/acceptable|fair|for\s+parts/.test(c)) return "fair";
  return "good";
}
