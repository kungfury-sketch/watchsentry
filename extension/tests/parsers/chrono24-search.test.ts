import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseChrono24Search } from "../../src/parsers/chrono24-search";
import { parsePriceAndCurrency } from "../../src/parsers/price";

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

  it("does not fabricate a price from card text when the price node is missing or renamed", () => {
    // Regression [C1]: if Chrono24 renames the price <p> class, the price lookup must
    // fail closed (null). It must NOT fall back to the card's full text, where
    // parsePriceAndCurrency would grab the reference number as a six-figure "price"
    // and paint a fairly-priced watch bright red.
    const html = `<!doctype html><html><body>
      <div class="wt-listing-item js-listing-item listing-item">
        <p class="text-bold text-ellipsis">Rolex Submariner Date</p>
        <p class="text-ellipsis">126610LN</p>
        <p class="price-class-renamed-by-chrono24">$13,499</p>
      </div>
    </body></html>`;
    const doc = new DOMParser().parseFromString(html, "text/html");
    const cards = parseChrono24Search(doc);
    expect(cards).toHaveLength(1);
    // Reference still resolves from its dedicated line…
    expect(cards[0]?.referenceNumber).toBe("126610LN");
    // …but a missing price node must yield no price, never the reference digits.
    expect(cards[0]?.listedPrice).toBeNull();
    expect(cards[0]?.listedCurrency).toBeNull();
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
  it("treats a trailing .00 / ,00 as cents, not extra digits", () => {
    expect(parsePriceAndCurrency("$24,500.00")).toEqual({ price: 24500, currency: "USD" });
    expect(parsePriceAndCurrency("6.800,00 €")).toEqual({ price: 6800, currency: "EUR" });
  });
  it("returns null price + null currency when there's no number or symbol", () => {
    expect(parsePriceAndCurrency("Price on request")).toEqual({ price: null, currency: null });
  });
});
