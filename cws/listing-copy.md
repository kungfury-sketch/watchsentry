# Chrome Web Store — listing copy

> **Anonymity check:** every field in this document must be reviewed against `docs/anonymity-audit.md` BEFORE submission. No operator name, no personal email, no internal paths.

---

## Name (max 75 chars)

```
WatchSentry — fair value on every Chrono24 listing
```

(51 chars)

---

## Short description (max 132 chars)

```
See whether a Chrono24 watch listing is above or below market in one glance — based on 90-day eBay sold-comps.
```

(112 chars)

**Alternative shorter / sharper variants for A/B if the first underperforms:**

```
Fair-value badge on every Chrono24 watch listing. Compare list price to 90-day eBay sold-comps in one glance.
```
(110 chars)

```
Don't overpay on Chrono24. WatchSentry shows fair value next to every listing — based on real eBay sold-comps.
```
(111 chars)

---

## Detailed description (max 16,000 chars)

```
WatchSentry adds a small fair-value badge to every Chrono24 listing, so you can see at a glance whether the asking price is above, below, or near the market.

HOW IT WORKS

Open any Chrono24 listing — the badge compares the listed price to a 90-day weighted median of comparable eBay sold-listings for the same brand and reference number. If you're looking at search results, every card gets a compact ±% badge so you can spot deals across a whole page without clicking through.

You see:
• A fair-value number derived from real recent sales, not asking prices
• The listing's delta vs that fair value (positive = above market, negative = below)
• How many sold-comps we used and over what time window

WHAT YOU DON'T HAVE TO DO

• No sign-up. No account. No password.
• No browser extension permissions beyond storage and the Chrono24 + API hosts.
• No tracking pixels. No advertising. No third-party SDKs.

WHAT'S COVERED

Phase 0 ships with fair-value coverage for the top-searched references in the major brands: Rolex, Omega, Tudor, Cartier, Audemars Piguet, Patek Philippe, IWC, Breitling, Grand Seiko, Panerai, Hublot, Vacheron Constantin, A. Lange & Söhne, Jaeger-LeCoultre, and Zenith.

If you visit a listing for a reference we haven't seeded yet, you'll see a small "reference not yet tracked" note instead of a number. New references are added on a rolling weekly basis based on what users actually look at.

PRIVACY

WatchSentry sends three things to our server when you visit a Chrono24 listing:
• Brand (e.g. "Rolex")
• Reference number (e.g. "124060")
• Condition tier (new / very_good / good / fair)

Plus a randomly-generated anonymous ID stored locally in your browser, used for nothing except daily rate-limiting our own server. There is no link between this ID and you. You can clear it at any time by removing the extension's storage in chrome://extensions.

We do NOT collect:
• Your name, email, or any login data
• Your IP address (beyond what every HTTPS request unavoidably exposes; we don't store it)
• Browsing history outside of the specific listing you're actively viewing
• Payment information (the extension is free)

Full privacy policy: https://watchsentry.app/privacy.html

COMING NEXT

• Cross-marketplace alternatives — see comparable listings on eBay, Bezel, Bob's Watches alongside the Chrono24 result
• Seller risk score — flag sellers with thin history, no return policy, or recent dispute reports
• Want-list monitor — track references you care about and get a notification when one drops below your target

QUESTIONS / FEEDBACK

support@watchsentry.app

LEGAL

WatchSentry is an independent buyer-side tool and is not affiliated with, endorsed by, or sponsored by Chrono24, eBay, or any watch brand mentioned. All trademarks belong to their respective owners.
```

(~1,950 chars — well under the 16,000 limit, leaves room to expand later)

---

## Category

`Shopping`

(Secondary candidates if Chrome rejects: `Productivity`, `Tools`. Shopping is the strongest fit because the extension is a buyer-decision aid.)

---

## Language

`English`

---

## Privacy policy URL

```
https://watchsentry.app/privacy.html
```

**Fallback if the custom domain isn't live yet at submission time:**

```
https://watchsentry.pages.dev/privacy.html
```

(Cloudflare Pages auto-assigns a `<project>.pages.dev` URL the moment the site deploys; works regardless of custom domain state.)

---

## Support URL / contact

```
mailto:support@watchsentry.app
```

(Requires the domain's MX or Cloudflare Email Routing to be live. If the domain isn't yet bought at submission, use the GitHub `<id>+<gh-username>@users.noreply.github.com` address as audit debt with a written remediation plan — swap to `support@watchsentry.app` once the domain is wired. Cross-reference `docs/anonymity-audit.md` row "CWS support email" for the live-or-debt status at submission time.)

---

## Permissions justification (CWS asks per permission)

CWS will ask three "Why does your extension need this?" questions. Use these answers verbatim:

### `storage`

```
Used to persist two things locally in chrome.storage.local: (1) a randomly-generated anonymous user identifier used only for daily rate-limiting against our own API, and (2) the user's on/off toggle for the extension. Both items live in the user's browser and are never transmitted except as part of the rate-limit field in API calls. No personal data is stored.
```

### `host_permissions: https://watchsentry-api.txrz.workers.dev/*`

```
Used to call our fair-value enrichment API at watchsentry-api.txrz.workers.dev. The extension sends only the brand, reference number, condition tier, and listed price of the watch the user is currently viewing on Chrono24, plus the anonymous rate-limit ID. The API returns the 90-day weighted median price and a delta. No other site is called from this permission.
```

### Active tab + content scripts (declared via `content_scripts.matches`, no separate justification field but CWS reviewers may ask)

```
The content script runs only on chrono24.com and its country-localized subdomains (https://*.chrono24.com/*). Its job is to read the brand and reference number from the listing's Schema.org Product metadata (or the search-card DOM) and inject the fair-value badge. It does not read other pages, does not read forms or input fields, and does not capture user activity beyond the listing currently being viewed.
```

---

## Data usage disclosure (CWS now requires this)

### Does your extension collect user data?

**Yes** — minimal: a randomly-generated anonymous identifier and the brand / reference / condition / listed-price of the watch currently being viewed.

### What categories of data does your extension collect?

Check **only** the following CWS data categories. Leave all others UNCHECKED:

- ☑️ **Web history** — partially: we see the URL of the specific Chrono24 listing being viewed, only at the moment the user opens it. We do not maintain a browsing history.
- ☐ Personally identifiable information — NO
- ☐ Health information — NO
- ☐ Financial and payment information — NO
- ☐ Authentication information — NO
- ☐ Personal communications — NO
- ☐ Location — NO
- ☐ User activity — NO (we don't track interactions beyond loading the listing)
- ☐ Website content — NO (we don't capture page content beyond the structured listing fields)

### Three required CWS statements (check all three)

1. ☑️ **I do not sell or transfer user data to third parties, outside of the approved use cases.**
2. ☑️ **I do not use or transfer user data for purposes unrelated to my item's single purpose.**
3. ☑️ **I do not use or transfer user data to determine creditworthiness or for lending purposes.**

### Single purpose statement (CWS requires this)

```
WatchSentry has a single purpose: show buyers a fair-value reference price next to every Chrono24 watch listing, derived from a 90-day weighted median of comparable eBay sold-comps.
```

---

## Remote code disclosure

```
This extension does NOT load or execute any remote code. All JavaScript, CSS, and resources are bundled into the extension package and reviewed at submission time. The only remote interaction is an HTTPS POST to our fair-value API which returns JSON data — never executable code.
```

---

## Final pre-submission checklist (for the human submitting)

- [ ] Anonymity audit (`docs/anonymity-audit.md`) re-run and all rows checked or have explicit remediation notes
- [ ] CWS developer-account display name is "WatchSentry" (not operator's real name)
- [ ] Support email field resolved: either `support@watchsentry.app` is live, OR audit debt acknowledged with deadline
- [ ] Privacy policy URL resolves to an actual privacy policy page (pages.dev or custom domain)
- [ ] Extension manifest version matches the bundle being uploaded (`extension/dist/manifest.json`)
- [ ] All 5 screenshots captured at 1280×800 (see `screenshot-plan.md`)
- [ ] Optional: demo video uploaded (see `demo-shotlist.md`)
- [ ] Listing copy above pasted into the CWS dashboard fields, character counts re-verified
- [ ] Data-usage checkboxes match the disclosure above
- [ ] Permissions justifications pasted verbatim
