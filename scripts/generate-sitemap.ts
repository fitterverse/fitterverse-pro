/* eslint-disable no-console */
import fs from "fs";
import path from "path";

// ---- CONFIG ----------------------------------------------------------------

/**
 * Public, canonical site URL (no trailing slash).
 * Provided by env or defaults to production domain.
 */
const SITE_URL = (process.env.SITE_URL || "https://fitterverse.in").replace(/\/+$/,"");

/**
 * Where your compiled site and static assets live.
 */
const PUBLIC_DIR = path.resolve("public");
const DIST_DIR = path.resolve("dist");

/**
 * Static, always-present routes for marketing pages.
 */
const STATIC_ROUTES = ["/", "/pricing", "/about", "/blog", "/faq"];

/**
 * Auto-discovered posts directory.
 * Each post is a JSON file with at least: { "hub": string, "slug": string }
 * Optional fields: { "date": "YYYY-MM-DD", "lastmod": ISO8601 }
 * Example path: src/content/posts/habits/habit-stacking-beginners.json
 */
const POSTS_DIR = path.resolve("src", "content", "posts");

// ----------------------------------------------------------------------------

type UrlEntry = {
  loc: string;
  lastmod?: string;
  priority?: string;
  changefreq?: string;
};

type PostJson = {
  title?: string;
  description?: string;
  hub: string;
  slug: string;
  date?: string;      // e.g., "2025-10-05"
  lastmod?: string;   // ISO8601 (overrides file mtime if present)
  // other fields are ignored by sitemap
};

// Utilities ------------------------------------------------------------------

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function iso(msOrDate: number | Date): string {
  return (msOrDate instanceof Date ? msOrDate : new Date(msOrDate)).toISOString();
}

function safeReadJson(file: string): PostJson | null {
  try {
    const raw = fs.readFileSync(file, "utf-8");
    const data = JSON.parse(raw);
    return data as PostJson;
  } catch (e) {
    console.warn(`[sitemap] Skipped invalid JSON: ${file}`);
    return null;
  }
}

/**
 * Recursively list files ending with .json inside `dir`.
 */
function listJsonFiles(dir: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;

  const stack: string[] = [dir];
  while (stack.length) {
    const cur = stack.pop()!;
    const entries = fs.readdirSync(cur, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(cur, ent.name);
      if (ent.isDirectory()) {
        stack.push(full);
      } else if (ent.isFile() && full.toLowerCase().endsWith(".json")) {
        out.push(full);
      }
    }
  }
  return out;
}

// Discovery ------------------------------------------------------------------

/**
 * Discover all post URLs from POSTS_DIR, and generate:
 *   - post URLs:   /blog/:hub/:slug
 *   - hub URLs:    /blog/:hub      (unique hubs observed)
 */
function discoverBlogUrls(): { postUrls: UrlEntry[]; hubUrls: UrlEntry[] } {
  const jsonFiles = listJsonFiles(POSTS_DIR);
  const hubs = new Set<string>();
  const postUrls: UrlEntry[] = [];

  for (const file of jsonFiles) {
    const data = safeReadJson(file);
    if (!data) continue;
    if (!data.hub || !data.slug) {
      console.warn(`[sitemap] Missing hub/slug in: ${file}`);
      continue;
    }
    const hub = String(data.hub).trim().replace(/^\/+|\/+$/g, "");
    const slug = String(data.slug).trim().replace(/^\/+|\/+$/g, "");

    // Collect hub for later
    hubs.add(hub);

    const loc = `${SITE_URL}/blog/${hub}/${slug}`;

    // lastmod precedence: explicit lastmod > content date > file mtime
    let lastmod: string | undefined;
    if (data.lastmod) {
      lastmod = data.lastmod;
    } else if (data.date) {
      try {
        lastmod = new Date(data.date).toISOString();
      } catch {
        lastmod = undefined;
      }
    }
    if (!lastmod) {
      try {
        const stat = fs.statSync(file);
        lastmod = iso(stat.mtimeMs);
      } catch {
        lastmod = iso(Date.now());
      }
    }

    postUrls.push({
      loc,
      lastmod,
      changefreq: "weekly",
      priority: "0.7",
    });
  }

  // Hub urls
  const hubUrls: UrlEntry[] = Array.from(hubs).map((hub) => {
    const loc = `${SITE_URL}/blog/${hub}`;
    // Approximate lastmod for hub: use repo index.html mtime or now
    let lastmod: string | undefined;
    try {
      const stat = fs.statSync(path.resolve("index.html"));
      lastmod = iso(stat.mtimeMs);
    } catch {
      lastmod = iso(Date.now());
    }
    return {
      loc,
      lastmod,
      changefreq: "weekly",
      priority: "0.8",
    };
  });

  return { postUrls, hubUrls };
}

function buildStaticUrls(): UrlEntry[] {
  return STATIC_ROUTES.map((r) => {
    // lastmod: fallback to index.html mtime; daily/weekly changefreq heuristics
    let lastmod: string | undefined;
    try {
      const stat = fs.statSync(path.resolve("index.html"));
      lastmod = iso(stat.mtimeMs);
    } catch {
      lastmod = iso(Date.now());
    }
    return {
      loc: `${SITE_URL}${r}`,
      lastmod,
      changefreq: r === "/" ? "daily" : "weekly",
      priority: r === "/" ? "1.0" : "0.8",
    };
  });
}

function renderXml(urls: UrlEntry[]) {
  const nodes = urls
    .map(
      (u) => `
  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}
    ${u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : ""}
    ${u.priority ? `<priority>${u.priority}</priority>` : ""}
  </url>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${nodes}
</urlset>`;
}

// Main -----------------------------------------------------------------------

function main() {
  const staticUrls = buildStaticUrls();
  const { postUrls, hubUrls } = discoverBlogUrls();

  // De-duplicate by loc
  const seen = new Set<string>();
  const urls: UrlEntry[] = [];
  for (const u of [...staticUrls, ...hubUrls, ...postUrls]) {
    if (seen.has(u.loc)) continue;
    seen.add(u.loc);
    urls.push(u);
  }

  const xml = renderXml(urls);

  ensureDir(PUBLIC_DIR);
  fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap.xml"), xml);
  console.log(`[sitemap] Wrote ${path.join(PUBLIC_DIR, "sitemap.xml")}`);

  ensureDir(DIST_DIR);
  fs.writeFileSync(path.join(DIST_DIR, "sitemap.xml"), xml);
  console.log(`[sitemap] Copied to ${path.join(DIST_DIR, "sitemap.xml")}`);

  console.log(`[sitemap] Total URLs: ${urls.length}`);
}

main();
