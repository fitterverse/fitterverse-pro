// src/pages/blog/HubPage.tsx
import React from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import Card from "@/components/ui/Card";
import { getHubs, getPostsByHub } from "@/lib/content";

export default function HubPage() {
  const { hubId = "" } = useParams();
  const [hub, setHub] = React.useState<any | null>(null);
  const [posts, setPosts] = React.useState<any[]>([]);

  React.useEffect(() => {
    (async () => {
      const hubs = await getHubs();
      setHub(hubs.find((h) => h.id === hubId) || null);
      setPosts(await getPostsByHub(hubId));
    })();
  }, [hubId]);

  if (!hub) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16">
        <Helmet>
          <title>Blog hub not found | Fitterverse</title>
        </Helmet>
        <h1 className="text-2xl font-bold">Topic not found</h1>
        <p className="mt-2 text-slate-400">
          Try returning to the <Link className="underline" to="/blog">Blog</Link>.
        </p>
      </main>
    );
  }

  const CANON = `https://fitterverse.in/blog/${hub.id}`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <Helmet>
        <title>{hub.title} – Fitterverse Blog</title>
        <meta name="description" content={hub.blurb || `${hub.title} guides and resources`} />
        <link rel="canonical" href={CANON} />
      </Helmet>

      <h1 className="text-3xl md:text-4xl font-extrabold">{hub.title}</h1>
      {hub.blurb && <p className="mt-2 text-slate-300">{hub.blurb}</p>}

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        {posts.map((p) => (
          <Link key={p.slug} to={`/blog/${p.hub}/${p.slug}`}>
            <Card className="bg-slate-900/60 border-slate-800 overflow-hidden hover:border-emerald-700/60 hover:bg-slate-900/80 transition">
              {p.hero?.url && (
                <img
                  src={p.hero.url}
                  alt={p.hero.alt || p.title}
                  width={p.hero.width || 1200}
                  height={p.hero.height || 800}
                  className="w-full h-44 object-cover"
                  loading="lazy"
                  decoding="async"
                />
              )}
              <div className="p-5">
                <h2 className="text-lg font-semibold">{p.title}</h2>
                {p.description && <p className="mt-2 text-slate-300 text-sm">{p.description}</p>}
                <div className="mt-3 text-xs text-slate-400">
                  {p.date && <>Published {new Date(p.date).toLocaleDateString()}</>}
                  {p.updated && <>, updated {new Date(p.updated).toLocaleDateString()}</>}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </section>

      <div className="mt-10 text-sm text-slate-400">
        <Link to="/blog" className="underline">← All topics</Link>
      </div>
    </main>
  );
}
