// src/components/nav/MarketingNavbar.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../state/authStore";

export default function MarketingNavbar() {
  const { openAuthModal, user, logout } = useAuth();
  const isAuthed = !!user;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-md bg-emerald-500 inline-block" />
          <span className="text-lg font-semibold">Fitterverse</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-slate-300">
          <Link to="/about" className="hover:text-white">About</Link>
          <Link to="/blog" className="hover:text-white">Blog</Link>
          <Link to="/pricing" className="hover:text-white">Pricing</Link>
        </nav>

        <div className="flex items-center gap-3">
          {!isAuthed ? (
            <>
              <button
                onClick={openAuthModal}
                className="rounded-lg border border-slate-700 px-4 py-1.5 text-slate-200 hover:bg-slate-800/50"
              >
                Log in
              </button>
              <button
                onClick={openAuthModal}
                className="rounded-lg bg-emerald-500 px-4 py-1.5 font-semibold text-slate-900 hover:bg-emerald-400"
              >
                Get started
              </button>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className="rounded-lg bg-emerald-500 px-4 py-1.5 font-semibold text-slate-900 hover:bg-emerald-400"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="rounded-lg border border-slate-700 px-4 py-1.5 text-slate-200 hover:bg-slate-800/50"
              >
                Log out
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
