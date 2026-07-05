// Generic KV-backed soft daily counter, shared by the public endpoints' per-IP caps.
// KV is eventually consistent, so this raises the bar on casual/single-IP abuse without
// the cost of a strong counter. Keys expire after 26h so stale days clean themselves up.
export async function underDailyCap(
  kv: KVNamespace,
  bucket: string,
  id: string,
  cap: number,
  day: string = new Date().toISOString().slice(0, 10),
): Promise<boolean> {
  const key = `${bucket}:${id}:${day}`;
  const current = Number((await kv.get(key)) ?? "0");
  if (current >= cap) return false;
  await kv.put(key, String(current + 1), { expirationTtl: 60 * 60 * 26 });
  return true;
}
