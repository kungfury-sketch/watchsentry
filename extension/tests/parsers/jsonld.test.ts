import { describe, expect, it } from "vitest";
import { extractProductFromJsonLd } from "../../src/parsers/jsonld";

function docFromLd(ld: unknown): Document {
  const html = `<!doctype html><html><head><script type="application/ld+json">${JSON.stringify(
    ld,
  )}</script></head><body></body></html>`;
  return new DOMParser().parseFromString(html, "text/html");
}

describe("extractProductFromJsonLd", () => {
  it("extracts a top-level Product (brand object, mpn ref, string price, USD)", () => {
    const r = extractProductFromJsonLd(
      docFromLd({
        "@context": "https://schema.org",
        "@type": "Product",
        brand: { "@type": "Brand", name: "Rolex" },
        mpn: "116610LN",
        model: "Submariner",
        offers: {
          "@type": "Offer",
          price: "11500",
          priceCurrency: "USD",
          itemCondition: "https://schema.org/UsedCondition",
        },
      }),
    );
    expect(r).toMatchObject({
      brand: "Rolex",
      reference: "116610LN",
      model: "Submariner",
      price: 11500,
      currency: "USD",
      condition: "good",
    });
  });

  it("finds a Product nested inside an @graph array (EUR price)", () => {
    const r = extractProductFromJsonLd(
      docFromLd({
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "BreadcrumbList" },
          {
            "@type": "Product",
            brand: "Omega",
            sku: "310.30.42",
            offers: { price: 6800, priceCurrency: "EUR" },
          },
        ],
      }),
    );
    expect(r).toMatchObject({
      brand: "Omega",
      reference: "310.30.42",
      price: 6800,
      currency: "EUR",
    });
  });

  it("finds a Product when the JSON-LD root is a bare array", () => {
    const r = extractProductFromJsonLd(
      docFromLd([
        { "@type": "WebSite" },
        {
          "@type": "Product",
          brand: { name: "Tudor" },
          mpn: "79030N",
          offers: { price: "3500", priceCurrency: "USD" },
        },
      ]),
    );
    expect(r?.brand).toBe("Tudor");
    expect(r?.reference).toBe("79030N");
  });

  it("accepts a numeric price as well as a string price", () => {
    const r = extractProductFromJsonLd(
      docFromLd({
        "@type": "Product",
        brand: "Rolex",
        mpn: "124060",
        offers: { price: 9500, priceCurrency: "USD" },
      }),
    );
    expect(r?.price).toBe(9500);
  });

  it("maps an http:// itemCondition, not just https://", () => {
    const r = extractProductFromJsonLd(
      docFromLd({
        "@type": "Product",
        brand: "Rolex",
        mpn: "5512",
        offers: {
          price: "8400",
          priceCurrency: "USD",
          itemCondition: "http://schema.org/UsedCondition",
        },
      }),
    );
    expect(r?.condition).toBe("good");
  });

  it("uses the first offer when offers is an array", () => {
    const r = extractProductFromJsonLd(
      docFromLd({
        "@type": "Product",
        brand: "Rolex",
        mpn: "126610LN",
        offers: [
          { price: "13499", priceCurrency: "USD" },
          { price: "99", priceCurrency: "USD" },
        ],
      }),
    );
    expect(r?.price).toBe(13499);
  });

  it("returns brand+ref with undefined price/currency when offers is missing", () => {
    const r = extractProductFromJsonLd(
      docFromLd({ "@type": "Product", brand: "Rolex", mpn: "16610" }),
    );
    expect(r).toMatchObject({ brand: "Rolex", reference: "16610" });
    expect(r?.price).toBeUndefined();
    expect(r?.currency).toBeUndefined();
  });

  it("returns null when there is no Product node", () => {
    expect(extractProductFromJsonLd(docFromLd({ "@type": "WebSite", name: "x" }))).toBeNull();
  });

  it("returns null for a Product missing brand or reference", () => {
    expect(
      extractProductFromJsonLd(
        docFromLd({ "@type": "Product", offers: { price: "100", priceCurrency: "USD" } }),
      ),
    ).toBeNull();
  });
});
