export type Chrono24SearchCard = {
  listingElement: HTMLElement;
  brand: string | null;
  referenceNumber: string | null;
  listedPriceUsd: number | null;
};

export function parseChrono24Search(doc: Document): Chrono24SearchCard[] {
  const cards = Array.from(
    doc.querySelectorAll<HTMLElement>("article.article-item, .article-item"),
  );
  return cards.map((el) => ({
    listingElement: el,
    brand: extractBrand(el),
    referenceNumber: extractReference(el),
    listedPriceUsd: extractPrice(el),
  }));
}

function extractBrand(el: HTMLElement): string | null {
  const txt = el
    .querySelector(".article-item-brand, [data-test=article-brand]")
    ?.textContent?.trim();
  return txt || null;
}

function extractReference(el: HTMLElement): string | null {
  // \b\Ref(\.|\s) prevents matching "Reference" since "Ref" is followed by "e".
  // Reference token must start with a digit (Chrono24 refs are digit-prefixed).
  const text = el.textContent ?? "";
  const m = text.match(/\bRef\.?\s+([0-9][A-Za-z0-9-./]*)/i);
  return m?.[1] ?? null;
}

function extractPrice(el: HTMLElement): number | null {
  const priceText = el.querySelector(".price, [data-test=article-price]")?.textContent ?? "";
  const cleaned = priceText.replace(/[\s,]/g, "");
  const m = cleaned.match(/([0-9]+(?:\.[0-9]{1,2})?)/);
  return m ? Number.parseFloat(m[1] as string) : null;
}
