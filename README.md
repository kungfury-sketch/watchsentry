# WatchSentry

A Chrome extension that protects mid-market watch buyers on Chrono24 by overlaying fair value, cross-marketplace alternatives, and seller risk evidence on every listing page.

**Status:** Phase 0 — pre-launch. Not yet on the Chrome Web Store.

## Layout

This is a monorepo. Each top-level folder is independently buildable/deployable.

| Folder | Purpose |
|---|---|
| `extension/` | The Chrome extension itself (manifest v3, Vite + crxjs, TypeScript, Preact). |
| `workers/` | Cloudflare Workers API (Hono) + D1 migrations + Cron triggers. Backend for the extension. |
| `landing/` | The watchsentry.com static site (Cloudflare Pages). Privacy policy, terms, mailing list. |
| `cws/` | Chrome Web Store submission assets: listing copy, screenshots. Demo videos are NOT committed (binary, large). |
| `docs/` | Plans, design records, anonymity audit, runbooks. |
| `progress/` | Per-work-session log. |
| `.github/workflows/` | CI: lint + typecheck + test on every push. |

## Contributing

This repo is private and the project is proprietary (see `LICENSE`). External contributions are not currently accepted.

## Contact

`support@watchsentry.com`

---

*WatchSentry is an independent tool and is not affiliated with Chrono24, eBay, Cloudflare, or any watch brand.*
