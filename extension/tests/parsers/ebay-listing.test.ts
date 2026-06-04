import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseEbayListing } from "../../src/parsers/ebay-listing";

const FIXTURE_JSONLD = readFileSync(
  join(__dirname, "../fixtures/ebay-listing-rolex-116610LN.html"),
  "utf8",
);
const FIXTURE_NO_JSONLD = readFileSync(
  join(__dirname, "../fixtures/ebay-listing-rolex-no-jsonld.html"),
  "utf8",
);

function parse(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return parseEbayListing(doc);
}

describe("parseEbayListing — JSON-LD path", () => {
  it("returns a parsed listing when JSON-LD Product is present", () => {
    const r = parse(FIXTURE_JSONLD);
    expect(r).not.toBeNull();
  });

  it("extracts brand from JSON-LD", () => {
    expect(parse(FIXTURE_JSONLD)?.brand).toBe("Rolex");
  });

  it("extracts reference from JSON-LD mpn (preferred over title regex)", () => {
    expect(parse(FIXTURE_JSONLD)?.referenceNumber).toBe("116610LN");
  });

  it("extracts model from JSON-LD", () => {
    expect(parse(FIXTURE_JSONLD)?.model).toBe("Submariner");
  });

  it("extracts price + currency from JSON-LD offers", () => {
    expect(parse(FIXTURE_JSONLD)?.listedPrice).toBe(11250);
    expect(parse(FIXTURE_JSONLD)?.listedCurrency).toBe("USD");
  });

  it("maps schema.org UsedCondition to 'good' tier", () => {
    expect(parse(FIXTURE_JSONLD)?.conditionTier).toBe("good");
  });
});

describe("parseEbayListing — item-specifics fallback (no JSON-LD)", () => {
  it("returns a parsed listing using the item-specifics section", () => {
    const r = parse(FIXTURE_NO_JSONLD);
    expect(r).not.toBeNull();
  });

  it("extracts brand from item-specifics row", () => {
    expect(parse(FIXTURE_NO_JSONLD)?.brand).toBe("Rolex");
  });

  it("extracts reference from the Reference Number item-specifics row", () => {
    expect(parse(FIXTURE_NO_JSONLD)?.referenceNumber).toBe("5513");
  });

  it("extracts model from the Model item-specifics row", () => {
    expect(parse(FIXTURE_NO_JSONLD)?.model).toBe("Submariner");
  });

  it("extracts price + currency from the x-price-primary span", () => {
    expect(parse(FIXTURE_NO_JSONLD)?.listedPrice).toBe(24500);
    expect(parse(FIXTURE_NO_JSONLD)?.listedCurrency).toBe("USD");
  });

  it("maps 'Pre-Owned' condition string to 'good' tier", () => {
    expect(parse(FIXTURE_NO_JSONLD)?.conditionTier).toBe("good");
  });
});

describe("parseEbayListing — defensive paths", () => {
  it("returns null on an empty document", () => {
    const doc = new DOMParser().parseFromString("<html></html>", "text/html");
    expect(parseEbayListing(doc)).toBeNull();
  });

  it("returns null when brand+ref cannot be derived", () => {
    const doc = new DOMParser().parseFromString(
      "<html><body><div>Just a random page</div></body></html>",
      "text/html",
    );
    expect(parseEbayListing(doc)).toBeNull();
  });
});

function jsonLdConditionDoc(itemCondition: string): string {
  return `<!doctype html><html><head><script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Rolex Submariner 116610LN",
    brand: { "@type": "Brand", name: "Rolex" },
    mpn: "116610LN",
    offers: { "@type": "Offer", price: "11250", priceCurrency: "USD", itemCondition },
  })}</script></head><body></body></html>`;
}

function specificsConditionDoc(condition: string): string {
  const row = (label: string, value: string) =>
    `<div class="ux-layout-section__row"><div class="ux-labels-values__labels">${label}</div><div class="ux-labels-values__values">${value}</div></div>`;
  return `<!doctype html><html><body>${row("Brand", "Rolex")}${row("Reference Number", "5513")}${row("Condition", condition)}<span class="x-price-primary">$24,500</span></body></html>`;
}

describe("parseEbayListing — condition mapping", () => {
  it.each([
    ["https://schema.org/NewCondition", "new"],
    ["https://schema.org/RefurbishedCondition", "very_good"],
    ["https://schema.org/DamagedCondition", "fair"],
    ["http://schema.org/NewCondition", "new"], // http variant — regression guard
  ])("maps JSON-LD itemCondition %s -> %s", (cond, tier) => {
    expect(parse(jsonLdConditionDoc(cond))?.conditionTier).toBe(tier);
  });

  it.each([
    ["Brand New", "new"],
    ["New (Other)", "unworn"],
    ["Unworn", "unworn"],
    ["Excellent condition", "very_good"],
    ["For parts or not working", "fair"],
  ])("maps item-specifics Condition '%s' -> %s", (cond, tier) => {
    expect(parse(specificsConditionDoc(cond))?.conditionTier).toBe(tier);
  });
});
