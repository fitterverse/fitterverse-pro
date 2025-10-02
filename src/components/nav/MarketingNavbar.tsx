import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import { useAuth } from "@/state/authStore";

export default function MarketingNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = (p: string) => pathname === p;

  // Close dropdown on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    if (menuOpen) window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [menuOpen]);

  return (
    <nav className="sticky top-0 z-40 bg-slate-950/70 backdrop-blur border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-white text-lg">
          Fitterverse
        </Link>

        {!user ? (
          // Logged OUT — classic marketing nav
          <div className="hidden sm:flex items-center gap-4">
            <Link
              to="/blog"
              className={`text-sm ${
                isActive("/blog") ? "text-teal-400" : "text-slate-300 hover:text-white"
              }`}
            >
              Blog
            </Link>
            <Link
              to="/pricing"
              className={`text-sm ${
                isActive("/pricing") ? "text-teal-400" : "text-slate-300 hover:text-white"
              }`}
            >
              Pricing
            </Link>
            <Link
              to="/about"
              className={`text-sm ${
                isActive("/about") ? "text-teal-400" : "text-slate-300 hover:text-white"
              }`}
            >
              About
            </Link>
            <Button
              onClick={() => (window as any)._openAuth?.()}
              className="bg-teal-500 hover:bg-teal-400 text-black"
            >
              Start for free
            </Button>
          </div>
        ) : (
          // Logged IN — app nav (NO top “Add habit” here)
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              Dashboard
            </Button>

            {/* Hamburger menu with Add habit, Settings, Logout */}
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
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-800 bg-slate-900/95 shadow-lg p-2"
                >
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/onboarding?mode=add");
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800"
                    role="menuitem"
                  >
                    + Add habit
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/settings");
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800"
                    role="menuitem"
                  >
                    Settings
                  </button>
                  <div className="my-1 h-px bg-slate-800" />
                  <button
                    onClick={async () => {
                      setMenuOpen(false);
                      await logout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-rose-300"
                    role="menuitem"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
