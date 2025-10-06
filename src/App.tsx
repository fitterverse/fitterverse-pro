// src/App.tsx
import React from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

import MarketingNavbar from "@/components/nav/MarketingNavbar";
import AppNavbar from "@/components/nav/AppNavbar";
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
import HabitDetail from "@/pages/HabitDetail"; // <— make sure this import exists

import { useAuth } from "@/state/authStore";

/** LocalStorage helper: read “onboarded” per user */
function isOnboarded(uid?: string | null): boolean {
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

  // Prevent repeated redirects causing “blank” screens
  const routedRef = React.useRef(false);

  React.useEffect(() => {
    if (!user) return;                  // only redirect signed-in users
    if (routedRef.current) return;      // only do it once per mount

    const path = location.pathname;
    const onMarketing =
      path === "/" ||
      path === "/pricing" ||
      path === "/about" ||
      path === "/blog" ||
      path.startsWith("/blog/");

    if (onMarketing) {
      routedRef.current = true;
      if (isOnboarded(user.uid)) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/onboarding", { replace: true });
      }
    }
  }, [user, location.pathname, navigate]);

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100">
      {/* Use the app navbar when authenticated, marketing otherwise */}
      {user ? <AppNavbar /> : <MarketingNavbar />}

      <Routes>
        {/* Marketing */}
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />

        {/* Product */}
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/habit/:id" element={<HabitDetail />} />
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
