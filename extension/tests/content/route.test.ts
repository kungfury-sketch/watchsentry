import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { chooseRoute } from "../../src/content/route";

const LISTING_FIXTURE = readFileSync(
  join(__dirname, "../fixtures/chrono24-listing-rolex-124060.html"),
  "utf8",
);

const SEARCH_FIXTURE = readFileSync(
  join(__dirname, "../fixtures/chrono24-search-rolex-submariner.html"),
  "utf8",
);

function asDoc(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

describe("chooseRoute", () => {
  it("returns 'listing' when the page has a parseable Product JSON-LD", () => {
    expect(chooseRoute(asDoc(LISTING_FIXTURE))).toBe("listing");
  });

  it("returns 'search' when the page has search-result cards but no Product JSON-LD", () => {
    expect(chooseRoute(asDoc(SEARCH_FIXTURE))).toBe("search");
  });

  it("returns 'none' on a page with neither Product schema nor search cards", () => {
    const doc = asDoc("<!doctype html><html><body><p>about us</p></body></html>");
    expect(chooseRoute(doc)).toBe("none");
  });

  it("prefers 'listing' over 'search' when both are present (detail pages can have related-listing cards)", () => {
    // Detail page that ALSO renders recommended/related listing cards.
    const html = `<!doctype html><html><head><script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Rolex Sub",
      brand: { "@type": "Brand", name: "Rolex" },
      sku: "124060",
      offers: { "@type": "Offer", priceCurrency: "USD", price: "11590" },
    })}</script></head><body>
      <div class="wt-listing-item js-listing-item listing-item"><p class="text-bold text-ellipsis">Rolex Submariner</p><p class="text-ellipsis">126610LN</p><p class="text-bold text-md">$13,499</p></div>
    </body></html>`;
    expect(chooseRoute(asDoc(html))).toBe("listing");
  });
});
