// src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

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

export default function App() {
  React.useEffect(() => {
    (window as any)._openAuth = () => {
      try {
        useAuth.getState().openAuthModal();
      } catch {}
    };
    return () => {
      if ((window as any)._openAuth) delete (window as any)._openAuth;
    };
  }, []);

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
