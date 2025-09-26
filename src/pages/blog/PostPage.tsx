// src/pages/blog/PostPage.tsx
import React from "react";
import { useParams, Link } from "react-router-dom";
import { getHubById, getPostBySlug, type Hub } from "@/content";

export default function PostPage() {
  const { hubId = "", postSlug = "" } = useParams<{ hubId: Hub; postSlug: string }>();
  const hub = getHubById(hubId);
  const post = hub ? getPostBySlug(hub.id, postSlug) : undefined;

  if (!hub || !post) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-2xl font-bold">Post not found</h1>
        <p className="mt-2 text-slate-400">
          Try returning to the{" "}
          <Link to="/blog" className="text-emerald-400 underline">Blog</Link>.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <nav className="text-sm text-slate-400 mb-6">
        <Link to="/blog" className="hover:text-emerald-400">Blog</Link> /{" "}
        <Link to={`/blog/${hub.id}`} className="hover:text-emerald-400">{hub.title}</Link>
      </nav>

      <article className="prose prose-invert max-w-none">
        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">{post.title}</h1>

        {post.description && <p className="mt-3 text-slate-300">{post.description}</p>}

        <div className="mt-6 text-xs text-slate-400">
          {post.date ? <span>Published {post.date}</span> : null}
          {post.keywords?.length ? (
            <>
              <span className="mx-2">•</span>
              <span>{post.keywords.slice(0, 5).join(" · ")}</span>
            </>
          ) : null}
        </div>

        <div className="mt-8 space-y-5 text-slate-200 leading-7">
          {Array.isArray(post.body)
            ? post.body.map((p, i) => <p key={i}>{p}</p>)
            : typeof post.body === "string"
            ? <p>{post.body}</p>
            : null}
        </div>
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
