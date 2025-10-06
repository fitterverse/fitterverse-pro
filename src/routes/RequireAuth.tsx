// src/routes/RequireAuth.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/state/authStore";

function LoadingScreen() {
  return (
    <div className="min-h-dvh flex items-center justify-center text-slate-300">
      Loading…
    </div>
  );
}

export default function RequireAuth({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/" replace state={{ from: location }} />;

  return children;
}
