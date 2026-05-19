import { describe, expect, it, vi } from "vitest";
import { touchUser } from "../src/enrich";

type Row = { enrichment_count_today: number; counter_day: string };

function mockDb(initialRow: Row | null) {
  const updates: Array<{ sql: string; binds: unknown[] }> = [];
  let current: Row | null = initialRow;

  const prepare = vi.fn((sql: string) => {
    return {
      bind: (...binds: unknown[]) => ({
        first: async () => current,
        run: async () => {
          updates.push({ sql, binds });
          if (sql.startsWith("INSERT INTO users")) {
            current = {
              enrichment_count_today: binds[1] as number,
              counter_day: binds[2] as string,
            };
          } else if (sql.startsWith("UPDATE users")) {
            current = {
              enrichment_count_today: binds[0] as number,
              counter_day: binds[1] as string,
            };
          }
        },
      }),
    };
  });

  return {
    db: { prepare } as unknown as D1Database,
    updates,
    getCurrent: () => current,
  };
}

const TODAY = "2026-05-19";

describe("touchUser", () => {
  it("inserts a new row with count=1 on first touch", async () => {
    const { db, updates, getCurrent } = mockDb(null);
    const r = await touchUser(db, "anon-1", TODAY);
    expect(r).toEqual({ count: 1, capped: false });
    expect(updates[0]?.sql).toContain("INSERT INTO users");
    expect(getCurrent()?.enrichment_count_today).toBe(1);
  });

  it("increments count on same day", async () => {
    const { db, getCurrent } = mockDb({ enrichment_count_today: 7, counter_day: TODAY });
    const r = await touchUser(db, "anon-1", TODAY);
    expect(r).toEqual({ count: 8, capped: false });
    expect(getCurrent()?.enrichment_count_today).toBe(8);
  });

  it("resets count to 1 on a new day", async () => {
    const { db } = mockDb({ enrichment_count_today: 199, counter_day: "2026-05-18" });
    const r = await touchUser(db, "anon-1", TODAY);
    expect(r).toEqual({ count: 1, capped: false });
  });

  it("marks capped=true on the 201st call same-day", async () => {
    const { db } = mockDb({ enrichment_count_today: 200, counter_day: TODAY });
    const r = await touchUser(db, "anon-1", TODAY);
    expect(r.count).toBe(201);
    expect(r.capped).toBe(true);
  });

  it("marks capped=false at the 200th call (boundary)", async () => {
    const { db } = mockDb({ enrichment_count_today: 199, counter_day: TODAY });
    const r = await touchUser(db, "anon-1", TODAY);
    expect(r.count).toBe(200);
    expect(r.capped).toBe(false);
  });
});
