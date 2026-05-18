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
});
