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

  it("passes an abort signal to fetch so hung requests can time out", async () => {
    let signal: AbortSignal | undefined;
    const mock = vi.fn(async (_url: string | URL | Request, opts?: RequestInit) => {
      signal = (opts?.signal as AbortSignal | undefined) ?? undefined;
      return new Response(
        JSON.stringify({
          status: "ok",
          fairValue: { medianUsd: 1, sampleSize: 1, windowDays: 90 },
        }),
        { status: 200 },
      );
    });
    await enrichListing(
      { brand: "Rolex", reference: "124060", condition: "very_good" },
      { apiBase: "https://api.example.com", fetchImpl: mock },
    );
    expect(signal).toBeInstanceOf(AbortSignal);
  });

  it("aborts a hung request once timeoutMs elapses", async () => {
    vi.useFakeTimers();
    try {
      const mock = vi.fn(
        (_url: string | URL | Request, opts?: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            opts?.signal?.addEventListener("abort", () =>
              reject(new DOMException("aborted", "AbortError")),
            );
          }),
      );
      const p = enrichListing(
        { brand: "Rolex", reference: "124060", condition: "very_good" },
        { apiBase: "https://api.example.com", fetchImpl: mock, timeoutMs: 5000 },
      );
      const settled = expect(p).rejects.toThrow();
      await vi.advanceTimersByTimeAsync(5001);
      await settled;
    } finally {
      vi.useRealTimers();
    }
  });
});
