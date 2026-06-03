import { describe, expect, it, vi } from "vitest";
import { convertToUsd, fetchEcbRates } from "../src/fx";

describe("convertToUsd", () => {
  it("converts a foreign amount to USD using rates expressed as foreign-units-per-USD", () => {
    // Chrono24 shows a German listing at €6,800. ECB: 1 USD = 0.92 EUR.
    // 6800 EUR / 0.92 = $7,391.
    expect(convertToUsd(6800, "EUR", { EUR: 0.92 })).toBe(7391);
  });

  it("passes USD through unchanged even when USD is absent from the rates table", () => {
    expect(convertToUsd(9500, "USD", {})).toBe(9500);
  });

  it("returns null for a currency missing from the rates table (don't fabricate a delta)", () => {
    expect(convertToUsd(100000, "JPY", { EUR: 0.92, GBP: 0.79 })).toBeNull();
  });

  it("returns null on a zero or negative rate instead of dividing by zero", () => {
    expect(convertToUsd(6800, "EUR", { EUR: 0 })).toBeNull();
    expect(convertToUsd(6800, "EUR", { EUR: -0.92 })).toBeNull();
  });

  it("treats the currency code case-insensitively (JSON-LD usually upper, be defensive)", () => {
    expect(convertToUsd(6800, "eur", { EUR: 0.92 })).toBe(7391);
  });

  it("returns null for non-finite or non-positive amounts", () => {
    expect(convertToUsd(Number.NaN, "EUR", { EUR: 0.92 })).toBeNull();
    expect(convertToUsd(0, "EUR", { EUR: 0.92 })).toBeNull();
    expect(convertToUsd(-100, "EUR", { EUR: 0.92 })).toBeNull();
  });
});

describe("fetchEcbRates", () => {
  it("returns frankfurter rates plus an explicit USD:1 (frankfurter omits the base currency)", async () => {
    const mockFetch = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            amount: 1,
            base: "USD",
            date: "2026-06-03",
            rates: { EUR: 0.92, GBP: 0.79 },
          }),
          { status: 200 },
        ),
    );
    const rates = await fetchEcbRates(mockFetch as unknown as typeof fetch);
    expect(rates).toMatchObject({ USD: 1, EUR: 0.92, GBP: 0.79 });
  });

  it("throws on a non-ok response so the cron keeps the last good rates in place", async () => {
    const mockFetch = vi.fn(async () => new Response("err", { status: 503 }));
    await expect(fetchEcbRates(mockFetch as unknown as typeof fetch)).rejects.toThrow(/fx/i);
  });
});
