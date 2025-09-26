import React from "react";
import { Link } from "react-router-dom";
import { HUBS, POSTS, getPostsByHub } from "@/content";

export default function BlogIndex() {
  const featured = POSTS.filter((p) => p.featured).slice(0, 6);

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100">
      <header className="mx-auto max-w-6xl px-4 pt-10 pb-6">
        <h1 className="text-3xl md:text-5xl font-extrabold">Fitterverse Blog</h1>
        <p className="mt-3 text-slate-300 md:text-lg">
          Research-backed guides on habits, fitness, nutrition, sleep, mindset, and more.
        </p>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <h2 className="text-xl font-semibold mb-4">Explore hubs</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {HUBS.map((h) => (
            <Link
              key={h.id}
              to={`/blog/${h.id}`}
              className="rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-900/70 transition p-4"
            >
              <div className="text-sm uppercase tracking-wide text-emerald-400">{h.label}</div>
              <div className="text-slate-300 mt-1">{h.description}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <h2 className="text-xl font-semibold mb-4">Featured</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((p) => (
            <Link
              key={`${p.hub}/${p.slug}`}
              to={`/blog/${p.hub}/${p.slug}`}
              className="group rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 hover:bg-slate-900/70 transition"
            >
              {p.cover && <img src={p.cover} alt="" className="h-40 w-full object-cover" />}
              <div className="p-4">
                <div className="text-xs uppercase tracking-wide text-emerald-400">{p.hub}</div>
                <h3 className="mt-1 font-semibold group-hover:underline">{p.title}</h3>
                <p className="mt-2 text-slate-300 text-sm">{p.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
