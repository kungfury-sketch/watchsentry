// Shared price-string parser used across marketplace parsers. Detects the currency by
// symbol/code and strips grouping separators to recover a whole-number amount — watch
// listings show whole prices across locales ("$13,499", "€9,500", "6.800 €", "CHF 8'500").
export function parsePriceAndCurrency(text: string): {
  price: number | null;
  currency: string | null;
} {
  const currency = detectCurrency(text);
  const cluster = text.match(/\d[\d.,'’ʼ \s]*\d|\d/);
  // Drop a trailing decimal-cents group (".00" / ",50") before stripping separators, so
  // "$24,500.00" -> 24500, not 2450000. Grouping is always 3 digits, so a trailing
  // separator followed by exactly 2 digits is unambiguously cents.
  const raw = cluster ? cluster[0].replace(/[.,]\d{2}$/, "") : "";
  const digits = raw.replace(/\D/g, "");
  const parsed = digits ? Number.parseInt(digits, 10) : null;
  return { price: parsed && parsed > 0 ? parsed : null, currency };
}

export function detectCurrency(text: string): string | null {
  if (text.includes("$")) return "USD";
  if (text.includes("€")) return "EUR";
  if (text.includes("£")) return "GBP";
  if (/\bCHF\b|\bFr\.?/.test(text)) return "CHF";
  if (text.includes("₺") || /\bTL\b/.test(text)) return "TRY";
  if (text.includes("¥")) return "JPY";
  return null;
}
