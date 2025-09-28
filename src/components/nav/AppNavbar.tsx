import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import clsx from "clsx";
import Button from "@/components/ui/Button";
import { useAuth } from "@/state/authStore";

export default function AppNavbar() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => setOpen(false), [location.pathname]);

  const linkBase =
    "text-slate-300 hover:text-white transition-colors rounded-lg px-3 py-2 text-sm font-medium";
  const linkActive = "text-white bg-slate-800/60";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/60 bg-slate-950/70 backdrop-blur">
      <nav className="mx-auto grid max-w-6xl grid-cols-12 items-center gap-2 px-4 py-3 sm:px-6 md:px-10">
        {/* Brand */}
        <div className="col-span-6 sm:col-span-3 flex items-center gap-2">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-teal-400 text-slate-900 font-extrabold">
              F
            </span>
            <span className="text-white font-semibold tracking-tight">Fitterverse</span>
          </Link>
        </div>

        {/* Center nav (you can add more app routes later) */}
        <div className="col-span-6 hidden sm:flex items-center justify-center gap-1">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => clsx(linkBase, isActive && linkActive)}
          >
            Dashboard
          </NavLink>
        </div>

        {/* Right actions */}
        <div className="col-span-6 sm:col-span-3 flex items-center justify-end gap-2">
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/dashboard"
              className="text-slate-300 hover:text-white text-sm px-3 py-2 rounded-lg border border-slate-800 hover:border-slate-700"
            >
              {user?.displayName ? `Hi, ${user.displayName.split(" ")[0]}` : "Dashboard"}
            </Link>
            <Button onClick={() => signOut()} className="bg-slate-800 hover:bg-slate-700 text-slate-200">
              Logout
            </Button>
          </div>
          {/* Hamburger */}
          <button
            aria-label="Open menu"
            className="sm:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-800 text-slate-300 hover:text-white"
            onClick={() => setOpen(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile sheet */}
      {open && (
        <Sheet onClose={() => setOpen(false)}>
          <SheetHeader onClose={() => setOpen(false)} />
          <div className="mt-6 flex flex-col gap-1">
            <MobileLink to="/dashboard" onClick={()=>setOpen(false)}>Dashboard</MobileLink>
            <button
              onClick={() => { setOpen(false); signOut(); }}
              className="mt-2 inline-flex items-center justify-center rounded-xl border border-slate-800 px-4 py-2.5 text-slate-200 hover:border-slate-700"
            >
              Logout
            </button>
          </div>
          <p className="mt-8 text-xs text-slate-500">Stay consistent. One small win a day compounds.</p>
        </Sheet>
      )}
    </header>
  );
}

function MobileLink({
  to, onClick, children,
}: { to: string; onClick?: () => void; children: React.ReactNode }) {
  const loc = useLocation();
  const active = loc.pathname.startsWith(to);
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={clsx(
        "rounded-lg px-3 py-2 text-sm font-medium",
        active ? "text-white bg-slate-800/60" : "text-slate-300 hover:text-white"
      )}
    >
      {children}
    </NavLink>
  );
}

function Sheet({
  children, onClose,
}: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden />
      <div className="absolute right-0 top-0 h-full w-[86%] max-w-sm bg-slate-950 border-l border-slate-800 p-5">
        {children}
      </div>
    </div>
  );
}

function SheetHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-teal-400 text-slate-900 font-extrabold">F</span>
        <span className="text-white font-semibold">Fitterverse</span>
      </div>
      <button
        aria-label="Close menu"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-800 text-slate-300 hover:text-white"
        onClick={onClose}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>
    </div>
  );
}
