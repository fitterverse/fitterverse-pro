// src/pages/Onboarding.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { Helmet } from "react-helmet-async";
import { db } from "@/lib/firebase";
import { useAuth } from "@/state/authStore";
import { useAppStore } from "@/state/appStore";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type Answers = Record<string, any>;

type HabitOption = {
  type: "eat_healthy" | "workout" | "walking_10k";
  name: string;
};

/** ✅ Only these 3 habits are allowed */
const HABIT_OPTIONS: HabitOption[] = [
  { type: "eat_healthy", name: "Eat healthy" },
  { type: "workout", name: "Workout" },
  { type: "walking_10k", name: "Walking (10k steps)" },
];

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const mode = params.get("mode") === "add" ? "add" : "first";

  // onboarding store
  const markOnboarded = useAppStore((s) => s.markOnboarded);

  // form state
  const [selectedType, setSelectedType] = useState<HabitOption["type"] | "">("");
  const [answers, setAnswers] = useState<Answers>({});
  const [saving, setSaving] = useState(false);

  // existing state
  const [existingTypes, setExistingTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // 🔁 One-time migration: if older builds set localStorage flag, copy it into the new store
  useEffect(() => {
    if (!user) return;
    try {
      const legacyKey = `fv_onboarded_${user.uid}`;
      if (localStorage.getItem(legacyKey) === "1") {
        markOnboarded(user.uid);
      }
    } catch {}
  }, [user, markOnboarded]);

  // Load user's existing habits (types only)
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, "user_habits"),
          where("uid", "==", user.uid)
        );
        const snap = await getDocs(q);
        const types: string[] = [];
        snap.forEach((d) => {
          const data = d.data() as any;
          if (data?.type) types.push(String(data.type));
        });
        setExistingTypes(types);
      } catch (e: any) {
        setErr(e?.message || "Could not load your habits.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // Filter options in add-mode to exclude already-created types
  const filteredOptions = useMemo(() => {
    if (mode !== "add") return HABIT_OPTIONS;
    return HABIT_OPTIONS.filter((o) => !existingTypes.includes(o.type));
  }, [mode, existingTypes]);

  const maxReached = existingTypes.length >= 3;
  const duplicateSelected =
    !!selectedType && existingTypes.includes(String(selectedType));

  const canSave =
    !!selectedType && !saving && !maxReached && !duplicateSelected;

  // Minimal dynamic questions just to keep structure (you can expand later)
  const renderDynamicQuestions = () => {
    if (!selectedType) return null;

    if (selectedType === "eat_healthy") {
      return (
        <div className="space-y-3">
          <label className="block text-sm text-slate-300">Diet preference</label>
          <select
            className="input"
            value={answers.diet ?? ""}
            onChange={(e) =>
              setAnswers((s) => ({ ...s, diet: e.target.value }))
            }
          >
            <option value="">Select</option>
            <option value="veg">Vegetarian</option>
            <option value="nonveg">Non-vegetarian</option>
            <option value="vegan">Vegan</option>
          </select>
        </div>
      );
    }

    if (selectedType === "workout") {
      return (
        <div className="space-y-3">
          <label className="block text-sm text-slate-300">Target days/week</label>
          <input
            type="number"
            min={1}
            max={7}
            className="input"
            value={answers.days ?? ""}
            onChange={(e) =>
              setAnswers((s) => ({
                ...s,
                days: Number(e.target.value || 0),
              }))
            }
          />
        </div>
      );
    }

    if (selectedType === "walking_10k") {
      return (
        <div className="space-y-3">
          <label className="block text-sm text-slate-300">Daily step target</label>
          <input
            type="number"
            min={1000}
            max={30000}
            className="input"
            value={answers.steps ?? 10000}
            onChange={(e) =>
              setAnswers((s) => ({
                ...s,
                steps: Number(e.target.value || 0),
              }))
            }
          />
        </div>
      );
    }

    return null;
  };

  const handleSave = async () => {
    if (!user || saving || !selectedType) return;

    setSaving(true);
    setErr(null);

    try {
      // 🔁 Defensive recheck just before saving
      const reQ = query(
        collection(db, "user_habits"),
        where("uid", "==", user.uid)
      );
      const reSnap = await getDocs(reQ);
      const typesNow: string[] = [];
      reSnap.forEach((d) => {
        const data = d.data() as any;
        if (data?.type) typesNow.push(String(data.type));
      });

      if (typesNow.length >= 3) {
        setErr("You already have 3 habits. Remove one before adding another.");
        setSaving(false);
        return;
      }
      if (typesNow.includes(selectedType)) {
        setErr("You already have this habit. Choose a different one.");
        setSaving(false);
        return;
      }

      const meta = HABIT_OPTIONS.find((o) => o.type === selectedType)!;

      await addDoc(collection(db, "user_habits"), {
        uid: user.uid,
        type: meta.type,
        name: meta.name,
        answers,
        createdAt: serverTimestamp(),
      });

      // ✅ Mark onboarded in the new store
      try {
        markOnboarded(user.uid);
      } catch {}

      // (optional) keep legacy flag set for backward compatibility
      try {
        localStorage.setItem(`fv_onboarded_${user.uid}`, "1");
      } catch {}

      navigate("/dashboard", { replace: true });
    } catch (e: any) {
      console.error(e);
      setErr(e?.message || "Could not save habit. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Helmet>
        <title>{mode === "add" ? "Add a habit" : "Choose your first habit"} | Fitterverse</title>
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href="https://fitterverse.in/onboarding" />
      </Helmet>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 md:px-10 py-8 md:py-10">
        <Card className="bg-slate-900/70 border-slate-800 p-5">
          <h1 className="text-2xl md:text-3xl font-bold">
            {mode === "add" ? "Add a habit" : "Choose your first habit"}
          </h1>

          <p className="mt-2 text-slate-300">
            You can have up to <strong>3 habits</strong>. No duplicates.
          </p>

          {existingTypes.length >= 3 && (
            <div className="mt-4 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
              You already have 3 habits. Remove one in the dashboard to add another.
            </div>
          )}

          <div className="mt-5 space-y-3">
            <label className="block text-sm text-slate-300">Habit</label>
            <select
              className="input"
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value as HabitOption["type"]);
                setAnswers({});
              }}
              disabled={existingTypes.length >= 3 || loading}
            >
              <option value="">Select a habit</option>
              {filteredOptions.map((opt) => (
                <option key={opt.type} value={opt.type}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>

          {!!selectedType && existingTypes.includes(String(selectedType)) && (
            <div className="mt-3 text-sm text-rose-300">
              You already have this habit. Pick another one.
            </div>
          )}

          {selectedType && (
            <div className="mt-6">
              <h3 className="font-semibold">Quick setup</h3>
              <div className="mt-3">{renderDynamicQuestions()}</div>
            </div>
          )}

          {err && (
            <div className="mt-4 rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {err}
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <Button onClick={() => navigate("/dashboard")} variant="ghost">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                !selectedType ||
                saving ||
                existingTypes.length >= 3 ||
                (!!selectedType && existingTypes.includes(String(selectedType)))
              }
              className="bg-teal-500 hover:bg-teal-400 text-black"
            >
              {saving ? "Saving…" : "Save habit"}
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
