// src/App.tsx
import React from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

import MarketingNavbar from "@/components/nav/MarketingNavbar";
import AuthModal from "@/components/AuthModal";

import Home from "@/pages/Home";
import Pricing from "@/pages/Pricing";
import About from "@/pages/About";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import Blog from "@/pages/Blog";
import HubPage from "@/pages/blog/HubPage";
import PostPage from "@/pages/blog/PostPage";
import HabitDashboard from "@/pages/habits/HabitDashboard";

import { useAuth, getOnboarded } from "@/state/authStore";

function AppShell() {
  const { user, initDone } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    (window as any)._openAuth = () => {
      try { useAuth.getState().openAuthModal(); } catch {}
    };
    return () => { delete (window as any)._openAuth; };
  }, []);

  React.useEffect(() => {
    if (!initDone) return;

    const path = location.pathname;

    if (user && (path === "/" || path === "/about" || path === "/pricing" || path.startsWith("/blog"))) {
      const dest = getOnboarded(user.uid) ? "/dashboard" : "/onboarding";
      if (path !== dest) navigate(dest, { replace: true });
      return;
    }

    if (!user && (path === "/dashboard" || path === "/settings" || path === "/onboarding" || path.startsWith("/habit/"))) {
      navigate("/", { replace: true });
    }
  }, [initDone, user, location.pathname, navigate]);

  if (!initDone) {
    return (
      <div className="min-h-dvh grid place-items-center bg-slate-950 text-slate-300">
        <div className="animate-pulse text-sm opacity-75">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100">
      <MarketingNavbar />

      <Routes>
        {/* Marketing */}
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />

        {/* Product */}
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/habit/:habitId" element={<HabitDashboard />} />

        {/* Blog */}
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:hubId" element={<HubPage />} />
        <Route path="/blog/:hubId/:slug" element={<PostPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <AuthModal />
    </div>
  );
}

export default function App() {
  return <AppShell />;
}
