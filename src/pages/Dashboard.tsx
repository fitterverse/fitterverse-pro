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

type UserHabit = {
  id: string;
  uid: string;
  name: string;
  type: string;
  createdAt?: any;
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [habits, setHabits] = useState<UserHabit[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const handleAddHabit = () => navigate("/onboarding?mode=add");

  // If no user, go back to home (marketing). Render nothing during redirect.
  useEffect(() => {
    if (!user) navigate("/", { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setErr(null);

    // Requires composite index: (uid ASC, createdAt DESC)
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
        <h1 className="text-2xl md:text-3xl font-bold">
          Your habits{user.displayName ? `, ${user.displayName}` : ""}
        </h1>
        <p className="mt-2 text-slate-300">
          Tap a habit to view progress, streaks, and reviews.
        </p>

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
                Use the + button below to create your first habit.
              </p>
            </Card>
          )}

          {!loading &&
            !err &&
            habits.map((h) => (
              <Card
                key={h.id}
                className="bg-slate-900/60 border-slate-800 p-5 hover:border-slate-700 cursor-pointer"
                onClick={() => navigate(`/habit/${h.id}`)}
                role="button"
                aria-label={`Open ${h.name}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{h.name}</h3>
                    <p className="text-slate-400 text-sm mt-1">
                      Type: {String(h.type || "").split("_").join(" ")}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400">View</span>
                </div>
              </Card>
            ))}
        </div>
      </section>

      {/* Floating action button (single CTA) */}
      <button
        onClick={handleAddHabit}
        className="fixed right-4 bottom-20 sm:right-6 sm:bottom-6 z-50 rounded-full bg-teal-500 hover:bg-teal-400 text-black px-6 py-4 text-lg font-semibold shadow-lg"
        aria-label="Add habit"
      >
        + Add habit
      </button>
    </div>
  );
}
