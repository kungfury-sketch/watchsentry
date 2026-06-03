// Shared helper for parsers across marketplaces that emit schema.org Product JSON-LD.
// Walks @graph trees and Array roots, returns the first Product node it finds.

// biome-ignore lint/suspicious/noExplicitAny: walks unknown JSON-LD structure
type JsonNode = any;

export type ProductLd = {
  brand?: string;
  reference?: string;
  model?: string;
  price?: number;
  currency?: string;
  condition?: "new" | "unworn" | "very_good" | "good" | "fair";
};

export function extractProductFromJsonLd(doc: Document): ProductLd | null {
  const nodes = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
  for (const node of nodes) {
    try {
      const data = JSON.parse(node.textContent ?? "");
      const product = findProduct(data);
      if (!product) continue;
      const brand = product.brand?.name ?? product.brand;
      const reference = product.mpn ?? product.sku ?? product.model;
      if (!brand || !reference) continue;

      const offer = Array.isArray(product.offers) ? product.offers[0] : product.offers;
      const price = parsePrice(offer?.price);
      const currency = offer?.priceCurrency ? String(offer.priceCurrency) : undefined;
      const condition = mapSchemaCondition(offer?.itemCondition);

      return {
        brand: String(brand),
        reference: String(reference),
        model: product.model ? String(product.model) : undefined,
        price,
        currency,
        condition,
      };
    } catch {
      // continue to next script tag
    }
  }
  return null;
}

function findProduct(node: JsonNode): JsonNode | null {
  if (!node || typeof node !== "object") return null;
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findProduct(item);
      if (found) return found;
    }
    return null;
  }
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

function parsePrice(raw: unknown): number | undefined {
  if (typeof raw === "number") return raw;
  if (typeof raw !== "string") return undefined;
  const m = raw.replace(/[\s,]/g, "").match(/([0-9]+(?:\.[0-9]{1,2})?)/);
  return m?.[1] ? Number.parseFloat(m[1]) : undefined;
}

function mapSchemaCondition(c: string | undefined): ProductLd["condition"] {
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
