export type Chrono24Listing = {
  brand: string;
  referenceNumber: string;
  model?: string;
  conditionTier: "new" | "unworn" | "very_good" | "good" | "fair";
  listedPrice: number | null;
  listedCurrency: string | null;
  sellerId?: string;
  listingId?: string;
};

export function parseChrono24Listing(doc: Document): Chrono24Listing | null {
  // Chrono24 listing pages embed structured data in <script type="application/ld+json">.
  // The Product node may be at the top level OR nested inside an @graph array.
  const ldNodes = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
  for (const node of ldNodes) {
    try {
      const data = JSON.parse(node.textContent ?? "");
      const product = findProduct(data);
      if (!product) continue;

      const brand = product.brand?.name ?? product.brand;
      const sku = product.sku ?? product.mpn ?? product.model;
      if (!brand || !sku) continue;

      const offer = Array.isArray(product.offers) ? product.offers[0] : product.offers;
      const listedPrice = parsePriceNumber(offer?.price);
      const listedCurrency = offer?.priceCurrency ? String(offer.priceCurrency) : null;

      const condition = mapSchemaCondition(offer?.itemCondition);

      return {
        brand: String(brand),
        referenceNumber: String(sku),
        model: product.model ? String(product.model) : undefined,
        conditionTier: condition,
        listedPrice,
        listedCurrency,
        listingId: product.productID ? String(product.productID) : undefined,
      };
    } catch {
      // continue to next script tag
    }
  }
  return null;
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

// Parses a JSON-LD price (schema.org uses a machine-readable number: '.' decimal,
// no thousands separators) into a positive number, or null when absent/invalid.
function parsePriceNumber(raw: unknown): number | null {
  const n =
    typeof raw === "number" ? raw : typeof raw === "string" ? Number.parseFloat(raw) : Number.NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

function mapSchemaCondition(c: string | undefined): Chrono24Listing["conditionTier"] {
  // schema.org itemCondition may be http:// OR https:// (Chrono24 uses http) — match on
  // the condition name, not the exact URL.
  const s = (c ?? "").toLowerCase();
  if (s.includes("newcondition")) return "new";
  if (s.includes("usedcondition")) return "good";
  if (s.includes("refurbishedcondition")) return "very_good";
  if (s.includes("damagedcondition")) return "fair";
  return "very_good"; // Chrono24 default for pre-owned-excellent
}
