// scripts/generate-sitemap.ts
/* eslint-disable no-console */
import fs from "fs";
import path from "path";

const SITE_URL = (process.env.SITE_URL || "https://fitterverse.in").replace(/\/+$/,"");
const PUBLIC_DIR = path.resolve("public");
const DIST_DIR = path.resolve("dist");

// ---- Configure static routes you want in sitemap:
const staticRoutes = [
  "/", "/pricing", "/about", "/blog", "/faq"
];

// ---- OPTIONAL: If you have a content directory, enumerate posts/hubs here.
// For now we’ll accept injections via a JSON file if present.
type ExtraRoute = { loc: string; lastmod?: string; priority?: number; changefreq?: string; };
const extraJsonPath = path.resolve("scripts", "sitemap.extra.json"); // optional
let extra: ExtraRoute[] = [];
if (fs.existsSync(extraJsonPath)) {
  try { extra = JSON.parse(fs.readFileSync(extraJsonPath, "utf-8")); } catch {}
}

type UrlEntry = { loc: string; lastmod?: string; priority?: string; changefreq?: string; };

function iso(dt: number) {
  return new Date(dt).toISOString();
}

function guessLastModForRoute(route: string): string {
  // Prefer public asset that belongs to the page if any; fallback to now
  const indexHtml = path.resolve("index.html");
  try {
    const stat = fs.statSync(indexHtml);
    return iso(stat.mtimeMs);
  } catch {
    return iso(Date.now());
  }
}

function buildUrlset(): UrlEntry[] {
  const urls: UrlEntry[] = [];

  staticRoutes.forEach((r) => {
    urls.push({
      loc: `${SITE_URL}${r}`,
      lastmod: guessLastModForRoute(r),
      changefreq: r === "/" ? "daily" : "weekly",
      priority: r === "/" ? "1.0" : "0.8",
    });
  });

  extra.forEach((e) => {
    urls.push({
      loc: e.loc.startsWith("http") ? e.loc : `${SITE_URL}${e.loc}`,
      lastmod: e.lastmod || iso(Date.now()),
      changefreq: e.changefreq || "weekly",
      priority: e.priority ? String(e.priority) : "0.7",
    });
  });

  return urls;
}

function renderXml(urls: UrlEntry[]) {
  const nodes = urls.map(u => `
  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}
    ${u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : ""}
    ${u.priority ? `<priority>${u.priority}</priority>` : ""}
  </url>`).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${nodes}
</urlset>`;
}

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function main() {
  const urls = buildUrlset();
  const xml = renderXml(urls);

  ensureDir(PUBLIC_DIR);
  fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap.xml"), xml);
  console.log(`[sitemap] Wrote ${path.join(PUBLIC_DIR, "sitemap.xml")}`);

  ensureDir(DIST_DIR);
  fs.writeFileSync(path.join(DIST_DIR, "sitemap.xml"), xml);
  console.log(`[sitemap] Copied to ${path.join(DIST_DIR, "sitemap.xml")}`);
}

main();
