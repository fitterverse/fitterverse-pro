// src/components/nav/MarketingNavbar.tsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import { useAuth } from "@/state/authStore";
import { goToAppOrOnboarding } from "@/lib/smartNav";

export default function MarketingNavbar() {
  const [open, setOpen] = React.useState(false);
  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  React.useEffect(() => {
    // close menu on route change
    setOpen(false);
  }, [pathname]);

  const handleStart = () => {
    goToAppOrOnboarding(user as any, navigate, openAuthModal);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <nav className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold tracking-tight">
          Fitterverse
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/blog" className="text-slate-300 hover:text-white">
            Blog
          </Link>
          <Link to="/pricing" className="text-slate-300 hover:text-white">
            Pricing
          </Link>
          <Link to="/about" className="text-slate-300 hover:text-white">
            About
          </Link>
          <Button onClick={handleStart} className="bg-teal-500 hover:bg-teal-400 text-black">
            Start free
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-md border border-slate-800"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span className="i-lucide-menu text-xl" />
        </button>
      </nav>

      {/* Mobile panel */}
      {open && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950">
          <div className="max-w-6xl mx-auto px-4 py-3 grid gap-2">
            <Link to="/blog" className="py-2 text-slate-200">
              Blog
            </Link>
            <Link to="/pricing" className="py-2 text-slate-200">
              Pricing
            </Link>
            <Link to="/about" className="py-2 text-slate-200">
              About
            </Link>
            <Button onClick={handleStart} className="mt-2 bg-teal-500 hover:bg-teal-400 text-black">
              Start free
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
