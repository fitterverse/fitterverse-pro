// src/components/nav/MarketingNavbar.tsx
import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import clsx from "clsx";
import Button from "@/components/ui/Button";
import { useAuth } from "@/state/authStore";

export default function MarketingNavbar() {
  const { pathname } = useLocation();
  const openAuthModal = useAuth((s) => s.openAuthModal);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60 border-b border-slate-800">
      <nav className="mx-auto max-w-6xl px-4 sm:px-6 md:px-10 h-14 flex items-center justify-between">
        <Link to="/" className="font-semibold tracking-tight">
          Fitterverse
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm">
          <NavLink
            to="/blog"
            className={clsx(
              "hover:text-white transition-colors",
              pathname.startsWith("/blog") ? "text-white" : "text-slate-300"
            )}
          >
            Blog
          </NavLink>
          <NavLink
            to="/pricing"
            className={clsx(
              "hover:text-white transition-colors",
              pathname.startsWith("/pricing") ? "text-white" : "text-slate-300"
            )}
          >
            Pricing
          </NavLink>
          <NavLink
            to="/about"
            className={clsx(
              "hover:text-white transition-colors",
              pathname.startsWith("/about") ? "text-white" : "text-slate-300"
            )}
          >
            About
          </NavLink>

          <Button
            onClick={openAuthModal}
            className="ml-2 bg-sky-500 hover:bg-sky-400 text-black"
          >
            Start free
          </Button>
        </div>

        {/* Mobile */}
        <div className="md:hidden">
          <Button onClick={openAuthModal} className="bg-sky-500 hover:bg-sky-400 text-black">
            Start
          </Button>
        </div>
      </nav>
    </header>
  );
}
