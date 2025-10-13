// src/components/DietMealTracker.tsx
import React from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type MealKey = "breakfast" | "lunch" | "dinner";
type MealStatus = "yes" | "partial" | "no" | "skip";

const ORDER: MealStatus[] = ["yes", "partial", "no", "skip"];

function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function DietMealTracker({ habitId }: { habitId: string }) {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [meals, setMeals] = React.useState<Record<MealKey, MealStatus>>({
    breakfast: "skip",
    lunch: "skip",
    dinner: "skip",
  });

  const tkey = todayKey();

  // Load today's log to prefill
  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const ref = doc(db, "user_habits", habitId, "logs", tkey);
        const snap = await getDoc(ref);
        const data = snap.data() as any;
        if (data?.meals) {
          setMeals((prev) => ({
            breakfast: (data.meals.breakfast as MealStatus) ?? prev.breakfast,
            lunch: (data.meals.lunch as MealStatus) ?? prev.lunch,
            dinner: (data.meals.dinner as MealStatus) ?? prev.dinner,
          }));
        }
      } catch (e: any) {
        setErr(e?.message || "Failed to load today’s meals.");
      } finally {
        setLoading(false);
      }
    })();
  }, [habitId, tkey]);

  const cycle = (k: MealKey) => {
    setMeals((s) => {
      const idx = ORDER.indexOf(s[k]);
      const next = ORDER[(idx + 1) % ORDER.length];
      return { ...s, [k]: next };
    });
  };

  const save = async () => {
    try {
      setSaving(true);
      setErr(null);
      const ref = doc(db, "user_habits", habitId, "logs", tkey);
      await setDoc(
        ref,
        {
          localDate: tkey,
          meals: meals,
          ts: Date.now(),
        },
        { merge: true }
      );
    } catch (e: any) {
      setErr(e?.message || "Could not save meals.");
    } finally {
      setSaving(false);
    }
  };

  const renderChip = (k: MealKey, label: string) => {
    const val = meals[k];
    const cls =
      val === "yes"
        ? "bg-emerald-500/20 border-emerald-500/40"
        : val === "partial"
        ? "bg-yellow-500/20 border-yellow-500/40"
        : val === "no"
        ? "bg-red-500/20 border-red-500/40"
        : "bg-slate-800/60 border-slate-700";

    return (
      <button
        type="button"
        className={`rounded-xl border px-3 py-2 text-left ${cls}`}
        onClick={() => cycle(k)}
        title="Tap to cycle: Yes → Partial → No → Skip"
      >
        <div className="text-xs text-slate-400">{label}</div>
        <div className="font-semibold capitalize mt-0.5">{val}</div>
      </button>
    );
  };

  return (
    <div className="mt-5">
      <h3 className="font-semibold">Meals today</h3>
      <p className="text-slate-400 text-sm mt-1">
        Tap to cycle: <span className="font-mono">Yes → Partial → No → Skip</span>
      </p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {renderChip("breakfast", "Breakfast")}
        {renderChip("lunch", "Lunch")}
        {renderChip("dinner", "Dinner")}
      </div>

      {err && (
        <div className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {err}
        </div>
      )}

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-3 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-black"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
