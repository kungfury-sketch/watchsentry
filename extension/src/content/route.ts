import { parseChrono24Listing } from "../parsers/chrono24-listing";
import { parseChrono24Search } from "../parsers/chrono24-search";

export type Route = "listing" | "search" | "none";

// Content-based dispatch: lets the extension fire across all Chrono24 page types
// (listing detail, brand index, model page, /search/) without hardcoded URL patterns.
export function chooseRoute(doc: Document): Route {
  if (parseChrono24Listing(doc) !== null) return "listing";
  if (parseChrono24Search(doc).length > 0) return "search";
  return "none";
}
