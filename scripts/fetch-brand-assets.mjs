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
