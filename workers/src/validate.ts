import { type SoldComp, fetchEbaySoldComps } from "./ebay";

export type ValidationOutcome = "promoted" | "insufficient_comps" | "fetch_error";

export type ValidationResult = {
  outcome: ValidationOutcome;
  comps: SoldComp[];
};

// Minimum comps required to promote a candidate to watch_references. Matches the
// model-fallback threshold so we don't promote refs we wouldn't badge anyway.
export const PROMOTION_MIN_COMPS = 50;

export async function validateCandidate(args: {
  brand: string;
  reference: string;
  token: string;
  ebayFetch?: typeof fetchEbaySoldComps;
}): Promise<ValidationResult> {
  const fetcher = args.ebayFetch ?? fetchEbaySoldComps;
  try {
    const comps = await fetcher({
      brand: args.brand,
      reference: args.reference,
      token: args.token,
    });
    if (comps.length >= PROMOTION_MIN_COMPS) {
      return { outcome: "promoted", comps };
    }
    return { outcome: "insufficient_comps", comps };
  } catch {
    return { outcome: "fetch_error", comps: [] };
  }
}

// Inserts a promoted candidate into watch_references. Returns the new reference id,
// or null if a parallel cron already inserted the same (brand, reference_number).
export async function promoteCandidate(
  db: D1Database,
  args: { brand: string; model: string; reference: string },
): Promise<number | null> {
  const displayName = `${args.brand} ${args.model} ${args.reference}`;
  await db
    .prepare(
      `INSERT OR IGNORE INTO watch_references (brand, model, reference_number, display_name)
       VALUES (?, ?, ?, ?)`,
    )
    .bind(args.brand, args.model, args.reference, displayName)
    .run();

  const row = await db
    .prepare("SELECT id FROM watch_references WHERE brand = ? AND reference_number = ?")
    .bind(args.brand, args.reference)
    .first<{ id: number }>();
  return row?.id ?? null;
}
