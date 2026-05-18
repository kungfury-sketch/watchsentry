import { render } from "preact";
import { enrichListing } from "../api/client";
import { Badge } from "../components/Badge";
import { parseChrono24Listing } from "../parsers/chrono24-listing";

// TODO(phase-1): Replace once the watchsentry-api worker is deployed (Task 2.7).
// The actual subdomain is the kungfurry account's workers.dev subdomain — known
// at deploy time, not at scaffold time. Until then, network calls will fail
// (DNS) and the badge will fall through to the "no_data" branch — which is the
// correct UX for "unknown reference" prior to launch.
const API_BASE = "https://watchsentry-api.<your-subdomain>.workers.dev";

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
