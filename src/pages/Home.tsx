// src/pages/Home.tsx
// -----------------------------------------------------------------------------
// Marketing homepage (public). All primary CTAs open the auth modal.
// We deliberately do NOT render <AuthModal /> here to avoid duplicates;
// the modal should be mounted once at the app root (e.g., in App.tsx).
// -----------------------------------------------------------------------------

import React, { useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/state/authStore";

export default function Home() {
  // Pull the modal opener from the auth store.
  // This is the ONLY function the CTAs should call to open the login/signup modal.
  const { openAuthModal } = useAuth();

  // tiny helper so we can tag where the click came from (for analytics later)
  const openAuth = useCallback(
    (source: string) => {
      // TODO: send `source` to analytics if needed
      openAuthModal();
    },
    [openAuthModal]
  );

  return (
    <>
      {/* ---------------------------------------------------------------------
        Announcement bar (sticky). Keep this concise and action-oriented.
      ---------------------------------------------------------------------- */}
      <div className="sticky top-0 z-30 bg-emerald-600/10 backdrop-blur border-b border-emerald-700/30">
        <div className="mx-auto max-w-6xl px-4 py-2 text-center text-sm text-emerald-200">
          🎉 Early access is live — master your first habit in <strong>66 days</strong>.{" "}
          <button
            onClick={() => openAuth("announce_start_free")}
            className="underline underline-offset-4 hover:text-white"
          >
            Start free →
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------------------------
        Hero section: main value prop + primary CTA to open auth modal
      ---------------------------------------------------------------------- */}
      <section className="bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
        <div className="mx-auto max-w-6xl px-4 pt-16 pb-12 md:pt-24 md:pb-16 grid md:grid-cols-2 gap-10">
          {/* Left: copy + CTAs */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05]">
              Transform <span className="text-emerald-400">one habit</span>.{" "}
              <br className="hidden md:block" />
              Change your life.
            </h1>

            <p className="mt-5 text-slate-300 text-lg md:text-xl">
              Fitterverse uses behavior design, weekly reviews, and tiny wins to help you stick —
              without guilt or overwhelm.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              {/* Primary CTA → opens auth modal */}
              <button
                onClick={() => openAuth("hero_primary")}
                className="inline-flex justify-center items-center rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-slate-900 hover:bg-emerald-400"
                data-cta="hero_primary"
              >
                Transform your habit
              </button>

              {/* Secondary CTA → scroll down to “Why” section */}
              <a
                href="#why"
                className="inline-flex justify-center items-center rounded-lg border border-slate-700 px-6 py-3 font-semibold text-slate-200 hover:bg-slate-800/50"
              >
                See how it works
              </a>
            </div>

            {/* Social proof snippet */}
            <div className="mt-6 flex items-center gap-3 text-sm text-slate-400">
              <Stars />
              <span>4.9 average satisfaction</span>
              <span className="opacity-50">•</span>
              <span>Backed by behavior science</span>
            </div>
          </div>

          {/* Right: hero image with a small overlay preview */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden ring-1 ring-slate-800 shadow-2xl">
              <img
                src="/images/hero-phone.jpg"
                alt="Fitterverse — habit focus phone"
                className="w-full h-[420px] object-cover"
                loading="eager"
              />
              {/* Subtle overlay “Today” card to hint at product feel */}
              <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-slate-900/80 border border-slate-700 p-4">
                <div className="text-sm text-slate-300">Today</div>
                <ul className="mt-2 space-y-2 text-sm">
                  {["2-min stretch", "No phone at breakfast", "10-min walk"].map((t) => (
                    <li key={t} className="flex items-center gap-2">
                      <span className="inline-block h-4 w-4 rounded border border-slate-600" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Logos / Social proof row (kept light; replace with partners later) */}
        <div className="mx-auto max-w-6xl px-4 pb-12 md:pb-16">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-slate-500 mb-4">
            inspired by research / trusted by builders
          </p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-x-6 gap-y-4 opacity-70">
            {["logo-mit.svg", "logo-ibm.svg", "logo-meta.svg", "logo-ibm.svg", "logo-meta.svg", "logo-mit.svg"].map(
              (l, i) => (
                <img key={i} src={`/images/${l}`} alt="logo" className="h-8 mx-auto" />
              )
            )}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------
        “Why Fitterverse” section: three concise differentiators + CTA
      ---------------------------------------------------------------------- */}
      <section id="why" className="border-t border-slate-800 bg-slate-900/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Fitterverse converts action into <span className="text-emerald-400">progress</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "One focus habit",
                body: "Scattered trackers fail. We go deep on one high-leverage habit for ~66 days.",
              },
              {
                title: "Weekly check-ins",
                body: "Less shame, more insight. Review weekly to adapt the plan and celebrate wins.",
              },
              {
                title: "Behavior design",
                body: "Implementation intentions + environment design baked right into your flow.",
              },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-slate-300">{f.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <button
              onClick={() => openAuth("why_section_cta")}
              className="inline-flex items-center rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-slate-900 hover:bg-emerald-400"
              data-cta="why_section_cta"
            >
              Start free — it takes 60s
            </button>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------
        “How it works” section: simple, scannable 3-step explanation + CTA
      ---------------------------------------------------------------------- */}
      <section className="border-t border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">How it works</h2>
            <ol className="space-y-4 text-slate-300">
              <li>
                <strong className="text-slate-100">1) Pick one habit</strong> — morning routine, screen-time, exercise (more soon).
              </li>
              <li>
                <strong className="text-slate-100">2) Personalize</strong> — goals, “if-then” plans, and environment tweaks.
              </li>
              <li>
                <strong className="text-slate-100">3) Weekly review</strong> — light check-ins → adjust → keep momentum.
              </li>
            </ol>

            <div className="mt-8">
              <button
                onClick={() => openAuth("how_it_works_cta")}
                className="inline-flex items-center rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-slate-900 hover:bg-emerald-400"
                data-cta="how_it_works_cta"
              >
                Make my plan
              </button>
            </div>
          </div>

          {/* Image: product vibe (replace with real dashboard later) */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden ring-1 ring-slate-800 shadow-2xl">
              <img
                src="/images/dashboard.jpg"
                alt="Fitterverse dashboard preview"
                className="w-full h-[380px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------
        Demo feel: two mini tiles that visually communicate the UX
      ---------------------------------------------------------------------- */}
      <section className="border-t border-slate-800 bg-slate-900/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Try the feel — tiny wins, not pressure</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Mini checklist tile (static preview) */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="font-semibold mb-3">Daily checklist</h3>
              <ul className="space-y-3 text-slate-200">
                {[
                  { id: "t1", text: "2-min stretch after waking" },
                  { id: "t2", text: "No phone at breakfast" },
                  { id: "t3", text: "10-min evening walk" },
                ].map((t) => (
                  <li key={t.id} className="flex items-center gap-3">
                    <span className="h-5 w-5 rounded border border-slate-600" />
                    <span>{t.text}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-slate-400">Real app saves this automatically.</p>
            </div>

            {/* If/Then plan concept tile (static preview) */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="font-semibold mb-3">If-then plan (example)</h3>
              <div className="text-slate-200">
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                  <div className="text-sm text-slate-400 mb-1">IF</div>
                  I sit down for breakfast
                </div>
                <div className="text-center py-2 text-slate-500">→</div>
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                  <div className="text-sm text-slate-400 mb-1">THEN</div>
                  My phone stays outside the kitchen
                </div>
              </div>
            </div>
          </div>

          {/* CTA under demo */}
          <div className="mt-8">
            <button
              onClick={() => openAuth("mini_demo_cta")}
              className="inline-flex items-center rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-slate-900 hover:bg-emerald-400"
              data-cta="mini_demo_cta"
            >
              Start free
            </button>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------
        Testimonials (stubbed; replace with real later)
      ---------------------------------------------------------------------- */}
      <section className="border-t border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-10">Loved by consistency-seekers</h2>
          {/* Add testimonial cards here later */}
        </div>
      </section>

      {/* ---------------------------------------------------------------------
        Final CTA band — last chance to convert
      ---------------------------------------------------------------------- */}
      <section className="border-t border-slate-800 bg-gradient-to-r from-emerald-600/10 via-emerald-500/10 to-emerald-600/10">
        <div className="mx-auto max-w-6xl px-4 py-12 text-center">
          <h3 className="text-2xl md:text-3xl font-bold">Ready to build your first habit?</h3>
          <p className="mt-2 text-slate-300">No spam, no pressure. Just tiny wins that add up.</p>
          <div className="mt-6">
            <button
              onClick={() => openAuth("final_band_cta")}
              className="inline-flex items-center rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-slate-900 hover:bg-emerald-400"
              data-cta="final_band_cta"
            >
              Transform your habit
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

/** Small star row used near the hero for quick social proof */
function Stars() {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-4 w-4 fill-emerald-400" aria-hidden="true">
          <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9 4.7 17.6l1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}
