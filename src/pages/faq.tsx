// src/pages/faq.tsx
import React from "react";
import { Helmet } from "react-helmet-async";
import FAQ, { QA } from "@/components/seo/FAQ";

export default function FaqPage() {
  const CANON = "https://fitterverse.in/faq";
  const items: QA[] = [
    {
      q: "Is Fitterverse free?",
      a: "Yes, you can start free. Paid plans unlock deeper insights and coaching.",
    },
    {
      q: "How many habits can I track?",
      a: "You can track up to 3 core habits initially—like Eat healthy, Workout, or 10k steps.",
    },
    {
      q: "Does it work offline?",
      a: "The PWA has offline support for recent screens; sync happens when you’re back online.",
    },
    {
      q: "Will I get meal or workout guidance?",
      a: "Yes, we provide suggested plans and habit-specific guidance to keep you consistent.",
    },
  ];

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Helmet prioritizeSeoTags>
        <title>Fitterverse FAQ</title>
        <meta
          name="description"
          content="Answers about pricing, features, habit tracking limits, and more."
        />
        <link rel="canonical" href={CANON} />
      </Helmet>

      <h1 className="text-3xl md:text-4xl font-extrabold mb-6">
        Frequently Asked Questions
      </h1>
      <FAQ items={items} canonical={CANON} />
    </main>
  );
}
