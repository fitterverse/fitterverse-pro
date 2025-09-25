// src/pages/Onboarding.tsx
import React from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useApp } from "../state/appStore";

const HABITS = [
  { id: "morning-routine", label: "Morning routine", emoji: "🌅" },
  { id: "screen-time", label: "Reduce screen time", emoji: "📵" },
  { id: "exercise", label: "Exercise daily", emoji: "💪" },
  { id: "workout", label: "Workout plan", emoji: "🏋️" },
  { id: "eat-healthy", label: "Eat a healthy diet", emoji: "🥗" },
  { id: "walk-10k", label: "Walk 10k steps", emoji: "🚶‍♂️" },
] as const;

export default function Onboarding() {
  const { profile, setProfile, ensureTodayPlan } = useApp();
  const [selected, setSelected] = React.useState<string>(profile.habitId ?? "");

  function next() {
    if (!selected) return;
    // ✅ persist habitId on profile
    setProfile({ habitId: selected as any });
    // create today plan so dashboard has content
    ensureTodayPlan();
    // simple route-forward (replace with navigate if using react-router hooks)
    window.location.href = "/dashboard";
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Choose your first habit</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        {HABITS.map((h) => (
          <button
            key={h.id}
            onClick={() => setSelected(h.id)}
            className={`text-left rounded-xl border p-4 transition ${
              selected === h.id ? "border-emerald-500 bg-emerald-500/10" : "border-slate-800 bg-slate-900"
            }`}
          >
            <div className="text-2xl">{h.emoji}</div>
            <div className="mt-2 font-semibold">{h.label}</div>
          </button>
        ))}
      </div>

      <Card className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-400">Selected</div>
            <div className="font-semibold">
              {selected ? HABITS.find((h) => h.id === selected)?.label : "—"}
            </div>
          </div>
          <Button onClick={next} disabled={!selected}>
            Start plan
          </Button>
        </div>
      </Card>
    </div>
  );
}
