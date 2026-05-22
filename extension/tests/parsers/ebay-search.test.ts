import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseEbaySearch } from "../../src/parsers/ebay-search";

const FIXTURE = readFileSync(
  join(__dirname, "../fixtures/ebay-search-rolex-submariner.html"),
  "utf8",
);

function parseFixture() {
  const doc = new DOMParser().parseFromString(FIXTURE, "text/html");
  return parseEbaySearch(doc);
}

describe("parseEbaySearch", () => {
  it("returns one card per real .s-item (placeholders excluded)", () => {
    const cards = parseFixture();
    // 5 real items + 1 placeholder "Shop on eBay" — parser should skip placeholder
    expect(cards).toHaveLength(5);
  });

  it("extracts brand for each card", () => {
    const cards = parseFixture();
    for (const c of cards) expect(c.brand).toBe("Rolex");
  });

  it("extracts reference from each title (5-7 digit + optional dial-code suffix)", () => {
    const cards = parseFixture();
    expect(cards[0]?.referenceNumber).toBe("116610LN");
    expect(cards[1]?.referenceNumber).toBe("124060");
    expect(cards[2]?.referenceNumber).toBe("16610LV");
    expect(cards[3]?.referenceNumber).toBe("116619LB");
    expect(cards[4]?.referenceNumber).toBe("16800");
  });

  it("extracts model as first word after brand prefix", () => {
    const cards = parseFixture();
    for (const c of cards) expect(c.model).toBe("Submariner");
  });

  it("parses USD listed price from .s-item__price", () => {
    const cards = parseFixture();
    expect(cards[0]?.listedPriceUsd).toBe(11499);
    expect(cards[1]?.listedPriceUsd).toBe(13200);
    expect(cards[2]?.listedPriceUsd).toBe(18800);
    expect(cards[3]?.listedPriceUsd).toBe(36950);
    expect(cards[4]?.listedPriceUsd).toBe(9750);
  });

  it("attaches the DOM element so consumers can mount badges", () => {
    const cards = parseFixture();
    for (const c of cards) expect(c.listingElement).toBeInstanceOf(HTMLElement);
  });

  it("skips placeholder cards (Shop on eBay) with no real listing data", () => {
    // Placeholder li was in the fixture but should not appear in results.
    const cards = parseFixture();
    expect(cards.some((c) => c.referenceNumber === null && c.brand === null)).toBe(false);
  });

  it("returns empty array on a document with no .s-item nodes", () => {
    const doc = new DOMParser().parseFromString("<html><body></body></html>", "text/html");
    expect(parseEbaySearch(doc)).toEqual([]);
  });
});
