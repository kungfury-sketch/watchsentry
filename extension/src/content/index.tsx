import { render } from "preact";
import { enrichListing } from "../api/client";
import { Badge } from "../components/Badge";
import { BadgeCompact } from "../components/BadgeCompact";
import { parseChrono24Listing } from "../parsers/chrono24-listing";
import { parseChrono24Search } from "../parsers/chrono24-search";
import { type Settings, getSettings } from "../storage";

// Cut over to api.watchsentry.app once the custom Worker route is wired (Week 5).
const API_BASE = "https://watchsentry-api.txrz.workers.dev";
const MAX_CARDS_PER_PAGE = 50;

function injectListingMountPoint(): HTMLElement {
  const anchor = document.querySelector(".js-detail-page-price-section") ?? document.body;
  const mount = document.createElement("div");
  mount.id = "watchsentry-mount";
  anchor.parentElement?.insertBefore(mount, anchor);
  return mount;
}

async function runListing(settings: Settings) {
  const parsed = parseChrono24Listing(document);
  if (!parsed) return;

  const mount = injectListingMountPoint();
  render(<Badge status="loading" />, mount);

  try {
    const enriched = await enrichListing(
      {
        brand: parsed.brand,
        reference: parsed.referenceNumber,
        condition: parsed.conditionTier,
        listedPriceUsd: parsed.listedPriceUsd ?? undefined,
        anonymousId: settings.anonymousId,
      },
      { apiBase: API_BASE },
    );
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
  } catch {
    render(<Badge status="no_data" />, mount);
  }
}

async function runSearch(settings: Settings) {
  const cards = parseChrono24Search(document).slice(0, MAX_CARDS_PER_PAGE);
  for (const card of cards) {
    if (!card.brand || !card.referenceNumber) continue;
    try {
      const enriched = await enrichListing(
        {
          brand: card.brand,
          reference: card.referenceNumber,
          condition: "very_good",
          listedPriceUsd: card.listedPriceUsd ?? undefined,
          anonymousId: settings.anonymousId,
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
  }
}

async function main() {
  const settings = await getSettings();
  if (!settings.enabled) return;

  if (location.pathname.startsWith("/search/")) {
    await runSearch(settings);
  } else {
    await runListing(settings);
  }
}

main();
