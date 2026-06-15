// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  SALES DEMO CONFIG — edit this before each prospect visit
//  All other files are untouched. Just change what you need here.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CONFIG = {

  // ── Restaurant identity ─────────────────────────────────────────────
  name:     'Birch & Bramble',
  // Tagline can be a plain string (same in every language) or a per-language
  // object { EN, ES, FR, DE } that switches with the language picker.
  tagline:  {
    EN: 'All-day kitchen & bar · Dublin',
    ES: 'Cocina y bar todo el día · Dublín',
    FR: 'Cuisine & bar toute la journée · Dublin',
    DE: 'Ganztagsküche & Bar · Dublin',
  },
  monogram: 'B',     // 1–2 letters shown in the logo circle if no logoUrl
  logoUrl:  '',      // Optional: full URL to a logo image (PNG/SVG recommended)
  currency: '€',

  // ── Theme A colours (the warm demo — customise for each prospect) ───
  // Primary   → header background, active tabs, close button
  // Accent    → logo circle fill, Popular badge, price highlight (Theme B)
  // Bg        → page and card backgrounds
  primaryColor: '#4F5A3F',   // earthy olive green
  accentColor:  '#EEA85C',   // soft apricot
  bgColor:      '#F5F0E7',

  // ── Font pairing for Theme A ────────────────────────────────────────
  // Use any Google Fonts name. Loaded automatically at runtime.
  // Theme B always uses Cormorant Garamond / Jost (built in).
  headingFont: 'Bricolage Grotesque',
  bodyFont:    'DM Sans',

  // ── Theme toggle label ──────────────────────────────────────────────
  // What the warm-theme button says in the bottom toggle pill
  themeALabel: 'Earthy',

};
