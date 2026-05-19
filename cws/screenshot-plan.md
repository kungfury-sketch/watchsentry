# CWS screenshots — capture plan

Chrome Web Store accepts 1-5 screenshots at **1280×800** or **640×400** PNG/JPG. Use 1280×800 for sharper visuals on the CWS detail page; 640×400 is for thumbnails on the search page.

This plan lists 5 shots that together tell the product story: "I saw the listing, the badge told me whether it was a deal, and the search page let me scan dozens at once."

Save captured images into `cws/screenshots/` with the filenames noted below.

---

## Shot 1 — Hero: a "good deal" listing badge

**Goal:** the first thing a CWS visitor sees should make the value prop instantly obvious.

**Setup:**
1. Open Chrono24 → search for `Rolex Submariner 124060`
2. Sort by "Price: lowest first"
3. Open the first listing with a USD price (use US/UK seller for cleanest layout)
4. Wait for the WatchSentry badge to render (full Fair value / Listing vs fair / sold-comps card)
5. Make sure the listing price is **below** the fair-value median (negative delta → ws-good green badge)

**Crop:** show the badge alongside enough of the listing context (price + photo + title) that a viewer can read both "this is a Submariner at $X" and "the badge says it's $Y below market."

**File:** `cws/screenshots/01-listing-good-deal.png`

---

## Shot 2 — A "fair / neutral" listing

**Goal:** show that the badge isn't always green — there's real signal.

**Setup:**
1. Same search, but pick a listing whose price is within ±5% of the median (neutral / gray badge)
2. Same crop framing as Shot 1

**File:** `cws/screenshots/02-listing-neutral.png`

> If no neutral example exists at the moment of capture, pick a slightly above-market listing (red ws-bad). The point is "the badge isn't always positive."

---

## Shot 3 — Search-results compact badges

**Goal:** demonstrate the at-a-glance scan across a whole page of listings.

**Setup:**
1. Search `Rolex Submariner 124060` → land on the search results page
2. Wait 10-15 seconds for the compact badges to populate on each visible card
3. Scroll so 6-8 cards are visible in one screenshot, with their badges showing a mix of green / neutral / red

**Crop:** the 6-8-card grid, badges clearly visible on each.

**File:** `cws/screenshots/03-search-results-grid.png`

---

## Shot 4 — Untracked-reference fallback

**Goal:** show the honest fallback messaging when a reference isn't yet in our DB (sets expectations + makes the next 50 reference adds feel valuable).

**Setup:**
1. Find a Chrono24 listing for a less-mainstream reference that we have NOT seeded (e.g. a vintage Rolex pre-2000, an unusual Sinn, etc.)
2. Open the listing and let the badge render
3. The badge should read "WatchSentry: reference not yet tracked" (neutral gray)

**Crop:** the listing's title + price + the neutral "not yet tracked" badge.

**File:** `cws/screenshots/04-untracked-reference.png`

> If you can't find an untracked reference easily, skip this shot — 4 screenshots is fine. Don't fabricate a fake one.

---

## Shot 5 — Settings popup

**Goal:** show that the extension has a real UI surface and an on/off toggle (CWS reviewers like to see this for legitimacy).

**Setup:**
1. On any Chrono24 page, click the WatchSentry icon in the toolbar
2. The popup opens (currently minimal: shows the on/off state and the anon-ID line)
3. Capture the popup with the host Chrono24 page partially visible behind it

**Crop:** popup + background frame for context.

**File:** `cws/screenshots/05-popup.png`

---

## Capture tooling (any of these works)

- **Windows built-in:** `Win + Shift + S` → "rectangle" mode → crop to 1280×800 manually if needed
- **Chrome built-in:** DevTools (F12) → ⋮ menu → "Capture screenshot" with the page sized to a 1280px viewport (set via DevTools device-toolbar)
- **Free tools:** ShareX, Greenshot, Lightshot
- **Resize after the fact** to exactly 1280×800: any image editor. Don't upscale a smaller capture — quality matters for the CWS detail page.

## Quality bar

- No personal browser chrome (extensions toolbar, bookmarks bar with personal sites). Use a clean Chrome profile or hide the bookmarks bar (`Ctrl+Shift+B`).
- No personal data visible (open tabs in the strip, autocomplete suggestions, account avatar). Sign out of Chrome or use a guest profile.
- No PII in the URL bar (e.g. session tokens, account names).
- File the captures into `cws/screenshots/` and commit them so they're versioned. CWS lets you re-upload screenshots without re-submitting the whole listing.
