// src/pages/Onboarding.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { addDoc, collection, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/state/authStore";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

/** Master list of habit options (expand later) */
const HABIT_OPTIONS = [
  { type: "eat_healthy", name: "Eat healthy" },
  { type: "wake_early", name: "Wake up early" },
  { type: "daily_walk", name: "Daily walk" },
  { type: "deep_work", name: "Deep work (2h)" },
  { type: "sleep_7_8h", name: "Sleep 7–8 hours" },
];

type Answers = Record<string, any>;

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [existingTypes, setExistingTypes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const mode = params.get("mode") === "add" ? "add" : "first";

  // Form state
  const [selectedType, setSelectedType] = useState<string>("");
  const [answers, setAnswers] = useState<Answers>({});

  // Load already created habit types to filter options in add-mode
  useEffect(() => {
    if (!user) return;
    (async () => {
      const q = query(collection(db, "user_habits"), where("uid", "==", user.uid));
      const snap = await getDocs(q);
      const types: string[] = [];
      snap.forEach((d) => {
        const data = d.data() as any;
        if (data?.type) types.push(data.type);
      });
      setExistingTypes(types);
    })();
  }, [user]);

  const filteredOptions = useMemo(() => {
    if (mode !== "add") return HABIT_OPTIONS;
    return HABIT_OPTIONS.filter((o) => !existingTypes.includes(o.type));
  }, [mode, existingTypes]);

  // Simple habit-specific short form
  const renderDynamicQuestions = () => {
    if (!selectedType) return null;

    if (selectedType === "eat_healthy") {
      return (
        <div className="space-y-3">
          <label className="block text-sm text-slate-300">Main challenge</label>
          <select
            className="input"
            value={answers.challenge ?? ""}
            onChange={(e) => setAnswers((s) => ({ ...s, challenge: e.target.value }))}
          >
            <option value="">Select</option>
            <option value="sweets">Sweet cravings</option>
            <option value="ordering">End up ordering food</option>
            <option value="binge">Binge at night</option>
            <option value="social">Social meals derail me</option>
          </select>

          <label className="block text-sm text-slate-300">Diet preference</label>
          <select
            className="input"
            value={answers.diet ?? ""}
            onChange={(e) => setAnswers((s) => ({ ...s, diet: e.target.value }))}
          >
            <option value="">Select</option>
            <option value="veg">Vegetarian</option>
            <option value="nonveg">Non-vegetarian</option>
            <option value="vegan">Vegan</option>
          </select>

          <label className="block text-sm text-slate-300">Meals per day</label>
          <input
            type="number"
            min={1}
            max={6}
            className="input"
            value={answers.meals ?? ""}
            onChange={(e) => setAnswers((s) => ({ ...s, meals: Number(e.target.value || 0) }))}
          />

          <label className="block text-sm text-slate-300">Plan style</label>
          <select
            className="input"
            value={answers.plan ?? ""}
            onChange={(e) => setAnswers((s) => ({ ...s, plan: e.target.value }))}
          >
            <option value="">Select</option>
            <option value="if">Intermittent fasting</option>
            <option value="omad">OMAD</option>
            <option value="three">3 meals/day</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      );
    }

    if (selectedType === "wake_early") {
      return (
        <div className="space-y-3">
          <label className="block text-sm text-slate-300">Target wake time</label>
          <input
            type="time"
            className="input"
            value={answers.wakeTime ?? ""}
            onChange={(e) => setAnswers((s) => ({ ...s, wakeTime: e.target.value }))}
          />

          <label className="block text-sm text-slate-300">Biggest blocker</label>
          <select
            className="input"
            value={answers.blocker ?? ""}
            onChange={(e) => setAnswers((s) => ({ ...s, blocker: e.target.value }))}
          >
            <option value="">Select</option>
            <option value="late_sleep">Sleep late</option>
            <option value="snooze">Hit snooze</option>
            <option value="inconsistent">Inconsistent schedule</option>
          </select>
        </div>
      );
    }

    // Add more types here over time…
    return (
      <div className="space-y-3">
        <label className="block text-sm text-slate-300">Notes (optional)</label>
        <input
          className="input"
          placeholder="Anything we should know?"
          value={answers.notes ?? ""}
          onChange={(e) => setAnswers((s) => ({ ...s, notes: e.target.value }))}
        />
      </div>
    );
  };

  const handleSave = async () => {
    if (!user || saving || !selectedType) return;
    const meta = HABIT_OPTIONS.find((o) => o.type === selectedType);
    if (!meta) return;

    setSaving(true);
    try {
      await addDoc(collection(db, "user_habits"), {
        uid: user.uid,
        type: meta.type,
        name: meta.name,
        answers,
        createdAt: serverTimestamp(),
      });
      navigate("/dashboard", { replace: true });
    } catch (e) {
      console.error(e);
      alert("Could not save habit. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 md:px-10 py-8 md:py-10">
        <Card className="bg-slate-900/70 border-slate-800 p-5">
          <h1 className="text-2xl md:text-3xl font-bold">
            {mode === "add" ? "Add a new habit" : "Choose your first habit"}
          </h1>
          <p className="mt-2 text-slate-300">
            Pick one focus to start. You can always add more later.
          </p>

          <div className="mt-5 space-y-3">
            <label className="block text-sm text-slate-300">Habit</label>
            <select
              className="input"
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setAnswers({});
              }}
            >
              <option value="">Select a habit</option>
              {filteredOptions.map((opt) => (
                <option key={opt.type} value={opt.type}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>

          {selectedType && (
            <div className="mt-6">
              <h3 className="font-semibold">A few quick questions</h3>
              <div className="mt-3">{renderDynamicQuestions()}</div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <Button onClick={() => navigate("/dashboard")} variant="ghost">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!selectedType || saving}
              className="bg-teal-500 hover:bg-teal-400 text-black"
            >
              {saving ? "Saving…" : "Finish & go to dashboard"}
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
