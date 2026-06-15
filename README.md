# Sales Demo Menu

A polished, mobile-first **digital menu** you can show a restaurant owner on your phone —
and quickly **personalise for a specific lead** before a pitch. Built with React from a CDN,
**no build step**: just open `index.html`.

Features: 30-dish demo menu, allergen icons with tap/hover names, a redesigned dish popup
with "Pairs with", an allergen/dietary **filter bar** + live search + an "I'm coeliac"
shortcut, **two themes** (Earthy / Minimal), **four languages** (EN / ES / FR / DE), and a
responsive layout that looks right from phone to laptop.

---

## Running

Just **open `index.html`** in a browser (double-click it). Nothing to install.

Prefer a local URL? Any static server works — e.g. VS Code's *Live Server* on `index.html`,
or `npx serve .`, or `python -m http.server 3000`.

---

## Personalise for a lead  ⭐ (the main workflow)

You don't edit code by hand — **prompt Claude** and it does it for you, following the
playbook in [`CLAUDE.md`](CLAUDE.md). The key move: Claude creates a **new "Personalised"
theme tab** (next to *Minimal* and *Earthy*) that the menu **defaults to**, styled to the
client's brand.

**Example prompt:**

> Personalise this menu for **Olive & Vine**, a Mediterranean bistro in Cork.
> Brand colours: primary deep teal `#1F4E46`, accent warm gold `#D7A24C`, cream background.
> Logo URL: `https://…/olive-vine.png`. Currency `€`.
> Make "Personalised" the default tab.

Claude will:
1. Update the **identity** in `config.js` (name, tagline, monogram/logo, currency).
2. Add a **Personalised** theme with the client's colours/fonts, add it to the bottom theme
   toggle, and set it as the **default**.

This personalises the **branding only** — the demo dishes and photos stay as they are (they're
there to showcase the format). At minimum, give Claude the **name + brand colours**.

---

## Editing by hand (optional)

- **Identity & Earthy palette** → `config.js` (well-commented).
- **Menu content** → `menuData.js`. Each dish has per-language `name`/`desc`
  (`{ EN, ES, FR, DE }`), `price`, `allergens` (EU-14 codes), optional `tags`
  (`v`/`vg`), `popular`, `image`, and `pairsWith`. Filters are the `FILTERS` object.
- **Themes / languages / layout** → `index.html` (`THEMES`, `LANGS`).
- **Photos** → drop files in `images/dishes/` and point each dish's `image` at them.

The two bottom-pill themes: **Earthy** (warm, colour-customisable) and **Minimal** (fixed
upscale serif). The language picker (top-right) switches EN / ES / FR / DE live.

---

## Deploy (optional)

It's static, so any host works. **Vercel/Netlify:** drag-and-drop this folder, or connect a
GitHub repo — no configuration needed.

---

## File structure

```
index.html          ← the app (open this)
config.js           ← restaurant identity + Earthy theme palette
menuData.js         ← categories, dishes, allergens, filters
images/
  allergens/        ← 14 EU allergen icons
  dishes/           ← dish photos (placeholder if missing)
CLAUDE.md           ← how Claude personalises this for a lead
README.md
docs/superpowers/   ← original design spec + plan (background)
```
