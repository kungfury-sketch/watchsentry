import { parsePriceAndCurrency } from "./price";
import { extractReferenceFromText } from "./reference";

export type EbaySearchCard = {
  listingElement: HTMLElement;
  brand: string | null;
  model: string | null;
  referenceNumber: string | null;
  listedPrice: number | null;
  listedCurrency: string | null;
};

// eBay migrated its search results (2024+) to a card layout: each result is a
// `.su-card-container` with `.s-card__title`, `.s-card__subtitle` ("Condition · Brand"),
// and `.s-card__price`. The legacy `li.s-item` markup is gone. Selectors verified against
// the live www.ebay.com search DOM on 2026-06-03.
const CARD_SELECTOR = ".su-card-container";

// Known watch brands, longest compound names first, matched as a substring of the
// title+subtitle. Modern eBay titles often lead with a year/qualifier ("2023 Rolex …"),
// so a first-word heuristic no longer works.
const KNOWN_BRANDS = [
  "Patek Philippe",
  "Audemars Piguet",
  "Vacheron Constantin",
  "A. Lange & Söhne",
  "Jaeger-LeCoultre",
  "Grand Seiko",
  "TAG Heuer",
  "Tag Heuer",
  "Richard Mille",
  "Roger Dubuis",
  "Maurice Lacroix",
  "Bell & Ross",
  "Ulysse Nardin",
  "Frederique Constant",
  "Rolex",
  "Omega",
  "Tudor",
  "Cartier",
  "Breitling",
  "Panerai",
  "Hublot",
  "IWC",
  "Longines",
  "Tissot",
  "Oris",
  "Hamilton",
  "Zenith",
  "Seiko",
];

export function parseEbaySearch(doc: Document): EbaySearchCard[] {
  const cards = Array.from(doc.querySelectorAll<HTMLElement>(CARD_SELECTOR));
  return cards
    .map((el): EbaySearchCard | null => {
      const title = (el.querySelector(".s-card__title")?.textContent ?? "").trim();
      // eBay injects a "Shop on eBay" placeholder card with no real listing data.
      if (!title || /^shop on ebay/i.test(title)) return null;
      const subtitle = (el.querySelector(".s-card__subtitle")?.textContent ?? "").trim();
      const brand = extractBrand(`${title} ${subtitle}`);
      if (!brand) return null;
      const referenceNumber = extractReference(title);
      if (!referenceNumber) return null;
      const { price, currency } = parsePriceAndCurrency(
        el.querySelector(".s-card__price")?.textContent ?? "",
      );
      return {
        listingElement: el,
        brand,
        model: extractModel(title, brand),
        referenceNumber,
        listedPrice: price,
        listedCurrency: currency,
      };
    })
    .filter((c): c is EbaySearchCard => c !== null);
}

function extractBrand(text: string): string | null {
  for (const b of KNOWN_BRANDS) {
    if (text.includes(b)) return b;
  }
  return null;
}

function extractReference(title: string): string | null {
  // Digit-leading, dotted, 14-digit, slashed, or letter-leading ref shapes. [H5]
  return extractReferenceFromText(title);
}

function extractModel(title: string, brand: string): string | null {
  const idx = title.indexOf(brand);
  if (idx < 0) return null;
  const remainder = title.slice(idx + brand.length).trim();
  if (!remainder) return null;
  const cleaned = remainder.replace(/^(date|no-date|vintage|new|unworn|pre-owned)\s+/i, "");
  const first = cleaned.split(/\s+/)[0];
  return first ?? null;
}
