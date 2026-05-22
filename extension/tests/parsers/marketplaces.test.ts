import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseCrownAndCaliberListing } from "../../src/parsers/crownandcaliber-listing";
import { parseCrownAndCaliberSearch } from "../../src/parsers/crownandcaliber-search";
import { parseHodinkeeListing } from "../../src/parsers/hodinkee-listing";
import { parseWatchchartsListing } from "../../src/parsers/watchcharts-listing";
import { parseWatchchartsSearch } from "../../src/parsers/watchcharts-search";
import { parseWatchfinderListing } from "../../src/parsers/watchfinder-listing";
import { parseWatchfinderSearch } from "../../src/parsers/watchfinder-search";

function fixture(name: string): string {
  return readFileSync(join(__dirname, "../fixtures", name), "utf8");
}

function asDoc(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

describe("parseWatchfinderListing", () => {
  const doc = asDoc(fixture("watchfinder-listing.html"));
  const result = parseWatchfinderListing(doc);
  it("returns a parsed listing", () => expect(result).not.toBeNull());
  it("extracts brand", () => expect(result?.brand).toBe("Rolex"));
  it("extracts reference", () => expect(result?.referenceNumber).toBe("116610LN"));
  it("extracts model", () => expect(result?.model).toBe("Submariner"));
  it("extracts USD price", () => expect(result?.listedPriceUsd).toBe(11800));
  it("maps Pre-Owned -> 'good' tier (via JSON-LD UsedCondition)", () =>
    expect(result?.conditionTier).toBe("good"));
});

describe("parseWatchfinderSearch", () => {
  const cards = parseWatchfinderSearch(asDoc(fixture("watchfinder-search.html")));
  it("returns one card per tile", () => expect(cards).toHaveLength(3));
  it("extracts brand for each card", () => {
    for (const c of cards) expect(c.brand).toBe("Rolex");
  });
  it("extracts reference from prod-tile-ref line", () => {
    expect(cards[0]?.referenceNumber).toBe("116610LN");
    expect(cards[1]?.referenceNumber).toBe("124060");
    expect(cards[2]?.referenceNumber).toBe("16610LV");
  });
  it("extracts model = first word after brand", () => {
    for (const c of cards) expect(c.model).toBe("Submariner");
  });
  it("parses USD price", () => {
    expect(cards[0]?.listedPriceUsd).toBe(11500);
    expect(cards[1]?.listedPriceUsd).toBe(13250);
    expect(cards[2]?.listedPriceUsd).toBe(18900);
  });
});

describe("parseCrownAndCaliberListing", () => {
  const result = parseCrownAndCaliberListing(asDoc(fixture("crownandcaliber-listing.html")));
  it("returns a parsed listing", () => expect(result).not.toBeNull());
  it("extracts brand", () => expect(result?.brand).toBe("Rolex"));
  it("extracts reference", () => expect(result?.referenceNumber).toBe("116610LN"));
  it("extracts model", () => expect(result?.model).toBe("Submariner"));
  it("extracts USD price", () => expect(result?.listedPriceUsd).toBe(11250));
});

describe("parseCrownAndCaliberSearch", () => {
  const cards = parseCrownAndCaliberSearch(asDoc(fixture("crownandcaliber-search.html")));
  it("returns one card per product", () => expect(cards).toHaveLength(3));
  it("extracts references for all cards", () => {
    expect(cards[0]?.referenceNumber).toBe("116610LN");
    expect(cards[1]?.referenceNumber).toBe("16800");
    expect(cards[2]?.referenceNumber).toBe("116619LB");
  });
  it("extracts model = first word after brand for all cards", () => {
    for (const c of cards) expect(c.model).toBe("Submariner");
  });
});

describe("parseWatchchartsListing", () => {
  const result = parseWatchchartsListing(asDoc(fixture("watchcharts-listing.html")));
  it("returns a parsed listing", () => expect(result).not.toBeNull());
  it("extracts brand + reference + model", () => {
    expect(result?.brand).toBe("Rolex");
    expect(result?.referenceNumber).toBe("116610LN");
    expect(result?.model).toBe("Submariner");
  });
  it("extracts USD price", () => expect(result?.listedPriceUsd).toBe(11400));
});

describe("parseWatchchartsSearch", () => {
  const cards = parseWatchchartsSearch(asDoc(fixture("watchcharts-search.html")));
  it("returns one card per listing", () => expect(cards).toHaveLength(3));
  it("extracts references for all cards", () => {
    expect(cards[0]?.referenceNumber).toBe("116610LN");
    expect(cards[1]?.referenceNumber).toBe("126610LV");
    expect(cards[2]?.referenceNumber).toBe("14060M");
  });
});

describe("parseHodinkeeListing", () => {
  const result = parseHodinkeeListing(asDoc(fixture("hodinkee-listing.html")));
  it("returns a parsed listing", () => expect(result).not.toBeNull());
  it("extracts brand + reference + model from JSON-LD", () => {
    expect(result?.brand).toBe("Rolex");
    expect(result?.referenceNumber).toBe("116610LN");
    expect(result?.model).toBe("Submariner");
  });
  it("extracts USD price", () => expect(result?.listedPriceUsd).toBe(12500));
  it("returns null on a non-watch product page (no JSON-LD)", () => {
    const doc = asDoc("<html><body><p>About Us</p></body></html>");
    expect(parseHodinkeeListing(doc)).toBeNull();
  });
});
