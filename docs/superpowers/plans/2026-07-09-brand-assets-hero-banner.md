# Real Logos + Hero Photo Banner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give all 23 restaurant-branded demo mocks in `themes.js` a real logo (where sourceable) and a leclub-style full-bleed hero photo banner (with a theme-coloured gradient fallback), so the sales demo looks like each prospect's actual menu instead of a generic template.

**Architecture:** A one-off Node script fetches each venue's real homepage, extracts an `og:image` (hero) and a favicon/logo candidate, and downloads whatever passes basic sanity checks into `images/heroes/` and `images/logos/`. The results are hand-wired into `themes.js` as two new `identity` fields (`heroUrl`, `logoUrl` — `logoUrl` already exists). A new `Hero` React component (inline in `index.html`, this repo has no build step) renders the photo with a CSS-layered gradient fallback, sitting below the existing sticky header.

**Tech Stack:** Node 24 (global `fetch`, no dependencies) for the fetch script; the existing inline React 18 + Babel-in-browser app in `index.html`; no test runner in this repo — verification is the existing JSX-compile-check + `themes.js`-validation-snippet convention from `CLAUDE.md`, plus manual browser checks.

## Global Constraints

- No build step, framework, or server dependency — `index.html` must keep opening by double-click (from `CLAUDE.md`).
- Don't touch `menuData.js` (dishes/photos) — this work is identity + theme only (from `CLAUDE.md` and the spec's "Out of scope").
- Don't add an in-app theme switcher or `localStorage` theme persistence (from `CLAUDE.md`).
- Themes `A` (Earthy) and `B` (Minimal) keep their current no-`identity` behavior — only get the gradient-fallback hero automatically via the `RESTAURANT` fallback path, no hardcoded hero photo (from spec).
- Every downloaded asset must pass: HTTP 200, `content-type` starts with `image/`, body ≥ 1024 bytes (from spec, rejects tracking pixels / broken icons).
- A venue that fails either fetch keeps `''` for that field — no manual sourcing detour (from spec's brainstorming decision).

---

### Task 1: Asset fetch script

**Files:**
- Create: `scripts/fetch-brand-assets.mjs`

**Interfaces:**
- Produces: `images/heroes/<KEY>.<ext>` and `images/logos/<KEY>.<ext>` files on disk (Task 3 reads whichever of these exist to decide what to wire into `themes.js`). Also produces a printed pass/fail table on stdout, one line per manifest entry: `<KEY padded to 6> hero:✓|✗ logo:✓|✗ <note>`.
- Consumes: nothing from earlier tasks (first task).

- [ ] **Step 1: Write the script**

```js
#!/usr/bin/env node
// scripts/fetch-brand-assets.mjs
// One-off fetcher: pulls a hero photo + logo for each of the 23 demo-mock
// restaurants from their own real website, per
// docs/superpowers/specs/2026-07-09-brand-assets-hero-banner-design.md.
// Re-runnable — overwrites existing files. No dependencies (Node 18+ global fetch).

import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

// key -> homepage URL, taken from Dimonova_Prospecting_Pack_Goatstown.pdf's
// "Grab their logo & colours" field. url:null = no verifiable source found
// (searched, not guessed) — expected to stay on the gradient/monogram fallback.
const MANIFEST = [
  { key: 'HX46',  url: 'https://hx46cafe.ie' },
  { key: 'GRV',   url: 'https://greenvilledeli.ie' },
  { key: 'GRND',  url: 'https://www.instagram.com/groundeddublin/' },
  { key: 'GOAT',  url: 'https://goatgrill.com' },
  { key: 'FIRE',  url: 'https://firedupizza.ie' },
  { key: 'FOIR',  url: 'https://www.instagram.com/foirfecoffee/' },
  { key: 'TTG',   url: 'https://thruthegreencoffeeco.com' },
  { key: 'EGGS',  url: null },
  { key: 'STRT',  url: 'https://streetrestaurant.ie' },
  { key: 'COMM',  url: 'https://uncletomscabin.ie/community-coffee' },
  { key: 'HELI',  url: 'https://heliossauna.ie' },
  { key: 'ESSN',  url: 'https://essence-cafe.ie' },
  { key: 'PYE',   url: 'https://pye.ie' },
  { key: 'DUND',  url: 'https://www.facebook.com/dundrumhse' },
  { key: 'COWB',  url: 'https://cbsteakhouse.ie' },
  { key: 'BRCK',  url: 'https://brickyard.ie' },
  { key: 'GRIN',  url: 'https://www.facebook.com/grindstonecoffeedundrum/' },
  { key: 'FARM',  url: 'https://farmerbrowns.ie' },
  { key: 'CF105', url: 'https://cafe105.flipdish.menu' },
  { key: 'WLDG',  url: 'https://wildeandgreen.com' },
  { key: 'ASHT',  url: 'https://ashtons.ie' },
  { key: 'COSY',  url: 'https://www.instagram.com/the_cosy_bean/' },
  { key: 'HOWA',  url: 'https://howardsway.ie' },
];

const MIN_BYTES = 1024; // rejects 1x1 tracking pixels / broken placeholder icons
const UA = 'Mozilla/5.0 (compatible; DimonovaBrandAssetBot/1.0; +https://dimonova.com)';

function extFromContentType(ct) {
  if (!ct) return null;
  if (ct.includes('svg')) return 'svg';
  if (ct.includes('png')) return 'png';
  if (ct.includes('jpeg') || ct.includes('jpg')) return 'jpg';
  if (ct.includes('webp')) return 'webp';
  if (ct.includes('gif')) return 'gif';
  if (ct.includes('x-icon') || ct.includes('vnd.microsoft.icon')) return 'ico';
  return null;
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return { html: await res.text(), finalUrl: res.url };
}

function findHeroCandidate(html) {
  const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
        || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  return m ? m[1] : null;
}

function findLogoCandidate(html) {
  const touchIcons = [...html.matchAll(/<link[^>]+rel=["']apple-touch-icon[^"']*["'][^>]*>/gi)];
  for (const tag of touchIcons) {
    const href = tag[0].match(/href=["']([^"']+)["']/i);
    if (href) return href[1];
  }
  const icon = html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i);
  if (icon) return icon[1];
  const headerBlock = html.match(/<header[\s\S]{0,2000}?<\/header>/i) || html.match(/<nav[\s\S]{0,2000}?<\/nav>/i);
  if (headerBlock) {
    const img = headerBlock[0].match(/<img[^>]+(?:class|alt)=["'][^"']*logo[^"']*["'][^>]+src=["']([^"']+)["']/i)
             || headerBlock[0].match(/<img[^>]+src=["']([^"']+)["'][^>]+(?:class|alt)=["'][^"']*logo[^"']*["']/i);
    if (img) return img[1];
  }
  return null;
}

function resolveUrl(candidate, baseUrl) {
  try { return new URL(candidate, baseUrl).href; } catch { return null; }
}

async function downloadImage(url, destPathNoExt) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) return null;
  const ct = res.headers.get('content-type') || '';
  if (!ct.startsWith('image/')) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.byteLength < MIN_BYTES) return null;
  const ext = extFromContentType(ct) || 'jpg';
  const dest = `${destPathNoExt}.${ext}`;
  await writeFile(dest, buf);
  return dest;
}

async function processVenue(entry) {
  const result = { key: entry.key, hero: false, logo: false, note: '' };
  if (!entry.url) { result.note = 'no source URL'; return result; }
  let html, finalUrl;
  try {
    ({ html, finalUrl } = await fetchText(entry.url));
  } catch (err) {
    result.note = `homepage fetch failed: ${err.message}`;
    return result;
  }
  const heroCandidate = findHeroCandidate(html);
  if (heroCandidate) {
    const abs = resolveUrl(heroCandidate, finalUrl);
    if (abs) {
      const saved = await downloadImage(abs, path.join('images', 'heroes', entry.key)).catch(() => null);
      if (saved) result.hero = true;
    }
  }
  const logoCandidate = findLogoCandidate(html);
  if (logoCandidate) {
    const abs = resolveUrl(logoCandidate, finalUrl);
    if (abs) {
      const saved = await downloadImage(abs, path.join('images', 'logos', entry.key)).catch(() => null);
      if (saved) result.logo = true;
    }
  }
  if (!heroCandidate && !logoCandidate) result.note = 'no og:image or icon found in HTML';
  return result;
}

async function main() {
  await mkdir('images/heroes', { recursive: true });
  await mkdir('images/logos', { recursive: true });
  const results = [];
  for (const entry of MANIFEST) {
    const r = await processVenue(entry);
    results.push(r);
    console.log(`${r.key.padEnd(6)} hero:${r.hero ? '✓' : '✗'} logo:${r.logo ? '✓' : '✗'} ${r.note}`);
  }
  const heroCount = results.filter(r => r.hero).length;
  const logoCount = results.filter(r => r.logo).length;
  console.log(`\n${heroCount}/${MANIFEST.length} heroes, ${logoCount}/${MANIFEST.length} logos`);
}

main();
```

- [ ] **Step 2: Run it and record the table**

Run: `cd demo-menudefault && node scripts/fetch-brand-assets.mjs`
Expected: exits 0; prints one line per manifest key in the form `KEY    hero:✓|✗ logo:✓|✗ <note>`, followed by a summary line `N/23 heroes, M/23 logos`. Exact ✓/✗ per venue is unknowable ahead of time (depends on live sites) — record the printed table verbatim, it's the input to Task 3.

- [ ] **Step 3: Sanity-check the downloaded files**

Run: `file images/heroes/* images/logos/* 2>/dev/null`
Expected: every listed file reports as an actual image type (`JPEG image data`, `PNG image data`, `SVG Scalable Vector Graphics image`, etc.), not `ASCII text`/`HTML document` (which would mean a login-wall or error page slipped past the content-type check). Delete and note as failed in the Task 2 table any file that isn't a real image.

- [ ] **Step 4: Commit**

```bash
git add scripts/fetch-brand-assets.mjs images/heroes images/logos
git commit -m "$(cat <<'EOF'
Add brand-asset fetch script; download real logos/heroes for demo mocks

Fetches each of the 23 Goatstown/Dundrum prospect's real homepage and
saves whatever og:image / favicon it finds locally, per
docs/superpowers/specs/2026-07-09-brand-assets-hero-banner-design.md.
EOF
)"
```

---

### Task 2: Wire fetched assets into `themes.js`

**Files:**
- Modify: `themes.js` (all 23 client-named theme entries, e.g. `HX46` at `themes.js:39-56`, `GRV` at `themes.js:57-74`, … `HOWA` at `themes.js:435-452` — same `identity:{...}` shape in each)

**Interfaces:**
- Consumes: the pass/fail table from Task 1 Step 2/3, and the files under `images/heroes/`, `images/logos/`.
- Produces: every theme's `identity` object gains a `heroUrl` key (new) alongside the existing `logoUrl` key. Both are read by the `Hero` and `Header` components built in Task 3 as `theme.identity.heroUrl` / `theme.identity.logoUrl`.

- [ ] **Step 1: Add `heroUrl` next to `logoUrl` in every theme's `identity` block**

For each of the 23 keys, using the Task 1 table: if that key's row shows `hero:✓`, set `heroUrl` to the saved path (`images/heroes/<KEY>.<ext>`, matching whatever extension Task 1 actually wrote — check with `ls images/heroes/`); otherwise set `heroUrl:''`. Same rule for `logoUrl` using `images/logos/<KEY>.<ext>`. Example edit for the `HX46` entry (`themes.js:42`), assuming Task 1 saved `images/heroes/HX46.jpg` and found no usable logo:

```js
    identity:{ name:"HX46 Café", monogram:"HX", tagline:"Pan-Asian kitchen & coffee · Goatstown", logoUrl:'', heroUrl:'images/heroes/HX46.jpg' },
```

Repeat for all 23 entries (`HX46, GRV, GRND, GOAT, FIRE, FOIR, TTG, EGGS, STRT, COMM, HELI, ESSN, PYE, DUND, COWB, BRCK, GRIN, FARM, CF105, WLDG, ASHT, COSY, HOWA`) — every one currently has a one-line `identity:{...}` (see `themes.js:39-452`), so this is a single-line edit per entry, in place.

- [ ] **Step 2: Validate `themes.js` still parses and every entry has the new field**

Run:
```bash
node -e '
const vm=require("vm"),fs=require("fs");
const CONFIG={themeALabel:"x",primaryColor:"#000",accentColor:"#000",bgColor:"#fff",headingFont:"x",bodyFont:"x"};
const ctx={CONFIG,out:{}};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync("themes.js","utf8")+"\n;out.T=THEMES;",ctx);
const T=ctx.out.T;
for (const k of Object.keys(T)) {
  const th=T[k];
  if(!th.name||!th.swatch||th.swatch.length!==2) console.log("BAD swatch/name",k);
  if(th.identity && !("heroUrl" in th.identity)) console.log("MISSING heroUrl",k);
}
console.log("themes",Object.keys(T).length);
'
```
Expected: no `BAD`/`MISSING` lines, final line `themes 25` (23 client themes + `A` + `B`).

- [ ] **Step 3: Commit**

```bash
git add themes.js
git commit -m "$(cat <<'EOF'
Wire fetched logos/hero photos into the 23 demo-mock themes

Sets identity.heroUrl (new) and identity.logoUrl for every venue that
had a usable asset from scripts/fetch-brand-assets.mjs; the rest keep
'' and fall back to the gradient/monogram built in the next commit.
EOF
)"
```

---

### Task 3: `Hero` component + layout wiring in `index.html`

**Files:**
- Modify: `index.html`
  - Add a `Hero` component definition near the other presentational components (after `Header`, `index.html:253` — right before `function Tabs`).
  - Insert `<Hero .../>` in `MenuApp`'s render, between `<Header .../>` and `<Tabs .../>` (currently `index.html:539-540`).
  - `RESTAURANT` constant (`index.html:64`) gains a `heroUrl` field so themes `A`/`B` (no `identity` override) have a consistent (empty) fallback value, same pattern as its existing `logoUrl`.

**Interfaces:**
- Consumes: `theme.identity.heroUrl` / `theme.identity.tagline` (or `RESTAURANT.*` fallback) — both already exist as data by Task 2; `theme.vars` CSS custom properties (`--primary`, `--accent`, `--font-display`, `--font-body`) already set by every theme entry; the existing `dishText(field, t)` helper (`index.html:143-146`) for resolving per-language tagline strings; the existing `t` (current-language `LANGS` entry) prop already threaded through every other component in this file.
- Produces: a `Hero({ theme, t })` component, same call signature as the existing `Header({ theme, t })` / `Tabs({ theme, ... })` components it sits beside.

- [ ] **Step 1: Add `heroUrl` to the `RESTAURANT` fallback constant**

In `index.html`, change line 64:
```js
const RESTAURANT = { name:CONFIG.name, monogram:CONFIG.monogram, tagline:CONFIG.tagline, logoUrl:CONFIG.logoUrl };
```
to:
```js
const RESTAURANT = { name:CONFIG.name, monogram:CONFIG.monogram, tagline:CONFIG.tagline, logoUrl:CONFIG.logoUrl, heroUrl:'' };
```
(`config.js`'s `CONFIG` has no hero photo concept — themes `A`/`B` intentionally always render the gradient-only hero, never a photo.)

- [ ] **Step 2: Add the `Hero` component**

Insert immediately after the `Header` component's closing brace (after `index.html:253`, right before `function Tabs({ theme, cats, active, onSelect, t }) {`):

```js
function Hero({ theme, t }) {
  const id = theme.identity || RESTAURANT;
  const heroUrl = id.heroUrl || '';
  return (
    <div style={{ position:'relative', height:220, flexShrink:0, overflow:'hidden' }}>
      <div style={{
        position:'absolute', inset:0,
        backgroundImage:`url('${heroUrl}'), repeating-linear-gradient(135deg, var(--primary) 0px, var(--primary) 26px, var(--accent) 26px, var(--accent) 52px)`,
        backgroundSize:'cover, cover',
        backgroundPosition:'center, center',
      }} />
      <div style={{
        position:'absolute', inset:0,
        background:'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 32%, rgba(0,0,0,0.55) 68%, rgba(0,0,0,0.82) 100%)',
      }} />
      <div style={{ position:'absolute', left:0, right:0, bottom:0, padding:'0 20px 18px', textAlign:'center' }}>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:'var(--display-weight)', fontSize:26, letterSpacing:'0.04em', textTransform:'uppercase', color:'#FAF6EE' }}>{id.name}</div>
        <div style={{ fontFamily:'var(--font-body)', fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.82)', marginTop:4 }}>{dishText(id.tagline, t)}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Render it in `MenuApp`, between `Header` and `Tabs`**

In `MenuApp`'s return (`index.html:539-540`), change:
```jsx
      <Header theme={theme} t={t} />
      <Tabs theme={theme} cats={cats} active={active} onSelect={setActive} t={t} />
```
to:
```jsx
      <Header theme={theme} t={t} />
      <Hero theme={theme} t={t} />
      <Tabs theme={theme} cats={cats} active={active} onSelect={setActive} t={t} />
```

- [ ] **Step 4: Compile-check the inline JSX**

Run:
```bash
TMP=$(mktemp -d); cd "$TMP"; echo '{"name":"t","private":true}' > package.json
npm install --no-audit --no-fund @babel/standalone@7 >/dev/null 2>&1
node -e 'const fs=require("fs");const h=fs.readFileSync(process.argv[1],"utf8");const m=h.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);require("@babel/standalone").transform(m[1],{presets:["react"]});console.log("JSX_COMPILE_OK");' "<abs path to demo-menudefault/index.html>"
cd /; rm -rf "$TMP"
```
Expected: prints `JSX_COMPILE_OK`, no syntax errors.

- [ ] **Step 5: Manual visual check**

Open `index.html?theme=<a key that got hero:✓ in Task 1>` in a browser and confirm: photo banner renders below the header, name/tagline are legible over it, no broken-image icon. Then open `index.html?theme=<a key that got hero:✗>` and confirm the diagonal theme-coloured gradient renders instead, same layout, no blank gap or JS error in the console. Report both checks to the user with the exact theme keys used — don't claim it "looks right" without having opened it (per this repo's `CLAUDE.md`).

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "$(cat <<'EOF'
Add Hero photo banner below the header, with gradient fallback

New Hero({ theme, t }) component, styled after client-leclubtenerife's
Hero.tsx: full-bleed photo with a bottom scrim and overlaid name/tagline.
Falls back to a theme-coloured diagonal gradient when identity.heroUrl
is empty, so themes without a fetched photo (A, B, and any venue the
fetch script couldn't source) still render a clean banner.
EOF
)"
```

---

### Task 4: Update `CLAUDE.md`'s personalisation playbook

**Files:**
- Modify: `CLAUDE.md:88-105` (the theme-entry template shown in "1. Add the theme — `themes.js`")
- Modify: `CLAUDE.md:33-51` ("Key facts" section, the bullet listing what `identity` contains)

**Interfaces:**
- Consumes: nothing (documentation only).
- Produces: nothing consumed by other tasks — this keeps the doc in sync so the next one-off lead personalisation (outside these 23) also gets a `heroUrl`.

- [ ] **Step 1: Add `heroUrl` to the template's `identity` line**

In `CLAUDE.md`, the template block currently reads (around line 91):
```js
    identity:{ name:'Client Name', monogram:'C', tagline:'Short tagline · Area', logoUrl:'' },
```
Change to:
```js
    identity:{ name:'Client Name', monogram:'C', tagline:'Short tagline · Area', logoUrl:'', heroUrl:'' },
```

- [ ] **Step 2: Document the field**

Immediately after the paragraph ending "...independent of the generic `CONFIG` identity." (around `CLAUDE.md:109`), add:

```markdown
`heroUrl` (added 2026-07-09) is the full-bleed photo shown in the `Hero` banner just below
the header — a real venue photo (exterior/interior/plated dish) works best; leave it `''` to
show a clean gradient in the theme's own colours instead of a placeholder or stock photo.
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: document identity.heroUrl in the theme-entry playbook"
```

---

## Plan self-review notes

- **Spec coverage:** fetch script (Task 1) ✓, local storage under `images/` (Task 1) ✓, fallback behaviour (Task 3's gradient layer, verified in Task 3 Step 5) ✓, data model `heroUrl` field (Task 2) ✓, `Hero` component + placement below header (Task 3) ✓, `CLAUDE.md` template update (Task 4) ✓, verification via compile-check + manual (Task 3 Steps 4–5) ✓. Out-of-scope items (`menuData.js`, Ring 3, theme-switcher mechanics) are untouched by every task above.
- **No placeholders:** the fetch manifest uses real URLs resolved via web search where the prospecting pack only gave "search Instagram" hints (`COMM`, `GRIN`, `COSY`); `EGGS` has no resolvable source after searching and is explicitly `url:null` with a code comment, not a TODO.
- **Type/name consistency:** `identity.heroUrl` is the name used consistently across Task 2 (data), Task 3 (component reads `id.heroUrl`), and Task 4 (docs) — no renaming drift.
