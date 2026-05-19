export type Settings = {
  enabled: boolean;
  anonymousId: string;
};

export async function getSettings(): Promise<Settings> {
  const stored = (await chrome.storage.local.get(["enabled", "anonymousId"])) as Partial<Settings>;
  return {
    enabled: stored.enabled ?? true,
    anonymousId: stored.anonymousId ?? (await ensureAnonymousId()),
  };
}

export async function setSettings(patch: Partial<Settings>): Promise<void> {
  await chrome.storage.local.set(patch);
}

export async function ensureAnonymousId(): Promise<string> {
  const stored = (await chrome.storage.local.get(["anonymousId"])) as { anonymousId?: string };
  if (stored.anonymousId) return stored.anonymousId;
  const id = crypto.randomUUID();
  await chrome.storage.local.set({ anonymousId: id });
  return id;
}
