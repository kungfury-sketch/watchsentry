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
import { type Host, chooseHost, chooseRoute } from "./route";

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
// Chrono24 parsers emit listedPrice + listedCurrency (currency-aware); the other
// marketplaces still emit listedPriceUsd. The union is structurally assignable here
// because every field is optional. The worker prefers listedPriceUsd, else converts
// listedPrice via the requested currency.
function priceFields(p: {
  listedPriceUsd?: number | null;
  listedPrice?: number | null;
  listedCurrency?: string | null;
}): { listedPriceUsd?: number; listedPrice?: number; listedCurrency?: string } {
  return {
    listedPriceUsd: p.listedPriceUsd ?? undefined,
    listedPrice: p.listedPrice ?? undefined,
    listedCurrency: p.listedCurrency ?? undefined,
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

async function runListing(settings: Settings, host: Host) {
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
      ...priceFields(parsed),
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
      />,
      mount,
    );
  } catch (err) {
    log.error("enrich failed", err);
    render(<Badge status="no_data" />, mount);
  }
}

const SEARCH_CONCURRENCY = 6;

async function runSearch(settings: Settings, host: Host) {
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
          ...priceFields(card),
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
      const mount = document.createElement("span");
      card.listingElement.appendChild(mount);
      render(
        <BadgeCompact status={enriched.status} deltaPercent={enriched.delta?.percent} />,
        mount,
      );
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

async function main() {
  const settings = await getSettings();
  if (!settings.enabled) return;

  const host = chooseHost(location.hostname);
  if (!host) return; // off-marketplace page (shouldn't happen under our manifest matches, but defensive)

  const route = chooseRoute(document, host);
  if (route === "listing") {
    await runListing(settings, host);
  } else if (route === "search") {
    await runSearch(settings, host);
  }
}

main();
