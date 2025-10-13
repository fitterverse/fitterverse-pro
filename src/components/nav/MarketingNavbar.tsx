// src/components/MarketingNavbar.tsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import { useAuth } from "@/state/authStore";

export default function MarketingNavbar() {
  const { user, logout, openAuthModal } = useAuth(); // ← include openAuthModal
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);     // logged-in dropdown
  const [mobileOpen, setMobileOpen] = useState(false); // logged-out hamburger

  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = (p: string) => pathname === p;

  // Bridge for any legacy callers using window._openAuth
  useEffect(() => {
    (window as any)._openAuth = openAuthModal;
    return () => {
      if ((window as any)._openAuth === openAuthModal) {
        try { delete (window as any)._openAuth; } catch {}
      }
    };
  }, [openAuthModal]);

  // Close logged-in dropdown on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    if (menuOpen) window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [menuOpen]);

  // Close mobile panel on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setMobileOpen(false); setMenuOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <nav className="sticky top-0 z-40 bg-slate-950/70 backdrop-blur border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-white text-lg">Fitterverse</Link>

        {/* LOGGED-OUT (desktop) */}
        {!user && (
          <div className="hidden sm:flex items-center gap-4">
            <Link to="/blog" className={`text-sm ${isActive("/blog") ? "text-teal-400" : "text-slate-300 hover:text-white"}`}>Blog</Link>
            <Link to="/pricing" className={`text-sm ${isActive("/pricing") ? "text-teal-400" : "text-slate-300 hover:text-white"}`}>Pricing</Link>
            <Link to="/about" className={`text-sm ${isActive("/about") ? "text-teal-400" : "text-slate-300 hover:text-white"}`}>About</Link>
            <Button
              onClick={openAuthModal} // ← call directly
              className="bg-teal-500 hover:bg-teal-400 text-black"
            >
              Start for free
            </Button>
          </div>
        )}

        {/* LOGGED-IN controls */}
        {user && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>Dashboard</Button>

            {/* Logged-in dropdown (Add habit / Settings / Logout) */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((s) => !s)}
                className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800"
                aria-haspopup="menu"
                aria-expanded={menuOpen ? "true" : "false"}
                aria-label="Menu"
              >
                ☰
              </button>
              {menuOpen && (
                <div role="menu" className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-800 bg-slate-900/95 shadow-lg p-2">
                  <button
                    onClick={() => { setMenuOpen(false); navigate("/onboarding?mode=add"); }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800" role="menuitem"
                  >
                    + Add habit
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); navigate("/settings"); }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800" role="menuitem"
                  >
                    Settings
                  </button>
                  <div className="my-1 h-px bg-slate-800" />
                  <button
                    onClick={async () => { setMenuOpen(false); await logout(); }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-rose-300" role="menuitem"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* LOGGED-OUT hamburger (mobile only) */}
        {!user && (
          <button
            className="sm:hidden inline-flex items-center justify-center rounded-lg p-2 text-slate-200 hover:bg-slate-800"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Mobile panel for logged-out */}
      {!user && mobileOpen && (
        <div className="sm:hidden border-t border-slate-800 bg-slate-950/95">
          <nav className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-2">
            <Link to="/blog" className="py-2 text-slate-100" onClick={() => setMobileOpen(false)}>Blog</Link>
            <Link to="/pricing" className="py-2 text-slate-100" onClick={() => setMobileOpen(false)}>Pricing</Link>
            <Link to="/about" className="py-2 text-slate-100" onClick={() => setMobileOpen(false)}>About</Link>
            <Button
              onClick={() => { setMobileOpen(false); openAuthModal(); }} // ← direct call
              className="mt-2 bg-teal-500 hover:bg-teal-400 text-black"
            >
              Start for free
            </Button>
          </nav>
        </div>
      )}
    </nav>
  );
}
