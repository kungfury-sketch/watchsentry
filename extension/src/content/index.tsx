import { render } from "preact";
import { enrichListing } from "../api/client";
import { Badge } from "../components/Badge";
import { BadgeCompact } from "../components/BadgeCompact";
import { parseChrono24Listing } from "../parsers/chrono24-listing";
import { parseChrono24Search } from "../parsers/chrono24-search";
import { type Settings, getSettings } from "../storage";
import { chooseRoute } from "./route";

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

function injectListingMountPoint(): HTMLElement {
  const mount = document.createElement("div");
  mount.id = "watchsentry-mount";
  const anchor =
    document.querySelector(".detail-page-price") ??
    document.querySelector(".js-detail-page-price-section");
  if (anchor?.parentElement) {
    anchor.parentElement.insertBefore(mount, anchor);
  } else {
    document.body.prepend(mount);
  }
  return mount;
}

async function runListing(settings: Settings) {
  const parsed = parseChrono24Listing(document);
  if (!parsed) {
    log.warn("parser returned null on listing page");
    return;
  }
  log.info("parsed", parsed);

  const mount = injectListingMountPoint();
  render(<Badge status="loading" />, mount);

  try {
    const requestBody = {
      brand: parsed.brand,
      reference: parsed.referenceNumber,
      condition: parsed.conditionTier,
      listedPriceUsd: parsed.listedPriceUsd ?? undefined,
      anonymousId: settings.anonymousId,
      model: parsed.model,
    };
    log.info("request body", requestBody);
    const enriched = await enrichListing(requestBody, { apiBase: API_BASE });
    log.info("response", enriched);
    render(
      <Badge
        status={enriched.status}
        medianUsd={enriched.fairValue?.medianUsd}
        listedPriceUsd={parsed.listedPriceUsd ?? undefined}
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

async function runSearch(settings: Settings) {
  const cards = parseChrono24Search(document)
    .slice(0, MAX_CARDS_PER_PAGE)
    .filter((c) => c.brand && c.referenceNumber);

  await processWithConcurrency(cards, SEARCH_CONCURRENCY, async (card) => {
    if (!card.brand || !card.referenceNumber) return;
    // Idempotency: skip if this card already has a badge from a prior pass (defense against
    // Chrono24's SPA re-rendering the cards while our async work was in flight).
    if (card.listingElement.querySelector(".ws-badge-compact")) return;
    try {
      const enriched = await enrichListing(
        {
          brand: card.brand,
          reference: card.referenceNumber,
          condition: "very_good",
          listedPriceUsd: card.listedPriceUsd ?? undefined,
          anonymousId: settings.anonymousId,
          model: card.model ?? undefined,
        },
        { apiBase: API_BASE },
      );
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

  const route = chooseRoute(document);
  if (route === "listing") {
    await runListing(settings);
  } else if (route === "search") {
    await runSearch(settings);
  }
}

main();
