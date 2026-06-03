// Currency conversion for fair-value deltas. Rates are expressed as
// foreign-currency-units per 1 USD (matches frankfurter.app `?from=USD` output),
// so converting an amount in `currency` to USD is `amount / rates[currency]`.
export type FxRates = Record<string, number>;

// KV key holding the latest USD-based rate table. Written by the daily cron,
// read by /enrich. Shared so the writer and reader can't drift.
export const FX_CACHE_KEY = "fx:rates:usd";

export function convertToUsd(amount: number, currency: string, rates: FxRates): number | null {
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const code = currency.toUpperCase();
  if (code === "USD") return Math.round(amount);
  const rate = rates[code];
  if (!rate || rate <= 0) return null;
  return Math.round(amount / rate);
}

// Fetches latest ECB reference rates with USD as the base, from frankfurter.app
// (free, no API key, no PII sent). The response omits the base currency itself,
// so we inject USD:1 to make `convertToUsd` self-consistent.
export async function fetchEcbRates(fetchImpl: typeof fetch = fetch): Promise<FxRates> {
  const res = await fetchImpl("https://api.frankfurter.app/latest?from=USD");
  if (!res.ok) throw new Error(`fx rate fetch error: ${res.status}`);
  const data = (await res.json()) as { rates?: Record<string, number> };
  return { USD: 1, ...(data.rates ?? {}) };
}
