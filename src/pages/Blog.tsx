// src/pages/Blog.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { listHubs } from "@/content";

export default function Blog() {
  const hubs = listHubs();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Helmet prioritizeSeoTags>
        <title>Fitterverse Blog</title>
        <meta
          name="description"
          content="Deep dives on habits, fitness, nutrition, sleep, and the systems that make change stick."
        />
        <link rel="canonical" href="https://fitterverse.in/blog" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "Fitterverse Blog",
          "url": "https://fitterverse.in/blog"
        })}</script>
      </Helmet>

      <header className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold">Fitterverse Blog</h1>
        <p className="mt-3 text-slate-300">
          Deep dives on habits, fitness, nutrition, sleep, and the systems that
          make change stick.
        </p>
      </header>

      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hubs.map((hub) => (
          <Link
            key={hub.id}
            to={hub.path}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 hover:border-emerald-700/60 hover:bg-slate-900/80 transition"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">{hub.icon ?? "📘"}</div>
              <h2 className="text-xl font-semibold">{hub.title}</h2>
            </div>
            <p className="mt-2 text-slate-300">{hub.blurb}</p>
            <div className="mt-3 text-sm text-emerald-400">Explore →</div>
          </Link>
        ))}
      </section>
    </main>
  );
}
