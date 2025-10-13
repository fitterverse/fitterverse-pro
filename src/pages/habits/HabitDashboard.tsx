// src/pages/habits/HabitDashboard.tsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/state/authStore";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import DietHabitCard from "@/components/DietHabitCard";
import WalkingHabitCard from "@/components/WalkingHabitCard";
import WorkoutHabitCard from "@/components/WorkoutHabitCard";

export default function HabitDashboard() {
  const { habitId } = useParams<{ habitId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [habit, setHabit] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      if (!user || !habitId) return;
      // READ from user_habits/{habitId}
      const ref = doc(db, "user_habits", habitId);
      const snap = await getDoc(ref);
      if (snap.exists()) setHabit({ id: snap.id, ...snap.data() });
      setLoading(false);
    })();
  }, [user, habitId]);

  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-950 text-slate-100">
        <Card className="p-6 bg-slate-900/70 border-slate-800 max-w-md text-center">
          <h1 className="text-lg font-semibold">Please sign in</h1>
          <Button onClick={() => navigate("/") } className="mt-4">Go to Home</Button>
        </Card>
      </div>
    );
  }

  if (loading) return <div className="min-h-screen grid place-items-center text-slate-300">Loading…</div>;
  if (!habit) return <div className="min-h-screen grid place-items-center text-slate-300">Habit not found.</div>;

  const type = String(habit.type || "");
  const answers = (habit.answers || {}) as any;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <section className="max-w-5xl mx-auto px-4 sm:px-6 md:px-10 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {habit.emoji ?? (type === "eat_healthy" ? "🥗" : type === "walking_10k" ? "🚶" : "🏋️")}{" "}
              {habit.name || "Habit"}
            </h1>
            <p className="text-slate-300 mt-1 text-sm">Your personalized habit hub</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>All habits</Button>
            <Button onClick={() => navigate("/onboarding?mode=add")}>Add another habit</Button>
          </div>
        </div>

        {/* Render the specific habit card */}
        {type === "eat_healthy" && (
          <DietHabitCard habitId={habit.id} onOpenTracker={() => { /* future: open food pdfs/recipes */ }} />
        )}

        {type === "walking_10k" && (
          <WalkingHabitCard habitId={habit.id} target={Number(answers.steps || 7000)} />
        )}

        {type === "workout" && (
          <WorkoutHabitCard habitId={habit.id} targetDays={Math.max(1, Math.min(7, Number(answers.workoutDays || 3)))} />
        )}
      </section>
    </div>
  );
}
