// src/App.tsx
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import MarketingNavbar from "./components/nav/MarketingNavbar";
import AppNavbar from "./components/nav/AppNavbar";

import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";

import AuthModal from "./components/AuthModal";

function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  // Marketing pages use the marketing navbar
  const isMarketing =
    pathname === "/" ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/blog") ||
    pathname.startsWith("/pricing");

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100">
      {isMarketing ? <MarketingNavbar /> : <AppNavbar />}

      {/* Mount once at root so any openAuth() shows this modal */}
      <AuthModal />

      {children}
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        {/* Marketing */}
        <Route path="/" element={<Home />} />

        {/* App */}
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}
