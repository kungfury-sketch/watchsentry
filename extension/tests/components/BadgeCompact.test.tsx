import { render } from "@testing-library/preact";
import { describe, expect, it } from "vitest";
import { BadgeCompact } from "../../src/components/BadgeCompact";

describe("<BadgeCompact>", () => {
  it("returns nothing for non-ok statuses", () => {
    const { container: c1 } = render(<BadgeCompact status="loading" />);
    expect(c1.textContent).toBe("");
    const { container: c2 } = render(<BadgeCompact status="unknown_reference" />);
    expect(c2.textContent).toBe("");
    const { container: c3 } = render(<BadgeCompact status="no_data" />);
    expect(c3.textContent).toBe("");
  });

  it("returns nothing for ok status without a delta value", () => {
    const { container } = render(<BadgeCompact status="ok" />);
    expect(container.textContent).toBe("");
  });

  it("renders the delta and the WS brand chip in the ok state", () => {
    const { container } = render(<BadgeCompact status="ok" deltaPercent={-7.3} />);
    const text = container.textContent ?? "";
    expect(text).toContain("-7.3%");
    expect(container.querySelector(".ws-badge-compact")).not.toBeNull();
    expect(container.querySelector(".ws-brand-chip")).not.toBeNull();
  });

  it("classifies tone correctly", () => {
    const { container: c1 } = render(<BadgeCompact status="ok" deltaPercent={-6} />);
    expect(c1.querySelector(".ws-good")).not.toBeNull();
    const { container: c2 } = render(<BadgeCompact status="ok" deltaPercent={12} />);
    expect(c2.querySelector(".ws-bad")).not.toBeNull();
    const { container: c3 } = render(<BadgeCompact status="ok" deltaPercent={2} />);
    expect(c3.querySelector(".ws-neutral")).not.toBeNull();
  });

  it("shows + sign for positive deltas", () => {
    const { container } = render(<BadgeCompact status="ok" deltaPercent={4.2} />);
    expect(container.textContent).toContain("+4.2%");
  });
});
