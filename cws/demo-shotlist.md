# CWS demo video — shot list (optional but recommended)

Chrome Web Store accepts an unlisted YouTube link in the "Promotional video" field. A short demo significantly improves the conversion rate on the detail page, especially for utility extensions.

Target: **~30 seconds, no voiceover, no music**. Just the screen telling the story. Add captions/text overlays if you have the tool for it; if not, the silent video still works.

---

## Shot list

| # | Duration | Action | Notes |
|---|---|---|---|
| 1 | 3s | Open `chrono24.com`, scrub mouse over the top nav to establish the site | No badges yet — this is "what Chrono24 looks like before the extension." |
| 2 | 4s | Type "Rolex Submariner 124060" into the search bar, hit enter | Show the search-results page appearing. |
| 3 | 6s | Watch as compact badges populate next to each card | This is the at-a-glance value moment — let it breathe. |
| 4 | 3s | Cursor moves to one of the green badges, briefly hovers | Don't click yet — let the viewer absorb the green/neutral mix. |
| 5 | 4s | Click into a listing with a clearly green badge (below market) | Page transition. |
| 6 | 6s | Listing page loads, the full WatchSentry card renders with Fair value / Listing vs fair / sold-comps | This is the payoff shot. |
| 7 | 4s | Optional: a smooth scroll showing the badge sits naturally above the price section | Helps reviewers see the UI integration is clean. |

**Total:** ~30s.

---

## Production notes

- **Resolution:** 1920×1080 minimum. Even though CWS thumbnail is small, the YouTube hosting page is full-resolution and people watch it there.
- **Frame rate:** 30fps is plenty for a screen-cap of static UI. Higher = bigger file with no payoff.
- **Mouse speed:** slow and deliberate. The video is a teaching artifact, not a demo reel.
- **Cursor visibility:** turn on a cursor-highlighting tool if Windows isn't doing it natively (PowerToys → "Mouse Highlighter"). Helps viewers track what you're showing.
- **No personal data in frame:** sign out of Chrome / use a guest profile. Hide the bookmarks bar (`Ctrl+Shift+B`).
- **Audio:** mute the recording — no system sounds, no mic. Background music is OK in post but tends to feel like marketing noise; skip it for a utility extension.

---

## Tooling

- **OBS Studio** — free, capable, slight learning curve
- **Loom** — free tier handles this easily, exports to MP4 + auto-uploads to a cloud URL (good for YouTube import)
- **Windows Game Bar** — `Win + G` → record. Limited editing.
- **macOS QuickTime** — built-in screen recording, basic trim

After recording: trim to ~30s, export as 1080p MP4, upload to YouTube as "Unlisted." Paste the YouTube URL into the CWS listing's "Promotional video" field.

---

## After upload

- [ ] YouTube video set to **Unlisted** (not Private — CWS needs to be able to load it without sign-in)
- [ ] Video title: "WatchSentry — fair value on every Chrono24 listing"
- [ ] Video description: same as CWS short description + the privacy policy URL
- [ ] YouTube channel name does NOT reveal operator identity (anonymity audit)
- [ ] Link pasted into CWS listing
