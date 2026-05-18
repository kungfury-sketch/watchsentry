# Test Fixtures

## chrono24-listing-rolex-124060.html

**SYNTHETIC fixture — not captured from a live page.**

This fixture is a hand-built HTML document containing a single
`<script type="application/ld+json">` block that mirrors Chrono24's
documented schema.org `Product` shape:

```jsonc
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Rolex Submariner Date 124060",
  "brand": { "@type": "Brand", "name": "Rolex" },
  "sku": "124060",
  "productID": "synthetic-listing-id-001",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "USD",
    "price": "9500.00",
    "itemCondition": "https://schema.org/UsedCondition"
  }
}
```

### Why synthetic?

Phase 0 Task 3.2 originally required a real-page capture (Save As → HTML).
That step was deferred to a future session to allow autonomous progress. The
parser at `src/parsers/chrono24-listing.ts` targets schema.org `Product` —
a synthetic fixture exercises the same code paths as a real Chrono24 page.

### MUST DO before Phase 1 launch

**Replace this fixture with a real Chrono24 listing capture** to catch any
deviation between schema.org spec and what Chrono24 actually emits:

1. Visit an active Chrono24 listing for a seeded reference
   (e.g. Rolex Submariner 124060 — see `workers/migrations/0002_seed_refs.sql`).
2. Right-click → "Save page as…" → "Webpage, HTML only".
3. Save into this folder, overwriting the synthetic file.
4. Re-run `npm test` to confirm the parser still passes against real DOM.
5. If it fails, inspect actual `ld+json` structure and refine
   `parseChrono24Listing` until green.

Until then, the parser is **correct against schema.org spec but unverified
against Chrono24's live DOM**. Track this as Phase 1 blocker.
