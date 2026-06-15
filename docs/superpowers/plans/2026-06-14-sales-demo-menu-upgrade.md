# Sales Demo Menu Upgrade — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add allergen icons, a redesigned dish popup (price + allergen icons + "Pairs with"), and an allergen/dietary filter bar to the demo menu, consolidated into a clean self-contained structure with no drag-and-drop.

**Architecture:** Single-page React app loaded from CDN, kept in one `index.html` that runs by simply opening the file. The two per-prospect editable parts — `config.js` and `menuData.js` — are external classic scripts and the single source of truth. Dish photos are deferred; the data model and a placeholder component are photo-ready.

**Tech Stack:** React 18 + Babel-standalone (browser, via CDN), plain CSS-in-JS with CSS custom properties for theming, static SVG/JPEG assets.

**Conventions for this plan:**
- **No test runner exists.** Each task ends with a concrete **browser verification** ("Open `index.html`, do X, expect Y"). Treat a failed expectation as a failing test — fix before moving on.
- **Not a git repo.** Task 0 optionally initialises git. If you skip it, ignore every `git commit` step; otherwise commit at the end of each task with the message shown.
- Reference file: the current app is `Menu.html` (will become `index.html`). Read it before editing.

---

## File structure (target)

```
Sales demo menu/
  index.html        ← app shell + inline app code (was Menu.html)
  config.js         ← restaurant identity + theme (exists; unchanged)
  menuData.js       ← categories, allergens, icon map, dishes, FILTERS (rewritten)
  images/
    allergens/      ← 14 SVG icons (copied + renamed in Task 1)
    dishes/         ← (empty for now — photos deferred)
  TODO.md           ← deferred work (exists)
  README.md         ← updated in Task 9
  docs/…            ← spec + this plan
```

**Deleted during this plan:** `menu-app.jsx`, `ios-frame.jsx`, `image-slot.js`, `Menu.html` (renamed to `index.html`), `screenshot-main.png` (stale).

---

## Task 0: (Optional) Initialise git

**Files:** none

- [ ] **Step 1: Init repo**

Run in `Sales demo menu/`:
```bash
git init && printf "node_modules/\n.superpowers/\n.image-slots.state.json\n" > .gitignore
git add -A && git commit -m "chore: baseline before menu upgrade"
```
Expected: a repo with one commit. If you skip this task, ignore all later `git commit` steps.

---

## Task 1: Copy and rename allergen icons

The 14 EU allergen SVGs live in `menu-prototypes/data/images/alergenos` with Spanish/accented names. Copy them into the project under clean ASCII names so the code can build paths from allergen codes.

**Files:**
- Create: `images/allergens/*.svg` (14 files)

- [ ] **Step 1: Create the folder and copy with renames**

Run from `Sales demo menu/` (Git Bash):
```bash
SRC="../menu-prototypes/data/images/alergenos"
mkdir -p images/allergens
cp "$SRC/gluten.svg"                       images/allergens/gluten.svg
cp "$SRC/crustaceos.svg"                   images/allergens/crustaceans.svg
cp "$SRC/huevos.svg"                        images/allergens/eggs.svg
cp "$SRC/pescado.svg"                       images/allergens/fish.svg
cp "$SRC/cacahuetes.svg"                    images/allergens/peanuts.svg
cp "$SRC/soja.svg"                          images/allergens/soy.svg
cp "$SRC/lacteos.svg"                       images/allergens/milk.svg
cp "$SRC/frutos_cascara.svg"                images/allergens/nuts.svg
cp "$SRC/apio.svg"                          images/allergens/celery.svg
cp "$SRC/mostaza.svg"                       images/allergens/mustard.svg
cp "$SRC/granos_sesamo.svg"                 images/allergens/sesame.svg
cp "$SRC/dióxido-azufre-sulfitos.svg"       images/allergens/sulphites.svg
cp "$SRC/altramuces.svg"                    images/allergens/lupin.svg
cp "$SRC/moluscos.svg"                       images/allergens/molluscs.svg
```

- [ ] **Step 2: Verify all 14 landed**

Run: `ls images/allergens | wc -l`
Expected: `14`

- [ ] **Step 3: Note on appearance** — these SVGs are **white silhouettes on transparent**. They are designed to sit on a dark badge (Task 4 renders them on a dark disc). Don't expect them to be visible on a white background on their own.

- [ ] **Step 4: Commit**
```bash
git add images/allergens && git commit -m "feat: add EU allergen icons"
```

---

## Task 2: Rewrite `menuData.js` as the single source of truth

`config.js` already exists and is correct — leave it. Replace `menuData.js` so it carries categories, the allergen code→name map, the code→icon-file map, dishes (now with `image` and `pairsWith`), and the filter definitions. `index.html` will load this in Task 3.

**Files:**
- Rewrite: `menuData.js`

- [ ] **Step 1: Write the file**

Replace the entire contents of `menuData.js` with:

```js
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  MENU DATA — edit to change the menu content
//  Allergen codes (EU 14): GL CR EG FI PN SY MK NU CY MD SE SU LP ML
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// code → icon file under images/allergens/
const ALLERGEN_ICONS = {
  GL:'gluten.svg', CR:'crustaceans.svg', EG:'eggs.svg', FI:'fish.svg',
  PN:'peanuts.svg', SY:'soy.svg', MK:'milk.svg', NU:'nuts.svg',
  CY:'celery.svg', MD:'mustard.svg', SE:'sesame.svg', SU:'sulphites.svg',
  LP:'lupin.svg', ML:'molluscs.svg',
};

const CATEGORIES = ['Brunch','Small Plates','Mains','Sides','Sweets','Drinks'];

// Filters shown in the filter bar.
//   dietary  → tag ids ('v' vegetarian, 'vg' vegan)
//   freeFrom → allergen codes the diner wants to avoid
const FILTERS = { dietary:['v','vg'], freeFrom:['GL','NU','PN','EG','MK'] };

// Each dish:
//   image     '' for now (placeholder shown). Later: 'images/dishes/x.jpg'
//   pairsWith  array of other dish ids (drinks allowed) — shown in the popup
const DISHES = [
  { id:'eggs-benedict', cat:'Brunch', name:'Garden Eggs Benedict', desc:'Poached free-range eggs, smoked ham hock & chive hollandaise on toasted sourdough.', price:'13.50', allergens:['EG','GL','MK'], tags:[], image:'', pairsWith:['flat-white','lemonade'] },
  { id:'avo-toast', cat:'Brunch', name:'Avocado & Whipped Feta', desc:'Smashed avocado, lemon-whipped feta, chilli & toasted seeds on rye.', price:'11.00', allergens:['GL','MK','SE'], tags:['v'], image:'', pairsWith:['flat-white','lemonade'] },
  { id:'pancakes', cat:'Brunch', name:'Buttermilk Pancakes', desc:'Thick-cut stack with streaky bacon, maple syrup & whipped butter.', price:'12.50', allergens:['GL','EG','MK'], tags:[], image:'', pairsWith:['flat-white'] },
  { id:'wings', cat:'Small Plates', name:'Buttermilk Hot Wings', desc:'Crispy wings tossed in house hot honey, blue cheese dip.', price:'9.50', allergens:['GL','MK'], tags:[], image:'', pairsWith:['ipa','fries'] },
  { id:'soup', cat:'Small Plates', name:'Soup of the Day', desc:'Seasonal vegetables, served with warm soda bread & butter.', price:'7.00', allergens:['GL','CY','MK'], tags:['v'], image:'', pairsWith:['bread'] },
  { id:'calamari', cat:'Small Plates', name:'Crispy Calamari', desc:'Lightly floured rings, lemon aioli & pickled jalapeño.', price:'10.00', allergens:['GL','EG','ML'], tags:[], image:'', pairsWith:['ipa','lemonade'] },
  { id:'house-burger', cat:'Mains', name:'The House Burger', desc:'Aged beef, smoked cheddar, pickles & burger sauce in a toasted brioche bun.', price:'16.50', allergens:['GL','EG','MK','MD'], tags:[], popular:true, image:'', pairsWith:['fries','ipa'] },
  { id:'chicken-burger', cat:'Mains', name:'Buttermilk Chicken Burger', desc:'Crispy chicken thigh, slaw & sriracha mayo, skin-on fries.', price:'15.00', allergens:['GL','EG','MK'], tags:[], image:'', pairsWith:['slaw','lemonade'] },
  { id:'sea-bass', cat:'Mains', name:'Pan-Seared Sea Bass', desc:'Lemon-caper butter, crushed new potatoes & seasonal greens.', price:'19.50', allergens:['FI','MK'], tags:[], image:'', pairsWith:['bread','lemonade'] },
  { id:'risotto', cat:'Mains', name:'Wild Mushroom Risotto', desc:'Arborio rice, aged parmesan, truffle oil & rocket.', price:'15.50', allergens:['MK','CY','SU'], tags:['v'], image:'', pairsWith:['bread','ipa'] },
  { id:'fries', cat:'Sides', name:'Skin-On Fries', desc:'Rosemary salt, roasted garlic aioli.', price:'4.50', allergens:['EG'], tags:['v','vg'], image:'', pairsWith:['house-burger'] },
  { id:'slaw', cat:'Sides', name:'House Slaw', desc:'Crunchy cabbage & carrot, bright lemon dressing.', price:'4.00', allergens:['EG','MD'], tags:['v'], image:'', pairsWith:['chicken-burger'] },
  { id:'bread', cat:'Sides', name:'Warm Soda Bread', desc:'House-baked daily, cultured butter.', price:'3.50', allergens:['GL','MK'], tags:['v'], image:'', pairsWith:['soup'] },
  { id:'stp', cat:'Sweets', name:'Sticky Toffee Pudding', desc:'Warm date sponge, toffee sauce & vanilla bean ice cream.', price:'7.50', allergens:['GL','EG','MK'], tags:['v'], image:'', pairsWith:['flat-white'] },
  { id:'brownie', cat:'Sweets', name:'Dark Chocolate Brownie', desc:'Salted caramel, honeycomb crumb & cream.', price:'7.00', allergens:['GL','EG','MK','SY'], tags:['v'], image:'', pairsWith:['flat-white'] },
  { id:'cheesecake', cat:'Sweets', name:'Baked Vanilla Cheesecake', desc:'Digestive base, fresh berry compote.', price:'7.00', allergens:['GL','EG','MK'], tags:['v'], image:'', pairsWith:['flat-white'] },
  { id:'flat-white', cat:'Drinks', name:'Flat White', desc:'Double ristretto shot, silky steamed milk.', price:'3.60', allergens:['MK'], tags:['v'], image:'', pairsWith:['stp','brownie'] },
  { id:'lemonade', cat:'Drinks', name:'Fresh Mint Lemonade', desc:'Pressed lemon, muddled mint & soda over ice.', price:'4.20', allergens:[], tags:['v','vg'], image:'', pairsWith:['calamari'] },
  { id:'ipa', cat:'Drinks', name:'Craft IPA — Local', desc:'Rotating selection from Irish microbreweries. Ask your server.', price:'6.50', allergens:['GL','SU'], tags:['vg'], image:'', pairsWith:['wings','house-burger'] },
];
```

- [ ] **Step 2: Sanity check ids** — every id used in any `pairsWith` exists as a dish `id`. (Verified in the data above; if you edit, keep it true — a missing id renders nothing for that pairing.)

- [ ] **Step 3: Commit**
```bash
git add menuData.js && git commit -m "feat: add image + pairsWith + filters to menu data"
```

---

## Task 3: Create `index.html` wired to external data, drop dead code

Turn `Menu.html` into `index.html`: load `config.js` + `menuData.js` externally, remove the inline `CONFIG`/`ALLERGENS`/`CATEGORIES`/`DISHES` duplicates, and delete the unused `image-slot` web component and the unused `IOSDevice` frame. Replace the photo drop-slot with a plain photo component.

**Files:**
- Create: `index.html` (from `Menu.html`)
- Delete: `Menu.html`, `image-slot.js`, `menu-app.jsx`, `ios-frame.jsx`, `screenshot-main.png`

- [ ] **Step 1: Rename**
```bash
git mv Menu.html index.html 2>/dev/null || mv Menu.html index.html
```

- [ ] **Step 2: Load external data, remove inline CONFIG block**

In `index.html`, the `<head>` currently defines `CONFIG` inline (the `<script>const CONFIG = {…};</script>` block around lines 9–23) and then a font-loader that reads `CONFIG`. Replace the inline `CONFIG` block with an external load **before** the font loader:

Replace:
```html
<!-- ── CONFIG — edit before each prospect visit ───────────────────── -->
<script>
const CONFIG = {
  name:         'Birch & Bramble',
  ...
  themeALabel:  'Warm',
};
</script>
```
with:
```html
<!-- ── CONFIG + DATA — edit config.js / menuData.js per prospect ───── -->
<script src="config.js"></script>
```
Leave the font-loader `<script>` immediately after it unchanged (it reads `CONFIG`).

- [ ] **Step 3: Replace the inline menu-data block with an external load**

Find the block that begins `<!-- ── MENU DATA ─` and defines `const ALLERGENS`, `const CATEGORIES`, `const DISHES` (around lines 60–89). Replace the whole `<script>…</script>` with:
```html
<!-- ── MENU DATA ─────────────────────────────────────────────────────── -->
<script src="menuData.js"></script>
```

- [ ] **Step 4: Delete the image-slot web component**

Remove the entire block `<!-- ── IMAGE SLOT web component ─ … -->` through its closing `</script>` (the IIFE that defines `customElements.define('image-slot', …)`, ~lines 91–271). This removes drag-and-drop entirely.

- [ ] **Step 5: Delete the unused iOS device frame**

Remove the `<!-- ── iOS DEVICE FRAME ─ … -->` script block that defines `IOSStatusBar`, `IOSDevice`, and `Object.assign(window, { IOSDevice })`. It is never rendered.

- [ ] **Step 6: Replace `PhotoSlot` with a static `DishPhoto`**

In the app script, replace the `PhotoSlot` component:
```jsx
function PhotoSlot({ id, radius, h=88 }) {
  return <image-slot id={id} ...></image-slot>;
}
```
with a static photo + placeholder component:
```jsx
function DishPhoto({ image, radius=14, style }) {
  const base = { borderRadius:radius, overflow:'hidden', background:'var(--surface-2)', flexShrink:0, ...style };
  if (image) return <div style={base}><img src={image} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} /></div>;
  return (
    <div style={{ ...base, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--muted)' }}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity:.5 }}>
        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
      </svg>
    </div>
  );
}
```

- [ ] **Step 7: Point the card at `DishPhoto`**

In `DishCard`, replace:
```jsx
<PhotoSlot id={`card-${dish.id}`} radius={m?3:14} h={imgH} />
```
with:
```jsx
<DishPhoto image={dish.image} radius={m?3:14} style={{ width:imgH, height:imgH }} />
```

- [ ] **Step 8: Delete the stale standalone files**
```bash
rm -f image-slot.js menu-app.jsx ios-frame.jsx screenshot-main.png
```

- [ ] **Step 9: Browser verification**

Open `index.html` directly in a browser (double-click, or via Live Server).
Expected: menu renders exactly as before, with cards showing a small **placeholder** image tile (camera glyph) instead of a drop zone. Theme toggle and language switch still work. No console errors about `image-slot` or `CONFIG`/`DISHES` undefined.

- [ ] **Step 10: Commit**
```bash
git add -A && git commit -m "refactor: consolidate to index.html, external data, drop drag-drop & dead code"
```

---

## Task 4: Allergen icon badges on cards

Replace the text-code chips on dish cards with circular dark badges showing the real icons.

**Files:**
- Modify: `index.html` (app script — `AllergenChips`)

- [ ] **Step 1: Add an `AllergenIcon` component** (place it just above `AllergenChips`):
```jsx
function AllergenIcon({ code, name, size=24 }) {
  const file = ALLERGEN_ICONS[code];
  return (
    <span title={name} aria-label={name} style={{ width:size, height:size, borderRadius:'50%', background:'var(--text)', display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      {file && <img src={`images/allergens/${file}`} alt="" style={{ width:'58%', height:'58%', objectFit:'contain', display:'block' }} />}
    </span>
  );
}
```

- [ ] **Step 2: Rewrite `AllergenChips` to use icons.** It needs the translation table for names, so add a `t` prop. Replace the whole component:
```jsx
function AllergenChips({ codes, t, size=22 }) {
  if (!codes.length) return null;
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:9 }}>
      {codes.map(c => <AllergenIcon key={c} code={c} name={t.allergens[c]} size={size} />)}
    </div>
  );
}
```

- [ ] **Step 3: Pass `t` where `AllergenChips` is used.** In `DishCard`, change:
```jsx
<AllergenChips codes={dish.allergens} minimal={m} />
```
to:
```jsx
<AllergenChips codes={dish.allergens} t={t} />
```

- [ ] **Step 4: Browser verification**

Open `index.html`. On dish cards, allergens now appear as small **dark circular badges with white icons** (e.g. Sea Bass shows a fish + milk icon). Hovering a badge shows the allergen name as a tooltip. Switch language — tooltips change (EN/ES/DE); icons stay. Toggle to Minimal theme — badges still render (dark disc, white icon).

- [ ] **Step 5: Commit**
```bash
git add index.html && git commit -m "feat: allergen icon badges on cards"
```

---

## Task 5: Add filter & pairs translation keys

The popup and filter bar need new labels in all three languages.

**Files:**
- Modify: `index.html` (app script — `LANGS`)

- [ ] **Step 1: Add keys to each language object.** Inside `LANGS.EN`, add:
```js
    pairsWith:'Pairs with',
    filters:'Filters', dietary:'Dietary', freeFrom:'Free from', clearFilters:'Clear',
    vegetarian:'Vegetarian', vegan:'Vegan',
    noMatch:'No dishes match these filters.',
    showing:(n) => `Showing ${n} ${n===1?'dish':'dishes'}`,
```
Inside `LANGS.ES`, add:
```js
    pairsWith:'Marida con',
    filters:'Filtros', dietary:'Dieta', freeFrom:'Sin', clearFilters:'Borrar',
    vegetarian:'Vegetariano', vegan:'Vegano',
    noMatch:'Ningún plato coincide con estos filtros.',
    showing:(n) => `Mostrando ${n} ${n===1?'plato':'platos'}`,
```
Inside `LANGS.DE`, add:
```js
    pairsWith:'Passt zu',
    filters:'Filter', dietary:'Ernährung', freeFrom:'Frei von', clearFilters:'Zurücksetzen',
    vegetarian:'Vegetarisch', vegan:'Vegan',
    noMatch:'Keine Gerichte entsprechen diesen Filtern.',
    showing:(n) => `${n} ${n===1?'Gericht':'Gerichte'}`,
```

- [ ] **Step 2: Browser verification** — open `index.html`, no console errors. (Keys are consumed in Tasks 6 & 8.)

- [ ] **Step 3: Commit**
```bash
git add index.html && git commit -m "feat: add filter + pairs translation keys"
```

---

## Task 6: Redesign the dish popup

Rebuild `DetailSheet`: full-bleed photo banner with overlaid close button, name + price, description, an inline row of allergen icons, and a "Pairs with" horizontal scroller whose cards open the paired dish.

**Files:**
- Modify: `index.html` (app script — `DetailSheet`, and `_openDish` usage)

- [ ] **Step 1: Add a `PairCard` component** (just above `DetailSheet`):
```jsx
function PairCard({ dish, onOpen }) {
  if (!dish) return null;
  return (
    <div onClick={() => onOpen(dish)} style={{ flex:'0 0 auto', width:158, display:'flex', alignItems:'center', gap:10, background:'var(--surface)', borderRadius:'var(--card-radius)', boxShadow:'var(--shadow)', padding:8, cursor:'pointer' }}>
      <DishPhoto image={dish.image} radius={9} style={{ width:42, height:42 }} />
      <div style={{ minWidth:0 }}>
        <div style={{ fontFamily:'var(--font-body)', fontSize:12.5, fontWeight:600, color:'var(--text)', lineHeight:1.15, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{dish.name}</div>
        <div style={{ fontFamily:'var(--font-body)', fontSize:11.5, color:'var(--accent)', marginTop:2 }}>{CONFIG.currency}{dish.price}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace the whole `DetailSheet` component** with:
```jsx
function DetailSheet({ theme, dish, onClose, onOpen, t }) {
  const [shown, setShown] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setShown(true), 30); return () => clearTimeout(timer); }, []);
  const m = theme.minimal;
  const close = () => { setShown(false); setTimeout(onClose, 260); };
  const pairs = (dish.pairsWith || []).map(id => DISHES.find(d => d.id === id)).filter(Boolean);
  return (
    <div style={{ position:'absolute', inset:0, zIndex:80 }}>
      <div onClick={close} style={{ position:'absolute', inset:0, background:'rgba(18,12,8,0.42)', opacity:shown?1:0, transition:'opacity .26s ease', backdropFilter:'blur(1.5px)' }}></div>
      <div className="no-scrollbar" style={{ position:'absolute', left:0, right:0, bottom:0, background:'var(--bg)', borderTopLeftRadius:m?8:28, borderTopRightRadius:m?8:28, transform:shown?'translateY(0)':'translateY(101%)', transition:'transform .3s cubic-bezier(.32,.72,0,1)', maxHeight:'90%', overflowY:'auto', paddingBottom:28, boxShadow:'0 -10px 40px rgba(0,0,0,0.18)' }}>

        {/* Full-bleed photo banner with overlaid close */}
        <div style={{ position:'relative' }}>
          <DishPhoto image={dish.image} radius={0} style={{ width:'100%', height:200, borderTopLeftRadius:m?8:28, borderTopRightRadius:m?8:28 }} />
          <button onClick={close} aria-label={t.close} style={{ position:'absolute', top:12, right:12, width:32, height:32, borderRadius:'50%', border:'none', cursor:'pointer', background:'rgba(0,0,0,0.45)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}>
            <svg width="15" height="15" viewBox="0 0 14 14"><path d="M1 1l12 12M13 1L1 13" stroke="#fff" strokeWidth="1.7" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div style={{ padding:'16px 20px 0' }}>
          {dish.popular && <div style={{ marginBottom:7 }}><PopularBadge minimal={m} t={t} /></div>}
          <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
            <div style={{ flex:1, fontFamily:'var(--font-display)', fontWeight:m?600:700, fontSize:m?27:23, lineHeight:1.08, color:'var(--text)', letterSpacing:'var(--name-spacing)' }}>{dish.name}</div>
            <div style={{ fontFamily:'var(--font-body)', fontWeight:m?500:700, fontSize:19, color:m?'var(--accent)':'var(--text)', whiteSpace:'nowrap', paddingTop:2 }}>{CONFIG.currency}{dish.price}</div>
          </div>
          <div style={{ fontFamily:'var(--font-body)', fontSize:14, lineHeight:1.5, color:'var(--muted)', marginTop:10 }}>{dish.desc}</div>

          {/* Contains — inline allergen icons */}
          <div style={{ fontFamily:'var(--font-body)', fontSize:10.5, fontWeight:m?500:600, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--muted)', marginTop:22, marginBottom:10 }}>{t.contains}</div>
          {dish.allergens.length
            ? <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>{dish.allergens.map(c => <AllergenIcon key={c} code={c} name={t.allergens[c]} size={30} />)}</div>
            : <div style={{ fontFamily:'var(--font-body)', fontSize:14, color:'var(--muted)' }}>{t.noAllergens}</div>}

          {/* Pairs with — horizontal scroller */}
          {pairs.length > 0 && (
            <div>
              <div style={{ fontFamily:'var(--font-body)', fontSize:10.5, fontWeight:m?500:600, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--muted)', marginTop:22, marginBottom:10 }}>{t.pairsWith}</div>
              <div className="no-scrollbar" style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:2 }}>
                {pairs.map(p => <PairCard key={p.id} dish={p} onOpen={onOpen} />)}
              </div>
            </div>
          )}

          <button onClick={close} style={{ width:'100%', marginTop:26, border:'none', cursor:'pointer', background:'var(--primary)', color:'var(--on-primary)', borderRadius:m?4:14, padding:'15px 0', fontFamily:'var(--font-body)', fontWeight:600, fontSize:15, letterSpacing:m?'0.08em':'0', textTransform:m?'uppercase':'none' }}>{t.close}</button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Pass `onOpen` into `DetailSheet`.** In `MenuApp`, find:
```jsx
{dish && <DetailSheet theme={theme} dish={dish} onClose={() => setDish(null)} t={t} />}
```
and change it to:
```jsx
{dish && <DetailSheet theme={theme} dish={dish} onClose={() => setDish(null)} onOpen={setDish} t={t} />}
```

- [ ] **Step 4: Browser verification**

Open `index.html`, tap **Pan-Seared Sea Bass**. Expect: a slide-up sheet with a full-width photo placeholder + round ✕ top-right; name + **€19.50**; description; a **Contains** row of two icon badges (fish, milk); a **Pairs with** row of cards (Warm Soda Bread, Fresh Mint Lemonade) showing thumbnail + name + price. Tap a pairing card → the sheet switches to that dish. Tap ✕ or the backdrop → it closes. Repeat in Minimal theme and in ES/DE (labels translate).

- [ ] **Step 5: Commit**
```bash
git add index.html && git commit -m "feat: redesigned dish popup with allergen icons and pairings"
```

---

## Task 7: Filter bar — state & component

Add a collapsible filter bar between the tabs and the list. This task builds the UI and wires the toggle state; Task 8 applies the filtering to the list.

**Files:**
- Modify: `index.html` (app script — new `FilterBar`, `MenuApp` state)

- [ ] **Step 1: Add filter state to `MenuApp`.** After the existing `const [active, setActive] = useState('All');` line, add:
```jsx
  const [filters, setFilters] = useState({ diet:[], free:[] });
  const toggleFilter = (group, id) => setFilters(f => {
    const has = f[group].includes(id);
    return { ...f, [group]: has ? f[group].filter(x => x !== id) : [...f[group], id] };
  });
  const clearFilters = () => setFilters({ diet:[], free:[] });
  const filterCount = filters.diet.length + filters.free.length;
```

- [ ] **Step 2: Add the `FilterBar` component** (place it above `MenuApp`):
```jsx
function FilterBar({ theme, filters, onToggle, onClear, count, t }) {
  const [open, setOpen] = useState(false);
  const m = theme.minimal;
  const chip = (active, label, onClick, dot) => (
    <button key={label} onClick={onClick} style={{ display:'inline-flex', alignItems:'center', gap:6, cursor:'pointer', borderRadius:999, padding:'7px 13px', fontFamily:'var(--font-body)', fontSize:13, fontWeight:500, border:active?'1.5px solid var(--primary)':'1.5px solid var(--line)', background:active?'var(--primary)':'var(--surface)', color:active?'var(--on-primary)':'var(--text)', transition:'background .15s, color .15s' }}>
      {dot && <span style={{ width:7, height:7, borderRadius:'50%', background:active?'var(--on-primary)':'#6BA368' }}></span>}{label}
    </button>
  );
  return (
    <div style={{ padding:'10px 16px', background:'var(--bg)', borderBottom:'1px solid var(--line)', flexShrink:0 }}>
      <button onClick={() => setOpen(o => !o)} style={{ display:'inline-flex', alignItems:'center', gap:8, cursor:'pointer', borderRadius:999, padding:'8px 14px', border:'1.5px solid var(--accent)', background:count?'var(--accent)':'transparent', color:count?'var(--accent-ink)':'var(--text)', fontFamily:'var(--font-body)', fontSize:12, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' }}>
        <svg width="13" height="13" viewBox="0 0 14 14" style={{ transform:open?'rotate(180deg)':'none', transition:'transform .2s' }}><path d="M2 4l5 5 5-5" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        {t.filters}{count ? ` · ${count}` : ''}
      </button>
      {open && (
        <div style={{ marginTop:12 }}>
          <div style={{ fontFamily:'var(--font-body)', fontSize:10, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--muted)', marginBottom:8 }}>{t.dietary}</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:14 }}>
            {chip(filters.diet.includes('v'), t.vegetarian, () => onToggle('diet','v'), true)}
            {chip(filters.diet.includes('vg'), t.vegan, () => onToggle('diet','vg'), true)}
          </div>
          <div style={{ fontFamily:'var(--font-body)', fontSize:10, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--muted)', marginBottom:8 }}>{t.freeFrom}</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {FILTERS.freeFrom.map(code => chip(filters.free.includes(code), t.allergens[code], () => onToggle('free',code), false))}
          </div>
          {count > 0 && (
            <button onClick={onClear} style={{ marginTop:14, border:'none', background:'transparent', cursor:'pointer', color:'var(--accent)', fontFamily:'var(--font-body)', fontSize:12.5, fontWeight:600, textDecoration:'underline', padding:0 }}>{t.clearFilters}</button>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Render `FilterBar` in `MenuApp`** — directly after `<Tabs … />`:
```jsx
      <FilterBar theme={theme} filters={filters} onToggle={toggleFilter} onClear={clearFilters} count={filterCount} t={t} />
```

- [ ] **Step 4: Browser verification**

Open `index.html`. Below the tabs is a **Filters** pill. Click it → it expands to show **Dietary** (Vegetarian, Vegan) and **Free from** (Gluten, Nuts, Peanuts, Eggs, Milk) chips. Clicking chips toggles their active style; the pill shows a count (e.g. "Filters · 2") and a **Clear** link appears. Clear resets. (The list doesn't filter yet — that's Task 8.)

- [ ] **Step 5: Commit**
```bash
git add index.html && git commit -m "feat: collapsible filter bar UI"
```

---

## Task 8: Apply filtering to the list + empty state

Make the active filters actually narrow the menu, add the "showing X" count, and an empty state.

**Files:**
- Modify: `index.html` (app script — `MenuList`, `MenuApp`)

- [ ] **Step 1: Add a matcher and thread `filters` into `MenuList`.** Replace the `MenuList` component with:
```jsx
function dishPasses(d, filters) {
  for (const tag of filters.diet) {
    if (tag === 'v' && !(d.tags.includes('v') || d.tags.includes('vg'))) return false;
    if (tag === 'vg' && !d.tags.includes('vg')) return false;
  }
  for (const code of filters.free) if (d.allergens.includes(code)) return false;
  return true;
}

function MenuList({ theme, active, filters, t }) {
  const m = theme.minimal;
  const pass = d => dishPasses(d, filters);
  const groups = (active === 'All' ? CATEGORIES.map(c => ({ cat:c, items:DISHES.filter(d => d.cat===c && pass(d)) }))
                                    : [{ cat:active, items:DISHES.filter(d => d.cat===active && pass(d)) }])
                 .filter(g => g.items.length > 0);
  if (groups.length === 0) {
    return (
      <div style={{ padding:'48px 24px', textAlign:'center', fontFamily:'var(--font-body)', fontSize:14, color:'var(--muted)' }}>{t.noMatch}</div>
    );
  }
  return (
    <div style={{ padding:m?'4px 20px 0':'14px 16px 0' }}>
      {groups.map((g, gi) => (
        <div key={g.cat} style={{ marginTop:gi===0?0:(m?22:18) }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:m?4:10, paddingTop:m?8:0 }}>
            <span style={{ fontFamily:m?'var(--font-body)':'var(--font-display)', fontWeight:m?500:700, fontSize:m?11.5:14, letterSpacing:m?'0.2em':'0.01em', textTransform:m?'uppercase':'none', color:m?'var(--muted)':'var(--text)' }}>{t.catLabels[g.cat] || g.cat}</span>
            {m && <span style={{ flex:1, height:1, background:'var(--line)' }}></span>}
          </div>
          {g.items.map(d => <DishCardBound key={d.id} theme={theme} dish={d} t={t} />)}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Pass `filters` to `MenuList` and add the count.** In `MenuApp`, replace:
```jsx
        <MenuList theme={theme} active={active} t={t} />
```
with:
```jsx
        <MenuList theme={theme} active={active} filters={filters} t={t} />
```
Then, immediately after `toggleFilter`/`clearFilters`/`filterCount` were defined (Task 7 Step 1), add a visible count derived from current view. Insert this just before the `return (` in `MenuApp`:
```jsx
  const visibleCount = useMemo(() => DISHES.filter(d =>
    (active === 'All' || d.cat === active) && dishPasses(d, filters)
  ).length, [active, filters]);
```

- [ ] **Step 3: Show the count inside the filter bar.** Pass it down: change the `FilterBar` render line to include `shown={visibleCount}`:
```jsx
      <FilterBar theme={theme} filters={filters} onToggle={toggleFilter} onClear={clearFilters} count={filterCount} shown={visibleCount} t={t} />
```
In `FilterBar`'s signature add `shown`, and inside the `open` panel, just before the `Clear` button, add a count line:
```jsx
          <div style={{ marginTop:14, fontFamily:'var(--font-body)', fontSize:12, color:'var(--muted)' }}>{t.showing(shown)}</div>
```

- [ ] **Step 4: Browser verification**

Open `index.html`.
- Activate **Free from → Milk**: dishes containing milk disappear (e.g. Flat White, most brunch items go); count updates.
- Activate **Vegan**: only vegan dishes remain (Skin-On Fries, Fresh Mint Lemonade, Craft IPA).
- Combine **Vegetarian + Gluten**: vegetarian dishes without gluten remain.
- Filter until nothing matches (e.g. Drinks tab + Free from Gluten + Milk + ... ) → the **"No dishes match these filters."** message shows.
- **Clear** restores everything. Confirm filtering respects the selected category tab, and works in all themes/languages.

- [ ] **Step 5: Commit**
```bash
git add index.html && git commit -m "feat: apply allergen/dietary filtering with count and empty state"
```

---

## Task 9: Update README & remove the old allergen legend codes note

Bring `README.md` in line with the new structure and editing workflow.

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update the File structure section** to:
```
index.html       ← open this in a browser
config.js        ← edit before each visit (identity + theme)
menuData.js      ← edit to change categories, dishes, pairings, filters
images/allergens ← the 14 EU allergen icons
images/dishes    ← dish photos (add later)
README.md
```

- [ ] **Step 2: Remove the "Adding food photos" drag-and-drop paragraph** (the slot/drag-drop instructions no longer apply) and replace with:
```markdown
## Adding food photos

Drop image files into `images/dishes/`, then set each dish's `image` field in
`menuData.js` to the path, e.g. `image: 'images/dishes/house-burger.jpg'`.
Dishes with an empty `image` show a neutral placeholder.
```

- [ ] **Step 3: Update the dish-shape snippet** in README to include `image` and `pairsWith` fields (mirror the shape in `menuData.js`).

- [ ] **Step 4: Browser verification** — none (docs only). Read through once for accuracy.

- [ ] **Step 5: Commit**
```bash
git add README.md && git commit -m "docs: update README for new structure"
```

---

## Task 10: Full regression pass

**Files:** none (verification only)

- [ ] **Step 1: Open `index.html` from disk** (double-click — no server). Confirm it renders with no console errors.
- [ ] **Step 2: Cards** — allergen icon badges show on every dish that has allergens; placeholders show for photos.
- [ ] **Step 3: Popup** — open several dishes incl. one with no allergens (Fresh Mint Lemonade → "None of the 14…") and one popular (House Burger → badge). Pairings render and tap through.
- [ ] **Step 4: Filters** — each filter, a combination, and the empty state behave per Task 8; count is correct.
- [ ] **Step 5: Themes & languages** — toggle Warm/Minimal and EN/ES/DE; all new UI is styled and translated.
- [ ] **Step 6: Per-prospect edit** — change `name` and `primaryColor` in `config.js`, reload, confirm it flows through.
- [ ] **Step 7: Final commit**
```bash
git add -A && git commit -m "chore: menu upgrade complete"
```

---

## Self-review notes

- **Spec coverage:** allergen icons (T1, T4) ✓ · redesigned popup with price/allergens/pairs (T6) ✓ · filters with curated set + count + empty state (T7, T8) ✓ · clean structure, no drag-drop, self-contained (T1–T3, T9) ✓ · photos deferred but data-ready (`image` field + `DishPhoto` placeholder, T2/T3) ✓ · themes & i18n for new UI (T5, styled throughout) ✓.
- **Type/name consistency:** `DishPhoto`, `AllergenIcon`, `ALLERGEN_ICONS`, `FILTERS`, `dishPasses`, `filters={diet:[],free:[]}`, `toggleFilter(group,id)` used consistently across T3–T8. `AllergenChips` updated everywhere it's called (T4 Step 3).
- **Deferred (in `TODO.md`):** modularising the inline app; assigning real dish photos.
