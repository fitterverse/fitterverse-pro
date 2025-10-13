// src/pages/Home.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useAuth } from "@/state/authStore";

export default function Home() {
  const { openAuthModal } = useAuth();

  const handleOpenAuth: React.MouseEventHandler<
    HTMLButtonElement | HTMLAnchorElement
  > = (e) => {
    e.preventDefault();
    openAuthModal();
  };

  const CANON = "https://fitterverse.in/";
  const OG_IMAGE =
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop";
  const OG_IMAGE_WIDTH = "1200";
  const OG_IMAGE_HEIGHT = "800";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Helmet>
        <title>Fitterverse – Get fit by mastering one habit at a time</title>
        <meta
          name="description"
          content="Build lasting fitness with tiny daily actions, flexible streaks, weekly reviews, and gentle AI nudges. No guilt. Just momentum."
        />
        <link rel="canonical" href={CANON} />

        {/* Preload hero image to keep it high priority without using fetchPriority */}
        <link rel="preload" as="image" href={OG_IMAGE} imageSrcSet={OG_IMAGE} />

        {/* Basic Open Graph */}
        <meta property="og:title" content="Fitterverse – Habit-first fitness" />
        <meta
          property="og:description"
          content="Tiny actions → compounding progress. Join 5,000+ people building fitness the habit-first way."
        />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:width" content={OG_IMAGE_WIDTH} />
        <meta property="og:image:height" content={OG_IMAGE_HEIGHT} />
        <meta property="og:type" content="website" />

        {/* Optional Twitter metadata */}
        <meta name="twitter:card" content="summary_large_image" />
        {/* <meta name="twitter:site" content="@yourhandle" /> */}

        {/* Organization JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Fitterverse",
            url: "https://fitterverse.in",
            sameAs: [
              "https://fitterverse.web.app",
              "https://fitterverse.firebaseapp.com",
            ],
          })}
        </script>

        {/* WebSite JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            url: CANON,
            potentialAction: {
              "@type": "SearchAction",
              target: "https://fitterverse.in/search?q={query}",
              "query-input": "required name=query",
            },
          })}
        </script>

        {/* SoftwareApplication JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Fitterverse",
            applicationCategory: "HealthApplication",
            operatingSystem: "Web",
            url: CANON,
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "INR",
              availability: "https://schema.org/InStock",
            },
          })}
        </script>
      </Helmet>

      {/* HERO */}
      <section className="px-4 sm:px-6 md:px-10 pt-14 pb-10 md:pt-20 md:pb-16 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Copy */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 text-teal-300 px-3 py-1 text-xs font-medium ring-1 ring-teal-400/30">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-400" />
              Behavior-science based
            </span>

            <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
              Get fit by{" "}
              <span className="bg-gradient-to-r from-teal-300 to-sky-300 bg-clip-text text-transparent">
                mastering one habit
              </span>{" "}
              at a time.
            </h1>

            <p className="mt-4 text-slate-300 text-lg">
              Tiny daily actions, flexible streaks, weekly reviews, and gentle
              AI nudges. No guilt. No overwhelm.{" "}
              <span className="text-teal-400">Just momentum.</span>
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                onClick={handleOpenAuth}
                className="w-full sm:w-auto bg-teal-500 hover:bg-teal-400 text-black"
              >
                Get started free
              </Button>

              <a
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-700 px-4 py-2.5 hover:border-slate-500"
              >
                See how it works
              </a>
            </div>

            <p className="mt-3 text-sm text-slate-400">
              ⭐ 4.9/5 satisfaction • No credit card • Cancel anytime
            </p>
          </div>

          {/* Visual */}
          <div>
            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
              <picture>
                <source srcSet={OG_IMAGE} type="image/jpeg" />
                <img
                  src={OG_IMAGE}
                  alt="Healthy habit routine—shoes, mat, and a simple plan"
                  className="h-72 w-full object-cover md:h-[420px]"
                  loading="eager"
                  decoding="async"
                  width={1200}
                  height={800}
                />
              </picture>

              {/* Overlay mini plan */}
              <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                <Card className="bg-slate-900/85 backdrop-blur border-slate-800">
                  <div className="p-4">
                    <div className="text-xs uppercase tracking-wider text-slate-400">
                      Today’s plan
                    </div>
                    <ul className="mt-2 space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-400" />
                        2-min stretch after waking
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-400" />
                        No phone at breakfast
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-400" />
                        10-min walk after lunch
                      </li>
                    </ul>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST / STATS */}
      <section className="px-4 sm:px-6 md:px-10 pb-4 md:pb-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          <Stat label="People transformed" value="5,000+" />
          <Stat label="Avg. satisfaction" value="4.9/5" />
          <Stat label="Countries" value="12+" />
          <Stat label="30-day consistency" value="90%" />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="px-4 sm:px-6 md:px-10 py-10 md:py-14 max-w-6xl mx-auto"
      >
        <h2 className="text-2xl md:text-3xl font-bold">
          How Fitterverse keeps you consistent
        </h2>

        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <Step
            number="1"
            title="Pick your focus"
            text="Choose a simple outcome like ‘feel energized’ or ‘lose 3–5 kg’ and we’ll convert it into small identity-based habits."
            icon="🎯"
          />
          <Step
            number="2"
            title="Get a tiny daily plan"
            text="Start with 1–2 minute actions. Flexible streaks mean you can miss a day without losing your identity or rhythm."
            icon="🧩"
          />
          <Step
            number="3"
            title="Track & review weekly"
            text="A 3-minute weekly check-in calibrates your plan. Progress graphs keep you motivated without guilt."
            icon="📈"
          />
        </div>

        <div className="mt-8">
          <Button
            onClick={handleOpenAuth}
            className="bg-teal-500 hover:bg-teal-400 text-black"
          >
            Start your first habit
          </Button>
        </div>
      </section>

      {/* SCIENCE / DIFFERENTIATION */}
      <section className="px-4 sm:px-6 md:px-10 py-10 md:py-14 max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold">
          Why Fitterverse works (when other apps don’t)
        </h2>

        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <Card className="bg-slate-900/60 border-slate-800">
            <div className="p-5">
              <h3 className="font-semibold">Identity, not willpower</h3>
              <p className="mt-2 text-slate-300 text-sm">
                We design cues, environment and “if-then” plans, so showing up
                becomes part of who you are—not a daily negotiation.
              </p>
            </div>
          </Card>
          <Card className="bg-slate-900/60 border-slate-800">
            <div className="p-5">
              <h3 className="font-semibold">Flexible streaks</h3>
              <p className="mt-2 text-slate-300 text-sm">
                Miss a day? You don’t lose your streak identity. Your chain
                bends, not breaks—keeping motivation intact.
              </p>
            </div>
          </Card>
          <Card className="bg-slate-900/60 border-slate-800">
            <div className="p-5">
              <h3 className="font-semibold">Weekly reflection</h3>
              <p className="mt-2 text-slate-300 text-sm">
                A 3-minute weekly review helps you course-correct early, turning
                tiny wins into compounding progress.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-4 sm:px-6 md:px-10 py-10 md:py-14 max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold">
          Loved by people who thought they “weren’t consistent”
        </h2>

        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <Testimonial
            quote="I stopped yo-yo routines. Two 5-minute habits every morning got me walking again and sleeping better."
            name="Tanvi S."
            role="Product Manager"
          />
          <Testimonial
            quote="The weekly review is magic. I finally see progress without guilt or all-or-nothing thinking."
            name="Aman P."
            role="Founder"
          />
          <Testimonial
            quote="I was ‘too busy’ for workouts. Habit stacking + gentle nudges made it easy to show up daily."
            name="Richa K."
            role="Doctor & mom"
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 sm:px-6 md:px-10 pb-16 max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold">FAQs</h2>
        <div className="mt-6 space-y-3">
          <FAQ
            q="What if I miss a day?"
            a="Nothing breaks. We use flexible streaks so you keep your identity streak while gently resuming the plan."
          />
          <FAQ
            q="How is this different from typical fitness apps?"
            a="We’re habit-first. Tiny actions, environment design, flexible streaks and weekly reflection—so consistency becomes easy."
          />
          <FAQ
            q="Do I need equipment?"
            a="No. You’ll start with actions that fit your life—walking, mobility, hydration, breathwork, simple strength."
          />
          <FAQ
            q="Can I cancel anytime?"
            a="Yes. Getting started is free and you can cancel anytime from settings."
          />
        </div>

        <div className="mt-8">
          <Button
            onClick={handleOpenAuth}
            className="bg-teal-500 hover:bg-teal-400 text-black"
          >
            Get started free
          </Button>
        </div>

        <p className="mt-3 text-sm text-slate-400">
          Trusted by <span className="text-teal-300 font-semibold">5,000+</span>{" "}
          people in <span className="text-teal-300 font-semibold">12+</span>{" "}
          countries. <span className="text-teal-300 font-semibold">90%</span>{" "}
          stick with habits past 30 days.
        </p>
      </section>
    </div>
  );
}

/* ======== Small Presentational Helpers (local to this file) ======== */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="bg-slate-900/60 border-slate-800">
      <div className="p-4 text-center">
        <div className="text-2xl font-bold text-teal-300">{value}</div>
        <div className="mt-1 text-xs text-slate-400">{label}</div>
      </div>
    </Card>
  );
}

function Step({
  number,
  title,
  text,
  icon,
}: {
  number: string;
  title: string;
  text: string;
  icon: string;
}) {
  return (
    <Card className="bg-slate-900/60 border-slate-800">
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/15 ring-1 ring-teal-400/30">
            <span className="text-xl">{icon}</span>
          </div>
          <div className="text-sm text-slate-400">Step {number}</div>
        </div>
        <h3 className="mt-3 font-semibold">{title}</h3>
        <p className="mt-2 text-slate-300 text-sm">{text}</p>
      </div>
    </Card>
  );
}

function Testimonial({
  quote,
  name,
  role,
}: {
  quote: string;
  name: string;
  role: string;
}) {
  return (
    <Card className="bg-slate-900/60 border-slate-800">
      <div className="p-5">
        <p className="text-slate-200">“{quote}”</p>
        <div className="mt-4 flex items-center gap-3">
          <img
            src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(
              name
            )}`}
            alt={name}
            className="h-9 w-9 rounded-full ring-1 ring-slate-700"
            loading="lazy"
            decoding="async"
            width={36}
            height={36}
          />
          <div className="text-sm">
            <div className="font-medium">{name}</div>
            <div className="text-slate-400">{role}</div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <summary className="cursor-pointer list-none font-medium">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-400" />
          {q}
        </span>
      </summary>
      <p className="mt-2 text-sm text-slate-300">{a}</p>
    </details>
  );
}
