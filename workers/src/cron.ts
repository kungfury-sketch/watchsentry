import { fetchEbaySoldComps, getEbayAppToken } from "./ebay";
import type { Env } from "./index";
import { insertSoldComps, listAllReferences } from "./repo";

export async function runDailyRefresh(env: Env): Promise<{ comps: number; refs: number }> {
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
  await env.DB.prepare("INSERT INTO audit_log (event_type, payload_json) VALUES (?, ?)")
    .bind("cron_ebay_refresh_done", JSON.stringify({ refs: refs.length, inserted: totalInserted }))
    .run();
  return { comps: totalInserted, refs: refs.length };
}
