// src/lib/content.ts
/* Robust content loader for hubs + posts (JSON) */
type JsonModule<T> = { default: T };

export type Author = {
  id: string;
  name: string;
  bio?: string;
  sameAs?: string[];
  image?: string;
};

export type Hub = {
  id: string;
  title: string;
  blurb?: string;
  cover?: { url: string; width?: number; height?: number; alt?: string };
};

export type FAQItem = { q: string; a: string };

export type Post = {
  title: string;
  slug: string;
  hub: string;
  description?: string;
  date?: string;
  updated?: string;
  keywords?: string[];
  readingMinutes?: number;
  authorId?: string;
  hero?: { url: string; width?: number; height?: number; alt?: string };
  html?: string;
  contentHtml?: string;
  body?: string;
  faq?: FAQItem[];
  links?: string[];
};

export type PostWithHub = Post & { hubInfo?: Hub; author?: Author };

// --------- helper: safe get default export ----------
function toDefault<T>(m: any): T {
  if (m && typeof m === "object" && "default" in m) return m.default as T;
  return m as T;
}

// --------- authors (optional) ----------
let authors: Record<string, Author> = {};
try {
  // try both alias + relative
  const authorMods =
    (import.meta.glob<JsonModule<Author[]>>("/src/content/authors.json", { eager: true }) as any) ||
    (import.meta.glob<JsonModule<Author[]>>("@/content/authors.json", { eager: true }) as any);

  const arr: Author[] | undefined = Object.values(authorMods).length
    ? toDefault<Author[]>(Object.values(authorMods)[0] as any)
    : undefined;

  authors = (arr || []).reduce((acc, a) => {
    acc[a.id] = a;
    return acc;
  }, {} as Record<string, Author>);
} catch {
  // optional
  authors = {};
}

// --------- Hubs ----------
export async function getHubs(): Promise<Hub[]> {
  const modsA = import.meta.glob<JsonModule<Hub>>("/src/content/hubs/*.json", { eager: true });
  const modsB = import.meta.glob<JsonModule<Hub>>("@/content/hubs/*.json", { eager: true });
  const mods = { ...modsA, ...modsB };

  const hubs = Object.values(mods).map((m) => toDefault<Hub>(m as any));
  hubs.sort((a, b) => a.title.localeCompare(b.title));

  if (import.meta.env.DEV) {
    // dev log: what hubs were found
    // eslint-disable-next-line no-console
    console.log("[content] hubs:", hubs.map((h) => h.id));
  }
  return hubs;
}

// --------- Posts ----------
export async function getAllPosts(): Promise<PostWithHub[]> {
  // try both alias and absolute src paths
  const postModsA = import.meta.glob<JsonModule<Post>>("/src/content/posts/**/*.json", { eager: true });
  const postModsB = import.meta.glob<JsonModule<Post>>("@/content/posts/**/*.json", { eager: true });
  const postMods = { ...postModsA, ...postModsB };

  const hubs = await getHubs();
  const hubMap = hubs.reduce((acc, h) => ((acc[h.id] = h), acc), {} as Record<string, Hub>);

  const posts: PostWithHub[] = Object.entries(postMods).map(([key, m]) => {
    const p = toDefault<Post>(m as any);
    const html = p.html || p.contentHtml || p.body || "";
    const author = p.authorId ? authors[p.authorId] : undefined;

    if (import.meta.env.DEV) {
      // dev log each found file + hub/slug
      // eslint-disable-next-line no-console
      console.log("[content] post file:", key, "=>", p.hub, "/", p.slug);
    }

    return { ...p, html, hubInfo: hubMap[p.hub], author };
  });

  posts.sort((a, b) => {
    const ad = new Date(a.updated || a.date || 0).getTime();
    const bd = new Date(b.updated || b.date || 0).getTime();
    return bd - ad;
  });

  return posts;
}

export async function getPostsByHub(hubId: string): Promise<PostWithHub[]> {
  const all = await getAllPosts();
  return all.filter((p) => p.hub === hubId);
}

export async function getPost(hubId: string, slug: string): Promise<PostWithHub | undefined> {
  const all = await getAllPosts();
  return all.find((p) => p.hub === hubId && p.slug === slug);
}
