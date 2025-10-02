import React from "react";
import AppNavbar from "@/components/nav/AppNavbar";

type Props = { children: React.ReactNode };

export default function AppShell({ children }: Props) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <AppNavbar />
      <main>{children}</main>
    </div>
  );
}
