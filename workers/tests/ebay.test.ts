import { describe, expect, it, vi } from "vitest";
import { fetchEbaySoldComps, normalizeCondition } from "../src/ebay";

describe("normalizeCondition", () => {
  it("maps NEW to 'new'", () => {
    expect(normalizeCondition("NEW")).toBe("new");
  });
  it("maps NEW_OTHER to 'unworn'", () => {
    expect(normalizeCondition("NEW_OTHER")).toBe("unworn");
  });
  it("maps USED_EXCELLENT to 'very_good'", () => {
    expect(normalizeCondition("USED_EXCELLENT")).toBe("very_good");
  });
  it("maps USED_GOOD to 'good'", () => {
    expect(normalizeCondition("USED_GOOD")).toBe("good");
  });
  it("maps unknown to 'fair' as conservative default", () => {
    expect(normalizeCondition("WEIRD")).toBe("fair");
  });
});

describe("fetchEbaySoldComps", () => {
  it("returns parsed comps from a mocked Browse API response", async () => {
    const mockFetch = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            itemSummaries: [
              {
                itemId: "v1|123|0",
                price: { value: "9450.00", currency: "USD" },
                condition: "USED_EXCELLENT",
                itemEndDate: "2026-04-20T18:00:00Z",
              },
            ],
          }),
          { status: 200 },
        ),
    );
    const comps = await fetchEbaySoldComps({
      brand: "Rolex",
      reference: "124060",
      token: "stub-token",
      fetchImpl: mockFetch as unknown as typeof fetch,
    });
    expect(comps).toHaveLength(1);
    expect(comps[0]).toMatchObject({
      sourceListingId: "v1|123|0",
      soldPriceUsd: 9450,
      conditionTier: "very_good",
      soldAt: "2026-04-20T18:00:00Z",
    });
  });

  it("filters out non-USD listings", async () => {
    const mockFetch = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            itemSummaries: [
              { itemId: "a", price: { value: "100", currency: "EUR" }, condition: "NEW" },
              { itemId: "b", price: { value: "200", currency: "USD" }, condition: "NEW" },
            ],
          }),
          { status: 200 },
        ),
    );
    const comps = await fetchEbaySoldComps({
      brand: "Rolex",
      reference: "124060",
      token: "t",
      fetchImpl: mockFetch as unknown as typeof fetch,
    });
    expect(comps.map((c) => c.sourceListingId)).toEqual(["b"]);
  });

  it("throws on non-ok response", async () => {
    const mockFetch = vi.fn(async () => new Response("rate limited", { status: 429 }));
    await expect(
      fetchEbaySoldComps({
        brand: "Rolex",
        reference: "124060",
        token: "t",
        fetchImpl: mockFetch as unknown as typeof fetch,
      }),
    ).rejects.toThrow(/eBay search error/);
  });
});
