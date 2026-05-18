import { describe, expect, it, vi } from "vitest";
import { enrichListing } from "../../src/api/client";

describe("enrichListing", () => {
  it("posts to /enrich and returns the response body", async () => {
    const mock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            status: "ok",
            fairValue: { medianUsd: 9200, sampleSize: 12, windowDays: 90 },
          }),
          { status: 200 },
        ),
    );
    const r = await enrichListing(
      { brand: "Rolex", reference: "124060", condition: "very_good", listedPriceUsd: 9500 },
      { apiBase: "https://api.example.com", fetchImpl: mock },
    );
    expect(r.status).toBe("ok");
    expect(r.fairValue?.medianUsd).toBe(9200);
    expect(mock).toHaveBeenCalledTimes(1);
  });

  it("throws when server returns non-2xx", async () => {
    const mock = vi.fn(async () => new Response("oops", { status: 500 }));
    await expect(
      enrichListing(
        { brand: "Rolex", reference: "124060", condition: "very_good" },
        { apiBase: "https://api.example.com", fetchImpl: mock },
      ),
    ).rejects.toThrow(/enrich error: 500/);
  });
});
