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
    expect(text.toLowerCase()).toMatch(/sold-comp|signal|data/);
  });

  it("renders fair value and delta in the ok state with WatchSentry attribution", () => {
    const { container } = render(
      <Badge
        status="ok"
        medianUsd={9500}
        listedPriceUsd={8500}
        sampleSize={12}
        deltaPercent={-10.5}
      />,
    );
    const text = container.textContent ?? "";
    expect(text).toContain("9,500");
    expect(text).toContain("-10.5%");
    expect(text).toContain("12");
    expect(text).toContain("WatchSentry");
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
