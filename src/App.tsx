// src/App.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";

// global layout
import Navbar from "./components/nav/MarketingNavbar";

// main pages
import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Blog from "./pages/Blog"; // ✅ new blog page

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* shared nav */}
      <Navbar />

      {/* main content area */}
      <main className="flex-1">
        <Routes>
          {/* marketing / public */}
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} /> {/* ✅ blog index */}

          {/* app flows */}
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />

          {/* fallback */}
          <Route
            path="*"
            element={
              <div className="p-12 text-center text-slate-400">
                404 — page not found
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
