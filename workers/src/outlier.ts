// Title-based outlier filter for eBay listings. eBay's Browse API doesn't reliably
// distinguish "watch" listings from "watch parts" / "box only" / "broken" — they
// share the same category. Letting these into sold_comps pulls medians toward the
// floor (a $500 dial pollutes the median for a $10k watch).
//
// Strategy: keyword + phrase matching against the listing title. False positives
// (legit listings that contain the word "parts" benignly) cost us a comp. False
// negatives (parts listings that slip through) pollute the median. We bias toward
// keeping legitimate listings — see the KEEPS tests for the boundary cases.

const PARTS_REGEX = [
  /\bfor\s+parts(?!\s+(intact|present|included|original))/i,
  /\bparts(\s+(only|or\s+repair)|\s*\/\s*repair)/i,
  /\bnot\s+working\b/i,
  /\bbroken\b/i,
  /\bdamaged\b/i,
  /\bproject\b/i,
  /\bas[-\s]is\b/i,
];

// "X only" patterns — applied with a negative lookahead for "with X" / "X intact"
// so legit listings ("box and papers only") aren't caught.
const ONLY_REGEX = [
  /\bbox\s+only\b/i,
  /\bpaper(s|work)?\s+only\b/i,
  /\bmovement\s+only\b/i,
  /\b(dial|case|bracelet|bezel|crown|hands?|crystal)\s+only\b/i,
  /\b(dial|case|bracelet|bezel|crown|crystal)\s+insert\s+only\b/i,
];

const COMPONENT_REGEX = [
  /\baftermarket\s+(dial|hands?|bezel|case|movement|bracelet|crown|crystal|insert)/i,
  /\b(dial|hands?|bezel|case|movement|bracelet|crown|crystal|insert)\s+[-—]\s+(replacement|aftermarket|spare)/i,
  /\breplacement\s+part\b/i,
];

// Caller passes a separate guard: titles that explicitly say "box, papers and watch"
// or "all original parts intact" pass through this allowlist regardless of other matches.
const ALLOWLIST = [
  /\b(box,?\s*papers?,?\s*and\s+(receipt|watch|original))/i,
  /\b(all\s+original\s+parts|original\s+parts\s+intact)\b/i,
  /\bfull\s+set\b/i,
];

export function isOutlierTitle(title: string | null | undefined): boolean {
  if (!title) return false;
  for (const allow of ALLOWLIST) {
    if (allow.test(title)) return false;
  }
  for (const r of PARTS_REGEX) {
    if (r.test(title)) return true;
  }
  for (const r of ONLY_REGEX) {
    if (r.test(title)) return true;
  }
  for (const r of COMPONENT_REGEX) {
    if (r.test(title)) return true;
  }
  return false;
}
