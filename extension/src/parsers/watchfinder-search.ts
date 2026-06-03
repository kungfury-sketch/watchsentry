import { parsePriceAndCurrency } from "./price";

export type WatchfinderSearchCard = {
  listingElement: HTMLElement;
  brand: string | null;
  model: string | null;
  referenceNumber: string | null;
  listedPrice: number | null;
  listedCurrency: string | null;
};

// Watchfinder search results render each watch as a `.product-card` with dedicated
// fields: `.card-brand`, `.card-series` (model), `.card-model-number` (reference),
// `.card-price`. Selectors verified against the live watchfinder.co.uk search DOM on
// 2026-06-03 (42/42 cards extracted cleanly; prices in GBP).
export function parseWatchfinderSearch(doc: Document): WatchfinderSearchCard[] {
  return Array.from(doc.querySelectorAll<HTMLElement>(".product-card"))
    .map((el): WatchfinderSearchCard | null => {
      const brand = text(el, ".card-brand");
      // The model-number field sometimes includes a space before the dial code
      // ("16610 LV"); collapse it to match the canonical reference format.
      const ref = text(el, ".card-model-number")?.replace(/\s+/g, "") ?? null;
      if (!brand || !ref) return null;
      const { price, currency } = parsePriceAndCurrency(text(el, ".card-price") ?? "");
      return {
        listingElement: el,
        brand,
        model: text(el, ".card-series"),
        referenceNumber: ref,
        listedPrice: price,
        listedCurrency: currency,
      };
    })
    .filter((c): c is WatchfinderSearchCard => c !== null);
}

function text(el: HTMLElement, sel: string): string | null {
  const t = el.querySelector(sel)?.textContent?.trim();
  return t || null;
}
