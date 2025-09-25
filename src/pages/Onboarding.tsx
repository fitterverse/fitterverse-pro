// src/pages/Onboarding.tsx
import React from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useApp, HabitId } from "../state/appStore";

const HABITS: { id: HabitId; label: string; desc: string; emoji: string }[] = [
  { id: "morning-routine", label: "Morning routine", desc: "2–10 min anchor tasks to start your day right.", emoji: "🌅" },
  { id: "screen-time", label: "Reduce screen time", desc: "Fewer doom-scroll loops, more focused blocks.", emoji: "📵" },
  { id: "exercise", label: "Exercise", desc: "Build a consistent movement habit.", emoji: "💪" },
];

export default function Onboarding() {
  const { profile, setProfile } = useApp();
  const [selected, setSelected] = React.useState<HabitId | null>(profile.habitId ?? null);

  function continueNext() {
    if (!selected) return;
    setProfile({ ...profile, habitId: selected });
    // navigate to next onboarding step or dashboard in your flow
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Choose your first habit</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {HABITS.map((h) => (
          <button
            key={h.id}
            onClick={() => setSelected(h.id)}
            className={`text-left ${selected === h.id ? "ring-2 ring-emerald-500" : ""}`}
          >
            <Card>
              <div className="text-3xl">{h.emoji}</div>
              <div className="mt-3 font-semibold">{h.label}</div>
              <div className="text-slate-400 text-sm">{h.desc}</div>
            </Card>
          </button>
        ))}
      </div>

      <div className="mt-8">
        <Button onClick={continueNext} disabled={!selected}>
          Continue
        </Button>
      </div>
    </div>
  );
}
