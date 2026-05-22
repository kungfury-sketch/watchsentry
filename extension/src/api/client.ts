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
