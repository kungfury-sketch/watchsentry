export type WatchfinderSearchCard = {
  listingElement: HTMLElement;
  brand: string | null;
  model: string | null;
  referenceNumber: string | null;
  listedPriceUsd: number | null;
};

const COMPOUND_BRANDS = [
  "Patek Philippe",
  "Audemars Piguet",
  "Vacheron Constantin",
  "Jaeger-LeCoultre",
  "TAG Heuer",
  "Tag Heuer",
  "Bell & Ross",
  "Grand Seiko",
  "A. Lange & Söhne",
];

export function parseWatchfinderSearch(doc: Document): WatchfinderSearchCard[] {
  const cards = Array.from(doc.querySelectorAll<HTMLElement>(".prod-tile"));
  return cards
    .map((el) => {
      const titleText = el.querySelector(".prod-tile-name")?.textContent?.trim() ?? "";
      if (!titleText) return null;
      const brand = extractBrand(titleText);
      if (!brand) return null;
      const referenceNumber = extractReference(el, titleText);
      if (!referenceNumber) return null;
      return {
        listingElement: el,
        brand,
        model: extractModel(titleText, brand),
        referenceNumber,
        listedPriceUsd: extractPrice(el),
      };
    })
    .filter((c) => c !== null) as WatchfinderSearchCard[];
}

function extractBrand(title: string): string | null {
  for (const compound of COMPOUND_BRANDS) {
    if (title.startsWith(compound)) return compound;
  }
  const first = title.split(/\s+/)[0];
  return first ?? null;
}

function extractReference(el: HTMLElement, title: string): string | null {
  const refLine = el.querySelector(".prod-tile-ref")?.textContent ?? "";
  const refM = refLine.match(/(?:Ref\.?\s+)?([0-9][A-Za-z0-9./-]{3,})/);
  if (refM?.[1]) return refM[1];
  const titleM = title.match(/\b([0-9]{5,7}[A-Za-z]{0,4})\b/);
  return titleM?.[1] ?? null;
}

function extractModel(title: string, brand: string): string | null {
  if (!title.startsWith(brand)) return null;
  const remainder = title.slice(brand.length).trim();
  if (!remainder) return null;
  const first = remainder.split(/\s+/)[0];
  return first ?? null;
}

function extractPrice(el: HTMLElement): number | null {
  const txt = el.querySelector(".prod-tile-price")?.textContent ?? "";
  const m = txt.replace(/[\s,]/g, "").match(/\$?([0-9]+(?:\.[0-9]{1,2})?)/);
  return m?.[1] ? Number.parseFloat(m[1]) : null;
}
