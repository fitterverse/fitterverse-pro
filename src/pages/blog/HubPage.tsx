// src/pages/blog/HubPage.tsx
import React from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getHubById, listPostsByHub, type Hub } from "@/content";

export default function HubPage() {
  const { hubId = "" } = useParams<{ hubId: Hub }>();
  const hub = getHubById(hubId);
  const posts = hub ? listPostsByHub(hub.id) : [];

  if (!hub) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16">
        <Helmet>
          <title>Blog hub not found | Fitterverse</title>
          <meta name="robots" content="noindex,nofollow" />
          <link rel="canonical" href="https://fitterverse.in/404" />
        </Helmet>
        <h1 className="text-2xl font-bold">Not found</h1>
        <p className="mt-2 text-slate-400">
          Go back to the{" "}
          <Link to="/blog" className="text-emerald-400 underline">
            Blog
          </Link>.
        </p>
      </main>
    );
  }

  const canonical = `https://fitterverse.in${hub.path}`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <Helmet prioritizeSeoTags>
        <title>{hub.title} | Fitterverse Blog</title>
        <meta
          name="description"
          content={hub.blurb ?? `${hub.title} articles on Fitterverse.`}
        />
        <link rel="canonical" href={canonical} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Blog", "item": "https://fitterverse.in/blog" },
            { "@type": "ListItem", "position": 2, "name": hub.title, "item": canonical }
          ]
        })}</script>
      </Helmet>

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold">{hub.title}</h1>
        {hub.blurb ? <p className="mt-3 text-slate-300">{hub.blurb}</p> : null}
      </header>

      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((p) => (
          <Link
            key={p.slug}
            to={`/blog/${hub.id}/${p.slug}`}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 hover:border-emerald-700/60 hover:bg-slate-900/80 transition block"
          >
            <h2 className="text-xl font-semibold">{p.title}</h2>
            {p.excerpt || p.description ? (
              <p className="mt-2 text-slate-300 text-sm">
                {p.excerpt ?? p.description}
              </p>
            ) : null}
            <div className="mt-3 text-xs text-slate-400">
              {p.date ? <span>{p.date}</span> : null}
              {p.keywords?.length ? (
                <>
                  <span className="mx-2">•</span>
                  <span>{p.keywords.slice(0, 3).join(" · ")}</span>
                </>
              ) : null}
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
