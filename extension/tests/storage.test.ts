import { beforeEach, describe, expect, it, vi } from "vitest";
import { ensureAnonymousId, getSettings, setSettings } from "../src/storage";

type StorageState = { enabled?: boolean; anonymousId?: string };

function mockChromeStorage(initial: StorageState = {}) {
  const state: StorageState = { ...initial };
  const local = {
    get: vi.fn(async (keys: string[]) => {
      const out: StorageState = {};
      for (const k of keys) {
        if (k in state) out[k as keyof StorageState] = state[k as keyof StorageState] as never;
      }
      return out;
    }),
    set: vi.fn(async (patch: StorageState) => {
      Object.assign(state, patch);
    }),
  };
  // biome-ignore lint/suspicious/noExplicitAny: test-only global stub
  vi.stubGlobal("chrome", { storage: { local } } as any);
  return { state, local };
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe("getSettings", () => {
  it("returns defaults when nothing stored", async () => {
    mockChromeStorage();
    const s = await getSettings();
    expect(s.enabled).toBe(true);
    expect(typeof s.anonymousId).toBe("string");
  });

  it("returns stored values when present", async () => {
    mockChromeStorage({ enabled: false, anonymousId: "stored-uuid" });
    const s = await getSettings();
    expect(s.enabled).toBe(false);
    expect(s.anonymousId).toBe("stored-uuid");
  });
});

describe("setSettings", () => {
  it("writes only the provided keys", async () => {
    const { state } = mockChromeStorage({ enabled: true });
    await setSettings({ enabled: false });
    expect(state.enabled).toBe(false);
    expect("anonymousId" in state).toBe(false);
  });
});

describe("ensureAnonymousId", () => {
  it("creates and stores a new UUID on first call", async () => {
    const { state, local } = mockChromeStorage();
    const id = await ensureAnonymousId();
    expect(id).toMatch(/^[0-9a-f-]{36}$/i);
    expect(state.anonymousId).toBe(id);
    expect(local.set).toHaveBeenCalled();
  });

  it("returns the existing UUID on subsequent calls", async () => {
    const { local } = mockChromeStorage({ anonymousId: "existing-uuid-1234" });
    const id = await ensureAnonymousId();
    expect(id).toBe("existing-uuid-1234");
    expect(local.set).not.toHaveBeenCalled();
  });
});
