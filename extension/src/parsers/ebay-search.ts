export type EbaySearchCard = {
  listingElement: HTMLElement;
  brand: string | null;
  model: string | null;
  referenceNumber: string | null;
  listedPriceUsd: number | null;
};

// eBay search results render each item as <li class="s-item ...">. Some pages include a
// placeholder card ("Shop on eBay" template) that we filter out by requiring a real
// .s-item__title with both brand and reference extractable.
const CARD_SELECTOR = "li.s-item";

// Watch brands eBay sellers commonly type as the first token. Matched as a prefix so
// compound brands resolve correctly ("Patek Philippe Nautilus" -> brand="Patek Philippe").
const COMPOUND_BRANDS = [
  "Patek Philippe",
  "Audemars Piguet",
  "Vacheron Constantin",
  "A. Lange & Söhne",
  "A. Lange and Sohne",
  "Jaeger-LeCoultre",
  "TAG Heuer",
  "Tag Heuer",
  "Richard Mille",
  "Roger Dubuis",
  "Maurice Lacroix",
  "Bell & Ross",
  "Ulysse Nardin",
  "Frederique Constant",
  "Grand Seiko",
];

export function parseEbaySearch(doc: Document): EbaySearchCard[] {
  const cards: HTMLElement[] = Array.from(doc.querySelectorAll<HTMLElement>(CARD_SELECTOR));
  return cards
    .map((el) => {
      const titleText = findTitleText(el);
      if (!titleText) return null;
      const brand = extractBrand(titleText);
      if (!brand) return null;
      const referenceNumber = extractReference(titleText);
      if (!referenceNumber) return null;
      return {
        listingElement: el,
        brand,
        model: extractModel(titleText, brand),
        referenceNumber,
        listedPriceUsd: extractPrice(el),
      };
    })
    .filter((c) => c !== null) as EbaySearchCard[];
}

function findTitleText(el: HTMLElement): string | null {
  const titleNode = el.querySelector(".s-item__title");
  if (!titleNode) return null;
  // eBay's placeholder card uses the same .s-item__title shell with text "Shop on eBay" or
  // similar marketing copy. Strip whitespace and reject if it doesn't look like a listing.
  const raw = titleNode.textContent?.trim() ?? "";
  if (!raw || /^(shop on ebay|new listing)$/i.test(raw)) return null;
  // Some titles are prefixed with "NEW LISTING" in a separate span; trim it.
  return raw.replace(/^new\s+listing\s*/i, "").trim();
}

function extractBrand(title: string): string | null {
  for (const compound of COMPOUND_BRANDS) {
    if (title.startsWith(compound)) return compound;
  }
  // First word, stripping a leading "Vintage" / "Authentic" qualifier sellers often prepend.
  const cleaned = title.replace(/^(vintage|authentic|genuine|rare)\s+/i, "");
  const first = cleaned.split(/\s+/)[0];
  return first ?? null;
}

function extractReference(title: string): string | null {
  // 5-7 digit core with optional 1-4 letter dial-code suffix. Skips 4-digit years (1900-2099)
  // and short numbers (e.g. case sizes like "40mm"). Same shape as the Chrono24 search parser.
  const m = title.match(/\b([0-9]{5,7}[A-Za-z]{0,4})\b/);
  return m?.[1] ?? null;
}

function extractModel(title: string, brand: string): string | null {
  if (!title.startsWith(brand)) return null;
  const remainder = title.slice(brand.length).trim();
  if (!remainder) return null;
  // Strip leading qualifier tokens that aren't model names.
  const cleaned = remainder.replace(/^(date|no-date|vintage|new|unworn|pre-owned)\s+/i, "");
  const first = cleaned.split(/\s+/)[0];
  return first ?? null;
}

function extractPrice(el: HTMLElement): number | null {
  const priceText = el.querySelector(".s-item__price")?.textContent ?? "";
  const m = priceText.replace(/[\s,]/g, "").match(/\$?([0-9]+(?:\.[0-9]{1,2})?)/);
  return m?.[1] ? Number.parseFloat(m[1]) : null;
}
