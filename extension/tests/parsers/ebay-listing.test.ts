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

  it("extracts USD price from JSON-LD offers", () => {
    expect(parse(FIXTURE_JSONLD)?.listedPriceUsd).toBe(11250);
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

  it("extracts price from the x-price-primary span", () => {
    expect(parse(FIXTURE_NO_JSONLD)?.listedPriceUsd).toBe(24500);
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
