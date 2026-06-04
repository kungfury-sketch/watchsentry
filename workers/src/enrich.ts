import { z } from "zod";
import { type ConditionTier, filterByPriceRange } from "./ebay";
import { type FairValue, computeFairValue } from "./fair-value";
import { FX_CACHE_KEY, type FxRates, convertToUsd } from "./fx";
import type { Env } from "./index";
import { normalizeReferenceCandidates } from "./normalize";
import { type WatchRef, findReference, getFairValueInputsFor, getModelLevelComps } from "./repo";

export const enrichRequestSchema = z.object({
  brand: z.string().min(1).max(50),
  reference: z.string().min(1).max(50),
  condition: z.enum(["new", "unworn", "very_good", "good", "fair"]),
  // Back-compat: older extension builds send the price already in USD.
  listedPriceUsd: z.number().positive().max(10_000_000).optional(),
  // Newer builds send the raw listing price + its ISO-4217 currency so the
  // worker can convert to USD before computing the delta (most non-US Chrono24
  // listings are EUR/GBP/CHF — comparing those against a USD median is wrong).
  listedPrice: z.number().positive().max(10_000_000).optional(),
  listedCurrency: z.string().length(3).optional(),
  anonymousId: z.string().uuid().optional(),
  model: z.string().min(1).max(80).optional(),
});

export type EnrichRequest = z.infer<typeof enrichRequestSchema>;

export type EnrichResponse = {
  status: "ok" | "no_data" | "unknown_reference";
  fairValue?: FairValue;
  delta?: { absoluteUsd: number; percent: number };
  reference?: { brand: string; model: string; displayName: string };
  tier?: ConditionTier;
  tierFallback?: boolean;
  modelFallback?: boolean;
};

// Minimum sold-comps required to compute a model-level fair value with usable confidence.
// Per-ref median uses LIMIT 500; we set this higher than computeFairValue's own threshold
// to avoid badging on thin/noisy model-wide data.
const MODEL_FALLBACK_MIN_COMPS = 50;

const CACHE_TTL_SECONDS = 60 * 60 * 6;
const DAILY_ENRICHMENT_CAP = 200;

export function enrichmentCacheKey(args: {
  brand: string;
  reference: string;
  condition: ConditionTier;
}): string {
  return `enrich:${args.brand}:${args.reference}:${args.condition}`;
}

export async function getCompsWithFallback(
  db: D1Database,
  referenceId: number,
  requested: ConditionTier,
): Promise<{
  comps: Awaited<ReturnType<typeof getFairValueInputsFor>>;
  actualTier: ConditionTier;
  fallbackUsed: boolean;
}> {
  const primary = await getFairValueInputsFor(db, referenceId, requested);
  if (primary.length > 0) {
    return { comps: primary, actualTier: requested, fallbackUsed: false };
  }
  if (requested === "fair") {
    return { comps: primary, actualTier: "fair", fallbackUsed: false };
  }
  const fallback = await getFairValueInputsFor(db, referenceId, "fair");
  return { comps: fallback, actualTier: "fair", fallbackUsed: true };
}

export async function touchUser(
  db: D1Database,
  anonymousId: string,
  today: string = new Date().toISOString().slice(0, 10),
): Promise<{ count: number; capped: boolean }> {
  // Single atomic upsert: insert-or-increment and RETURN the resulting count in one
  // statement. A search page fans out dozens of concurrent /enrich calls; a SELECT-then-
  // UPDATE would let two read the same count and both write count+1 (lost update), silently
  // leaking past the daily cap. The CASE resets the counter on a new day. [H3]
  const row = await db
    .prepare(
      `INSERT INTO users (anonymous_id, enrichment_count_today, counter_day, last_seen_at)
       VALUES (?1, 1, ?2, datetime('now'))
       ON CONFLICT(anonymous_id) DO UPDATE SET
         enrichment_count_today =
           CASE WHEN users.counter_day = ?2 THEN users.enrichment_count_today + 1 ELSE 1 END,
         counter_day = ?2,
         last_seen_at = datetime('now')
       RETURNING enrichment_count_today AS count`,
    )
    .bind(anonymousId, today)
    .first<{ count: number }>();
  const count = row?.count ?? 1;
  return { count, capped: count > DAILY_ENRICHMENT_CAP };
}

// Resolves the listing price to USD for delta computation. Prefers an explicit
// USD price (back-compat); otherwise converts price+currency via the rate table.
// Returns undefined when conversion isn't possible so the caller omits the delta
// rather than showing a wrong one.
export function resolveListedPriceUsd(
  req: { listedPriceUsd?: number; listedPrice?: number; listedCurrency?: string },
  rates: FxRates | null,
): number | undefined {
  if (req.listedPriceUsd !== undefined) return req.listedPriceUsd;
  if (req.listedPrice !== undefined && req.listedCurrency) {
    if (!rates) return undefined;
    return convertToUsd(req.listedPrice, req.listedCurrency, rates) ?? undefined;
  }
  return undefined;
}

// Env-bound wrapper: reads cached FX rates from KV only when a genuine
// foreign-currency conversion is needed (USD requests skip the KV read).
async function resolveListedPriceForEnv(env: Env, req: EnrichRequest): Promise<number | undefined> {
  if (req.listedPriceUsd !== undefined) return req.listedPriceUsd;
  if (req.listedPrice === undefined || !req.listedCurrency) return undefined;
  const rates: FxRates | null =
    req.listedCurrency.toUpperCase() === "USD"
      ? { USD: 1 }
      : await env.CACHE.get<FxRates>(FX_CACHE_KEY, "json");
  return resolveListedPriceUsd(req, rates);
}

export async function enrich(env: Env, req: EnrichRequest): Promise<EnrichResponse> {
  const listedPriceUsd = await resolveListedPriceForEnv(env, req);
  const cacheKey = enrichmentCacheKey({
    brand: req.brand,
    reference: req.reference,
    condition: req.condition,
  });

  // Cache hits don't count toward the daily cap — the cap protects D1 work, not KV reads.
  const cached = await env.CACHE.get<EnrichResponse>(cacheKey, "json");
  if (cached) return maybeAttachDelta(cached, listedPriceUsd);

  if (req.anonymousId) {
    const u = await touchUser(env.DB, req.anonymousId);
    if (u.capped) return { status: "no_data" };
  }

  let ref: WatchRef | null = null;
  for (const candidate of normalizeReferenceCandidates(req.brand, req.reference)) {
    ref = await findReference(env.DB, req.brand, candidate);
    if (ref) break;
  }
  if (!ref) {
    const modelResp = await tryModelFallback(env, req);
    if (modelResp) {
      await env.CACHE.put(cacheKey, JSON.stringify(modelResp), {
        expirationTtl: CACHE_TTL_SECONDS,
      });
      return maybeAttachDelta(modelResp, listedPriceUsd);
    }
    const resp: EnrichResponse = { status: "unknown_reference" };
    await env.CACHE.put(cacheKey, JSON.stringify(resp), { expirationTtl: CACHE_TTL_SECONDS });
    return resp;
  }

  const { comps, actualTier, fallbackUsed } = await getCompsWithFallback(
    env.DB,
    ref.id,
    req.condition,
  );
  // Drop accessory/parts and multi-watch-lot outliers before the median. The ingest-time
  // filter never touched legacy comps, so cleaning on read protects every reference. [H1]
  const fv = computeFairValue(filterByPriceRange(comps));
  if (!fv) {
    const modelResp = await tryModelFallback(env, req, ref);
    if (modelResp) {
      await env.CACHE.put(cacheKey, JSON.stringify(modelResp), {
        expirationTtl: CACHE_TTL_SECONDS,
      });
      return maybeAttachDelta(modelResp, listedPriceUsd);
    }
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
    tier: actualTier,
    tierFallback: fallbackUsed,
  };
  await env.CACHE.put(cacheKey, JSON.stringify(resp), { expirationTtl: CACHE_TTL_SECONDS });
  return maybeAttachDelta(resp, listedPriceUsd);
}

// Attempts a model-level fair-value lookup when per-ref data is absent.
// `knownRef` is supplied when the ref was found but had no comps — its brand+model
// already disambiguate. When the ref was unknown, we use the request's `model` field.
async function tryModelFallback(
  env: Env,
  req: EnrichRequest,
  knownRef?: WatchRef,
): Promise<EnrichResponse | null> {
  const brand = knownRef?.brand ?? req.brand;
  const model = knownRef?.model ?? req.model;
  if (!model) return null;

  // Use the same condition-tier fallback policy as per-ref (try requested, fall to "fair").
  let comps = await getModelLevelComps(env.DB, brand, model, req.condition);
  let actualTier: ConditionTier = req.condition;
  let tierFallbackUsed = false;
  if (comps.length === 0 && req.condition !== "fair") {
    comps = await getModelLevelComps(env.DB, brand, model, "fair");
    actualTier = "fair";
    tierFallbackUsed = true;
  }
  // The model-level set spans every reference under brand+model, so the price cloud is
  // wide; filter accessory/parts and lots before applying the confidence threshold. [H1]
  const filtered = filterByPriceRange(comps);
  if (filtered.length < MODEL_FALLBACK_MIN_COMPS) return null;

  const fv = computeFairValue(filtered);
  if (!fv) return null;

  return {
    status: "ok",
    fairValue: fv,
    reference: knownRef
      ? { brand: knownRef.brand, model: knownRef.model, displayName: knownRef.displayName }
      : { brand, model, displayName: `${brand} ${model}` },
    tier: actualTier,
    tierFallback: tierFallbackUsed,
    modelFallback: true,
  };
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
