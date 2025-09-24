// src/components/nav/MarketingNavbar.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/state/authStore";

export default function MarketingNavbar() {
  const { openAuthModal, isAuthed } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <nav className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-block h-5 w-5 rounded-md bg-emerald-500" />
          <span className="font-semibold text-white">Fitterverse</span>
        </Link>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-8 text-slate-300">
          <Link to="/about" className="hover:text-white">About</Link>
          <Link to="/blog" className="hover:text-white">Blog</Link>
          <Link to="/pricing" className="hover:text-white">Pricing</Link>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {!isAuthed ? (
            <>
              <button
                onClick={openAuthModal}
                className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 hover:bg-slate-800/60"
              >
                Log in
              </button>
              <button
                onClick={openAuthModal}
                className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-900 hover:bg-emerald-400"
              >
                Get started
              </button>
            </>
          ) : (
            <Link
              to="/dashboard"
              className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-900 hover:bg-emerald-400"
            >
              Go to dashboard
            </Link>
          )}
        </div>
      </nav>
      {/* Intentionally NO announcement banner here.
          The announcement lives in Home.tsx only to avoid duplicates. */}
    </header>
  );
}
