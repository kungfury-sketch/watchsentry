import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/fx", () => ({ FX_CACHE_KEY: "fx:rates:usd", fetchEcbRates: vi.fn() }));
vi.mock("../src/ebay", () => ({ getEbayAppToken: vi.fn(), fetchEbaySoldComps: vi.fn() }));
vi.mock("../src/repo", () => ({ listAllReferences: vi.fn(), insertSoldComps: vi.fn() }));
vi.mock("../src/discover", () => ({
  pickCandidatesForValidation: vi.fn(),
  markCandidateValidated: vi.fn(),
}));
vi.mock("../src/validate", () => ({ validateCandidate: vi.fn(), promoteCandidate: vi.fn() }));

import { runDailyRefresh } from "../src/cron";
import { markCandidateValidated, pickCandidatesForValidation } from "../src/discover";
import { fetchEbaySoldComps, getEbayAppToken } from "../src/ebay";
import { fetchEcbRates } from "../src/fx";
import type { Env } from "../src/index";
import { insertSoldComps, listAllReferences } from "../src/repo";
import { promoteCandidate, validateCandidate } from "../src/validate";

// Minimal Env that records the audit_log event_types the cron writes.
function mockEnv() {
  const events: string[] = [];
  const env = {
    CACHE: { put: vi.fn(async () => {}) },
    DB: {
      prepare: (sql: string) => ({
        bind: (...binds: unknown[]) => ({
          run: async () => {
            if (sql.includes("audit_log")) events.push(String(binds[0]));
          },
        }),
      }),
    },
    EBAY_APP_ID: "app",
    EBAY_CERT_ID: "cert",
  } as unknown as Env;
  return { env, events };
}

beforeEach(() => {
  vi.mocked(fetchEcbRates).mockResolvedValue({ USD: 1 });
  vi.mocked(getEbayAppToken).mockResolvedValue("token");
  vi.mocked(listAllReferences).mockResolvedValue([]);
  vi.mocked(fetchEbaySoldComps).mockResolvedValue([]);
  vi.mocked(insertSoldComps).mockResolvedValue(0);
  vi.mocked(pickCandidatesForValidation).mockResolvedValue([]);
  vi.mocked(validateCandidate).mockResolvedValue({ outcome: "insufficient_comps", comps: [] });
  vi.mocked(markCandidateValidated).mockResolvedValue(undefined);
  vi.mocked(promoteCandidate).mockResolvedValue(null);
});

describe("runDailyRefresh resilience", () => {
  it("survives an eBay token-fetch failure: logs and returns instead of aborting", async () => {
    vi.mocked(getEbayAppToken).mockRejectedValue(new Error("eBay 401"));
    const { env, events } = mockEnv();
    await expect(runDailyRefresh(env)).resolves.toBeDefined();
    expect(events).toContain("cron_ebay_token_error");
  });

  it("treats an FX refresh failure as non-fatal and still fetches the eBay token", async () => {
    vi.mocked(fetchEcbRates).mockRejectedValue(new Error("ECB down"));
    const { env, events } = mockEnv();
    await runDailyRefresh(env);
    expect(events).toContain("cron_fx_error");
    expect(getEbayAppToken).toHaveBeenCalled();
  });

  it("continues the ref loop when one reference's eBay fetch fails", async () => {
    vi.mocked(listAllReferences).mockResolvedValue([
      { id: 1, brand: "Rolex", model: "Submariner", referenceNumber: "124060", displayName: "a" },
      { id: 2, brand: "Omega", model: "Speedmaster", referenceNumber: "311", displayName: "b" },
    ]);
    vi.mocked(fetchEbaySoldComps)
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValueOnce([]);
    const { env, events } = mockEnv();
    await runDailyRefresh(env);
    expect(events).toContain("cron_ebay_ref_error");
    expect(fetchEbaySoldComps).toHaveBeenCalledTimes(2);
  });
});
