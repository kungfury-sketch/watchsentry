import { z } from "zod";

export const discoverRequestSchema = z.object({
  brand: z.string().min(1).max(50),
  model: z.string().min(1).max(80),
  reference: z.string().min(1).max(50),
});

export type DiscoverRequest = z.infer<typeof discoverRequestSchema>;

// Idempotent upsert. First call inserts a row with observation_count=1.
// Subsequent calls for the same (brand, reference_number) increment observation_count
// and refresh last_seen_at. The cron uses observation_count to prioritize which
// candidates to validate first.
export async function recordDiscovery(db: D1Database, req: DiscoverRequest): Promise<void> {
  await db
    .prepare(
      `INSERT INTO candidate_refs (brand, model, reference_number)
       VALUES (?, ?, ?)
       ON CONFLICT (brand, reference_number) DO UPDATE SET
         observation_count = observation_count + 1,
         last_seen_at = datetime('now'),
         model = excluded.model`,
    )
    .bind(req.brand, req.model, req.reference)
    .run();
}

export const DISCOVER_CAP_PER_IP_PER_DAY = 100;

// Per-IP soft daily cap (KV-backed) on /discover. The endpoint is public and keyless, so
// without this an attacker could flood it to bloat candidate_refs and pin junk refs to the
// front of the nightly eBay-validation queue. KV is eventually consistent, so this is a soft
// cap — it raises the bar on casual/single-IP abuse without the cost of a strong counter. [H2]
export async function underDiscoverCap(
  kv: KVNamespace,
  ip: string,
  day: string = new Date().toISOString().slice(0, 10),
): Promise<boolean> {
  const key = `discover:${ip}:${day}`;
  const current = Number((await kv.get(key)) ?? "0");
  if (current >= DISCOVER_CAP_PER_IP_PER_DAY) return false;
  await kv.put(key, String(current + 1), { expirationTtl: 60 * 60 * 26 });
  return true;
}

export type CandidateRow = {
  id: number;
  brand: string;
  model: string;
  reference_number: string;
  observation_count: number;
};

// Returns unvalidated or stale-validated candidates, hottest first. The cron walks this
// list and tries to promote each to watch_references via an eBay sold-comp check.
export async function pickCandidatesForValidation(
  db: D1Database,
  limit: number,
): Promise<CandidateRow[]> {
  const rs = await db
    .prepare(
      `SELECT id, brand, model, reference_number, observation_count
       FROM candidate_refs
       WHERE promoted_at IS NULL
         AND (validated_at IS NULL OR validated_at < datetime('now', '-7 days'))
       ORDER BY observation_count DESC, id ASC
       LIMIT ?`,
    )
    .bind(limit)
    .all<CandidateRow>();
  return rs.results ?? [];
}

export async function markCandidateValidated(
  db: D1Database,
  id: number,
  result: "promoted" | "insufficient_comps" | "fetch_error",
): Promise<void> {
  if (result === "promoted") {
    await db
      .prepare(
        `UPDATE candidate_refs
         SET validated_at = datetime('now'), validation_result = ?, promoted_at = datetime('now')
         WHERE id = ?`,
      )
      .bind(result, id)
      .run();
  } else {
    await db
      .prepare(
        `UPDATE candidate_refs
         SET validated_at = datetime('now'), validation_result = ?
         WHERE id = ?`,
      )
      .bind(result, id)
      .run();
  }
}
