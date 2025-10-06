// src/App.tsx
import React from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import MarketingNavbar from "@/components/nav/MarketingNavbar";
import AppNavbar from "@/components/nav/AppNavbar";
import AuthModal from "@/components/AuthModal";
import HostRobotsGuard from "@/components/HostRobotsGuard";

import Home from "@/pages/Home";
import Pricing from "@/pages/Pricing";
import About from "@/pages/About";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import Blog from "@/pages/Blog";
import HubPage from "@/pages/blog/HubPage";
import PostPage from "@/pages/blog/PostPage";
import HabitDetail from "@/pages/HabitDetail";
import NotFound from "@/pages/NotFound";

import { useAuth } from "@/state/authStore";
import RequireAuth from "@/routes/RequireAuth";
import { isOnboarded } from "@/state/appStore";

function isMarketingPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/pricing" ||
    pathname === "/about" ||
    pathname === "/blog" ||
    pathname.startsWith("/blog/")
  );
}

export default function App() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const redirectedOnceRef = React.useRef(false);

  React.useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (redirectedOnceRef.current) return;

    const path = location.pathname || "/";
    const onMarketing = isMarketingPath(path);
    const onPrivate =
      path.startsWith("/dashboard") ||
      path.startsWith("/settings") ||
      path.startsWith("/habit/") ||
      path.startsWith("/onboarding");

    if (!onPrivate && onMarketing) {
      redirectedOnceRef.current = true;
      if (isOnboarded(user.uid)) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/onboarding", { replace: true });
      }
    }
  }, [user, loading, location.pathname, navigate]);

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100">
      <HostRobotsGuard />
      {user ? <AppNavbar /> : <MarketingNavbar />}

      <Routes>
        {/* Marketing */}
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />

        {/* Product (auth required) */}
        <Route
          path="/onboarding"
          element={
            <RequireAuth>
              <Onboarding />
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/habit/:id"
          element={
            <RequireAuth>
              <HabitDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <Settings />
            </RequireAuth>
          }
        />

        {/* Blog */}
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:hubId" element={<HubPage />} />
        <Route path="/blog/:hubId/:slug" element={<PostPage />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <AuthModal />
    </div>
  );
}
