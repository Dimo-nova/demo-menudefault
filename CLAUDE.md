# CLAUDE.md — Sales Demo Menu

> **Role in the live system:** This repo is the **design source** for the Birch & Bramble demo restaurant in Supabase. The script `product-menuadmin/scripts/seed-demo.ts` reads `config.js` and `menuData.js` from here and loads them into the database. This file itself is **never deployed** and is never touched by the live system — it is kept as-is for offline sales pitching. If you change the menu content here, the database is **not** automatically updated; the seed script would need to be re-run (which is destructive — see `product-menuadmin/scripts/README.md` before doing that).



Guidance for Claude when working in this project, and the **playbook for personalising
the menu for a sales lead**.

## What this is

A mobile-first **digital restaurant menu demo** used to sell a digital-menu service to
restaurant owners. It is a self-contained single-page app — open `index.html` in a
browser, no build step, no server required.

- **`index.html`** — the whole app: an inline `<script type="text/babel">` React 18 app
  (React + Babel loaded from CDN). Contains the components, `LANGS`, and the CSS-variable
  styling. Edit this for layout/UI changes.
- **`themes.js`** — the `THEMES` object: one entry per restaurant/lead (colours, fonts, and
  for client-named entries an `identity` override). Loaded as a classic script, after
  `config.js` (theme `A` reads `CONFIG.*` live) and before the app script.
- **`leads.html`** — **secret** landing page, not linked from anywhere in the app. Lists
  every key in `THEMES` as a card; clicking one opens `index.html?theme=KEY` in a new tab.
  Only reachable if you know its URL — see "Theme selection" below.
- **`config.js`** — restaurant **identity** (name, tagline, monogram, logo, currency) and
  the **Earthy** theme's palette/fonts. Loaded as a classic script; defines `const CONFIG`.
- **`menuData.js`** — categories, dishes, allergen-icon map, and filter config. Defines
  `const ALLERGEN_ICONS`, `CATEGORIES`, `FILTERS`, `DISHES`.
- **`images/allergens/`** — 14 EU allergen icons (`*.png`, dark glyphs on transparent).
- **`images/dishes/`** — dish photos (`<id-ish>.jpg`). Missing photo ⇒ neutral placeholder.
- **`docs/superpowers/`** — the original design spec + implementation plan (background).

### Key facts
- **Theme selection has no UI.** There is no in-app switcher. `index.html` reads a fixed
  theme from the `?theme=KEY` URL query param (validated against `THEMES`); if absent or
  invalid it falls back to `B` (Minimal). The theme is never persisted (no `localStorage`),
  so a tab opened for one client never leaks another client's branding. To hand a specific
  restaurant's link to someone, use `index.html?theme=KEY`.
- **Two generic showcase themes** live in `THEMES` (in `themes.js`): `A` = **Earthy** (warm,
  card style, reads its colours/fonts from `CONFIG`), `B` = **Minimal** (fixed, sparse,
  serif) — this is what plain `index.html` (no `?theme=`) shows. Every other key is a
  named, client-specific theme with its own hardcoded colours and an `identity` override
  (name/monogram/tagline/logo), read by `Header` via `theme.identity || RESTAURANT`.
- **`leads.html` is the only place all themes are listed together** — keep it unlinked from
  `index.html` and out of any navigation. When you add a new theme to `themes.js`, it shows
  up there automatically (it iterates `Object.keys(THEMES)`); no `leads.html` edit needed.
- **Four languages**: `LANGS` (EN, ES, FR, DE) in `index.html`. Dish `name`/`desc` are
  per-language objects `{ EN, ES, FR, DE }`, resolved by the `dishText(field, t)` helper
  (`EN` is the fallback). The tagline in `config.js` is the same per-language shape.
- **EU-14 allergen codes**: `GL CR EG FI PN SY MK NU CY MD SE SU LP ML`.
- The app is centred to a **720px column** on wide screens (`#appcol`).

### Verifying changes (no test runner)
After editing `index.html`, **compile-check the inline JSX** (catches syntax errors):
```bash
TMP=$(mktemp -d); cd "$TMP"; echo '{"name":"t","private":true}' > package.json
npm install --no-audit --no-fund @babel/standalone@7 >/dev/null 2>&1
node -e 'const fs=require("fs");const h=fs.readFileSync(process.argv[1],"utf8");const m=h.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);require("@babel/standalone").transform(m[1],{presets:["react"]});console.log("JSX_COMPILE_OK");' "<abs path>/index.html"
cd /; rm -rf "$TMP"
```
After editing `menuData.js`, validate it:
```bash
node -e 'const vm=require("vm"),fs=require("fs");const c={out:{}};vm.runInNewContext(fs.readFileSync("menuData.js","utf8")+"\n;out.D=DISHES;",c);const D=c.out.D,ids=new Set(D.map(d=>d.id));for(const d of D){for(const L of["EN","ES","FR","DE"]){if(!d.name[L]||!d.desc[L])console.log("MISSING",d.id,L);}(d.pairsWith||[]).forEach(p=>{if(!ids.has(p))console.log("BAD pair",d.id,p)});}console.log("dishes",D.length);'
```
There is **no automated browser check** — the human verifies visually. Don't claim it
"looks right"; state what you compiled/validated and ask them to refresh `index.html`.

---

# Playbook: personalise the menu for a lead

When the user asks to personalise for a specific restaurant/lead, do the following. The
headline requirement is a **new theme entry, given its own key**, tailored to the client,
reachable at `index.html?theme=KEY` and listed on the secret `leads.html` page. This is
**identity + theme only** — do **not** swap the demo dishes or photos. Work from whatever
brand details the user gives (name, colours, fonts, logo). Ask for anything essential
that's missing (at minimum: name + brand colours).

Don't touch `config.js` for this — that file drives the generic `A` (Earthy) showcase theme
only. A personalised lead gets its own `identity` block directly in its theme entry instead.

## 1. Add the theme — `themes.js`
Add an entry to the `THEMES` object with a short, unique key (e.g. initials of the client
name). Put the **client's brand colours/fonts and identity as literals** here. Pick
`minimal:false` for the warm card layout (recommended), or `minimal:true` for the sparse
serif list layout.
```js
  ABCD: {
    key:'ABCD', name:'Client Name', minimal:false,
    swatch:['#PRIMARY', '#ACCENT'],          // the two dots shown on the leads.html card
    identity:{ name:'Client Name', monogram:'C', tagline:'Short tagline · Area', logoUrl:'', heroUrl:'' },
    vars:{
      '--primary':'#PRIMARY','--on-primary':'#TEXT_ON_PRIMARY',   // header/tabs/buttons + text on them
      '--accent':'#ACCENT','--accent-ink':'#TEXT_ON_ACCENT',      // logo/badge/price/Filters pill + text on them
      '--bg':'#PAGE_BG','--surface':'#CARD_BG','--surface-2':'#SUBTLE_BG',
      '--text':'#BODY_TEXT','--muted':'#MUTED_TEXT','--line':'rgba(0,0,0,0.09)',
      '--pill-bg':'#PILL_BG','--pill-ink':'#PILL_TEXT',           // inactive chips
      '--card-radius':'18px','--img-radius':'14px','--chip-radius':'7px',
      '--shadow':'0 8px 20px rgba(0,0,0,0.07), 0 1.5px 3px rgba(0,0,0,0.05)',
      '--shadow-bar':'0 6px 18px rgba(0,0,0,0.10)',
      '--font-display':"'Heading Font', system-ui, sans-serif",
      '--font-body':"'Body Font', system-ui, sans-serif",
      '--display-weight':'700','--name-spacing':'-0.01em',
    },
  },
```
`identity` is what the in-app `Header` and `Hero` banner show for this theme (falls back to
`config.js`'s `RESTAURANT` if omitted) — always set it for a real lead so the client's own
name/tagline/monogram/logo appear, independent of the generic `CONFIG` identity.

`heroUrl` is the full-bleed photo shown in the `Hero` banner just below the header — a real
venue photo (exterior/interior/plated dish) works best; leave it `''` to show a clean
gradient in the theme's own colours instead of a placeholder or stock photo. Same rule as
`logoUrl`: only set it to a real, verified image — a wordmark graphic, a platform's generic
icon (e.g. Instagram's own logo when scraping a profile that blocks unauthenticated access),
or a site screenshot with nav/CTA baked in all look worse than the gradient fallback, so
reject those rather than wiring them in.

**Colour guidance:** `--primary` is the header/tabs/active-buttons; `--on-primary` must read
clearly on it (usually a near-white/cream). `--accent` is the highlight (logo fill, Popular
badge, price, Filters pill); `--accent-ink` is text/icons sitting on the accent. `--bg` is
the page; `--surface` the dish cards. Aim for contrast and brand fidelity. Reuse the radius/
shadow/weight values above unless the brand calls for sharper/rounder.

**Fonts:** if the brand fonts aren't already loaded, add them to the Google-Fonts `<link>`
URL in `index.html`'s `<head>` (the font-loader script). Cormorant Garamond, Jost, and the
`CONFIG` fonts are already loaded.

## 2. Nothing to wire up
`leads.html` iterates `Object.keys(THEMES)` at load time, so the new entry shows up there
automatically — no HTML/JSX edit needed. The client's link is simply:
```
index.html?theme=ABCD
```
Share that URL directly (e.g. opened via `leads.html`, which opens it in a new tab so
there's no back-navigation to the lead list). Don't change `index.html`'s no-param default
(`B`, Minimal) — that stays the generic demo shown to anyone without a `?theme=` link.

## 3. Verify & hand off
Run the JSX compile check above (it also re-parses `themes.js` implicitly since `index.html`
loads it — but run the `themes.js` validation snippet too, see below). Tell the user exactly
what you changed and give them the `index.html?theme=KEY` link to test. (The demo menu's
dishes and photos are left as-is.)

To validate `themes.js` after editing it:
```bash
node -e 'const vm=require("vm"),fs=require("fs");const CONFIG={themeALabel:"x",primaryColor:"#000",accentColor:"#000",bgColor:"#fff",headingFont:"x",bodyFont:"x"};const ctx={CONFIG,out:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync("themes.js","utf8")+"\n;out.T=THEMES;",ctx);const T=ctx.out.T;for(const k of Object.keys(T)){if(!T[k].name||!T[k].swatch||T[k].swatch.length!==2)console.log("BAD",k);}console.log("themes",Object.keys(T).length);'
```

## Don'ts
- Don't add a build step, framework, or server dependency — it must open by double-click.
- Don't rename/restructure files or touch `images/allergens/` unless asked.
- Don't swap the demo dishes/photos or edit `menuData.js` as part of personalisation.
- Don't claim visual correctness you haven't verified — compile, then ask to refresh.
- Don't link to `leads.html` from `index.html`, `README`, or anywhere else — its only
  protection is that its URL isn't published. Don't add a favicon/meta description that
  would make it easy to guess either.
- Don't reintroduce an in-app theme switcher or theme `localStorage` persistence — that's
  what let one client's tab leak another client's branding before this playbook changed.
