import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Button from "@/components/ui/Button";

export default function AppNavbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const goDashboard = () => navigate("/dashboard");
  const goAddHabit = () => {
    setOpen(false);
    navigate("/onboarding?mode=add");
  };
  const goSettings = () => {
    setOpen(false);
    navigate("/settings");
  };
  const doLogout = async () => {
    setOpen(false);
    try {
      await signOut(auth);
      navigate("/", { replace: true });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 h-14 flex items-center justify-between">
        {/* Brand + primary nav */}
        <div className="flex items-center gap-6">
          <button
            onClick={goDashboard}
            className="text-xl font-semibold tracking-tight"
            aria-label="Fitterverse"
          >
            Fitterverse
          </button>

          <nav className="hidden sm:flex items-center gap-5 text-sm">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `hover:text-white ${isActive ? "text-white" : "text-slate-300"}`
              }
            >
              Dashboard
            </NavLink>
          </nav>
        </div>

        {/* Right side: ONLY hamburger menu now */}
        <div className="relative">
          <button
            onClick={() => setOpen((s) => !s)}
            className="h-10 w-10 inline-flex items-center justify-center rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700"
            aria-label="Menu"
            aria-haspopup="menu"
            aria-expanded={open ? "true" : "false"}
          >
            <span className="i-lucide-menu text-lg">≡</span>
          </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900/95 shadow-xl p-2 text-sm"
            >
              <button
                onClick={goAddHabit}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800"
                role="menuitem"
              >
                + Add habit
              </button>
              <button
                onClick={goSettings}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800"
                role="menuitem"
              >
                Settings
              </button>
              <div className="my-1 h-px bg-slate-800" />
              <button
                onClick={doLogout}
                className="w-full text-left px-3 py-2 rounded-lg text-rose-300 hover:bg-slate-800"
                role="menuitem"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
