// src/components/HostRobotsGuard.tsx
import React from "react";
import { Helmet } from "react-helmet-async";

export default function HostRobotsGuard() {
  if (typeof window === "undefined") return null;
  const host = window.location.hostname;
  const isPreview = /(?:web\.app|firebaseapp\.com)$/i.test(host);
  return isPreview ? (
    <Helmet>
      <meta name="robots" content="noindex,nofollow" />
    </Helmet>
  ) : null;
}
