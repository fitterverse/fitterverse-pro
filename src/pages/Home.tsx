// src/pages/Home.tsx
import React from "react";
import { useAuth } from "@/state/authStore";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

/**
 * Mobile-first, conversion-focused landing page for Fitterverse.
 * - CTAs open the Auth modal (Google / Microsoft / Phone).
 * - Clear value prop + differentiators, social proof, and FAQs.
 * - Realistic imagery from /public/images (swap later as needed).
 */
export default function Home() {
  const { openAuthModal } = useAuth();

  const handleOpenAuth: React.MouseEventHandler<
    HTMLButtonElement | HTMLAnchorElement
  > = (e) => {
    e.preventDefault();
    openAuthModal();
  };

  return (
    <div className="bg-slate-950 text-slate-100">
      {/* ========== HERO ========== */}
      <section className="px-4 sm:px-6 md:px-10 pt-16 md:pt-24 pb-10 md:pb-14 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Copy */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
              New • Behavior-science based
            </div>
            <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
              Get fit by{" "}
              <span className="text-emerald-400">mastering one habit</span> at a
              time.
            </h1>
            <p className="mt-4 text-slate-300 text-lg">
              Fitterverse turns tiny actions into compounding progress with
              flexible streaks, weekly reviews, and gentle AI nudges. No guilt.
              No overwhelm. Just momentum.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                onClick={handleOpenAuth}
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-900"
              >
                Get started free
              </Button>
              <a
                href="#how"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-700 px-4 py-2.5 hover:bg-slate-900/60"
              >
                See how it works
              </a>
            </div>

            <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
              <Stars />
              <span>4.9 satisfaction</span>
              <span className="opacity-50">•</span>
              <span>Backed by research</span>
              <span className="opacity-50">•</span>
              <span>No credit card</span>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl ring-1 ring-slate-800 shadow-2xl">
              <img
                src="/images/hero-phone.jpg"
                alt="Focus on one habit — Fitterverse"
                className="h-[420px] w-full object-cover"
                loading="eager"
              />
            </div>

            {/* Overlay mini card */}
            <div className="absolute -bottom-6 left-4 right-4 hidden md:block">
              <Card className="bg-slate-900/90 border-slate-800 shadow-xl">
                <div className="p-4">
                  <div className="text-xs uppercase tracking-wider text-slate-400">
                    Today’s plan
                  </div>
                  <ul className="mt-2 space-y-2 text-sm">
                    {[
                      "2-min stretch after waking",
                      "No phone at breakfast",
                      "10-min walk after lunch",
                    ].map((t) => (
                      <li key={t} className="flex items-center gap-2">
                        <span className="inline-block h-4 w-4 rounded border border-slate-600"></span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Logos */}
        <div className="mt-12 md:mt-16">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-slate-500 mb-4">
            inspired by research / trusted by builders
          </p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-x-6 gap-y-4 opacity-70">
            {[
              "logo-mit.svg",
              "logo-ibm.svg",
              "logo-meta.svg",
              "logo-ibm.svg",
              "logo-meta.svg",
              "logo-mit.svg",
            ].map((l, i) => (
              <img key={i} src={`/images/${l}`} alt="logo" className="h-8 mx-auto" />
            ))}
          </div>
        </div>
      </section>

      {/* ========== DIFFERENTIATORS ========== */}
      <section id="why" className="border-t border-slate-800 bg-slate-900/40">
        <div className="px-4 sm:px-6 md:px-10 py-12 md:py-16 max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center">
            Why most fitness apps fail — and{" "}
            <span className="text-emerald-400">Fitterverse works</span>
          </h2>

          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {[
              {
                title: "One focus habit",
                body:
                  "Scattered trackers dilute effort. We go deep on one high-leverage habit ~66 days.",
              },
              {
                title: "Weekly reviews",
                body:
                  "Less shame, more learning. Reflect weekly to adjust goals and celebrate wins.",
              },
              {
                title: "Behavior design",
                body:
                  "If-then plans, environment tweaks, and friction removal baked into your flow.",
              },
            ].map((f) => (
              <Card key={f.title} className="bg-slate-900 border-slate-800">
                <div className="p-6">
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-slate-300">{f.body}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS (4 steps) ========== */}
      <section id="how" className="border-t border-slate-800">
        <div className="px-4 sm:px-6 md:px-10 py-12 md:py-16 max-w-6xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">How it works</h2>
            <ol className="mt-5 space-y-4 text-slate-300">
              <li>
                <strong className="text-slate-100">1) Pick one habit</strong> — e.g., morning
                routine, screen-time, workout, 10k steps, or eating better.
              </li>
              <li>
                <strong className="text-slate-100">2) Personalize</strong> — set tiny baseline,
                choose daily <em>or</em> weekly tracking, and create if-then plans.
              </li>
              <li>
                <strong className="text-slate-100">3) Get nudges</strong> — flexible streaks,
                reminders, and environment tips (no guilt trips).
              </li>
              <li>
                <strong className="text-slate-100">4) Review weekly</strong> — a quick 3–5 min
                check-in to adapt goals and keep momentum.
              </li>
            </ol>
            <div className="mt-6">
              <Button
                onClick={handleOpenAuth}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-900"
              >
                Start your plan
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-2xl ring-1 ring-slate-800 shadow-2xl">
              <img
                src="/images/dashboard.jpg"
                alt="Fitterverse progress and review"
                className="h-[380px] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========== COMPARISON (side-by-side) ========== */}
      <section className="border-t border-slate-800 bg-slate-900/40">
        <div className="px-4 sm:px-6 md:px-10 py-12 md:py-16 max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center">
            Not another tracker. A{" "}
            <span className="text-emerald-400">change system</span>.
          </h2>

          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <Card className="bg-slate-900 border-slate-800">
              <div className="p-6">
                <h3 className="font-semibold">Typical apps</h3>
                <ul className="mt-3 space-y-2 text-slate-300 text-sm">
                  <li>• Big, unsustainable plans</li>
                  <li>• Streak breaks — motivation dies</li>
                  <li>• One-size-fits-all programs</li>
                  <li>• Guilt-driven reminders</li>
                </ul>
              </div>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <div className="p-6">
                <h3 className="font-semibold">Fitterverse</h3>
                <ul className="mt-3 space-y-2 text-slate-300 text-sm">
                  <li>• Tiny daily wins or weekly reviews (your choice)</li>
                  <li>• Flexible streaks — miss a day, not your identity</li>
                  <li>• If-then plans + environment design</li>
                  <li>• Progress &gt; perfection</li>
                </ul>
                <Button
                  onClick={handleOpenAuth}
                  className="mt-5 bg-emerald-500 hover:bg-emerald-400 text-slate-900"
                >
                  Try it free
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ========== SOCIAL PROOF (testimonials) ========== */}
      <section className="border-t border-slate-800">
        <div className="px-4 sm:px-6 md:px-10 py-12 md:py-16 max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Loved by consistency-seekers
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                img: "/images/ava-1.jpg",
                quote:
                  "My morning routine finally stuck. The weekly reviews keep me honest without stress.",
                name: "Aarav Sharma",
                role: "Product Manager",
              },
              {
                img: "/images/ava-2.jpg",
                quote:
                  "Screen-time cravings dropped. The if-then plans were simple but powerful.",
                name: "Maya Patel",
                role: "Founder",
              },
              {
                img: "/images/ava-3.jpg",
                quote:
                  "Tiny wins + one focus habit = sustainable progress. I’m all in.",
                name: "Leo Martinez",
                role: "Engineer",
              },
            ].map((t) => (
              <Card key={t.name} className="bg-slate-900 border-slate-800">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={t.img}
                      alt={t.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-xs text-slate-400">{t.role}</div>
                    </div>
                  </div>
                  <p className="text-slate-200">“{t.quote}”</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ========== “STILL UNSURE?” BAND ========== */}
      <section className="border-t border-slate-800 bg-slate-900/40">
        <div className="px-4 sm:px-6 md:px-10 py-10 md:py-14 max-w-6xl mx-auto">
          <Card className="bg-slate-900 border-slate-800">
            <div className="p-6 md:flex md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold">Still unsure?</h3>
                <p className="mt-2 text-slate-300">
                  Start free. If Fitterverse doesn’t help in a week, walk away.
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <Button
                  onClick={handleOpenAuth}
                  className="bg-white text-slate-900 hover:bg-white/90"
                >
                  Start free
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ========== FAQ ========== */}
      <section className="border-t border-slate-800">
        <div className="px-4 sm:px-6 md:px-10 py-12 md:py-16 max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold">FAQs</h2>
          <div className="mt-6 space-y-3">
            <FAQ
              q="Why only one habit?"
              a="Focus compounds. Mastery is easier when you remove competing goals."
            />
            <FAQ
              q="Daily tracking mandatory?"
              a="No. Choose daily tracking or a simple weekly check-in — both work."
            />
            <FAQ
              q="How much time does it take?"
              a="Most actions are 2–10 minutes/day, plus a 3–5 minute weekly review."
            />
            <FAQ
              q="Is it free?"
              a="Early access is free while we iterate. Paid tiers later for coaching and analytics."
            />
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="border-t border-slate-800 bg-gradient-to-r from-emerald-500/10 via-emerald-400/10 to-emerald-500/10">
        <div className="px-4 sm:px-6 md:px-10 py-12 text-center max-w-6xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold">
            Ready to build your first habit?
          </h3>
          <p className="mt-2 text-slate-300">
            No spam. No pressure. Just tiny wins that add up.
          </p>
          <div className="mt-6">
            <Button
              onClick={handleOpenAuth}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-900"
            >
              Transform your habit
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- Small helpers ---------- */

function Stars() {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-4 w-4 fill-emerald-400">
          <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9 4.7 17.6l1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <details className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <summary className="cursor-pointer font-semibold">{q}</summary>
      <p className="mt-2 text-slate-300">{a}</p>
    </details>
  );
}
