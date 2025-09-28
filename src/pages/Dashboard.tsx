// src/pages/Dashboard.tsx
import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/state/authStore";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Key we’ll use to detect onboarding completion.
  const onboardKey = useMemo(
    () => (user?.uid ? `fv_onboarded_${user.uid}` : null),
    [user?.uid]
  );

  useEffect(() => {
    if (!user) return;

    // If onboarding has not been marked done, send to onboarding
    if (onboardKey && localStorage.getItem(onboardKey) !== "1") {
      navigate("/onboarding", { replace: true });
    }
  }, [user, onboardKey, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <Card className="bg-slate-900/70 border-slate-800 p-6 max-w-md text-center">
          <h1 className="text-xl font-semibold">You’re logged out</h1>
          <p className="mt-2 text-slate-300">Please sign in to view your dashboard.</p>
          <Button onClick={() => navigate("/") } className="mt-4">Go to home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-12">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Welcome back{user.displayName ? `, ${user.displayName}` : ""}!</h1>
            <p className="mt-2 text-slate-300">
              Here’s an overview of your habits and progress.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/onboarding")} variant="ghost">Edit plan</Button>
            <Button onClick={() => navigate("/blog")} className="bg-teal-500 hover:bg-teal-400 text-black">
              Habit tips
            </Button>
          </div>
        </div>

        {/* SUMMARY CARDS (placeholders for now – ready for real data) */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <Card className="bg-slate-900/60 border-slate-800 p-5">
            <h3 className="font-semibold">Today</h3>
            <p className="mt-2 text-3xl font-bold">1 / 1</p>
            <p className="text-slate-400 text-sm mt-1">habits done</p>
          </Card>
          <Card className="bg-slate-900/60 border-slate-800 p-5">
            <h3 className="font-semibold">This week</h3>
            <p className="mt-2 text-3xl font-bold">6 / 7</p>
            <p className="text-slate-400 text-sm mt-1">targets completed</p>
          </Card>
          <Card className="bg-slate-900/60 border-slate-800 p-5">
            <h3 className="font-semibold">Consistency</h3>
            <p className="mt-2 text-3xl font-bold">86%</p>
            <p className="text-slate-400 text-sm mt-1">last 30 days</p>
          </Card>
        </div>

        {/* CHART AREA – stubbed container so we can plug in real charts later */}
        <div className="grid lg:grid-cols-3 gap-4 mt-6">
          <Card className="bg-slate-900/60 border-slate-800 p-5 lg:col-span-2">
            <h3 className="font-semibold">Weekly trend</h3>
            <div className="mt-4 h-48 rounded-xl bg-slate-800/50 border border-slate-800 flex items-center justify-center text-slate-400">
              {/* Replace with real chart (Recharts) when data is wired */}
              Chart placeholder
            </div>
          </Card>
          <Card className="bg-slate-900/60 border-slate-800 p-5">
            <h3 className="font-semibold">Top habit</h3>
            <p className="mt-2 text-slate-300">Morning walk</p>
            <div className="mt-3 h-2 rounded-full bg-slate-800">
              <div className="h-2 rounded-full bg-teal-500" style={{ width: "72%" }} />
            </div>
            <p className="text-slate-400 text-sm mt-2">72% done this month</p>
          </Card>
        </div>

        {/* CTA */}
        <Card className="bg-slate-900/60 border-slate-800 p-5 mt-6">
          <div className="md:flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Keep the streak alive 🔥</h3>
              <p className="text-slate-300 mt-1 text-sm">
                Do one small action now to move forward.
              </p>
            </div>
            <div className="mt-3 md:mt-0">
              <Button onClick={() => navigate("/onboarding")}>Adjust schedule</Button>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
