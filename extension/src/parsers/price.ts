// Shared price-string parser used across marketplace parsers. Detects the currency by
// symbol/code and strips grouping separators to recover a whole-number amount — watch
// listings show whole prices across locales ("$13,499", "€9,500", "6.800 €", "CHF 8'500").
const NUMBER = "\\d[\\d.,'’ʼ \\s]*\\d|\\d";

// Regex fragment for each currency's symbol/code, so the amount can be anchored to the
// detected currency rather than blindly taking the first number in the string.
const CURRENCY_SYMBOL: Record<string, string> = {
  USD: "\\$",
  EUR: "€",
  GBP: "£",
  CHF: "CHF|Fr\\.?",
  TRY: "₺|TL",
  JPY: "¥",
};

// Drop a trailing decimal-cents group (".00" / ",50") before stripping grouping separators,
// so "$24,500.00" -> 24500, not 2450000. Grouping is always 3 digits, so a trailing separator
// followed by exactly 2 digits is unambiguously cents.
function toAmount(raw: string): number | null {
  const digits = raw.replace(/[.,]\d{2}$/, "").replace(/\D/g, "");
  const n = digits ? Number.parseInt(digits, 10) : null;
  return n && n > 0 ? n : null;
}

export function parsePriceAndCurrency(text: string): {
  price: number | null;
  currency: string | null;
} {
  const currency = detectCurrency(text);
  const sym = currency ? CURRENCY_SYMBOL[currency] : undefined;
  if (sym) {
    // Prefer the amount adjacent to the detected currency symbol, so a struck-through price
    // in another currency (or elsewhere in the string) can't be mispaired with it. [M5]
    const after = text.match(new RegExp(`(?:${sym})\\s*(${NUMBER})`));
    if (after?.[1]) return { price: toAmount(after[1]), currency };
    const before = text.match(new RegExp(`(${NUMBER})\\s*(?:${sym})`));
    if (before?.[1]) return { price: toAmount(before[1]), currency };
  }
  // No currency detected, or a symbol with no adjacent number: take the first number.
  const cluster = text.match(new RegExp(NUMBER));
  return { price: cluster ? toAmount(cluster[0]) : null, currency };
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
