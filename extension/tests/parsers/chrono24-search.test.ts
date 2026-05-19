import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseChrono24Search } from "../../src/parsers/chrono24-search";

const FIXTURE = readFileSync(
  join(__dirname, "../fixtures/chrono24-search-rolex-submariner.html"),
  "utf8",
);

function parseFixture() {
  const doc = new DOMParser().parseFromString(FIXTURE, "text/html");
  return parseChrono24Search(doc);
}

describe("parseChrono24Search", () => {
  it("returns one card per .wt-listing-item", () => {
    const cards = parseFixture();
    expect(cards).toHaveLength(4);
  });

  it("extracts brand for each card", () => {
    const cards = parseFixture();
    for (const c of cards) expect(c.brand).toBe("Rolex");
  });

  it("extracts reference number from the dedicated ref line", () => {
    const cards = parseFixture();
    expect(cards[0]?.referenceNumber).toBe("126610LN");
    expect(cards[1]?.referenceNumber).toBe("124060");
    expect(cards[2]?.referenceNumber).toBe("116610LV");
    expect(cards[3]?.referenceNumber).toBeNull();
  });

  it("parses listed price in USD; non-USD currencies fall back to the parsed number", () => {
    const cards = parseFixture();
    expect(cards[0]?.listedPriceUsd).toBe(13499);
    expect(cards[1]?.listedPriceUsd).toBe(10250);
    expect(cards[2]?.listedPriceUsd).toBe(18000);
    expect(typeof cards[3]?.listedPriceUsd).toBe("number");
  });

  it("attaches the DOM element so consumers can mount badges", () => {
    const cards = parseFixture();
    for (const c of cards) expect(c.listingElement).toBeInstanceOf(HTMLElement);
  });
});
