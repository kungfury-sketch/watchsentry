import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseChrono24Search, parsePriceAndCurrency } from "../../src/parsers/chrono24-search";

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
    expect(cards).toHaveLength(6);
  });

  it("extracts brand for each card", () => {
    const cards = parseFixture();
    for (const c of cards) expect(c.brand).toBe("Rolex");
  });

  it("extracts reference number from the dedicated ref line when it's clean", () => {
    const cards = parseFixture();
    expect(cards[0]?.referenceNumber).toBe("126610LN");
    expect(cards[1]?.referenceNumber).toBe("124060");
    expect(cards[2]?.referenceNumber).toBe("116610LV");
    expect(cards[3]?.referenceNumber).toBeNull();
  });

  it("extracts reference from descriptive seller text (digit-sequence fallback)", () => {
    const cards = parseFixture();
    // "Unworn 2026 / 124060 - New style box" — must skip 2026 (year), pick 124060
    expect(cards[4]?.referenceNumber).toBe("124060");
    // "41mm 126610LN Oystersteel ..." — must skip 41 (too short), pick 126610LN
    expect(cards[5]?.referenceNumber).toBe("126610LN");
  });

  it("parses listed price + currency for each card", () => {
    const cards = parseFixture();
    expect(cards[0]).toMatchObject({ listedPrice: 13499, listedCurrency: "USD" });
    expect(cards[1]).toMatchObject({ listedPrice: 10250, listedCurrency: "USD" });
    expect(cards[2]).toMatchObject({ listedPrice: 18000, listedCurrency: "USD" });
    expect(cards[3]).toMatchObject({ listedPrice: 9500, listedCurrency: "EUR" });
    expect(cards[4]).toMatchObject({ listedPrice: 14170, listedCurrency: "USD" });
    expect(cards[5]).toMatchObject({ listedPrice: 13074, listedCurrency: "USD" });
  });

  it("attaches the DOM element so consumers can mount badges", () => {
    const cards = parseFixture();
    for (const c of cards) expect(c.listingElement).toBeInstanceOf(HTMLElement);
  });

  it("extracts model as first word after the brand prefix", () => {
    const cards = parseFixture();
    // Title "Rolex Submariner Date" -> model "Submariner"
    expect(cards[0]?.model).toBe("Submariner");
    expect(cards[1]?.model).toBe("Submariner");
    expect(cards[2]?.model).toBe("Submariner");
    expect(cards[3]?.model).toBe("Submariner");
    expect(cards[4]?.model).toBe("Submariner");
    expect(cards[5]?.model).toBe("Submariner");
  });
});

describe("parsePriceAndCurrency", () => {
  it("parses US-formatted dollar prices", () => {
    expect(parsePriceAndCurrency("$13,499")).toEqual({ price: 13499, currency: "USD" });
  });
  it("parses euro prices in both US- and European-style thousands separators", () => {
    expect(parsePriceAndCurrency("€9,500")).toEqual({ price: 9500, currency: "EUR" });
    expect(parsePriceAndCurrency("6.800 €")).toEqual({ price: 6800, currency: "EUR" });
    expect(parsePriceAndCurrency("9 500 €")).toEqual({ price: 9500, currency: "EUR" });
  });
  it("parses pound and Swiss-franc (apostrophe-grouped) prices", () => {
    expect(parsePriceAndCurrency("£12,000")).toEqual({ price: 12000, currency: "GBP" });
    expect(parsePriceAndCurrency("CHF 8'500")).toEqual({ price: 8500, currency: "CHF" });
  });
  it("returns null price + null currency when there's no number or symbol", () => {
    expect(parsePriceAndCurrency("Price on request")).toEqual({ price: null, currency: null });
  });
});
