import { describe, expect, it } from "vitest";
import { normalizeReferenceCandidates } from "../src/normalize";

describe("normalizeReferenceCandidates", () => {
  it("returns the original reference first so direct hits short-circuit", () => {
    const cands = normalizeReferenceCandidates("Rolex", "124060");
    expect(cands[0]).toBe("124060");
  });

  it("appends a stripped variant when the ref ends in a 1-4 letter dial-code suffix", () => {
    // Real-world Chrono24 examples: 16613LB (vintage Sub two-tone), 116610LN (modern Sub black).
    // If our refs table only has the base 16613, we still want a hit.
    expect(normalizeReferenceCandidates("Rolex", "16613LB")).toContain("16613");
    expect(normalizeReferenceCandidates("Rolex", "116610LN")).toContain("116610");
    expect(normalizeReferenceCandidates("Rolex", "79030N")).toContain("79030");
  });

  it("does not append a stripped variant when the ref has no trailing letters", () => {
    const cands = normalizeReferenceCandidates("Rolex", "124060");
    expect(cands).toEqual(["124060"]);
  });

  it("does not strip when the trailing letter run is longer than 4 (probably not a dial code)", () => {
    // "126610ABCDE" is junk, not a real dial code — don't speculate.
    const cands = normalizeReferenceCandidates("Rolex", "126610ABCDE");
    expect(cands).not.toContain("126610");
  });

  it("for Omega, an 8-digit numeric ref also gets a canonical 4.2.2-dotted variant", () => {
    // Chrono24's JSON-LD strips dots from Omega refs: 3570.50.00 → 35705000.
    // Our D1 likely has 3570.50.00 (canonical Omega format).
    expect(normalizeReferenceCandidates("Omega", "35705000")).toContain("3570.50.00");
    expect(normalizeReferenceCandidates("Omega", "31030425001001")).toContain(
      "310.30.42.50.01.001",
    );
  });

  it("for Omega, a dotted ref also gets a dots-stripped variant (reverse direction)", () => {
    // Symmetric: if Chrono24 ever sends the canonical form and we store stripped, still hit.
    expect(normalizeReferenceCandidates("Omega", "3570.50.00")).toContain("35705000");
  });

  it("dotted refs for non-Omega brands also get a dots-stripped variant", () => {
    // Pure dot/dash normalization is brand-agnostic.
    expect(normalizeReferenceCandidates("Rolex", "126.610.LN")).toContain("126610LN");
  });

  it("deduplicates candidates so we don't re-query the same ref", () => {
    const cands = normalizeReferenceCandidates("Rolex", "124060");
    expect(new Set(cands).size).toBe(cands.length);
  });

  it("returns an empty list defensively if the reference is empty", () => {
    expect(normalizeReferenceCandidates("Rolex", "")).toEqual([]);
  });
});
