// src/pages/blog/PostPage.tsx
import React from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
// ⛔️ Removed MarketingNavbar import to avoid double nav
import { getPost, getAllPosts } from "@/lib/content";
import ArticleComments from "@/pages/blog/ArticleComments";
import "@/styles/article.css";

/* utils */
function stripHtml(html: string) {
  if (typeof document === "undefined") return html;
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}
function toId(text: string) {
  return (text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}

type PostLite = {
  hub: string;
  slug: string;
  title: string;
  description?: string;
  hero?: { url?: string; alt?: string; width?: number; height?: number };
  date?: string;
  updated?: string;
  readingMinutes?: number;
};

export default function PostPage() {
  const { hubId = "", slug = "" } = useParams();
  const [post, setPost] = React.useState<any | null>(null);
  const [related, setRelated] = React.useState<PostLite[]>([]);
  const [toc, setToc] = React.useState<{ id: string; text: string; level: number }[]>([]);
  const [activeId, setActiveId] = React.useState<string>("");
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    (async () => {
      const p = await getPost(hubId, slug);
      setPost(p || null);

      const all = await getAllPosts();
      const others = all.filter((x: any) => !(x.hub === hubId && x.slug === slug));
      const sameHub = others.filter((x: any) => x.hub === hubId).slice(0, 4);
      const fill = sameHub.length < 4 ? others.slice(0, 4 - sameHub.length) : [];
      const picks = [...sameHub, ...fill].slice(0, 4).map((x: any) => ({
        hub: x.hub,
        slug: x.slug,
        title: x.title,
        description: x.description,
        hero: x.hero,
        date: x.date,
        updated: x.updated,
        readingMinutes: x.readingMinutes,
      }));
      setRelated(picks);
    })();
  }, [hubId, slug]);

  React.useEffect(() => {
    if (!post) return;
    const el = contentRef.current;
    if (!el) return;
    const hs = Array.from(el.querySelectorAll("h2, h3, h4")) as HTMLHeadingElement[];
    hs.forEach((h) => {
      if (!h.id) h.id = toId(h.textContent || "");
    });
    setToc(
      hs.map((h) => ({
        id: h.id,
        text: h.textContent || "",
        level: h.tagName === "H2" ? 2 : h.tagName === "H3" ? 3 : 4,
      }))
    );

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.target as HTMLElement).offsetTop - (b.target as HTMLElement).offsetTop);
        if (visible[0]) setActiveId((visible[0].target as HTMLElement).id);
      },
      { rootMargin: "0px 0px -70% 0px", threshold: [0, 1] }
    );
    hs.forEach((h) => obs.observe(h));
    return () => obs.disconnect();
  }, [post]);

  // Make external links open in new tab
  React.useEffect(() => {
    const root = contentRef.current;
    if (!root) return;
    const anchors = root.querySelectorAll<HTMLAnchorElement>("a[href^='http']");
    anchors.forEach((a) => {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    });
  }, [post]);

  if (!post) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16">
        <h1 className="text-2xl font-bold">Post not found</h1>
        <p className="mt-2">
          Try returning to the <Link to="/blog" className="underline text-sky-600">Blog</Link>.
        </p>
      </main>
    );
  }

  const CANON = `https://fitterverse.in/blog/${hubId}/${slug}`;
  const bodyHtml = post.html || "";
  const wordCount = stripHtml(bodyHtml).split(/\s+/).filter(Boolean).length;

  const faqSchema =
    Array.isArray(post.faq) && post.faq.length
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: post.faq.map((f: any) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description || "",
    image: post.hero?.url ? [post.hero.url] : [],
    datePublished: post.date ? new Date(post.date).toISOString() : undefined,
    dateModified: post.updated ? new Date(post.updated).toISOString() : undefined,
    wordCount,
    mainEntityOfPage: CANON,
  };

  return (
    <div className="min-h-screen article-shell">
      <Helmet prioritizeSeoTags>
        <title>{post.title} – Fitterverse</title>
        {post.description && <meta name="description" content={post.description} />}
        <link rel="canonical" href={CANON} />
        <meta property="og:title" content={post.title} />
        {post.description && <meta property="og:description" content={post.description} />}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={CANON} />
        {post.hero?.url && <meta property="og:image" content={post.hero.url} />}
        {post.date && (
          <meta property="article:published_time" content={new Date(post.date).toISOString()} />
        )}
        {post.updated && (
          <meta property="article:modified_time" content={new Date(post.updated).toISOString()} />
        )}
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        {faqSchema && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}
      </Helmet>

      {/* wider container to reduce side gutters on desktop */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
        {/* breadcrumbs */}
        <nav className="mb-4 text-sm article-meta">
          <Link to="/blog" className="underline text-sky-600">Blog</Link>
          {" / "}
          <Link to={`/blog/${post.hub}`} className="underline text-sky-600">
            {post.hubInfo?.title || post.hub}
          </Link>
        </nav>

        {/* Article card */}
        <article className="article-card">
          {/* Title + meta */}
          <header>
            <h1 className="font-extrabold" style={{ marginTop: 0 }}>{post.title}</h1>
            <div className="mt-2 article-meta">
              {post.date && <>Published {new Date(post.date).toLocaleDateString()}</>}
              {post.updated && <> , updated {new Date(post.updated).toLocaleDateString()}</>}
              {post.readingMinutes && <> • {post.readingMinutes} min read</>}
              {wordCount ? <> • {wordCount.toLocaleString()} words</> : null}
            </div>

            {post.hero?.url && (
              <figure style={{ marginTop: 16 }}>
                <img
                  src={post.hero.url}
                  alt={post.hero.alt || post.title}
                  width={post.hero.width || 1200}
                  height={post.hero.height || 800}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
                {post.hero.alt && <figcaption>{post.hero.alt}</figcaption>}
              </figure>
            )}
          </header>

          {/* On this page — at the top (non-sticky) */}
          {toc.length > 0 && (
            <div className="toc" style={{ marginTop: 16 }}>
              <div className="toc-title">On this page</div>
              <ul className="toc-list">
                {toc.map((t) => (
                  <li key={t.id} style={{ marginLeft: t.level === 3 ? 12 : t.level === 4 ? 24 : 0 }}>
                    <a className={activeId === t.id ? "toc-active" : ""} href={`#${t.id}`}>
                      {t.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Body */}
          <div
            ref={contentRef}
            className="article-content mt-6"
            dangerouslySetInnerHTML={{ __html: post.html || "" }}
          />

          {/* References */}
          {Array.isArray(post.sources) && post.sources.length > 0 && (
            <section className="refs" style={{ marginTop: 28 }}>
              <h2>References</h2>
              <ul className="refs-list">
                {post.sources.map((s: any, i: number) => (
                  <li key={i}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.name}
                    </a>
                    {s.note ? <span className="refs-note"> — {s.note}</span> : null}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Comments */}
          <ArticleComments hubId={hubId} slug={slug} />

          {/* Related */}
          {related.length > 0 && (
            <section className="related">
              <h3 className="font-semibold">Recommended next reads</h3>
              <div className="related-grid">
                {related.map((r) => (
                  <div key={`${r.hub}/${r.slug}`} className="related-card">
                    <Link to={`/blog/${r.hub}/${r.slug}`}>
                      <div className="font-medium">{r.title}</div>
                      {r.description && <div className="desc">{r.description}</div>}
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>
    </div>
  );
}
