// src/pages/Pricing.tsx
import React from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/state/authStore";

function inr(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export default function Pricing() {
  const { openAuthModal } = useAuth();

  const [billing, setBilling] = React.useState<"monthly" | "annual">("monthly");
  const [monthlyPrice, setMonthlyPrice] = React.useState(299); // default middle value
  const min = 99;
  const max = 999;

  const annualPayNow = monthlyPrice * 10; // 2 months free (pay 10×)
  const effectiveMonthlyOnAnnual = Math.round(annualPayNow / 12);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header band */}
      <section className="px-4 sm:px-6 md:px-10 pt-12 pb-6 max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold">Choose your price</h1>
        <p className="mt-2 text-slate-300">
          You set the value. Pay monthly from {inr(min)}–{inr(max)}, or pick annual and get <span className="text-emerald-400">2 months free</span>.
        </p>
      </section>

      {/* Pricing controls */}
      <section className="px-4 sm:px-6 md:px-10 pb-12 max-w-4xl mx-auto">
        <Card className="bg-slate-900/70 border-slate-800">
          <div className="p-6">
            {/* Billing toggle */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="text-sm text-slate-400">Billing</div>
              <div className="inline-flex rounded-xl overflow-hidden border border-slate-800">
                <button
                  onClick={() => setBilling("monthly")}
                  className={`px-4 py-2 text-sm ${billing === "monthly" ? "bg-emerald-500 text-slate-900" : "bg-slate-900 text-slate-200 hover:bg-slate-800"}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBilling("annual")}
                  className={`px-4 py-2 text-sm ${billing === "annual" ? "bg-emerald-500 text-slate-900" : "bg-slate-900 text-slate-200 hover:bg-slate-800"}`}
                >
                  Annual (2 months free)
                </button>
              </div>
            </div>

            {/* Slider */}
            <div className="mt-6">
              <div className="flex items-end justify-between">
                <label htmlFor="price" className="font-semibold">
                  {billing === "monthly" ? "Your monthly price" : "Set your base monthly (for annual)"}
                </label>
                <div className="text-sm text-slate-400">
                  Range: {inr(min)}–{inr(max)}
                </div>
              </div>

              <input
                id="price"
                type="range"
                min={min}
                max={max}
                step={10}
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(parseInt(e.target.value, 10))}
                className="mt-3 w-full accent-emerald-500"
              />

              {/* Numbers */}
              <div className="mt-5 grid sm:grid-cols-3 gap-4">
                {/* Chosen monthly */}
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <div className="text-xs text-slate-400">Chosen monthly</div>
                  <div className="mt-1 text-2xl font-extrabold">{inr(monthlyPrice)}</div>
                </div>

                {/* If monthly plan */}
                {billing === "monthly" && (
                  <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                    <div className="text-xs text-slate-400">Billed now</div>
                    <div className="mt-1 text-2xl font-extrabold">{inr(monthlyPrice)}</div>
                    <div className="mt-1 text-xs text-slate-400">Renews monthly</div>
                  </div>
                )}

                {/* If annual plan */}
                {billing === "annual" && (
                  <>
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                      <div className="text-xs text-slate-400">Pay now (annual)</div>
                      <div className="mt-1 text-2xl font-extrabold">{inr(annualPayNow)}</div>
                      <div className="mt-1 text-xs text-emerald-400">2 months free</div>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                      <div className="text-xs text-slate-400">Effective monthly</div>
                      <div className="mt-1 text-2xl font-extrabold">{inr(effectiveMonthlyOnAnnual)}</div>
                      <div className="mt-1 text-xs text-slate-400">12-month average</div>
                    </div>
                  </>
                )}
              </div>

              {/* CTA */}
              <div className="mt-6">
                <Button
                  onClick={openAuthModal}
                  className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-900"
                >
                  Continue — create my account
                </Button>
                <p className="mt-2 text-xs text-slate-500">
                  You won’t be charged yet. We’ll confirm details after onboarding.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* What you get */}
        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          {[
            { title: "Habit-first plan", desc: "One focus habit, tiny steps, flexible streaks." },
            { title: "Weekly reviews", desc: "3–5 min reflection that compounds progress." },
            { title: "AI nudges", desc: "Gentle, timely reminders (no guilt trips)." },
          ].map((f) => (
            <Card key={f.title} className="bg-slate-900/60 border-slate-800">
              <div className="p-5">
                <div className="font-semibold">{f.title}</div>
                <div className="mt-1 text-sm text-slate-300">{f.desc}</div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
