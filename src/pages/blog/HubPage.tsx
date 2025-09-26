import React from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { getHubById, getPostsByHub } from "@/content";

export default function HubPage() {
  const { hub } = useParams<{ hub: string }>();
  const hubData = hub ? getHubById(hub) : null;
  if (!hub || !hubData) return <Navigate to="/blog" replace />;

  const posts = getPostsByHub(hubData.id as any);

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100">
      <header className="mx-auto max-w-6xl px-4 pt-10 pb-6">
        <h1 className="text-3xl md:text-5xl font-extrabold">{hubData.label}</h1>
        <p className="mt-3 text-slate-300 md:text-lg">{hubData.description}</p>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20">
        {posts.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">New articles coming soon.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p) => (
              <Link
                key={p.slug}
                to={`/blog/${p.hub}/${p.slug}`}
                className="group rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 hover:bg-slate-900/70 transition"
              >
                {p.cover && <img src={p.cover} alt="" className="h-40 w-full object-cover" />}
                <div className="p-4">
                  <h3 className="font-semibold group-hover:underline">{p.title}</h3>
                  <p className="mt-2 text-slate-300 text-sm">{p.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
