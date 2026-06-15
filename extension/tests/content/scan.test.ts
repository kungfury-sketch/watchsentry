import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

// Deterministic + offline: settings enabled, enrich always returns a good-deal verdict.
vi.mock("../../src/storage", () => ({
  getSettings: vi.fn(async () => ({ enabled: true, anonymousId: "test-uuid" })),
}));
vi.mock("../../src/api/client", () => ({
  enrichListing: vi.fn(async () => ({
    status: "ok",
    fairValue: { medianUsd: 12000, sampleSize: 100, windowDays: 90 },
    delta: { absoluteUsd: -1000, percent: -8.3 },
  })),
  reportDiscovery: vi.fn(async () => {}),
}));

import { enrichListing } from "../../src/api/client";
import { priceFields, scan } from "../../src/content/index";

const C24_LISTING = readFileSync(
  join(__dirname, "../fixtures/chrono24-listing-rolex-124060.html"),
  "utf8",
);
const C24_SEARCH = readFileSync(
  join(__dirname, "../fixtures/chrono24-search-rolex-submariner.html"),
  "utf8",
);

function loadGlobalDoc(html: string): void {
  document.open();
  document.write(html);
  document.close();
}

const OK_ENRICH: Awaited<ReturnType<typeof enrichListing>> = {
  status: "ok",
  fairValue: { medianUsd: 12000, sampleSize: 100, windowDays: 90 },
  delta: { absoluteUsd: -1000, percent: -8.3 },
};

afterEach(() => {
  vi.mocked(enrichListing).mockResolvedValue(OK_ENRICH);
  document.open();
  document.write("<!doctype html><html><body></body></html>");
  document.close();
});

describe("scan() — listing", () => {
  it("mounts exactly one badge and stays idempotent across re-scans", async () => {
    loadGlobalDoc(C24_LISTING);
    await scan("www.chrono24.com");
    expect(document.querySelectorAll("#watchsentry-mount")).toHaveLength(1);
    expect(document.querySelector(".ws-badge")).not.toBeNull();
    // A MutationObserver re-fire or SPA re-scan must NOT inject a second badge.
    await scan("www.chrono24.com");
    expect(document.querySelectorAll("#watchsentry-mount")).toHaveLength(1);
  });

  it("does nothing on an unsupported host", async () => {
    loadGlobalDoc(C24_LISTING);
    await scan("example.com");
    expect(document.querySelector("#watchsentry-mount")).toBeNull();
  });
});

describe("scan() — search", () => {
  it("badges each card once and does not re-badge on a second scan", async () => {
    loadGlobalDoc(C24_SEARCH);
    await scan("www.chrono24.com");
    const first = document.querySelectorAll(".ws-badge-compact").length;
    expect(first).toBeGreaterThan(0);
    await scan("www.chrono24.com");
    expect(document.querySelectorAll(".ws-badge-compact").length).toBe(first);
  });

  it("does not litter cards with empty spans for non-ok results [L7]", async () => {
    vi.mocked(enrichListing).mockResolvedValue({ status: "no_data" });
    loadGlobalDoc(C24_SEARCH);
    await scan("www.chrono24.com");
    expect(document.querySelectorAll(".ws-badge-compact")).toHaveLength(0);
    expect(document.querySelectorAll("span:empty")).toHaveLength(0);
  });
});

describe("priceFields — host-default currency [M7]", () => {
  it("keeps the parser's currency when present", () => {
    expect(priceFields({ listedPrice: 5000, listedCurrency: "EUR" }, "GBP")).toMatchObject({
      listedPrice: 5000,
      listedCurrency: "EUR",
    });
  });
  it("falls back to the host default when the parser found no currency", () => {
    expect(priceFields({ listedPrice: 5000, listedCurrency: null }, "GBP")).toMatchObject({
      listedPrice: 5000,
      listedCurrency: "GBP",
    });
  });
  it("does not invent a currency when there is no price", () => {
    expect(priceFields({ listedCurrency: null }, "GBP").listedCurrency).toBeUndefined();
  });
  it("leaves the USD back-compat path untouched (no default applied)", () => {
    const r = priceFields({ listedPriceUsd: 5000 }, "GBP");
    expect(r.listedPriceUsd).toBe(5000);
    expect(r.listedCurrency).toBeUndefined();
  });
});
