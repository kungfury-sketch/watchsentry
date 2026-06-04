import { describe, expect, it } from "vitest";
import { extractReferenceFromText } from "../../src/parsers/reference";

describe("extractReferenceFromText", () => {
  it("extracts digit-leading refs with optional dial-code suffix (existing behaviour)", () => {
    expect(extractReferenceFromText("Rolex Submariner 124060")).toBe("124060");
    expect(extractReferenceFromText("41mm 126610LN Oystersteel")).toBe("126610LN");
    expect(extractReferenceFromText("Unworn 2026 / 124060 - box")).toBe("124060");
  });

  it("extracts dotted Omega references", () => {
    expect(extractReferenceFromText("Omega Seamaster 311.30.42.30.01.005 blue dial")).toBe(
      "311.30.42.30.01.005",
    );
    expect(extractReferenceFromText("Speedmaster 310.30.42.50.01.001 hesalite")).toBe(
      "310.30.42.50.01.001",
    );
  });

  it("extracts 14-digit Omega references (dots stripped)", () => {
    expect(extractReferenceFromText("Omega 21030422001001 full set")).toBe("21030422001001");
  });

  it("extracts slashed Patek references", () => {
    expect(extractReferenceFromText("Patek Philippe Nautilus 5711/1A-010 steel")).toBe(
      "5711/1A-010",
    );
  });

  it("extracts letter-leading alphanumeric references (Cartier, Breitling, TAG)", () => {
    expect(extractReferenceFromText("Cartier Santos WSSA0009 steel")).toBe("WSSA0009");
    expect(extractReferenceFromText("Breitling Navitimer AB0121211B1P1")).toBe("AB0121211B1P1");
  });

  it("prefers a genuine digit ref over a letter-prefixed token elsewhere in the text", () => {
    // AB1234 is a junk token; the real ref 124060 must win.
    expect(extractReferenceFromText("AB1234 Rolex Submariner 124060")).toBe("124060");
  });

  it("returns null when there is no reference-shaped token", () => {
    expect(extractReferenceFromText("Rolex Submariner Date")).toBeNull();
    expect(extractReferenceFromText("2026 vintage example")).toBeNull();
    expect(extractReferenceFromText("41mm steel case")).toBeNull();
    expect(extractReferenceFromText("Box and papers included")).toBeNull();
    expect(extractReferenceFromText("Price on request")).toBeNull();
  });

  it("does not mistake a DD.MM.YYYY date for a dotted reference", () => {
    expect(extractReferenceFromText("Serviced 01.02.2026 by dealer")).toBeNull();
  });
});
