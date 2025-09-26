import React from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { getHubById, getPost } from "@/content";

export default function PostPage() {
  const { hub, slug } = useParams<{ hub: string; slug: string }>();
  const hubData = hub ? getHubById(hub) : null;
  const post = hub && slug ? getPost(hub as any, slug) : null;

  if (!hubData) return <Navigate to="/blog" replace />;
  if (!post) return <Navigate to={`/blog/${hubData.id}`} replace />;

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100">
      <article className="mx-auto max-w-3xl px-4 pt-10 pb-24">
        <h1 className="text-3xl md:text-4xl font-extrabold">{post.title}</h1>
        <div className="mt-3 text-sm text-slate-400">
          {post.author.name} • {new Date(post.date).toLocaleDateString()} • {post.readMins} min read
        </div>
        {post.cover && <img src={post.cover} alt="" className="mt-6 rounded-2xl border border-slate-800" />}
        <div
          className="prose prose-invert prose-emerald mt-6"
          dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
        />
        <div className="mt-10">
          <Link to={`/blog/${hubData.id}`} className="text-sm text-slate-400 hover:text-white">
            ← Back to {hubData.label}
          </Link>
        </div>
      </article>
    </div>
  );
}
