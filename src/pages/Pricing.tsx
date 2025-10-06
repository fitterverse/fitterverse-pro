// src/pages/Pricing.tsx
import React from "react";
import { Helmet } from "react-helmet-async";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/state/authStore";

function inr(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function Pricing() {
  const { openAuthModal } = useAuth();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <Helmet prioritizeSeoTags>
        <title>Pricing | Fitterverse</title>
        <meta
          name="description"
          content="Simple, transparent pricing for habit-first fitness. Start free and upgrade anytime."
        />
        <link rel="canonical" href="https://fitterverse.in/pricing" />
      </Helmet>

      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold">Pricing</h1>
        <p className="mt-3 text-slate-300">
          Start free. Upgrade when you need more coaching & tracking depth.
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold">Starter</h3>
          <p className="mt-1 text-slate-400">Core tracking & basic tips</p>
          <p className="mt-4 text-3xl font-extrabold">{inr(0)}</p>
          <Button className="mt-6" onClick={() => openAuthModal()}>
            Get started
          </Button>
        </Card>

        <Card className="p-6 border-emerald-800">
          <h3 className="text-xl font-semibold">Pro</h3>
          <p className="mt-1 text-slate-400">Deep insights & guidance</p>
          <p className="mt-4 text-3xl font-extrabold">{inr(499)}</p>
          <Button className="mt-6" onClick={() => openAuthModal()}>
            Upgrade to Pro
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold">Teams</h3>
          <p className="mt-1 text-slate-400">For coaches & programs</p>
          <p className="mt-4 text-3xl font-extrabold">Custom</p>
          <Button className="mt-6" onClick={() => openAuthModal()}>
            Contact sales
          </Button>
        </Card>
      </div>
    </main>
  );
}
