import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseChrono24Listing } from "../../src/parsers/chrono24-listing";

const FIXTURE = readFileSync(
  join(__dirname, "../fixtures/chrono24-listing-rolex-124060.html"),
  "utf8",
);

describe("parseChrono24Listing", () => {
  it("extracts brand from the saved Rolex 124060 listing fixture", () => {
    const doc = new DOMParser().parseFromString(FIXTURE, "text/html");
    const r = parseChrono24Listing(doc);
    expect(r?.brand).toBe("Rolex");
  });
  it("extracts reference number", () => {
    const doc = new DOMParser().parseFromString(FIXTURE, "text/html");
    const r = parseChrono24Listing(doc);
    expect(r?.referenceNumber).toBe("124060");
  });
  it("extracts the listing price and its currency", () => {
    const doc = new DOMParser().parseFromString(FIXTURE, "text/html");
    const r = parseChrono24Listing(doc);
    expect(r?.listedPrice).toBeGreaterThan(0);
    expect(r?.listedCurrency).toBe("USD");
  });
  it("returns null on a page that isn't a listing", () => {
    const doc = new DOMParser().parseFromString(
      "<html><body>not a listing</body></html>",
      "text/html",
    );
    expect(parseChrono24Listing(doc)).toBeNull();
  });

  it("finds Product nested inside @graph (current Chrono24 layout)", () => {
    const graphHtml = `<!doctype html><html><head><script type="application/ld+json">${JSON.stringify(
      {
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "BreadcrumbList", itemListElement: [] },
          {
            "@type": "Product",
            name: "Rolex Submariner",
            brand: { "@type": "Brand", name: "Rolex" },
            sku: "124060",
            productID: "graphed-listing-id",
            offers: {
              "@type": "Offer",
              priceCurrency: "USD",
              price: "11590",
            },
          },
        ],
      },
    )}</script></head><body></body></html>`;
    const doc = new DOMParser().parseFromString(graphHtml, "text/html");
    const r = parseChrono24Listing(doc);
    expect(r?.brand).toBe("Rolex");
    expect(r?.referenceNumber).toBe("124060");
    expect(r?.listedPrice).toBe(11590);
    expect(r?.listedCurrency).toBe("USD");
    expect(r?.listingId).toBe("graphed-listing-id");
  });

  it("extracts a non-USD price with its currency (previously dropped to null)", () => {
    // This is the core fix: a EUR listing must keep its price + currency so the worker
    // can convert and still show a delta, instead of silently rendering no verdict.
    const eurHtml = `<!doctype html><html><head><script type="application/ld+json">${JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Omega Speedmaster",
        brand: { "@type": "Brand", name: "Omega" },
        sku: "310.30.42.50.01.001",
        offers: { "@type": "Offer", priceCurrency: "EUR", price: "6800" },
      },
    )}</script></head><body></body></html>`;
    const doc = new DOMParser().parseFromString(eurHtml, "text/html");
    const r = parseChrono24Listing(doc);
    expect(r?.listedPrice).toBe(6800);
    expect(r?.listedCurrency).toBe("EUR");
  });

  it("maps an http:// (non-https) schema.org itemCondition (real Chrono24 uses http)", () => {
    // Verified live 2026-06-03: Chrono24 JSON-LD emits "http://schema.org/UsedCondition".
    const html = `<!doctype html><html><head><script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Rolex Submariner",
      brand: { "@type": "Brand", name: "Rolex" },
      sku: "5512",
      offers: {
        "@type": "Offer",
        priceCurrency: "USD",
        price: "8400",
        itemCondition: "http://schema.org/UsedCondition",
      },
    })}</script></head><body></body></html>`;
    const r = parseChrono24Listing(new DOMParser().parseFromString(html, "text/html"));
    expect(r?.conditionTier).toBe("good");
  });
});
