// src/pages/blog/HubPage.tsx
import React from "react";
import { Link, useParams } from "react-router-dom";
import { getHubById, listPostsByHub, type Hub } from "@/content";

export default function HubPage() {
  const { hubId = "" } = useParams<{ hubId: Hub }>();
  const hub = getHubById(hubId);
  const posts = hub ? listPostsByHub(hub.id) : [];

  if (!hub) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-2xl font-bold">Topic not found</h1>
        <p className="mt-2 text-slate-400">
          Try returning to the{" "}
          <Link to="/blog" className="text-emerald-400 underline">Blog</Link>.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <nav className="text-sm text-slate-400 mb-6">
        <Link to="/blog" className="hover:text-emerald-400">Blog</Link>{" "}
        / <span className="text-slate-200">{hub.title}</span>
      </nav>

      <header className="mb-8">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{hub.icon ?? "📚"}</span>
          <h1 className="text-3xl md:text-4xl font-extrabold">{hub.title}</h1>
        </div>
        <p className="mt-2 text-slate-300 max-w-2xl">{hub.blurb}</p>
      </header>

      {posts.length === 0 ? (
        <div className="text-slate-400">Articles coming soon.</div>
      ) : (
        <section className="grid md:grid-cols-2 gap-6">
          {posts.map((p) => (
            <Link
              key={p.id}
              to={`/blog/${hub.id}/${p.slug}`}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5 hover:border-emerald-700/60 hover:bg-slate-900/80 transition"
            >
              <h3 className="text-lg font-semibold">{p.title}</h3>
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
      )}
    </main>
  );
}
