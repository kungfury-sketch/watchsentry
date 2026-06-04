import { describe, expect, it, vi } from "vitest";
import {
  conditionFromTitle,
  fetchEbaySoldComps,
  filterByPriceRange,
  getEbayAppToken,
  normalizeCondition,
} from "../src/ebay";

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

  it("derives condition from the title when eBay omits the structured condition", async () => {
    const mockFetch = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            itemSummaries: [
              {
                itemId: "u",
                title: "Rolex Submariner 126610LN Unworn 2024 Full Set",
                price: { value: "15000", currency: "USD" },
              },
            ],
          }),
          { status: 200 },
        ),
    );
    const comps = await fetchEbaySoldComps({
      brand: "Rolex",
      reference: "126610LN",
      token: "t",
      fetchImpl: mockFetch as unknown as typeof fetch,
    });
    expect(comps[0]?.conditionTier).toBe("unworn");
  });

  it("drops a clean-titled listing priced far below the cluster (price-range filter)", async () => {
    const summaries = [14000, 14500, 13800, 14200].map((p, i) => ({
      itemId: `w${i}`,
      title: "Rolex Submariner 126610LN",
      price: { value: String(p), currency: "USD" },
    }));
    summaries.push({
      itemId: "accessory",
      title: "Rolex Submariner 126610LN", // clean title — only the price flags it
      price: { value: "145", currency: "USD" },
    });
    const mockFetch = vi.fn(
      async () => new Response(JSON.stringify({ itemSummaries: summaries }), { status: 200 }),
    );
    const comps = await fetchEbaySoldComps({
      brand: "Rolex",
      reference: "126610LN",
      token: "t",
      fetchImpl: mockFetch as unknown as typeof fetch,
    });
    expect(comps.map((c) => c.soldPriceUsd)).not.toContain(145);
    expect(comps).toHaveLength(4);
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

describe("conditionFromTitle", () => {
  it("classifies unworn / new-old-stock titles as 'unworn'", () => {
    expect(conditionFromTitle("Rolex Submariner 126610LN Unworn 2024 Full Set")).toBe("unworn");
    expect(conditionFromTitle("Omega Speedmaster New Old Stock NOS")).toBe("unworn");
  });
  it("classifies brand-new / BNIB titles as 'new'", () => {
    expect(conditionFromTitle("Tudor Black Bay 58 Brand New BNIB Sealed")).toBe("new");
  });
  it("classifies 'mint condition' / 'like new' as 'very_good'", () => {
    expect(conditionFromTitle("Rolex GMT-Master II 126710BLRO Mint Condition")).toBe("very_good");
    expect(conditionFromTitle("Cartier Santos Like New box & papers")).toBe("very_good");
  });
  it("does NOT read a 'mint green dial' colour as the condition 'mint' (false-positive guard)", () => {
    expect(conditionFromTitle("Rolex Submariner 126610LV Mint Green Dial")).toBeNull();
  });
  it("classifies pre-owned / used titles as 'good'", () => {
    expect(conditionFromTitle("Omega Seamaster 300M Pre-Owned Serviced")).toBe("good");
  });
  it("returns null when the title carries no condition signal", () => {
    expect(conditionFromTitle("Rolex Submariner Date 126610LN")).toBeNull();
    expect(conditionFromTitle(undefined)).toBeNull();
  });
});

describe("filterByPriceRange", () => {
  const comp = (p: number) => ({
    sourceListingId: `c${p}`,
    soldPriceUsd: p,
    conditionTier: "fair" as const,
    soldAt: "2026-06-01T00:00:00Z",
  });

  it("drops a low-priced accessory/part far below the watch cluster", () => {
    const kept = filterByPriceRange([
      comp(14000),
      comp(14500),
      comp(13800),
      comp(14200),
      comp(145),
    ]).map((c) => c.soldPriceUsd);
    expect(kept).not.toContain(145);
    expect(kept).toContain(14000);
  });

  it("drops a high outlier far above the cluster (e.g. a multi-watch lot)", () => {
    const kept = filterByPriceRange([
      comp(14000),
      comp(14500),
      comp(13800),
      comp(14200),
      comp(95000),
    ]).map((c) => c.soldPriceUsd);
    expect(kept).not.toContain(95000);
  });

  it("keeps everything when prices are tightly clustered", () => {
    expect(filterByPriceRange([comp(14000), comp(14500), comp(13800), comp(14200)])).toHaveLength(
      4,
    );
  });

  it("returns the input unchanged when there are too few comps to trust a center", () => {
    expect(filterByPriceRange([comp(14000), comp(145), comp(300)])).toHaveLength(3);
  });

  it("handles an empty list", () => {
    expect(filterByPriceRange([])).toEqual([]);
  });
});

describe("getEbayAppToken", () => {
  it("exchanges client credentials for an access token (Basic auth + client_credentials grant)", async () => {
    let captured: { url: string; init: RequestInit } | undefined;
    const mockFetch = vi.fn(async (url: string, init: RequestInit) => {
      captured = { url, init };
      return new Response(JSON.stringify({ access_token: "tok-123" }), { status: 200 });
    });
    const token = await getEbayAppToken("APPID", "CERTID", mockFetch as unknown as typeof fetch);
    expect(token).toBe("tok-123");
    expect(captured?.url).toContain("/identity/v1/oauth2/token");
    expect(captured?.init.method).toBe("POST");
    const headers = captured?.init.headers as Record<string, string>;
    expect(headers.Authorization).toBe(`Basic ${btoa("APPID:CERTID")}`);
    expect(String(captured?.init.body)).toContain("grant_type=client_credentials");
  });

  it("throws on a non-ok token response", async () => {
    const mockFetch = vi.fn(async () => new Response("unauthorized", { status: 401 }));
    await expect(getEbayAppToken("a", "b", mockFetch as unknown as typeof fetch)).rejects.toThrow(
      /eBay token error/,
    );
  });
});
