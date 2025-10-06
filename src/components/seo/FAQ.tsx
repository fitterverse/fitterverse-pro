// src/components/seo/FAQ.tsx
import React from "react";
import { Helmet } from "react-helmet-async";

export type QA = { q: string; a: string };

export default function FAQ({ items, canonical }: { items: QA[]; canonical: string }) {
  const faqs = items.map((it) => ({
    "@type": "Question",
    name: it.q,
    acceptedAnswer: { "@type": "Answer", text: it.a },
  }));

  return (
    <>
      <Helmet>
        <link rel="canonical" href={canonical} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs,
          })}
        </script>
      </Helmet>

      <div className="space-y-3">
        {items.map((it, i) => (
          <details
            key={i}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
          >
            <summary className="cursor-pointer text-lg font-semibold">
              {it.q}
            </summary>
            <div className="mt-2 text-slate-300">{it.a}</div>
          </details>
        ))}
      </div>
    </>
  );
}
