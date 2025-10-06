// src/pages/About.tsx
import React from "react";
import { Helmet } from "react-helmet-async";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Helmet prioritizeSeoTags>
        <title>About Fitterverse</title>
        <meta
          name="description"
          content="We help you build lasting habits across fitness, nutrition, sleep, and mindset—one tiny action at a time."
        />
        <link rel="canonical" href="https://fitterverse.in/about" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Fitterverse",
          "url": "https://fitterverse.in",
          "logo": "https://fitterverse.in/icons/icon-512.png",
          "sameAs": []
        })}</script>
      </Helmet>

      {/* Hero */}
      <section className="px-4 sm:px-6 md:px-10 pt-14 pb-10 md:pt-20 md:pb-12 max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold">About Fitterverse</h1>
        <p className="mt-3 text-slate-300">
          We’re building a habit-first platform to help people get healthier for life.
        </p>
      </section>

      {/* Body */}
      <section className="px-4 sm:px-6 md:px-10 pb-16 max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold">Our Mission</h2>
          <p className="mt-3 text-slate-300">
            Make consistent health practices achievable and rewarding—through small
            wins, community, and smart guidance.
          </p>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold">What We Do</h2>
          <p className="mt-3 text-slate-300">
            Personalized plans, habit tracking, and science-backed nudges to keep you
            moving—day after day.
          </p>
        </Card>
      </section>

      <section className="px-4 sm:px-6 md:px-10 pb-20 max-w-5xl mx-auto">
        <Link to="/pricing">
          <Button>See Pricing</Button>
        </Link>
      </section>
    </div>
  );
}
