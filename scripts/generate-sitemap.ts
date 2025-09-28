/* scripts/generate-sitemap.ts
 * Generates /dist/sitemap.xml (and /public/sitemap.xml during dev) from:
 *  - Static marketing pages
 *  - Blog hubs and posts from src/content
 *
 * Usage:
 *   npm run sitemap
 *   (Also runs automatically before every build via "prebuild")
 */

import { mkdirSync, writeFileSync, existsSync, copyFileSync } from "fs";
import { resolve } from "path";

// ---- Config ----
const SITE_URL =
  process.env.SITE_URL?.replace(/\/+$/, "") || "https://fitterverse.in";

// Static pages you want indexed
const STATIC_ROUTES: Array<{ loc: string; changefreq?: string; priority?: number }> = [
  { loc: "/", changefreq: "weekly", priority: 0.9 },
  { loc: "/pricing", changefreq: "monthly", priority: 0.7 },
  { loc: "/about", changefreq: "yearly", priority: 0.5 },
  { loc: "/blog", changefreq: "weekly", priority: 0.8 },
];

// Safe import of content module
let hubs: any[] = [];
let listPostsByHub: (hubId: string) => any[] = () => [];
try {
  // IMPORTANT: this path matches your project (src/content/index.ts)
  // Vite/tsx can import TypeScript from src with path mapping “@” (tsconfig).
  const content = await import("../src/content/index.ts");
  hubs = Array.isArray(content.hubs) ? content.hubs : [];
  listPostsByHub =
    typeof content.listPostsByHub === "function" ? content.listPostsByHub : () => [];
} catch (e) {
  console.warn(
    "[sitemap] Could not import content. Hubs/posts will be omitted. Error:",
    (e as Error).message
  );
}

// Build URL entries
type UrlEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
};

const urls: UrlEntry[] = [];

// 1) Static pages
for (const r of STATIC_ROUTES) {
  urls.push({
    loc: SITE_URL + r.loc,
    changefreq: r.changefreq,
    priority: r.priority,
  });
}

// 2) Blog hubs
for (const hub of hubs) {
  const id = hub?.id || hub; // supports either object or string fallback
  const hubPath = `/blog/${id}`;
  urls.push({
    loc: SITE_URL + hubPath,
    changefreq: "weekly",
    priority: 0.7,
  });

  // 3) Posts within the hub
  const posts = listPostsByHub(id) || [];
  for (const p of posts) {
    const slug: string = p?.slug;
    if (!slug) continue;
    const lastmod =
      p?.date && !Number.isNaN(Date.parse(p.date))
        ? new Date(p.date).toISOString()
        : undefined;

    urls.push({
      loc: SITE_URL + `${hubPath}/${slug}`,
      lastmod,
      changefreq: "monthly",
      priority: 0.6,
    });
  }
}

// XML builder
function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls
    .map((u) => {
      const loc = `<loc>${escapeXml(u.loc)}</loc>`;
      const lastmod = u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : "";
      const changefreq = u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : "";
      const priority =
        typeof u.priority === "number" ? `<priority>${u.priority.toFixed(1)}</priority>` : "";
      return `  <url>${loc}${lastmod}${changefreq}${priority}</url>`;
    })
    .join("\n") +
  `\n</urlset>\n`;

// Ensure output exists and write
const distDir = resolve(process.cwd(), "dist");
if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true });
const distSitemap = resolve(distDir, "sitemap.xml");
writeFileSync(distSitemap, xml, "utf8");
console.log(`[sitemap] Wrote ${distSitemap}`);

// Also place a copy in public for local preview if desired (optional)
const publicDir = resolve(process.cwd(), "public");
if (existsSync(publicDir)) {
  const publicMap = resolve(publicDir, "sitemap.xml");
  copyFileSync(distSitemap, publicMap);
  console.log(`[sitemap] Copied to ${publicMap}`);
}

// Also ensure robots.txt references the sitemap (optional helper)
// If you already manage robots.txt, you can skip this block.
const robotsPath = resolve(publicDir, "robots.txt");
try {
  let robots = "";
  if (existsSync(robotsPath)) {
    robots = (await import("fs/promises")).readFile(robotsPath, "utf8") as unknown as string;
  }
  const sitemapLine = `Sitemap: ${SITE_URL}/sitemap.xml`;
  if (!robots.includes("User-agent")) robots = `User-agent: *\nAllow: /\n\n${robots}`;
  if (!robots.includes(sitemapLine)) robots += (robots.endsWith("\n") ? "" : "\n") + sitemapLine + "\n";
  writeFileSync(robotsPath, robots, "utf8");
  console.log(`[sitemap] Ensured robots.txt contains sitemap line`);
} catch {
  /* non-fatal */
}
