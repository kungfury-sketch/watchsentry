import { extractProductFromJsonLd } from "./jsonld";
import { parsePriceAndCurrency } from "./price";

export type WatchfinderListing = {
  brand: string;
  referenceNumber: string;
  model?: string;
  conditionTier: "new" | "unworn" | "very_good" | "good" | "fair";
  listedPrice: number | null;
  listedCurrency: string | null;
};

const BRANDS = [
  "Patek Philippe",
  "Audemars Piguet",
  "Jaeger-LeCoultre",
  "Grand Seiko",
  "TAG Heuer",
  "Tag Heuer",
  "Bell & Ross",
  "A. Lange & Söhne",
  "Rolex",
  "Omega",
  "Tudor",
  "Cartier",
  "Breitling",
  "IWC",
  "Panerai",
  "Hublot",
  "Longines",
  "Zenith",
  "Seiko",
];

export function parseWatchfinderListing(doc: Document): WatchfinderListing | null {
  // Prefer JSON-LD when a page happens to carry it.
  const ld = extractProductFromJsonLd(doc);
  if (ld?.brand && ld.reference) {
    const dom = mainPrice(doc);
    return {
      brand: ld.brand,
      referenceNumber: ld.reference,
      model: ld.model,
      conditionTier: ld.condition ?? "good",
      listedPrice: ld.price ?? dom.price,
      listedCurrency: ld.price != null ? (ld.currency ?? null) : dom.currency,
    };
  }
  // Watchfinder product pages carry NO JSON-LD: the main watch's brand/model/reference are
  // in the <h1> ("Rolex Submariner 16610"); the price is the first compact currency element
  // that is NOT inside a related `.product-card`. Verified live on watchfinder.co.uk 2026-06-03.
  return fromHeading(doc);
}

function fromHeading(doc: Document): WatchfinderListing | null {
  const h1 = doc.querySelector("h1")?.textContent?.replace(/\s+/g, " ").trim() ?? "";
  if (!h1) return null;
  const brand = BRANDS.find((b) => h1.includes(b));
  if (!brand) return null;
  const ref = h1.match(/\b([0-9]{4,7}[A-Za-z]{0,4})\b/)?.[1];
  if (!ref) return null;
  const after = h1.slice(h1.indexOf(brand) + brand.length).trim();
  const model = after.split(/\s+/)[0] || undefined;
  const { price, currency } = mainPrice(doc);
  return {
    brand,
    referenceNumber: ref,
    model,
    conditionTier: "good",
    listedPrice: price,
    listedCurrency: currency,
  };
}

// The main listing price: first compact currency element that is NOT inside a related
// `.product-card` (the page is full of related-watch cards that also show prices).
function mainPrice(doc: Document): { price: number | null; currency: string | null } {
  const el = Array.from(doc.querySelectorAll<HTMLElement>("span, strong, b, h2, h3")).find(
    (e) =>
      !e.closest(".product-card") &&
      /[£$€][\d,]{3,}/.test(e.textContent ?? "") &&
      (e.textContent ?? "").replace(/\s/g, "").length < 16,
  );
  return el ? parsePriceAndCurrency(el.textContent ?? "") : { price: null, currency: null };
}
