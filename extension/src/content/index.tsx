import { render } from "preact";
import { enrichListing, reportDiscovery } from "../api/client";
import { Badge } from "../components/Badge";
import { BadgeCompact } from "../components/BadgeCompact";
import { parseChrono24Listing } from "../parsers/chrono24-listing";
import { parseChrono24Search } from "../parsers/chrono24-search";
import { parseEbayListing } from "../parsers/ebay-listing";
import { parseEbaySearch } from "../parsers/ebay-search";
import { parseWatchfinderListing } from "../parsers/watchfinder-listing";
import { parseWatchfinderSearch } from "../parsers/watchfinder-search";
import { type Settings, getSettings } from "../storage";
import { type Host, chooseHost, chooseRoute, defaultCurrencyForHost } from "./route";

// Cut over to api.watchsentry.app once the custom Worker route is wired (Week 5).
const API_BASE = "https://watchsentry-api.txrz.workers.dev";
const MAX_CARDS_PER_PAGE = 50;

// Set DEBUG=true + rebuild to surface [WatchSentry] logs in the page console.
// Useful when Chrono24 changes their DOM and badges silently stop rendering.
const DEBUG = false;

const log = {
  info: (msg: string, ...args: unknown[]) => {
    if (DEBUG) console.info(`[WatchSentry] ${msg}`, ...args);
  },
  warn: (msg: string, ...args: unknown[]) => {
    if (DEBUG) console.warn(`[WatchSentry] ${msg}`, ...args);
  },
  error: (msg: string, ...args: unknown[]) => {
    if (DEBUG) console.error(`[WatchSentry] ${msg}`, ...args);
  },
};

// Per-host anchor selectors — the badge sits above the price block to feel native.
const ANCHOR_SELECTORS: Record<Host, string[]> = {
  chrono24: [".detail-page-price", ".js-detail-page-price-section"],
  ebay: [".x-price-primary", ".x-bin-price", "[itemprop='price']"],
  watchfinder: [".prod-price", ".prod-price-figure"],
};

// Normalizes whatever price fields a parser produced into the worker payload shape.
// All active parsers (Chrono24, eBay, Watchfinder) emit listedPrice + listedCurrency
// (currency-aware). listedPriceUsd is a legacy/back-compat field emitted only by the
// dormant dealer parsers; the worker prefers it when present, else converts listedPrice
// via the requested currency. Every field is optional, so the union is assignable here.
// `defaultCurrency` (from the host TLD) is applied only when the parser produced a price but
// no currency — so a currency symbol missing from the price's DOM node doesn't silently drop
// the delta. Exported for tests. [M7]
export function priceFields(
  p: {
    listedPriceUsd?: number | null;
    listedPrice?: number | null;
    listedCurrency?: string | null;
  },
  defaultCurrency?: string | null,
): { listedPriceUsd?: number; listedPrice?: number; listedCurrency?: string } {
  const currency =
    p.listedCurrency ?? (p.listedPrice != null ? (defaultCurrency ?? undefined) : undefined);
  return {
    listedPriceUsd: p.listedPriceUsd ?? undefined,
    listedPrice: p.listedPrice ?? undefined,
    listedCurrency: currency ?? undefined,
  };
}

function injectListingMountPoint(host: Host): HTMLElement {
  const mount = document.createElement("div");
  mount.id = "watchsentry-mount";
  for (const sel of ANCHOR_SELECTORS[host]) {
    const anchor = document.querySelector(sel);
    if (anchor?.parentElement) {
      anchor.parentElement.insertBefore(mount, anchor);
      return mount;
    }
  }
  document.body.prepend(mount);
  return mount;
}

function parseHostListing(host: Host) {
  switch (host) {
    case "chrono24":
      return parseChrono24Listing(document);
    case "ebay":
      return parseEbayListing(document);
    case "watchfinder":
      return parseWatchfinderListing(document);
  }
}

function parseHostSearch(host: Host) {
  switch (host) {
    case "chrono24":
      return parseChrono24Search(document);
    case "ebay":
      return parseEbaySearch(document);
    case "watchfinder":
      return parseWatchfinderSearch(document);
  }
}

async function runListing(settings: Settings, host: Host, defaultCurrency: string | null) {
  // Idempotent: if a badge is already mounted (e.g. a MutationObserver re-fire on the same
  // listing), don't inject a second one. SPA route changes remove the stale mount first. [H4]
  if (document.getElementById("watchsentry-mount")) return;
  const parsed = parseHostListing(host);
  if (!parsed) {
    log.warn(`${host} listing parser returned null`);
    return;
  }
  log.info("parsed", parsed);

  const mount = injectListingMountPoint(host);
  render(<Badge status="loading" />, mount);

  try {
    const requestBody = {
      brand: parsed.brand,
      reference: parsed.referenceNumber,
      condition: parsed.conditionTier,
      ...priceFields(parsed, defaultCurrency),
      anonymousId: settings.anonymousId,
      model: parsed.model,
    };
    log.info("request body", requestBody);
    const enriched = await enrichListing(requestBody, { apiBase: API_BASE });
    log.info("response", enriched);
    if (enriched.status === "unknown_reference" && parsed.model) {
      void reportDiscovery(
        { brand: parsed.brand, model: parsed.model, reference: parsed.referenceNumber },
        { apiBase: API_BASE },
      );
    }
    render(
      <Badge
        status={enriched.status}
        medianUsd={enriched.fairValue?.medianUsd}
        sampleSize={enriched.fairValue?.sampleSize}
        deltaPercent={enriched.delta?.percent}
        deltaAbsUsd={enriched.delta?.absoluteUsd}
        rangeLowUsd={enriched.fairValue?.rangeLowUsd}
        rangeHighUsd={enriched.fairValue?.rangeHighUsd}
      />,
      mount,
    );
  } catch (err) {
    log.error("enrich failed", err);
    // Distinct from no_data ("we have no comps"): a thrown error means we couldn't reach
    // the worker (network / timeout / non-2xx). Say so honestly instead of implying the
    // watch has no data. [M3]
    render(<Badge status="error" />, mount);
  }
}

const SEARCH_CONCURRENCY = 6;

async function runSearch(settings: Settings, host: Host, defaultCurrency: string | null) {
  const cards = parseHostSearch(host)
    .slice(0, MAX_CARDS_PER_PAGE)
    .filter((c) => c.brand && c.referenceNumber);

  await processWithConcurrency(cards, SEARCH_CONCURRENCY, async (card) => {
    if (!card.brand || !card.referenceNumber) return;
    // Idempotency: skip if this card already has a badge from a prior pass (defense against
    // SPA re-renders mid-flight).
    if (card.listingElement.querySelector(".ws-badge-compact")) return;
    try {
      const enriched = await enrichListing(
        {
          brand: card.brand,
          reference: card.referenceNumber,
          condition: "very_good",
          ...priceFields(card, defaultCurrency),
          anonymousId: settings.anonymousId,
          model: card.model ?? undefined,
        },
        { apiBase: API_BASE },
      );
      if (enriched.status === "unknown_reference" && card.brand && card.model) {
        void reportDiscovery(
          { brand: card.brand, model: card.model, reference: card.referenceNumber },
          { apiBase: API_BASE },
        );
      }
      // Only mount when BadgeCompact will actually render a pill (ok + a delta). Otherwise
      // every non-ok card would get an empty <span>. [L7]
      if (enriched.status === "ok" && enriched.delta?.percent !== undefined) {
        const mount = document.createElement("span");
        card.listingElement.appendChild(mount);
        render(<BadgeCompact status="ok" deltaPercent={enriched.delta.percent} />, mount);
      }
    } catch {
      // skip single-card failures silently
    }
  });
}

async function processWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  let index = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (true) {
      const i = index++;
      if (i >= items.length) return;
      await worker(items[i] as T);
    }
  });
  await Promise.all(runners);
}

// Exported for tests; `hostname` is injectable so a test can target a marketplace host
// without stubbing the global location.
export async function scan(hostname: string = location.hostname): Promise<void> {
  const settings = await getSettings();
  if (!settings.enabled) return;

  const host = chooseHost(hostname);
  if (!host) return; // off-marketplace page (defensive; shouldn't happen under our matches)

  const defaultCurrency = defaultCurrencyForHost(hostname);
  const route = chooseRoute(document, host);
  if (route === "listing") {
    await runListing(settings, host, defaultCurrency);
  } else if (route === "search") {
    await runSearch(settings, host, defaultCurrency);
  }
}

// Re-scan on SPA navigation (eBay/Watchfinder are client-side-routed) and on late DOM
// hydration, so badges appear without a full page load. The idempotency guards in
// runListing (mount check) and runSearch (.ws-badge-compact check) keep re-scans from
// duplicating badges. [H4]
function setupReactiveScan(): void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const debouncedScan = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => void scan(), 600);
  };

  new MutationObserver(debouncedScan).observe(document.body, { childList: true, subtree: true });

  const onNavigate = () => {
    // A new route may show a different watch — drop the stale listing badge so scan()
    // re-injects a fresh one. Search pills live on their cards, which the SPA replaces.
    document.getElementById("watchsentry-mount")?.remove();
    debouncedScan();
  };
  window.addEventListener("popstate", onNavigate);
  // pushState/replaceState don't emit popstate — wrap them to catch SPA navigations.
  for (const method of ["pushState", "replaceState"] as const) {
    const original = history[method];
    history[method] = function (this: History, ...args: Parameters<typeof original>) {
      const result = original.apply(this, args);
      onNavigate();
      return result;
    } as typeof original;
  }
}

// Auto-start in the extension; skipped under test, where scan() is driven directly.
if (import.meta.env?.MODE !== "test") {
  void scan();
  setupReactiveScan();
}
