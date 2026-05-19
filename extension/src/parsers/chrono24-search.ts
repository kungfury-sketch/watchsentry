export type Chrono24SearchCard = {
  listingElement: HTMLElement;
  brand: string | null;
  referenceNumber: string | null;
  listedPriceUsd: number | null;
};

const CARD_SELECTOR = ".wt-listing-item.js-listing-item.listing-item, .wt-listing-item";

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
  return cards.map((el) => ({
    listingElement: el,
    brand: extractBrand(el),
    referenceNumber: extractReference(el),
    listedPriceUsd: extractPrice(el),
  }));
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

function extractReference(el: HTMLElement): string | null {
  const refText = findReferenceText(el);
  if (refText && /^[0-9][A-Za-z0-9\-./]*$/.test(refText)) return refText;
  const m = (el.textContent ?? "").match(/\bRef\.?\s+([0-9][A-Za-z0-9\-./]*)/i);
  return m?.[1] ?? null;
}

function extractPrice(el: HTMLElement): number | null {
  const priceText = findPriceText(el) ?? el.textContent ?? "";
  const usd = priceText.match(/\$\s*([\d,]+(?:\.\d{1,2})?)/);
  if (usd?.[1]) return Number.parseFloat(usd[1].replace(/,/g, ""));
  const fallback = priceText.replace(/[\s,]/g, "").match(/([0-9]+(?:\.[0-9]{1,2})?)/);
  return fallback?.[1] ? Number.parseFloat(fallback[1]) : null;
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
