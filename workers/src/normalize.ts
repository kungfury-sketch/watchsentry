// Chrono24's JSON-LD ships references in formats that don't always match how our refs table
// stores them — dial-code suffixes (16613LB vs base 16613) and Omega's dots-stripped variants
// (3570.50.00 ↔ 35705000). This helper produces an ordered candidate list so the worker can
// fall back to known-good variants when the direct lookup misses.

export function normalizeReferenceCandidates(brand: string, reference: string): string[] {
  if (!reference) return [];
  const out: string[] = [reference];

  // 1. Strip a trailing 1-4 letter dial-code suffix when the prefix begins and ends with a digit.
  //    Example: 16613LB → also try 16613.
  const stripped = reference.match(/^([0-9][0-9A-Za-z\-./]*?[0-9])([A-Za-z]{1,4})$/);
  if (stripped?.[1]) out.push(stripped[1]);

  // 2. Brand-agnostic: if the ref contains dots/dashes, also try a stripped variant.
  //    Example: 3570.50.00 → also try 35705000; 126.610.LN → also try 126610LN.
  if (/[.\-]/.test(reference)) {
    out.push(reference.replace(/[.\-]/g, ""));
  }

  // 3. Omega-specific: pure-digit refs at known lengths get a canonical dotted variant.
  if (brand === "Omega" && /^\d+$/.test(reference)) {
    if (reference.length === 8) {
      // 4.2.2 split: e.g. 35705000 → 3570.50.00
      out.push(`${reference.slice(0, 4)}.${reference.slice(4, 6)}.${reference.slice(6, 8)}`);
    } else if (reference.length === 14) {
      // 3.2.2.2.2.3 split: e.g. 31030425001001 → 310.30.42.50.01.001
      out.push(
        `${reference.slice(0, 3)}.${reference.slice(3, 5)}.${reference.slice(5, 7)}.${reference.slice(7, 9)}.${reference.slice(9, 11)}.${reference.slice(11, 14)}`,
      );
    }
  }

  return Array.from(new Set(out));
}
