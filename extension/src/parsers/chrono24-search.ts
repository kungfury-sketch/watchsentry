export type Chrono24SearchCard = {
  listingElement: HTMLElement;
  brand: string | null;
  model: string | null;
  referenceNumber: string | null;
  listedPrice: number | null;
  listedCurrency: string | null;
};

// Strict 3-class selector only. Chrono24's responsive layout has additional .wt-listing-item
// wrapper elements (~2x match count) that don't represent real listings — including them
// causes duplicate badges per card.
const CARD_SELECTOR = ".wt-listing-item.js-listing-item.listing-item";

const COMPOUND_BRANDS = [
  "Patek Philippe",
  "Audemars Piguet",
  "Vacheron Constantin",
  "A. Lange & Söhne",
  "Jaeger-LeCoultre",
  "TAG Heuer",
  "Tag Heuer",
  "Richard Mille",
  "Roger Dubuis",
  "Maurice Lacroix",
  "Bell & Ross",
  "Ulysse Nardin",
  "Frederique Constant",
];

export function parseChrono24Search(doc: Document): Chrono24SearchCard[] {
  const seen = new Set<HTMLElement>();
  const cards: HTMLElement[] = [];
  for (const el of Array.from(doc.querySelectorAll<HTMLElement>(CARD_SELECTOR))) {
    if (seen.has(el)) continue;
    seen.add(el);
    cards.push(el);
  }
  return cards.map((el) => {
    const brand = extractBrand(el);
    const { price, currency } = extractCardPrice(el);
    return {
      listingElement: el,
      brand,
      model: extractModel(el, brand),
      referenceNumber: extractReference(el),
      listedPrice: price,
      listedCurrency: currency,
    };
  });
}

function extractBrand(el: HTMLElement): string | null {
  const titleText = findTitleText(el);
  if (!titleText) return null;
  for (const compound of COMPOUND_BRANDS) {
    if (titleText.startsWith(compound)) return compound;
  }
  const first = titleText.split(/\s+/)[0];
  return first ?? null;
}

// First word after the brand prefix. Coarse on purpose — Chrono24 titles append
// dial/colorway/variant words ("Date", "Hulk", "Pepsi", "Vintage") that the worker
// doesn't need to disambiguate the model. The first word is usually the catalog model
// name as stored in watch_references.model.
function extractModel(el: HTMLElement, brand: string | null): string | null {
  if (!brand) return null;
  const titleText = findTitleText(el);
  if (!titleText || !titleText.startsWith(brand)) return null;
  const remainder = titleText.slice(brand.length).trim();
  if (!remainder) return null;
  const first = remainder.split(/\s+/)[0];
  return first ?? null;
}

function extractReference(el: HTMLElement): string | null {
  const refText = findReferenceText(el);

  // Cleanest case: the ref-line text IS the reference (e.g. "124060" or "126610LN").
  if (refText && /^[0-9][A-Za-z0-9\-./]*$/.test(refText)) return refText;

  const fullText = el.textContent ?? "";

  // Fallback 1: explicit "Ref. NNN" pattern anywhere in the card.
  const explicit = fullText.match(/\bRef\.?\s+([0-9][A-Za-z0-9\-./]*)/i);
  if (explicit?.[1]) return explicit[1];

  // Fallback 2: implicit reference in descriptive seller text — 5-7 digits with optional
  // 1-4 letter suffix. Excludes 4-digit years (e.g. "2026") and short numbers (e.g. "41mm").
  // Examples we catch: "Unworn 2026 / 124060 - New style box", "Black Dial 124060", "41mm 124060 Oystersteel".
  const implicit = fullText.match(/\b([0-9]{5,7}[A-Za-z]{0,4})\b/);
  return implicit?.[1] ?? null;
}

function extractCardPrice(el: HTMLElement): { price: number | null; currency: string | null } {
  const priceText = findPriceText(el) ?? el.textContent ?? "";
  return parsePriceAndCurrency(priceText);
}

// Parses a display price string into a whole-number amount + ISO currency.
// Chrono24 cards show whole prices (no cents) across locales: "$13,499", "€9,500",
// "6.800 €", "9 500 €", "CHF 8'500". We detect the currency by symbol/code and strip
// all grouping separators (comma, dot, space, apostrophe) to recover the integer.
export function parsePriceAndCurrency(text: string): {
  price: number | null;
  currency: string | null;
} {
  const currency = detectCurrency(text);
  const cluster = text.match(/\d[\d.,'’ʼ \s]*\d|\d/);
  const digits = cluster ? cluster[0].replace(/\D/g, "") : "";
  const parsed = digits ? Number.parseInt(digits, 10) : null;
  return { price: parsed && parsed > 0 ? parsed : null, currency };
}

function detectCurrency(text: string): string | null {
  if (text.includes("$")) return "USD";
  if (text.includes("€")) return "EUR";
  if (text.includes("£")) return "GBP";
  if (/\bCHF\b|\bFr\.?/.test(text)) return "CHF";
  if (text.includes("₺") || /\bTL\b/.test(text)) return "TRY";
  if (text.includes("¥")) return "JPY";
  return null;
}

function findTitleText(el: HTMLElement): string | null {
  for (const p of Array.from(el.querySelectorAll<HTMLElement>("p"))) {
    const cls = p.className;
    if (typeof cls !== "string") continue;
    if (cls.includes("text-bold") && cls.includes("text-ellipsis")) {
      const text = p.textContent?.trim();
      if (text) return text;
    }
  }
  return null;
}

function findReferenceText(el: HTMLElement): string | null {
  for (const p of Array.from(el.querySelectorAll<HTMLElement>("p"))) {
    const cls = p.className;
    if (typeof cls !== "string") continue;
    if (cls.includes("text-ellipsis") && !cls.includes("text-bold")) {
      const text = p.textContent?.trim();
      if (text) return text;
    }
  }
  return null;
}

function findPriceText(el: HTMLElement): string | null {
  for (const p of Array.from(el.querySelectorAll<HTMLElement>("p"))) {
    const cls = p.className;
    if (typeof cls !== "string") continue;
    if (cls.includes("text-bold") && cls.includes("text-md")) {
      const text = p.textContent?.trim();
      if (text) return text;
    }
  }
  return null;
}
