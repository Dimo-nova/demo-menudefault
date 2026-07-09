# Real Logos + Hero Photo Banner — Design

**Date:** 2026-07-09
**Status:** Approved design, pending spec review

## Goal

Finalise the 23 restaurant-branded demo mocks (`themes.js`, one per Goatstown/Dundrum
prospect — see `Dimonova_Prospecting_Pack_Goatstown.pdf`) before they're shown at doorstep
pitches. Two gaps, closed in this pass:

1. **Real logos** — every theme's `identity.logoUrl` is currently `''`, so the header shows
   a plain monogram circle for all 23. Replace with the venue's actual logo where one can be
   sourced.
2. **Hero photo banner** — the demo has no photo banner at all. `client-leclubtenerife`'s
   `Hero.tsx` (a full-bleed venue photo with a name/tagline overlay, sitting below the sticky
   header) is the reference: it makes the menu feel like *that specific restaurant's* menu,
   not a generic template. Bring an adapted version into the demo, styled per-theme.

Both are sourced from each venue's real website (URLs already catalogued per-venue in the
prospecting pack's "Grab their logo & colours" field) — not invented or stock imagery.

## Decisions captured during brainstorming

- **Photo/logo source:** real assets fetched from each venue's own site, not stock photos or
  generic placeholders. Where a real asset can't be gotten (Instagram-only sources, mainly),
  fall back to what already exists today — monogram circle for logo, and a new theme-coloured
  gradient for the hero (see below) — no manual sourcing detour, no fetch left half-done.
- **Hero photo content:** "best available ambiance shot" per venue — whatever the homepage's
  strongest image is (storefront, interior, or a plated hero dish), judged per venue rather
  than forcing one category.
- **Storage:** downloaded and committed locally (`images/logos/`, `images/heroes/`), not
  hotlinked. Keeps the demo working offline at a pitch and immune to the source site changing
  or Instagram's hotlink blocking.
- **Layout:** the hero banner is a new element, inserted below the existing sticky compact
  header (logo circle + name + tabs) — that header is untouched. The hero is not sticky; it
  scrolls away with the rest of the menu, same as in `client-leclubtenerife`.
- **Rollout:** all 23 venues in one fetch pass (not a Ring-1 pilot first).

## Asset fetch script

`scripts/fetch-brand-assets.mjs` — a one-off Node script (not shipped as part of the running
app; lives alongside the repo for re-runs if a venue's site changes later).

- A manifest of the 23 `{ key, homepageUrl }` pairs, taken from the prospecting pack's
  "Grab their logo & colours" links (e.g. `HX46 → https://hx46cafe.ie`). Instagram-only
  entries (`GRND`, `FOIR`, `COMM`, `EGGS`, `GRIN`, `COSY`) are included with their Instagram
  URL but expected to fail — Instagram serves a login wall to unauthenticated fetches.
- For each venue: `fetch()` the homepage HTML (following the one redirect most of these sites
  issue, e.g. `hx46cafe.ie` → `www.hx46cafe.ie`), then regex out:
  - **Hero candidate:** `<meta property="og:image" content="...">`.
  - **Logo candidate:** `<link rel="apple-touch-icon" ...>` or `<link rel="icon" ...>` (prefer
    the largest declared `sizes`), falling back to a `<img>` inside a `<header>`/`<nav>` whose
    `src` or `class`/`alt` contains "logo".
- Resolve relative URLs against the final (post-redirect) page URL, download each candidate,
  and only keep it if: HTTP 200, `content-type` starts with `image/`, and the body is over a
  small byte threshold (rejects 1×1 tracking pixels and broken placeholder icons).
- Saved as `images/heroes/<KEY>.<ext>` and `images/logos/<KEY>.<ext>` (extension from
  `content-type`). Nothing is written for a venue/slot that fails the checks above.
- Prints a final pass/fail table: key, hero ✓/✗, logo ✓/✗ — this is what gets eyeballed before
  wiring `themes.js`, and what tells us which venues fall back to the gradient/monogram.

This script does real, unauthenticated HTTP GETs to sites already given by the prospect
himself as "their real logo and colours" source in the pack he's using to pitch them — the
same two-minute lookup the pack tells him to do by hand per venue, automated across all 23.

## Data model changes (`themes.js`)

One additive field per theme, alongside the existing `logoUrl`:

```js
identity:{
  name:'HX46 Café', monogram:'HX', tagline:'Pan-Asian kitchen & coffee · Goatstown',
  logoUrl:'images/logos/HX46.png',   // '' ⇒ existing monogram-circle fallback
  heroUrl:'images/heroes/HX46.jpg',  // '' ⇒ new gradient fallback (see Hero component)
},
```

`A` (Earthy) and `B` (Minimal), the two generic non-client themes, are untouched — no
`heroUrl`, same as they have no `identity` override today.

## `Hero` component (new, in `index.html`)

Inserted in `MenuApp`, between the existing `Header` and `FilterBar`:

```
Header (sticky: logo circle · name · tagline · tabs)
Hero            ← new
FilterBar
MenuList
```

- Full-bleed within the 720px app column, fixed height ~220px (shorter than leclub's 296px —
  the demo already spends more header height on the logo bar and tabs).
- Background is two CSS layers, real photo on top of a theme-coloured fallback, so a missing
  `heroUrl` degrades cleanly with no broken-image icon and no conditional JSX:
  ```js
  backgroundImage: `url('${theme.identity?.heroUrl || ''}'), repeating-linear-gradient(135deg, var(--primary) 0px, var(--primary) 26px, var(--accent) 26px, var(--accent) 52px)`,
  backgroundSize: 'cover, cover',
  backgroundPosition: 'center, center',
  ```
  (An empty `url('')` layer simply fails to paint; the gradient layer underneath still shows.)
- A bottom-anchored scrim (`linear-gradient(180deg, transparent 0%, transparent 32%, rgba(0,0,0,0.55) 68%, rgba(0,0,0,0.84) 100%)`) keeps overlaid text legible over any photo.
- Overlaid, bottom-aligned, centered: the restaurant name in `--font-display`, large, uppercase,
  letter-spaced, and the `identity.tagline` beneath it in `--font-body`, smaller, uppercase,
  muted — reusing the same `dishText()` resolver the rest of the app uses for per-language
  tagline strings.
- Themes `A`/`B` (no `identity`) render the hero using `RESTAURANT` (from `CONFIG`) the same
  way `Header` already falls back — so the generic demo also gets a (gradient-only, since
  `CONFIG` has no `heroUrl`) hero banner rather than being the only theme missing one.

## Wiring

1. Run the fetch script, review the pass/fail table.
2. For each venue with a passing hero/logo, add the local path to that theme's
   `identity.heroUrl` / `identity.logoUrl` in `themes.js`.
3. Venues that failed either fetch keep `''` for that field — no manual sourcing detour (per
   the brainstorming decision above).
4. Update the theme-entry template and field docs in `CLAUDE.md` to include `heroUrl` next to
   `logoUrl`, so future one-off personalisations (new leads beyond these 23) follow the same
   pattern.

## Verification

- JSX compile-check on `index.html` (existing repo convention, see `CLAUDE.md`).
- `themes.js` validation snippet (existing repo convention).
- Manual, since there's no browser test runner in this repo: open `index.html?theme=KEY` for
  at least one venue that got a real hero+logo and one that fell back to the gradient/monogram,
  confirm both render without a broken-image flash or layout shift, then ask the user to
  eyeball the rest via `leads.html`.

## Out of scope

- Re-touching dishes/photos in `menuData.js` — unchanged, per the existing personalisation
  playbook (identity + theme only).
- Sourcing assets for venues beyond these 23 (Ring 3 expansion, chains list) — not part of
  this pack.
- Any change to theme selection mechanics (`?theme=` URL param, no switcher/persistence) —
  unrelated to this work.
