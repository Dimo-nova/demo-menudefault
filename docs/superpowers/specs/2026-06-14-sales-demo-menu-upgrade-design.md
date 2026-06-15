# Sales Demo Menu — Upgrade Design

**Date:** 2026-06-14
**Status:** Approved design, pending spec review

## Goal

Turn the existing demo menu (`Sales demo menu/Menu.html`) into an **excellent, easily-editable base menu** used to sell the digital-menu service to prospects. Four improvements, in priority order:

1. **Allergen icons** — replace the text codes (GL, MK…) with real icons.
2. **Redesigned dish popup** — richer detail sheet with price, description, allergen icons, and a "Pairs with" section.
3. **Allergen / dietary filters** — a collapsible filter bar that narrows the menu.
4. **Dish photos** — *deferred*; data model is photo-ready, actual images added later.

Cross-cutting requirements: everything self-contained inside `Sales demo menu/`, clean code & organisation, and **no drag-and-drop photo slots** (dishes use fixed images).

## What stays

The current strengths are kept: two live themes (Warm / Minimal toggle), three languages (EN / ES / DE), the "Popular / Signature" badge, the allergen legend, and per-prospect customisation via config. The bottom-sheet interaction pattern stays; its contents get richer.

## Decisions captured during brainstorming

- **Allergen chips on cards:** *Option A* — circular dark badges, icon-only. The white SVG silhouettes sit on a dark disc, working in both themes. Full names appear in the legend and via tooltip.
- **Popup layout:** *Option A* (full-bleed photo at the top of the slide-up sheet, "Pairs with" as horizontal scroll cards) **with Option B's compact inline allergen icons** (icon-only row, no per-line names). **No Save button.**
- **Filters:** *Curated* set, collapsed by default, chips toggle and stack, live "showing X dishes" count.
  - **Dietary:** Vegetarian, Vegan.
  - **Free from:** Gluten, Nuts, Peanuts, Eggs, Milk. *(Lactose is not an EU-14 allergen; Milk is the correct one.)*
- **Photos:** deferred. Placeholder rendered when a dish has no image yet.

---

## File structure

Consolidate the current mix (standalone `Menu.html` plus an un-wired modular copy) into one clean, self-contained set:

```
Sales demo menu/
  index.html        ← open this. App shell + app code (React + Babel via CDN).
  config.js         ← per-prospect identity + theme. Edit before each visit.
  menuData.js       ← categories, dishes, allergens, pairings, filters. Edit to change the menu.
  images/
    allergens/      ← the 14 EU allergen SVG icons (copied in, ASCII filenames)
    dishes/         ← dish photos (added later — deferred)
  docs/…            ← this spec
  README.md         ← updated usage guide
```

**Removed:** `Menu.html` (becomes `index.html`), `menu-app.jsx`, `ios-frame.jsx` (the iOS frame is dead code — never rendered), `image-slot.js` (drag-drop no longer needed), and the inline duplicates of CONFIG/DISHES.

**Runs by simply opening `index.html`** — no local server required. To preserve that, the React/JSX app stays **inline** in `index.html` (Babel-in-browser cannot fetch external JSX over `file://`), organised into clearly-commented component sections. The two files a salesperson actually edits — `config.js` and `menuData.js` — are external classic scripts (single source of truth, load fine over `file://`).

> **Decided:** keep the app inline now for simplicity and zero-friction open. Splitting the app into fully modular `.jsx` files (served via Live Server) is captured as future work in `TODO.md`, not part of this plan.

---

## Data model

Each dish in `menuData.js`:

```js
{
  id: 'sea-bass',
  cat: 'Mains',
  name: 'Pan-Seared Sea Bass',
  desc: 'Lemon-caper butter, crushed new potatoes & seasonal greens.',
  price: '19.50',
  allergens: ['FI', 'MK'],     // EU-14 codes
  tags: ['v'],                 // 'v' vegetarian, 'vg' vegan (optional)
  popular: true,               // optional badge
  image: '',                   // 'images/dishes/x.jpg' — empty ⇒ placeholder (deferred)
  pairsWith: ['calamari','ipa']// dish ids; renders thumb + name + price
}
```

**Allergen code → icon file** (copied from `menu-prototypes/data/images/alergenos`, renamed to clean ASCII):

| Code | File | Code | File |
|------|------|------|------|
| GL | gluten.svg | NU | nuts.svg |
| CR | crustaceans.svg | CY | celery.svg |
| EG | eggs.svg | MD | mustard.svg |
| FI | fish.svg | SE | sesame.svg |
| PN | peanuts.svg | SU | sulphites.svg |
| SY | soy.svg | LP | lupin.svg |
| MK | milk.svg | ML | molluscs.svg |

**Filter config:**

```js
const FILTERS = {
  dietary:  ['v', 'vg'],              // Vegetarian, Vegan
  freeFrom: ['GL', 'NU', 'PN', 'EG', 'MK'],
};
```

---

## Components & behaviour

**AllergenIcon** — circular dark badge (`<img>` of the white SVG on a dark disc). Sizes: small for cards, slightly larger for the popup row. `title` attribute = translated allergen name (tooltip / accessibility).

**DishCard** — unchanged structure, but: fixed `image` (or placeholder) instead of a drop slot; allergen text-chips replaced by the icon-badge row.

**DishPhoto / placeholder** — when `image` is set, render `<img>` (object-fit: cover). When empty, render a subtle branded placeholder (theme gradient + small dish-photo glyph). Used on both card thumbnail and popup banner.

**DetailSheet (redesigned popup)** — slide-up bottom sheet:
1. Full-bleed photo (or placeholder) at the top, with a round close button overlaid top-right.
2. Name + price row.
3. Description.
4. **Contains** — compact inline row of circular allergen icon badges (tooltips for names).
5. **Pairs with** — horizontal scroll of up to 3 pairing cards (thumb + name + price). Tapping a pairing opens *that* dish's sheet — a nice interactive touch for the demo.
6. Full-width Close button.

**FilterBar** — sits directly under the category tabs:
- Collapsed default: a single "Filters" pill (with a count badge when filters are active).
- Expanded: a panel with two labelled groups — *Dietary* (Vegetarian, Vegan) and *Free from* (Gluten, Nuts, Peanuts, Eggs, Milk). Chips toggle on tap; multiple stack.
- A live "Showing X dishes" line.
- A "Clear" affordance when any filter is active.

**Filter logic** (a dish is shown if it passes *all* active filters):
- `vegetarian` active ⇒ dish has tag `v` **or** `vg` (vegan implies vegetarian).
- `vegan` active ⇒ dish has tag `vg`.
- `free from <CODE>` active ⇒ `<CODE>` not in `dish.allergens`.
- Filters combine with the selected category tab.
- **Empty state:** if filters exclude everything in view, show a friendly "No dishes match these filters" message with a Clear button.

**Theming & i18n** — all new UI uses the existing CSS variables and reads labels from the `LANGS` table. New translation keys: `filters`, `dietary`, `freeFrom`, `clear`, `vegetarian`, `vegan`, `showingCount`, `pairsWith`, plus the per-allergen filter labels (reuse existing allergen names). Both themes (Warm / Minimal) are styled.

---

## Build order

1. **Restructure** — create `index.html` from `Menu.html`, wire external `config.js` + `menuData.js`, delete dead files, copy allergen SVGs into `images/allergens/`.
2. **Allergen icons** — AllergenIcon component; swap into cards.
3. **Popup redesign** — DetailSheet with photo/placeholder, allergen icon row, Pairs-with cards (+ tap-to-open).
4. **Filters** — FilterBar + filter logic + empty state + translations.
5. **Photos (deferred)** — copy chosen dish images into `images/dishes/`, set `image` fields. Tracked as a follow-up.
6. **README** — update for the new structure and editing workflow.

## Testing / verification

Manual verification in the browser (no test framework in this project):
- Icons render for every allergen code, both themes, all three languages.
- Popup shows correct price, allergens, and pairings; tapping a pairing swaps dishes; placeholder shows when no image.
- Each filter and combinations narrow correctly; count is accurate; empty state appears; Clear resets.
- Per-prospect edit in `config.js` / `menuData.js` still flows through.
- `index.html` opens directly from disk (no server) and renders.

## Out of scope

Real dish photography (deferred), Save/favourites, ordering/checkout, backend, analytics, and any change to the theme/language feature set beyond styling the new components.
