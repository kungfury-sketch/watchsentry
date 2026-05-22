import { parseChrono24Listing } from "../parsers/chrono24-listing";
import { parseChrono24Search } from "../parsers/chrono24-search";
import { parseCrownAndCaliberListing } from "../parsers/crownandcaliber-listing";
import { parseCrownAndCaliberSearch } from "../parsers/crownandcaliber-search";
import { parseEbayListing } from "../parsers/ebay-listing";
import { parseEbaySearch } from "../parsers/ebay-search";
import { parseHodinkeeListing } from "../parsers/hodinkee-listing";
import { parseWatchchartsListing } from "../parsers/watchcharts-listing";
import { parseWatchchartsSearch } from "../parsers/watchcharts-search";
import { parseWatchfinderListing } from "../parsers/watchfinder-listing";
import { parseWatchfinderSearch } from "../parsers/watchfinder-search";

export type Host =
  | "chrono24"
  | "ebay"
  | "watchfinder"
  | "crownandcaliber"
  | "watchcharts"
  | "hodinkee";
export type Route = "listing" | "search" | "none";

// Hostname-based marketplace dispatch. Strict regex with anchor (^ or \.) to defeat
// hostname spoofing like `chrono24.evil.com`.
export function chooseHost(hostname: string): Host | null {
  if (/(^|\.)chrono24\.com$/i.test(hostname)) return "chrono24";
  if (/(^|\.)ebay\.(com|co\.uk|de)$/i.test(hostname)) return "ebay";
  if (/(^|\.)watchfinder\.(co\.uk|com)$/i.test(hostname)) return "watchfinder";
  if (/(^|\.)crownandcaliber\.com$/i.test(hostname)) return "crownandcaliber";
  if (/(^|\.)watchcharts\.com$/i.test(hostname)) return "watchcharts";
  if (/(^|\.)hodinkee\.com$/i.test(hostname)) return "hodinkee";
  return null;
}

// Content-based route dispatch within a host: tries listing-detail parser first, falls
// back to search-results parser. Hodinkee has no separate search parser yet — its
// collection pages are deferred to Phase 1.2 because the curated catalog is small.
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
    case "crownandcaliber":
      if (parseCrownAndCaliberListing(doc) !== null) return "listing";
      if (parseCrownAndCaliberSearch(doc).length > 0) return "search";
      return "none";
    case "watchcharts":
      if (parseWatchchartsListing(doc) !== null) return "listing";
      if (parseWatchchartsSearch(doc).length > 0) return "search";
      return "none";
    case "hodinkee":
      if (parseHodinkeeListing(doc) !== null) return "listing";
      return "none";
  }
}
