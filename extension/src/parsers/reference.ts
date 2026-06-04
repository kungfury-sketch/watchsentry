// Shared reference-number extractor for free text (listing titles, seller descriptions).
// Tries progressively less-specific patterns. A false positive almost always resolves to
// "not a reference we track" downstream (no badge), never a wrong number — so broadening
// coverage here is low-risk. [H5]
//
// Order matters: the more-specific shapes (dotted / 14-digit / slashed) run first, then the
// common digit-leading core, and letter-leading LAST. Because `\b[0-9]{5,7}` can't match
// digits embedded inside a letter-prefixed token (no word boundary), a genuine digit ref
// elsewhere in the text still wins over a junk letter-prefixed token.
export function extractReferenceFromText(text: string): string | null {
  // 1. Dotted numeric (Omega, e.g. 311.30.42.30.01.005): 4+ groups of 2-3 digits. Limiting
  //    each group to 2-3 digits excludes DD.MM.YYYY dates (the 4-digit year breaks the run).
  const dotted = text.match(/\b\d{2,3}(?:\.\d{2,3}){3,}\b/);
  if (dotted) return dotted[0];

  // 2. 14-digit Omega form (dots stripped, e.g. 21030422001001).
  const long = text.match(/\b\d{14}\b/);
  if (long) return long[0];

  // 3. Slashed (Patek, e.g. 5711/1A-010): 4-5 digits, slash, then alphanumerics.
  const slashed = text.match(/\b\d{4,5}\/\d[A-Za-z0-9-]*\b/);
  if (slashed) return slashed[0];

  // 4. Digit-leading core with optional 1-4 letter dial-code suffix (Rolex 124060, 126610LN).
  //    The word boundary skips 4-digit years and digits embedded in letter-prefixed tokens.
  const digit = text.match(/\b[0-9]{5,7}[A-Za-z]{0,4}\b/);
  if (digit) return digit[0];

  // 5. Letter-leading alphanumeric (Cartier WSSA0009, Breitling AB0121211B1P1): 2-4 capitals,
  //    then 3+ digits, then optional alphanumerics; require length >= 6 to avoid short noise.
  const lettered = text.match(/\b[A-Z]{2,4}[0-9]{3,}[A-Za-z0-9]*\b/);
  if (lettered && lettered[0].length >= 6) return lettered[0];

  return null;
}
