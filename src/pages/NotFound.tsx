// src/pages/NotFound.tsx
import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20">
      <Helmet>
        <title>404 – Page not found | Fitterverse</title>
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href="https://fitterverse.in/404" />
      </Helmet>
      <h1 className="text-3xl font-extrabold">Page not found</h1>
      <p className="mt-3 text-slate-400">
        The link might be broken or the page may have moved.
      </p>
      <div className="mt-6">
        <Link
          to="/"
          className="inline-flex items-center rounded-lg border border-slate-700 px-4 py-2 hover:bg-slate-800/60"
        >
          ← Go to Home
        </Link>
      </div>
    </main>
  );
}
