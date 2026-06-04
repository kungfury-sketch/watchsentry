import { describe, expect, it, vi } from "vitest";
import { touchUser } from "../src/enrich";

type Row = { enrichment_count_today: number; counter_day: string };

// Simulates the atomic UPSERT: a single statement that inserts-or-increments and
// RETURNs the resulting count. The mock applies the same same-day / new-day logic the
// SQL CASE expression encodes, so the test pins the behavior rather than a SELECT-then-write.
function mockDb(initialRow: Row | null) {
  let current: Row | null = initialRow;
  const calls: Array<{ sql: string; binds: unknown[] }> = [];
  const prepare = vi.fn((sql: string) => ({
    bind: (...binds: unknown[]) => ({
      first: async () => {
        calls.push({ sql, binds });
        const today = binds[1] as string;
        current = !current
          ? { enrichment_count_today: 1, counter_day: today }
          : {
              enrichment_count_today:
                current.counter_day === today ? current.enrichment_count_today + 1 : 1,
              counter_day: today,
            };
        return { count: current.enrichment_count_today };
      },
      run: async () => ({}),
    }),
  }));
  return { db: { prepare } as unknown as D1Database, calls, getCurrent: () => current };
}

const TODAY = "2026-05-19";

describe("touchUser (atomic upsert)", () => {
  it("issues a single atomic UPSERT statement (no separate SELECT then write)", async () => {
    const { db, calls } = mockDb(null);
    await touchUser(db, "anon-1", TODAY);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.sql).toMatch(/ON CONFLICT/i);
    expect(calls[0]?.sql).toMatch(/RETURNING/i);
  });

  it("inserts with count=1 on first touch", async () => {
    const { db, getCurrent } = mockDb(null);
    const r = await touchUser(db, "anon-1", TODAY);
    expect(r).toEqual({ count: 1, capped: false });
    expect(getCurrent()?.enrichment_count_today).toBe(1);
  });

  it("increments count on the same day", async () => {
    const { db } = mockDb({ enrichment_count_today: 7, counter_day: TODAY });
    const r = await touchUser(db, "anon-1", TODAY);
    expect(r).toEqual({ count: 8, capped: false });
  });

  it("resets count to 1 on a new day", async () => {
    const { db } = mockDb({ enrichment_count_today: 199, counter_day: "2026-05-18" });
    const r = await touchUser(db, "anon-1", TODAY);
    expect(r).toEqual({ count: 1, capped: false });
  });

  it("marks capped=false at the 200th call (boundary)", async () => {
    const { db } = mockDb({ enrichment_count_today: 199, counter_day: TODAY });
    const r = await touchUser(db, "anon-1", TODAY);
    expect(r.count).toBe(200);
    expect(r.capped).toBe(false);
  });

  it("marks capped=true on the 201st call same-day", async () => {
    const { db } = mockDb({ enrichment_count_today: 200, counter_day: TODAY });
    const r = await touchUser(db, "anon-1", TODAY);
    expect(r.count).toBe(201);
    expect(r.capped).toBe(true);
  });
});
