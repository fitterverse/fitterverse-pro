// src/pages/Blog.tsx
import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Card from "@/components/ui/Card";
import { getHubs } from "@/lib/content";

export default function Blog() {
  const [hubs, setHubs] = React.useState<any[]>([]);

  React.useEffect(() => {
    getHubs().then(setHubs);
  }, []);

  const CANON = "https://fitterverse.in/blog";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <Helmet>
        <title>Fitterverse Blog</title>
        <meta
          name="description"
          content="Deep dives on habits, fitness, nutrition, sleep, and the systems that make change stick."
        />
        <link rel="canonical" href={CANON} />
      </Helmet>

      <h1 className="text-3xl md:text-4xl font-extrabold">Fitterverse Blog</h1>
      <p className="mt-2 text-slate-300">
        Deep dives on habits, fitness, nutrition, sleep, and the systems that make change stick.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {hubs.map((h) => (
          <Link key={h.id} to={`/blog/${h.id}`}>
            <Card className="bg-slate-900/60 border-slate-800 overflow-hidden hover:border-emerald-700/60 hover:bg-slate-900/80 transition">
              {h.cover?.url && (
                <img
                  src={h.cover.url}
                  alt={h.cover.alt || h.title}
                  width={h.cover.width || 1200}
                  height={h.cover.height || 800}
                  className="w-full h-44 object-cover"
                  loading="lazy"
                  decoding="async"
                />
              )}
              <div className="p-5">
                <h2 className="text-xl font-semibold">{h.title}</h2>
                {h.blurb && <p className="mt-2 text-slate-300 text-sm">{h.blurb}</p>}
                <div className="mt-3 text-sm text-emerald-400">Explore →</div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
