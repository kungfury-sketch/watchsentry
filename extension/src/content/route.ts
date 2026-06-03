import { parseChrono24Listing } from "../parsers/chrono24-listing";
import { parseChrono24Search } from "../parsers/chrono24-search";
import { parseEbayListing } from "../parsers/ebay-listing";
import { parseEbaySearch } from "../parsers/ebay-search";
import { parseWatchfinderListing } from "../parsers/watchfinder-listing";
import { parseWatchfinderSearch } from "../parsers/watchfinder-search";

// Active marketplaces are the three verified-working against live DOM (Chrono24, eBay,
// Watchfinder). Crown & Caliber, WatchCharts, and Hodinkee are DISABLED pending live-DOM
// verification — their parsers (parsers/{crownandcaliber,watchcharts,hodinkee}-*.ts) remain
// in the tree (dormant, synthetic-fixture-tested) for a future re-enable, but are not wired
// into the manifest or this dispatch. (2026-06-03)
export type Host = "chrono24" | "ebay" | "watchfinder";
export type Route = "listing" | "search" | "none";

// Hostname-based marketplace dispatch. Strict regex with anchor (^ or \.) to defeat
// hostname spoofing like `chrono24.evil.com`.
export function chooseHost(hostname: string): Host | null {
  if (/(^|\.)chrono24\.com$/i.test(hostname)) return "chrono24";
  if (/(^|\.)ebay\.(com|co\.uk|de)$/i.test(hostname)) return "ebay";
  if (/(^|\.)watchfinder\.(co\.uk|com)$/i.test(hostname)) return "watchfinder";
  return null;
}

// Content-based route dispatch within a host: tries listing-detail parser first, falls
// back to search-results parser.
export function chooseRoute(doc: Document, host: Host): Route {
  switch (host) {
    case "chrono24":
      if (parseChrono24Listing(doc) !== null) return "listing";
      if (parseChrono24Search(doc).length > 0) return "search";
      return "none";
    case "ebay":
      if (parseEbayListing(doc) !== null) return "listing";
      if (parseEbaySearch(doc).length > 0) return "search";
      return "none";
    case "watchfinder":
      if (parseWatchfinderListing(doc) !== null) return "listing";
      if (parseWatchfinderSearch(doc).length > 0) return "search";
      return "none";
  }
}
