// src/pages/blog/BlogIndex.tsx
import React from "react";
import { Link } from "react-router-dom";
import { listHubs } from "@/content";

export default function BlogIndex() {
  const hubs = listHubs();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold">Fitterverse Blog</h1>
        <p className="mt-3 text-slate-300">
          Deep dives on habits, fitness, nutrition, sleep, and the systems that make change stick.
        </p>
      </header>

      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hubs.map((h) => (
          <Link
            key={h.id}
            to={h.path}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-emerald-700/60 hover:bg-slate-900/80 transition"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">{h.icon ?? "📚"}</div>
              <h2 className="text-xl font-semibold">{h.title}</h2>
            </div>
            <p className="mt-3 text-slate-300 text-sm">{h.blurb}</p>
            <div className="mt-3 text-sm text-emerald-400">Explore →</div>
          </Link>
        ))}
      </section>
    </main>
  );
}
