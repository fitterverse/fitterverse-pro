// src/pages/Home.tsx
import React from "react";
import { Link } from "react-router-dom";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useAuth } from "@/state/authStore";

export default function Home() {
  const openAuthModal = useAuth((s) => s.openAuthModal);

  const handleOpenAuth: React.MouseEventHandler<
    HTMLButtonElement | HTMLAnchorElement
  > = (e) => {
    e.preventDefault();
    openAuthModal();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* HERO */}
      <section className="px-4 sm:px-6 md:px-10 pt-14 pb-10 md:pt-20 md:pb-16 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
              Build habits that actually stick.
            </h1>
            <p className="mt-4 text-slate-300 text-lg">
              Fitterverse is the <span className="text-teal-400">habit-first</span> way to get fit —
              tiny daily actions, AI nudges, and accountability that compounds.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                onClick={handleOpenAuth}
                className="w-full sm:w-auto bg-teal-500 hover:bg-teal-400 text-black"
              >
                Get started free
              </Button>

              <a
                href="/#start"
                onClick={handleOpenAuth}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-700 px-4 py-2.5 hover:border-slate-500"
              >
                Log in
              </a>
            </div>

            <p className="mt-3 text-sm text-slate-400">
              No credit card. Cancel anytime.
            </p>
          </div>

          <div>
            <Card className="bg-slate-900/60 border-slate-800">
              <div className="p-4 md:p-6">
                <p className="text-slate-300">
                  “I struggled with consistency. Fitterverse finally made it easy to show up daily.”
                </p>
                <div className="mt-4 text-sm text-slate-400">— Early access user</div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* HOW WE'RE DIFFERENT */}
      <section className="px-4 sm:px-6 md:px-10 py-10 md:py-14 max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold">Why Fitterverse vs. normal fitness apps?</h2>

        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <Card className="bg-slate-900/60 border-slate-800">
            <div className="p-4 md:p-6">
              <h3 className="font-semibold">Typical apps</h3>
              <ul className="mt-3 space-y-2 text-slate-300 text-sm">
                <li>• Big plans, hard to sustain</li>
                <li>• Streaks break → motivation drops</li>
                <li>• Generic programs</li>
              </ul>
            </div>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800">
            <div className="p-4 md:p-6">
              <h3 className="font-semibold">Fitterverse (habit-first)</h3>
              <ul className="mt-3 space-y-2 text-slate-300 text-sm">
                <li>• Tiny daily actions you’ll actually do</li>
                <li>• AI nudges + flexible streaks</li>
                <li>• Plans that adapt to your life</li>
              </ul>
            </div>
          </Card>
        </div>

        <div className="mt-6">
          <Button onClick={handleOpenAuth} className="bg-teal-500 hover:bg-teal-400 text-black">
            Start building your first habit
          </Button>
        </div>
      </section>

      {/* STILL CONFUSED */}
      <section className="px-4 sm:px-6 md:px-10 py-10 md:py-14 max-w-6xl mx-auto">
        <Card className="bg-slate-900/60 border-slate-800">
          <div className="p-4 md:p-6 md:flex md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold">Still unsure?</h3>
              <p className="mt-2 text-slate-300">
                Try it free for a week. Build one habit. If you don’t love it, walk away.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link
                to="/#try"
                onClick={handleOpenAuth}
                className="inline-flex items-center justify-center rounded-xl bg-white text-slate-900 font-medium px-5 py-2.5 hover:bg-white/90"
              >
                Try free
              </Link>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
