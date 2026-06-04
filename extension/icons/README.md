# Extension Icons

Production brand icons: a shield with a checkmark ("verified / safe to buy"), matching
the landing-page mark. Referenced by `manifest.config.ts` and the popup header.

| File | Size | Use |
|---|---|---|
| `16.png` | 16×16 | Toolbar favicon |
| `48.png` | 48×48 | Extension management page + popup header |
| `128.png` | 128×128 | CWS listing + install prompt |

`candidates/` holds earlier icon explorations and is not referenced by the manifest.

Keep these filenames stable so the manifest doesn't change. (Earlier Phase-0 builds shipped
1×1 transparent stubs; those were replaced with the real artwork — this note corrects the
prior placeholder warning.)
