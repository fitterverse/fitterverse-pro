// src/App.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import MarketingNavbar from "@/components/nav/MarketingNavbar";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Onboarding from "@/pages/Onboarding";
import Settings from "@/pages/Settings";
import BlogIndex from "@/pages/blog/BlogIndex";
import HubPage from "@/pages/blog/HubPage";
import PostPage from "@/pages/blog/PostPage";
import AuthModal from "@/components/AuthModal";

export default function App() {
  return (
    <>
      <MarketingNavbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/settings" element={<Settings />} />

        {/* Blog */}
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/blog/:hubId" element={<HubPage />} />
        <Route path="/blog/:hubId/:slug" element={<PostPage />} />
      </Routes>

      {/* Auth modal lives once at the root, opened from anywhere */}
      <AuthModal />
    </>
  );
}
