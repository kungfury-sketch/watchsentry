import { render } from "@testing-library/preact";
import { describe, expect, it } from "vitest";
import { Badge } from "../../src/components/Badge";

describe("<Badge>", () => {
  it("renders the loading state with the WatchSentry wordmark", () => {
    const { container } = render(<Badge status="loading" />);
    expect(container.textContent).toContain("WatchSentry");
  });

  it("renders an encouraging copy for unknown_reference (not deflating)", () => {
    const { container } = render(<Badge status="unknown_reference" />);
    const text = container.textContent ?? "";
    expect(text.toLowerCase()).toMatch(/weekly|soon|adding|growing/);
    expect(text.toLowerCase()).not.toMatch(/not yet tracked|untracked|unsupported/);
  });

  it("renders an honest no_data message", () => {
    const { container } = render(<Badge status="no_data" />);
    const text = container.textContent ?? "";
    expect(text.toLowerCase()).toMatch(/signal|data|enough/);
  });

  it("renders a distinct, honest 'could not reach' error state (separate from no_data)", () => {
    const { container } = render(<Badge status="error" />);
    const text = (container.textContent ?? "").toLowerCase();
    expect(text).toContain("watchsentry");
    expect(text).toMatch(/couldn.t reach|unavailable|try (again|reloading)/);
  });

  it("renders fair value and delta in the ok state with WatchSentry attribution", () => {
    const { container } = render(
      <Badge status="ok" medianUsd={9500} sampleSize={12} deltaPercent={-10.5} />,
    );
    const text = container.textContent ?? "";
    expect(text).toContain("9,500");
    expect(text).toContain("-10.5%");
    expect(text).toContain("12");
    expect(text).toContain("WatchSentry");
  });

  it("shows the absolute dollar gap directionally (below market) in the ok state", () => {
    const { container } = render(
      <Badge
        status="ok"
        medianUsd={12400}
        sampleSize={142}
        deltaPercent={-8.4}
        deltaAbsUsd={-1150}
      />,
    );
    const text = container.textContent ?? "";
    expect(text).toContain("-8.4%");
    expect(text).toContain("1,150");
    expect(text.toLowerCase()).toContain("below");
  });

  it("labels an over-market listing as 'above'", () => {
    const { container } = render(
      <Badge status="ok" medianUsd={10000} sampleSize={50} deltaPercent={12} deltaAbsUsd={1200} />,
    );
    const text = container.textContent ?? "";
    expect(text.toLowerCase()).toContain("above");
    expect(text).toContain("1,200");
  });

  it("classifies delta tone correctly (good when <= -5%)", () => {
    const { container } = render(
      <Badge status="ok" medianUsd={9500} sampleSize={5} deltaPercent={-8} />,
    );
    expect(container.querySelector(".ws-good")).not.toBeNull();
  });

  it("classifies delta tone correctly (bad when >= +10%)", () => {
    const { container } = render(
      <Badge status="ok" medianUsd={9500} sampleSize={5} deltaPercent={15} />,
    );
    expect(container.querySelector(".ws-bad")).not.toBeNull();
  });
});
