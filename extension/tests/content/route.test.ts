import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { chooseHost, chooseRoute, defaultCurrencyForHost } from "../../src/content/route";

const C24_LISTING = readFileSync(
  join(__dirname, "../fixtures/chrono24-listing-rolex-124060.html"),
  "utf8",
);
const C24_SEARCH = readFileSync(
  join(__dirname, "../fixtures/chrono24-search-rolex-submariner.html"),
  "utf8",
);
const EBAY_LISTING = readFileSync(
  join(__dirname, "../fixtures/ebay-listing-rolex-116610LN.html"),
  "utf8",
);
const EBAY_SEARCH = readFileSync(
  join(__dirname, "../fixtures/ebay-search-rolex-submariner.html"),
  "utf8",
);

function asDoc(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

describe("chooseHost", () => {
  it("identifies chrono24 hosts", () => {
    expect(chooseHost("www.chrono24.com")).toBe("chrono24");
    expect(chooseHost("chrono24.com")).toBe("chrono24");
  });
  it("identifies eBay hosts including locale variants", () => {
    expect(chooseHost("www.ebay.com")).toBe("ebay");
    expect(chooseHost("www.ebay.co.uk")).toBe("ebay");
    expect(chooseHost("www.ebay.de")).toBe("ebay");
  });
  it("returns null for unsupported hosts (defense against off-domain script injection)", () => {
    expect(chooseHost("example.com")).toBeNull();
    expect(chooseHost("chrono24.evil.com")).toBeNull();
    expect(chooseHost("ebay.com.evil.net")).toBeNull();
  });
});

describe("chooseRoute — chrono24", () => {
  it("returns 'listing' when the page has a Chrono24 Product JSON-LD", () => {
    expect(chooseRoute(asDoc(C24_LISTING), "chrono24")).toBe("listing");
  });
  it("returns 'search' when the page has Chrono24 search-result cards", () => {
    expect(chooseRoute(asDoc(C24_SEARCH), "chrono24")).toBe("search");
  });
  it("returns 'none' on a Chrono24 page with neither", () => {
    expect(chooseRoute(asDoc("<html><body><p>about</p></body></html>"), "chrono24")).toBe("none");
  });
  it("prefers 'listing' over 'search' when both are present (detail + related cards)", () => {
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
    expect(chooseRoute(asDoc(html), "chrono24")).toBe("listing");
  });
});

describe("chooseRoute — ebay", () => {
  it("returns 'listing' when the page has an eBay listing detail", () => {
    expect(chooseRoute(asDoc(EBAY_LISTING), "ebay")).toBe("listing");
  });
  it("returns 'search' when the page has eBay search-result cards", () => {
    expect(chooseRoute(asDoc(EBAY_SEARCH), "ebay")).toBe("search");
  });
  it("returns 'none' on an eBay page with neither", () => {
    expect(chooseRoute(asDoc("<html><body><p>about</p></body></html>"), "ebay")).toBe("none");
  });
});

describe("defaultCurrencyForHost", () => {
  it("maps eBay TLDs to their listing currency", () => {
    expect(defaultCurrencyForHost("www.ebay.com")).toBe("USD");
    expect(defaultCurrencyForHost("www.ebay.co.uk")).toBe("GBP");
    expect(defaultCurrencyForHost("www.ebay.de")).toBe("EUR");
  });
  it("maps Watchfinder TLDs", () => {
    expect(defaultCurrencyForHost("www.watchfinder.co.uk")).toBe("GBP");
    expect(defaultCurrencyForHost("www.watchfinder.com")).toBe("USD");
  });
  it("returns null for Chrono24 (multi-currency) and unknown hosts", () => {
    expect(defaultCurrencyForHost("www.chrono24.com")).toBeNull();
    expect(defaultCurrencyForHost("example.com")).toBeNull();
  });
});
