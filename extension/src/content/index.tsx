import { render } from "preact";
import { enrichListing } from "../api/client";
import { Badge } from "../components/Badge";
import { parseChrono24Listing } from "../parsers/chrono24-listing";

// Cut over to api.watchsentry.app once the custom Worker route is wired (Week 5).
const API_BASE = "https://watchsentry-api.txrz.workers.dev";

function injectMountPoint(): HTMLElement {
  // Mount above the price block on Chrono24 listing pages.
  // Selector may need adjustment based on actual DOM — fallback to body.
  const anchor = document.querySelector(".js-detail-page-price-section") ?? document.body;
  const mount = document.createElement("div");
  mount.id = "watchsentry-mount";
  anchor.parentElement?.insertBefore(mount, anchor);
  return mount;
}

async function run() {
  const parsed = parseChrono24Listing(document);
  if (!parsed) return;

  const mount = injectMountPoint();
  render(<Badge status="loading" />, mount);

  try {
    const enriched = await enrichListing(
      {
        brand: parsed.brand,
        reference: parsed.referenceNumber,
        condition: parsed.conditionTier,
        listedPriceUsd: parsed.listedPriceUsd ?? undefined,
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

run();
