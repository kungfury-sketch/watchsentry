import { describe, expect, it, vi } from "vitest";
import { discoverRequestSchema, recordDiscovery } from "../src/discover";

type RunMock = ReturnType<typeof vi.fn>;

function mockDb(opts: { runImpl?: RunMock } = {}) {
  const runImpl = opts.runImpl ?? vi.fn(async () => ({ meta: { rows_written: 1 } }));
  const captured: Array<{ sql: string; bindings: unknown[] }> = [];
  const prepare = vi.fn((sql: string) => ({
    bind: (...bindings: unknown[]) => {
      captured.push({ sql, bindings });
      return { run: runImpl };
    },
  }));
  return { db: { prepare } as unknown as D1Database, captured, runImpl };
}

describe("discoverRequestSchema", () => {
  it("accepts a minimal valid request", () => {
    const r = discoverRequestSchema.safeParse({
      brand: "Rolex",
      model: "Submariner",
      reference: "16800",
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty fields", () => {
    expect(
      discoverRequestSchema.safeParse({ brand: "", model: "Submariner", reference: "16800" })
        .success,
    ).toBe(false);
    expect(
      discoverRequestSchema.safeParse({ brand: "Rolex", model: "", reference: "16800" }).success,
    ).toBe(false);
    expect(
      discoverRequestSchema.safeParse({ brand: "Rolex", model: "Submariner", reference: "" })
        .success,
    ).toBe(false);
  });

  it("rejects oversized fields (defends against payload abuse)", () => {
    expect(
      discoverRequestSchema.safeParse({
        brand: "x".repeat(100),
        model: "Submariner",
        reference: "16800",
      }).success,
    ).toBe(false);
  });
});

describe("recordDiscovery", () => {
  it("performs an idempotent upsert (insert when new, increment on duplicate)", async () => {
    const { db, captured } = mockDb();
    await recordDiscovery(db, { brand: "Rolex", model: "Submariner", reference: "16800" });
    expect(captured).toHaveLength(1);
    expect(captured[0]?.sql).toMatch(/INSERT INTO candidate_refs/i);
    expect(captured[0]?.sql).toMatch(/ON CONFLICT/i);
    expect(captured[0]?.bindings).toEqual(["Rolex", "Submariner", "16800"]);
  });

  it("binds brand, model, reference in the documented order", async () => {
    const { db, captured } = mockDb();
    await recordDiscovery(db, {
      brand: "Omega",
      model: "Speedmaster",
      reference: "311.30.42.30.01.005",
    });
    expect(captured[0]?.bindings).toEqual(["Omega", "Speedmaster", "311.30.42.30.01.005"]);
  });
});
