import { markCandidateValidated, pickCandidatesForValidation } from "./discover";
import { fetchEbaySoldComps, getEbayAppToken } from "./ebay";
import type { Env } from "./index";
import { insertSoldComps, listAllReferences } from "./repo";
import { promoteCandidate, validateCandidate } from "./validate";

const CANDIDATES_PER_CRON = 20;

export async function runDailyRefresh(
  env: Env,
): Promise<{ comps: number; refs: number; candidatesPromoted: number; candidatesChecked: number }> {
  const token = await getEbayAppToken(env.EBAY_APP_ID, env.EBAY_CERT_ID);
  const refs = await listAllReferences(env.DB);
  let totalInserted = 0;
  for (const r of refs) {
    try {
      const comps = await fetchEbaySoldComps({
        brand: r.brand,
        reference: r.referenceNumber,
        token,
      });
      const inserted = await insertSoldComps(env.DB, r.id, comps);
      totalInserted += inserted;
      await new Promise((res) => setTimeout(res, 300));
    } catch (e) {
      await env.DB.prepare("INSERT INTO audit_log (event_type, payload_json) VALUES (?, ?)")
        .bind("cron_ebay_ref_error", JSON.stringify({ refId: r.id, error: String(e) }))
        .run();
    }
  }

  // Candidate validation phase — promote user-discovered refs that pass the comp threshold.
  const candidates = await pickCandidatesForValidation(env.DB, CANDIDATES_PER_CRON);
  let promoted = 0;
  for (const c of candidates) {
    const result = await validateCandidate({
      brand: c.brand,
      reference: c.reference_number,
      token,
    });
    if (result.outcome === "promoted") {
      const refId = await promoteCandidate(env.DB, {
        brand: c.brand,
        model: c.model,
        reference: c.reference_number,
      });
      if (refId !== null) {
        await insertSoldComps(env.DB, refId, result.comps);
        totalInserted += result.comps.length;
        promoted++;
      }
    }
    await markCandidateValidated(env.DB, c.id, result.outcome);
    await new Promise((res) => setTimeout(res, 300));
  }

  await env.DB.prepare("INSERT INTO audit_log (event_type, payload_json) VALUES (?, ?)")
    .bind(
      "cron_ebay_refresh_done",
      JSON.stringify({
        refs: refs.length,
        inserted: totalInserted,
        candidatesChecked: candidates.length,
        candidatesPromoted: promoted,
      }),
    )
    .run();
  return {
    comps: totalInserted,
    refs: refs.length,
    candidatesPromoted: promoted,
    candidatesChecked: candidates.length,
  };
}
