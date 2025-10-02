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

import { useAuth } from "@/state/authStore";

/**
 * Helper: read "onboarded" flag from localStorage for a user.
 * We set this to "1" after first habit is created in Onboarding.
 */
function isOnboarded(uid: string | undefined | null): boolean {
  if (!uid) return false;
  try {
    return localStorage.getItem(`fv_onboarded_${uid}`) === "1";
  } catch {
    return false;
  }
}

export default function App() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // On login, if user lands on "/" (or any marketing route),
  // push them to the right product route based on onboarding.
  React.useEffect(() => {
    if (!user) return;

    const path = location.pathname;
    const onMarketing =
      path === "/" ||
      path === "/pricing" ||
      path === "/about" ||
      path.startsWith("/blog");

    if (onMarketing) {
      if (isOnboarded(user.uid)) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/onboarding", { replace: true });
      }
    }
  }, [user, location.pathname, navigate]);

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

