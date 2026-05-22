import { describe, expect, it } from "vitest";
import { isOutlierTitle } from "../src/outlier";

describe("isOutlierTitle", () => {
  describe("excludes obvious parts/damaged listings", () => {
    const examples = [
      "Rolex Submariner 16610 FOR PARTS OR REPAIR",
      "Rolex Submariner 16610 - parts only",
      "Rolex Submariner 16610 (damaged crystal, project)",
      "Rolex Submariner 16610 NOT WORKING",
      "Rolex Submariner 16610 - For Parts",
      "Rolex Daytona 116500LN parts/repair",
      "Rolex Datejust 16234 broken movement",
      "Rolex Sub 116610LN as-is",
      "Rolex Submariner 16610 dial only",
    ];
    for (const t of examples) {
      it(t, () => expect(isOutlierTitle(t)).toBe(true));
    }
  });

  describe("excludes box-only / paper-only / movement-only listings", () => {
    const examples = [
      "Rolex Submariner 16610 box and papers only — no watch",
      "Rolex Submariner box only",
      "Rolex Submariner 16610 paperwork only",
      "Rolex Sub movement only — no case",
      "Rolex 16610 BRACELET only",
      "Rolex Submariner case only",
    ];
    for (const t of examples) {
      it(t, () => expect(isOutlierTitle(t)).toBe(true));
    }
  });

  describe("excludes empty bezel / strap / aftermarket-component listings", () => {
    const examples = [
      "Rolex Submariner bezel insert ONLY",
      "Rolex 16610 dial — aftermarket replacement",
      "Rolex Daytona crown - replacement part",
    ];
    for (const t of examples) {
      it(t, () => expect(isOutlierTitle(t)).toBe(true));
    }
  });

  describe("KEEPS legitimate listings even when wording is close", () => {
    const examples = [
      "Rolex Submariner 16610 — Box, papers, and original receipt",
      "Rolex Submariner 16610 with original parts intact",
      "Rolex Submariner 16610 unworn — full set with papers",
      "Rolex Datejust 16234 — mint condition, all original",
      "Rolex GMT-Master II 116710LN serviced",
      "Rolex Daytona 116500LN excellent working condition",
    ];
    for (const t of examples) {
      it(t, () => expect(isOutlierTitle(t)).toBe(false));
    }
  });

  it("is case-insensitive", () => {
    expect(isOutlierTitle("FOR PARTS OR REPAIR")).toBe(true);
    expect(isOutlierTitle("for parts or repair")).toBe(true);
    expect(isOutlierTitle("For Parts Or Repair")).toBe(true);
  });

  it("returns false for null/empty input (no false-positive defaults)", () => {
    expect(isOutlierTitle("")).toBe(false);
    expect(isOutlierTitle(null)).toBe(false);
    expect(isOutlierTitle(undefined)).toBe(false);
  });
});
