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
  it("extracts a USD price", () => {
    const doc = new DOMParser().parseFromString(FIXTURE, "text/html");
    const r = parseChrono24Listing(doc);
    expect(r?.listedPriceUsd).toBeGreaterThan(0);
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
    expect(r?.listedPriceUsd).toBe(11590);
    expect(r?.listingId).toBe("graphed-listing-id");
  });
});
