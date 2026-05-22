export type EnrichResponse = {
  status: "ok" | "no_data" | "unknown_reference";
  fairValue?: { medianUsd: number; sampleSize: number; windowDays: number };
  delta?: { absoluteUsd: number; percent: number };
  reference?: { brand: string; model: string; displayName: string };
  modelFallback?: boolean;
};

export async function enrichListing(
  payload: {
    brand: string;
    reference: string;
    condition: string;
    listedPriceUsd?: number;
    anonymousId?: string;
    model?: string;
  },
  opts: { apiBase: string; fetchImpl?: typeof fetch },
): Promise<EnrichResponse> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const res = await fetchImpl(`${opts.apiBase}/enrich`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`enrich error: ${res.status}`);
  return (await res.json()) as EnrichResponse;
}

// Fire-and-forget candidate registration. Called when the extension sees a card with
// a parseable (brand, model, reference) that /enrich didn't recognize. Backend
// accumulates these in candidate_refs; nightly cron validates against eBay sold-comps
// and promotes valid candidates into watch_references — letting the catalog grow
// toward the actual distribution of what users browse, without manual seeding.
export async function reportDiscovery(
  payload: { brand: string; model: string; reference: string },
  opts: { apiBase: string; fetchImpl?: typeof fetch },
): Promise<void> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  try {
    await fetchImpl(`${opts.apiBase}/discover`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Fire-and-forget — never block the badge render on this.
  }
}
