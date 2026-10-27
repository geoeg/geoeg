// Generates the tech stack card grid used in README.md.
// Edit GROUPS, then run: node scripts/gen-stack.mjs
// Writes assets/stack-light.svg and assets/stack-dark.svg (overwrites them).
// Icons are Simple Icons SVGs (https://simpleicons.org) saved in scripts/icons/<slug>.svg.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.join(here, 'icons');
const outDir = path.join(here, '..', 'assets');

const GROUPS = [
  { title: 'Web', items: [
    ['typescript', 'TypeScript'], ['react', 'React'], ['tanstack', 'TanStack'],
    ['tailwindcss', 'Tailwind CSS'], ['shadcnui', 'shadcn/ui'], ['vite', 'Vite'] ] },
  { title: 'Mobile', items: [
    ['expo', 'Expo'], ['react', 'React Native'], ['pwa', 'PWA'] ] },
  { title: 'Backend', items: [
    ['strapi', 'Strapi'], ['supabase', 'Supabase'], ['postgresql', 'Postgres'],
    ['nodedotjs', 'Node.js'], ['fastapi', 'FastAPI'], ['stripe', 'Stripe'] ] },
  { title: 'Ship', items: [
    ['docker', 'Docker'], ['cloudflare', 'Cloudflare'], ['netlify', 'Netlify'], ['vitest', 'Vitest'] ] },
  { title: 'AI', items: [
    ['claude', 'Claude API'], ['claude', 'Claude Code'], ['anthropic', 'Agent skills'] ] },
];

// GitHub Primer colors; `min` is the contrast below which a brand color falls back to `fg`
const THEMES = {
  light: { min: 1.5, card: '#f6f8fa', border: '#d0d7de', fg: '#1f2328', muted: '#59636e' },
  dark: { min: 3, card: '#151b23', border: '#3d444d', fg: '#f0f6fc', muted: '#9198a1' },
};

const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif";

const icon = slug => {
  const svg = fs.readFileSync(path.join(iconsDir, `${slug}.svg`), 'utf8');
  return { d: svg.match(/ d="([^"]+)"/)[1], hex: svg.match(/fill="(#[0-9A-Fa-f]{6})"/)[1] };
};

const lum = hex => {
  const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contrast = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const tint = (hex, t) => (contrast(hex, t.card) < t.min ? t.fg : hex);
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function render(t) {
  const W = 840, gap = 12, colW = (W - gap * (GROUPS.length - 1)) / GROUPS.length, rowH = 30, top = 44;
  const H = top + Math.max(...GROUPS.map(g => g.items.length)) * rowH + 14;
  let out = '';
  GROUPS.forEach((g, i) => {
    const x = i * (colW + gap);
    out += `<g class="col" style="animation-delay:${i * 90}ms">`;
    out += `<rect x="${x + 0.5}" y="0.5" width="${colW - 1}" height="${H - 1}" rx="12" fill="${t.card}" stroke="${t.border}"/>`;
    out += `<text x="${x + 16}" y="28" font-family="${SANS}" font-size="11" font-weight="600" letter-spacing="1.2" fill="${t.muted}">${g.title.toUpperCase()}</text>`;
    g.items.forEach(([slug, label], j) => {
      const { d, hex } = icon(slug);
      const y = top + j * rowH;
      out += `<g transform="translate(${x + 16} ${y}) scale(0.75)"><path d="${d}" fill="${tint(hex, t)}"/></g>`;
      out += `<text x="${x + 44}" y="${y + 13.5}" font-family="${SANS}" font-size="13.5" fill="${t.fg}">${esc(label)}</text>`;
    });
    out += '</g>';
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Tech stack">
<style>.col{opacity:0;animation:in .5s ease-out forwards}@keyframes in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}@media (prefers-reduced-motion:reduce){.col{animation:none;opacity:1}}</style>
${out}</svg>
`;
}

fs.mkdirSync(outDir, { recursive: true });
for (const [name, t] of Object.entries(THEMES)) {
  fs.writeFileSync(path.join(outDir, `stack-${name}.svg`), render(t));
}
