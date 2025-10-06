// src/pages/blog/PostPage.tsx
import React from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getHubById, getPostBySlug, type Hub } from "@/content";

type AnyPost = {
  title: string;
  description?: string;
  date?: string;
  keywords?: string[];
  // any one (or more) of these may exist in your content source:
  html?: string;
  contentHtml?: string;
  body?: string[];      // array of paragraphs/blocks
  content?: string;     // legacy key
};

function PostBody({ post }: { post: AnyPost }) {
  // Prefer explicit HTML fields if present
  if (post.html) {
    return <div dangerouslySetInnerHTML={{ __html: post.html }} />;
  }
  if (post.contentHtml) {
    return <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />;
  }
  // Support legacy "content" (string, possibly HTML)
  if ((post as any).content) {
    const c = (post as any).content as string;
    const looksHtml = /<\/?[a-z][\s\S]*>/i.test(c);
    return looksHtml ? (
      <div dangerouslySetInnerHTML={{ __html: c }} />
    ) : (
      <p className="whitespace-pre-wrap">{c}</p>
    );
  }
  // Simple array of paragraphs
  if (Array.isArray(post.body) && post.body.length) {
    return (
      <div className="space-y-4">
        {post.body.map((p, i) => (
          <p key={i} className="text-slate-200 leading-7">
            {p}
          </p>
        ))}
      </div>
    );
  }
  // Fallback
  return (
    <p className="text-slate-300">
      Coming soon. Meanwhile, explore more posts from this hub.
    </p>
  );
}

export default function PostPage() {
  // IMPORTANT: the route is /blog/:hubId/:slug
  const { hubId = "", slug = "" } = useParams<{ hubId: Hub; slug: string }>();
  const hub = getHubById(hubId);
  const post = hub ? (getPostBySlug(hub.id, slug) as AnyPost | undefined) : undefined;

  if (!hub || !post) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <Helmet>
          <title>Not found | Fitterverse Blog</title>
          <meta name="robots" content="noindex,nofollow" />
          <link rel="canonical" href="https://fitterverse.in/404" />
        </Helmet>
        <h1 className="text-2xl font-bold">Post not found</h1>
        <p className="mt-2 text-slate-400">
          Try returning to the{" "}
          <Link to="/blog" className="text-emerald-400 underline">
            Blog
          </Link>.
        </p>
      </main>
    );
  }

  const canonical = `https://fitterverse.in/blog/${hub.id}/${slug}`;
  const ogImage = "https://fitterverse.in/images/dashboard.jpg";

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Helmet prioritizeSeoTags>
        <title>{post.title} | Fitterverse Blog</title>
        {post.description && (
          <meta name="description" content={post.description} />
        )}
        <link rel="canonical" href={canonical} />

        {/* Open Graph / Twitter */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${post.title} | Fitterverse Blog`} />
        {post.description && (
          <meta property="og:description" content={post.description} />
        )}
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />

        {/* Article JSON-LD */}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "description": post.description ?? "",
          "datePublished": post.date ?? undefined,
          "dateModified": post.date ?? undefined,
          "mainEntityOfPage": canonical,
          "image": [ogImage],
          "author": { "@type": "Organization", "name": "Fitterverse" },
          "publisher": {
            "@type": "Organization",
            "name": "Fitterverse",
            "logo": { "@type": "ImageObject", "url": "https://fitterverse.in/icons/icon-512.png" }
          }
        })}</script>

        {/* Breadcrumbs JSON-LD */}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Blog", "item": "https://fitterverse.in/blog" },
            { "@type": "ListItem", "position": 2, "name": hub.title, "item": `https://fitterverse.in/blog/${hub.id}` },
            { "@type": "ListItem", "position": 3, "name": post.title, "item": canonical }
          ]
        })}</script>
      </Helmet>

      <article className="prose prose-invert max-w-none">
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold">{post.title}</h1>
          {post.date ? (
            <p className="mt-2 text-slate-400 text-sm">{post.date}</p>
          ) : null}
          {post.keywords?.length ? (
            <p className="mt-1 text-slate-400 text-xs">
              {post.keywords.slice(0, 6).join(" · ")}
            </p>
          ) : null}
        </header>

        <PostBody post={post} />
      </article>

      <div className="mt-10">
        <Link
          to={`/blog/${hub.id}`}
          className="inline-flex items-center rounded-lg border border-slate-700 px-4 py-2 hover:bg-slate-800/60 text-sm"
        >
          ← Back to {hub.title}
        </Link>
      </div>
    </main>
  );
}
