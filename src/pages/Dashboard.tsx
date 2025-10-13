// src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/state/authStore";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import MiniWalkingCard from "@/components/habits/MiniWalkingCard";
import MiniWorkoutCard from "@/components/habits/MiniWorkoutCard";
import MiniDietCard from "@/components/habits/MiniDietCard";

type UserHabit = {
  id: string;
  uid: string;
  name: string;
  type: string;
  answers?: any;
  createdAt?: any;
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [habits, setHabits] = useState<UserHabit[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const handleAddHabit = () => navigate("/onboarding?mode=add");

  useEffect(() => {
    if (!user) navigate("/", { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setErr(null);

    const q = query(
      collection(db, "user_habits"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const mapDoc = (d: QueryDocumentSnapshot<DocumentData>): UserHabit => ({
      id: d.id,
      ...(d.data() as any),
    });

    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map(mapDoc);
        setHabits(rows);
        setLoading(false);
      },
      (e) => {
        setErr(e?.message || "Failed to load habits");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-8 md:py-10 pb-24">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Your habits{user.displayName ? `, ${user.displayName}` : ""}
            </h1>
            <p className="mt-2 text-slate-300">
              Quick-tap your day or open details for streaks & analytics.
            </p>
          </div>
          <Button onClick={handleAddHabit} className="bg-teal-500 hover:bg-teal-400 text-black">
            + Add habit
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-6">
          {loading && (
            <Card className="bg-slate-900/60 border-slate-800 p-5 md:col-span-3">
              Loading your habits…
            </Card>
          )}

          {!loading && err && (
            <Card className="bg-slate-900/60 border-slate-800 p-5 md:col-span-3">
              <h3 className="font-semibold">Couldn’t load habits</h3>
              <p className="text-slate-300 mt-1 text-sm break-words">{err}</p>
            </Card>
          )}

          {!loading && !err && habits.length === 0 && (
            <Card className="bg-slate-900/60 border-slate-800 p-5 md:col-span-3">
              <h3 className="font-semibold">No habits yet</h3>
              <p className="text-slate-300 mt-1 text-sm">
                Use the + button above to create your first habit.
              </p>
            </Card>
          )}

          {!loading &&
            !err &&
            habits.map((h) => {
              const type = String(h.type || "");

              if (type === "eat_healthy") {
                return (
                  <MiniDietCard
                    key={h.id}
                    habitId={h.id}
                    name={h.name || "Eat healthy"}
                    onOpen={() => navigate(`/habit/${h.id}`)}
                  />
                );
              }

              if (type === "walking_10k") {
                return (
                  <MiniWalkingCard
                    key={h.id}
                    habitId={h.id}
                    name={h.name || "Walking"}
                    target={Number(h.answers?.steps || 7000)}
                    onOpen={() => navigate(`/habit/${h.id}`)}
                  />
                );
              }

              if (type === "workout") {
                return (
                  <MiniWorkoutCard
                    key={h.id}
                    habitId={h.id}
                    name={h.name || "Workout"}
                    targetDays={Math.max(1, Math.min(7, Number(h.answers?.workoutDays || 3)))}
                    onOpen={() => navigate(`/habit/${h.id}`)}
                  />
                );
              }

              // Fallback generic card
              return (
                <Card
                  key={h.id}
                  className="bg-slate-900/60 border-slate-800 p-5 hover:border-slate-700 cursor-pointer"
                  onClick={() => navigate(`/habit/${h.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{h.name}</h3>
                      <p className="text-slate-400 text-sm mt-1">
                        Type: {type.split("_").join(" ")}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400">Open</span>
                  </div>
                </Card>
              );
            })}
        </div>
      </section>
    </div>
  );
}
