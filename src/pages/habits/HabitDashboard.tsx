// src/pages/habits/HabitDashboard.tsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/state/authStore";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function HabitDashboard() {
  const { habitId } = useParams<{ habitId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [habit, setHabit] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      if (!user || !habitId) return;
      const ref = doc(db, "users", user.uid, "habits", habitId);
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

  if (loading) {
    return <div className="min-h-screen grid place-items-center text-slate-300">Loading…</div>;
  }

  if (!habit) {
    return (
      <div className="min-h-screen grid place-items-center text-slate-300">
        Habit not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <section className="max-w-5xl mx-auto px-4 sm:px-6 md:px-10 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {habit.emoji ?? "🏁"} {habit.label}
            </h1>
            <p className="text-slate-300 mt-1 text-sm">Your personalized habit hub</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>All habits</Button>
            <Button onClick={() => navigate("/onboarding")}>Add another habit</Button>
          </div>
        </div>

        {/* Streak / analytics placeholders, ready for data */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-5 bg-slate-900/60 border-slate-800">
            <h3 className="font-semibold">Streak</h3>
            <p className="mt-2 text-3xl font-bold">3 days</p>
          </Card>
          <Card className="p-5 bg-slate-900/60 border-slate-800">
            <h3 className="font-semibold">Consistency (30d)</h3>
            <p className="mt-2 text-3xl font-bold">78%</p>
          </Card>
          <Card className="p-5 bg-slate-900/60 border-slate-800">
            <h3 className="font-semibold">This week</h3>
            <p className="mt-2 text-3xl font-bold">4 / 5</p>
          </Card>
        </div>

        {/* Journal + quick log (MVP placeholders) */}
        <Card className="p-5 bg-slate-900/60 border-slate-800">
          <h3 className="font-semibold">Today</h3>
          <p className="text-slate-300 mt-2 text-sm">
            We’ll put the fast logging controls here (checkboxes / steppers / segmented controls)
            tailored to <span className="font-medium">{habit.label}</span>.
          </p>
          <div className="mt-4">
            <Button className="bg-teal-500 hover:bg-teal-400 text-black">Save for today</Button>
          </div>
        </Card>

        <Card className="p-5 bg-slate-900/60 border-slate-800">
          <h3 className="font-semibold">Notes / Journal</h3>
          <textarea className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2" rows={4} placeholder="How did it go today?" />
          <div className="mt-3 flex justify-end">
            <Button variant="ghost">Save note</Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
