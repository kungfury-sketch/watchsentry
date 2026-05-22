import { parseChrono24Listing } from "../parsers/chrono24-listing";
import { parseChrono24Search } from "../parsers/chrono24-search";
import { parseEbayListing } from "../parsers/ebay-listing";
import { parseEbaySearch } from "../parsers/ebay-search";

export type Host = "chrono24" | "ebay";
export type Route = "listing" | "search" | "none";

// Hostname-based marketplace dispatch. Each host has its own listing + search parsers
// because eBay and Chrono24 use different DOM conventions even though the worker /enrich
// payload shape is identical (brand + ref + model + condition).
export function chooseHost(hostname: string): Host | null {
  if (/(^|\.)chrono24\.com$/i.test(hostname)) return "chrono24";
  if (/(^|\.)ebay\.(com|co\.uk|de)$/i.test(hostname)) return "ebay";
  return null;
}

// Content-based route dispatch within a host: tries listing-detail parser first, falls
// back to search-results parser. Resilient to URL-pattern changes on the marketplace side.
export function chooseRoute(doc: Document, host: Host): Route {
  if (host === "chrono24") {
    if (parseChrono24Listing(doc) !== null) return "listing";
    if (parseChrono24Search(doc).length > 0) return "search";
    return "none";
  }
  if (host === "ebay") {
    if (parseEbayListing(doc) !== null) return "listing";
    if (parseEbaySearch(doc).length > 0) return "search";
    return "none";
  }
  return "none";
}
