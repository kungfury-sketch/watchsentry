import { describe, expect, it } from "vitest";
import { ENRICH_CAP_PER_IP_PER_DAY, enrich } from "../src/enrich";
import type { Env } from "../src/index";
import { underDailyCap } from "../src/ratelimit";

const DAY = "2026-07-06";

function fakeKv(store: Map<string, string>): KVNamespace {
  return {
    get: async (k: string) => store.get(k) ?? null,
    put: async (k: string, v: string) => {
      store.set(k, v);
    },
  } as unknown as KVNamespace;
}

describe("underDailyCap", () => {
  it("counts calls under the cap and blocks at the cap", async () => {
    const store = new Map<string, string>();
    const kv = fakeKv(store);
    expect(await underDailyCap(kv, "enrich", "1.2.3.4", 2, DAY)).toBe(true);
    expect(await underDailyCap(kv, "enrich", "1.2.3.4", 2, DAY)).toBe(true);
    expect(store.get(`enrich:1.2.3.4:${DAY}`)).toBe("2");
    expect(await underDailyCap(kv, "enrich", "1.2.3.4", 2, DAY)).toBe(false);
  });

  it("does not increment once blocked", async () => {
    const store = new Map<string, string>([[`enrich:9.9.9.9:${DAY}`, "5"]]);
    expect(await underDailyCap(fakeKv(store), "enrich", "9.9.9.9", 5, DAY)).toBe(false);
    expect(store.get(`enrich:9.9.9.9:${DAY}`)).toBe("5");
  });

  it("isolates counters by id", async () => {
    const store = new Map<string, string>([[`enrich:1.1.1.1:${DAY}`, "5"]]);
    expect(await underDailyCap(fakeKv(store), "enrich", "2.2.2.2", 5, DAY)).toBe(true);
  });
});

describe("enrich() per-IP daily cap [H2-deeper]", () => {
  const RECENT = "2026-07-01T00:00:00Z";
  const ref = {
    id: 1,
    brand: "Rolex",
    model: "Submariner",
    reference_number: "124060",
    display_name: "Rolex Submariner 124060",
  };
  const comps = Array.from({ length: 20 }, () => ({
    sold_price_usd: 14000,
    sold_at: RECENT,
  }));

  function fakeEnv(kvStore: Map<string, string>): Env {
    return {
      DB: {
        prepare: (_sql: string) => ({
          bind: (..._binds: unknown[]) => ({
            first: async () => ref,
            all: async () => ({ results: comps }),
            run: async () => ({}),
          }),
        }),
      },
      CACHE: fakeKv(kvStore),
      EBAY_APP_ID: "x",
      EBAY_CERT_ID: "x",
    } as unknown as Env;
  }

  const req = { brand: "Rolex", reference: "124060", condition: "good" as const };

  it("serves normally under the cap and counts the request", async () => {
    const store = new Map<string, string>();
    const res = await enrich(fakeEnv(store), req, { ip: "1.2.3.4" });
    expect(res.status).toBe("ok");
    const key = [...store.keys()].find((k) => k.startsWith("enrich:1.2.3.4:"));
    expect(key).toBeDefined();
  });

  it("returns no_data (no D1 work) when the IP is over the daily cap", async () => {
    const day = new Date().toISOString().slice(0, 10);
    const store = new Map<string, string>([
      [`enrich:1.2.3.4:${day}`, String(ENRICH_CAP_PER_IP_PER_DAY)],
    ]);
    const res = await enrich(fakeEnv(store), req, { ip: "1.2.3.4" });
    expect(res.status).toBe("no_data");
  });

  it("fails open when no IP is available", async () => {
    const res = await enrich(fakeEnv(new Map()), req, { ip: undefined });
    expect(res.status).toBe("ok");
  });
});
