// src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  Query,
  FirestoreError,
} from "firebase/firestore";
import { db, serverTimestampCompat } from "@/lib/firebase";
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
  const [indexWarn, setIndexWarn] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const handleAddHabit = () => navigate("/onboarding?mode=add");

  useEffect(() => {
    if (!user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setErr(null);
    setIndexWarn(null);

    const q: Query = query(
      collection(db, "user_habits"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: UserHabit[] = [];
        snap.forEach((d) => rows.push({ id: d.id, ...(d.data() as any) }));
        setHabits(rows);
        setLoading(false);
        setErr(null);
        setIndexWarn(null); // clear once index is live
      },
      (e: FirestoreError) => {
        // If the composite index is missing, Firestore throws failed-precondition.
        if (e.code === "failed-precondition") {
          setIndexWarn(
            "Missing Firestore index. We’re temporarily sorting on the client. Create the index (uid ASC, createdAt DESC) for best performance."
          );
        } else {
          setErr(e.message || "Failed to load habits");
        }
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-8 md:py-10">
        <h1 className="text-2xl md:text-3xl font-bold">
          Your habits{user.displayName ? `, ${user.displayName}` : ""}
        </h1>
        <p className="mt-2 text-slate-300">
          Tap a habit to view progress, streaks, and reviews.
        </p>

        {/* Optional, temporary banner if index is still building */}
        {indexWarn && (
          <Card className="bg-amber-500/10 border-amber-500/40 text-amber-200 p-4 mt-6">
            <strong className="block mb-1">Missing Firestore index</strong>
            <span className="text-sm">
              {indexWarn} —{" "}
              <a
                href="https://console.firebase.google.com/v1/r/project/fitterverse/firestore/indexes?create_composite=Ck9wcm9qZWN0cy9maXR0ZXJ2ZXJzZS9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvdXNlcl9oYWJpdHMvaW5kZXhlcy9fEAEaBwoDdWlkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                click here to create the index
              </a>
              , then refresh.
            </span>
          </Card>
        )}

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
                Use the + button to create your first habit.
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
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{h.name}</h3>
                    <p className="text-slate-400 text-sm mt-1">
                      Type: {String(h.type || "").replaceAll("_", " ")}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400">View</span>
                </div>
              </Card>
            ))}
        </div>
      </section>

      {/* Floating action button */}
      <button
        onClick={handleAddHabit}
        className="fixed right-4 bottom-20 sm:right-6 sm:bottom-6 rounded-full bg-teal-500 hover:bg-teal-400 text-black px-6 py-4 text-lg font-semibold shadow-lg"
      >
        + Add habit
      </button>
    </div>
  );
}
