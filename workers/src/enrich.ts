import { z } from "zod";
import type { ConditionTier } from "./ebay";
import { type FairValue, computeFairValue } from "./fair-value";
import type { Env } from "./index";
import { findReference, getFairValueInputsFor } from "./repo";

export const enrichRequestSchema = z.object({
  brand: z.string().min(1).max(50),
  reference: z.string().min(1).max(50),
  condition: z.enum(["new", "unworn", "very_good", "good", "fair"]),
  listedPriceUsd: z.number().positive().max(10_000_000).optional(),
  anonymousId: z.string().uuid().optional(),
});

export type EnrichRequest = z.infer<typeof enrichRequestSchema>;

export type EnrichResponse = {
  status: "ok" | "no_data" | "unknown_reference";
  fairValue?: FairValue;
  delta?: { absoluteUsd: number; percent: number };
  reference?: { brand: string; model: string; displayName: string };
};

const CACHE_TTL_SECONDS = 60 * 60 * 6;

export function enrichmentCacheKey(args: {
  brand: string;
  reference: string;
  condition: ConditionTier;
}): string {
  return `enrich:${args.brand}:${args.reference}:${args.condition}`;
}

export async function enrich(env: Env, req: EnrichRequest): Promise<EnrichResponse> {
  const cacheKey = enrichmentCacheKey({
    brand: req.brand,
    reference: req.reference,
    condition: req.condition,
  });

  const cached = await env.CACHE.get<EnrichResponse>(cacheKey, "json");
  if (cached) return maybeAttachDelta(cached, req.listedPriceUsd);

  const ref = await findReference(env.DB, req.brand, req.reference);
  if (!ref) {
    const resp: EnrichResponse = { status: "unknown_reference" };
    await env.CACHE.put(cacheKey, JSON.stringify(resp), { expirationTtl: CACHE_TTL_SECONDS });
    return resp;
  }

  const comps = await getFairValueInputsFor(env.DB, ref.id, req.condition);
  const fv = computeFairValue(comps);
  if (!fv) {
    const resp: EnrichResponse = {
      status: "no_data",
      reference: { brand: ref.brand, model: ref.model, displayName: ref.displayName },
    };
    await env.CACHE.put(cacheKey, JSON.stringify(resp), { expirationTtl: CACHE_TTL_SECONDS });
    return resp;
  }

  const resp: EnrichResponse = {
    status: "ok",
    fairValue: fv,
    reference: { brand: ref.brand, model: ref.model, displayName: ref.displayName },
  };
  await env.CACHE.put(cacheKey, JSON.stringify(resp), { expirationTtl: CACHE_TTL_SECONDS });
  return maybeAttachDelta(resp, req.listedPriceUsd);
}

function maybeAttachDelta(resp: EnrichResponse, listedPriceUsd?: number): EnrichResponse {
  if (resp.status !== "ok" || !resp.fairValue || listedPriceUsd === undefined) return resp;
  const abs = listedPriceUsd - resp.fairValue.medianUsd;
  const pct = (abs / resp.fairValue.medianUsd) * 100;
  return {
    ...resp,
    delta: { absoluteUsd: Math.round(abs), percent: Math.round(pct * 10) / 10 },
  };
}
