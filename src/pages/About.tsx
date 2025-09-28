// src/pages/About.tsx
import React from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero */}
      <section className="px-4 sm:px-6 md:px-10 pt-14 pb-10 md:pt-20 md:pb-12 max-w-5xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
          We’re building the habit-first way to get fit.
        </h1>
        <p className="mt-4 text-slate-300 text-lg">
          Fitterverse replaces guilt-driven tracking with tiny wins, weekly reflection, and plans
          that adapt to your real life.
        </p>
      </section>

      {/* Mission + What we believe */}
      <section className="px-4 sm:px-6 md:px-10 pb-12 max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
        <Card className="bg-slate-900/70 border-slate-800">
          <div className="p-6">
            <h2 className="text-xl font-semibold">Our mission</h2>
            <p className="mt-3 text-slate-300">
              Make consistency effortless for millions of people by focusing on one habit at a time
              and celebrating sustainable progress over perfection.
            </p>
          </div>
        </Card>

        <Card className="bg-slate-900/70 border-slate-800">
          <div className="p-6">
            <h2 className="text-xl font-semibold">What we believe</h2>
            <ul className="mt-3 space-y-2 text-slate-300">
              <li>• Start tiny, grow naturally.</li>
              <li>• Reflection beats shame.</li>
              <li>• Design your environment to win by default.</li>
              <li>• Technology should nudge, not nag.</li>
            </ul>
          </div>
        </Card>
      </section>

      {/* Team snapshot */}
      <section className="px-4 sm:px-6 md:px-10 pb-12 max-w-5xl mx-auto">
        <Card className="bg-slate-900/70 border-slate-800">
          <div className="p-6">
            <h2 className="text-xl font-semibold">Who we are</h2>
            <p className="mt-3 text-slate-300">
              We’re a small, product-obsessed team with backgrounds in behavior design, consumer
              apps, and coaching. We ship fast, listen hard, and favor real-world results over hype.
            </p>

            <div className="mt-6 grid sm:grid-cols-3 gap-4">
              {[
                { name: "Raj", role: "Founder • Product", img: "/images/ava-1.jpg" },
                { name: "Maya", role: "Behavior Design", img: "/images/ava-2.jpg" },
                { name: "Leo", role: "Engineering", img: "/images/ava-3.jpg" },
              ].map((m) => (
                <div key={m.name} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <div className="flex items-center gap-3">
                    <img src={m.img} alt={m.name} className="h-12 w-12 rounded-full object-cover" />
                    <div>
                      <div className="font-semibold">{m.name}</div>
                      <div className="text-xs text-slate-400">{m.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      {/* Values */}
      <section className="px-4 sm:px-6 md:px-10 pb-12 max-w-5xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Our values</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { t: "Clarity", d: "Simple flows. Fewer choices. Less friction." },
            { t: "Compassion", d: "No guilt loops. Encourage, don’t punish." },
            { t: "Evidence", d: "Backed by research, refined by feedback." },
          ].map((v) => (
            <Card key={v.t} className="bg-slate-900/60 border-slate-800">
              <div className="p-5">
                <div className="font-semibold">{v.t}</div>
                <div className="mt-1 text-sm text-slate-300">{v.d}</div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 md:px-10 pb-14 max-w-5xl mx-auto">
        <Card className="bg-gradient-to-r from-emerald-600/10 via-emerald-500/10 to-emerald-600/10 border-emerald-700/30">
          <div className="p-6 md:flex md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold">Ready to build your first habit?</h3>
              <p className="mt-2 text-slate-300">Start free. It takes less than a minute.</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link to="/" className="hidden" aria-hidden />
              <Button
                onClick={() => (window as any)._openAuth?.()}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-900"
              >
                Get started
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
