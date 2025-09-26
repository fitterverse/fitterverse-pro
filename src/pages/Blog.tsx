// src/pages/Blog.tsx
import React from "react";
import { Link } from "react-router-dom";
import SEOHead from "../components/SEOHead";
import { HUBS } from "../content";

export default function Blog() {
  const pageTitle = "Fitterverse Blog — Habit, Fitness, Nutrition & Sleep Guides";
  const pageDesc =
    "Evidence-based guides on building habits that last — fitness routines, nutrition, sleep, mindset, productivity and more. Start with a hub, then go deep.";

  return (
    <>
      <SEOHead
        title={pageTitle}
        description={pageDesc}
        canonical="https://fitterverse.in/blog"
        image="/images/dashboard.jpg"
        type="website"
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <div className="max-w-3xl">
            <p className="text-emerald-400 font-semibold tracking-wide uppercase text-xs">
              Blog
            </p>
            <h1 className="mt-2 text-4xl md:text-5xl font-extrabold leading-tight">
              Research-backed guides on{" "}
              <span className="text-emerald-400">habits that stick</span>
            </h1>
            <p className="mt-4 text-slate-300 text-lg">
              Browse by topic hub. Each hub collects long-tail, practical articles so you
              can act today and see progress this week — not someday.
            </p>
          </div>
        </div>
      </section>

      {/* Hubs grid */}
      <section className="border-b border-slate-800 bg-slate-900/40">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {HUBS.map((hub) => (
              <Link
                key={hub.slug}
                to={`/blog/${hub.slug}`}
                className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-emerald-600/60 hover:shadow-emerald-600/10 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-bold group-hover:text-emerald-400">
                    {hub.title}
                  </h2>
                  <svg
                    className="h-5 w-5 text-slate-500 group-hover:text-emerald-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path d="M7 17L17 7M17 7H8M17 7v9" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="mt-2 text-slate-300">{hub.blurb}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {hub.keywords.slice(0, 3).map((k) => (
                    <span
                      key={k}
                      className="text-xs rounded-full border border-slate-700 bg-slate-950 px-2 py-1 text-slate-400"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 text-center text-slate-400 text-sm">
            Don’t see your topic?{" "}
            <Link to="/contact" className="text-emerald-400 hover:underline">
              Tell us what to write next →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
