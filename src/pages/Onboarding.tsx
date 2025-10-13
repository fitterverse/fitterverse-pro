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

const HABIT_OPTIONS: HabitOption[] = [
  { type: "eat_healthy", name: "Eat healthy" },
  { type: "workout", name: "Workout" },
  { type: "walking_10k", name: "Walking (10k steps)" },
];

type StepKey = "food" | "movement" | "goals" | "review";

/** Clamp helper */
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v || 0));

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const mode = params.get("mode") === "add" ? "add" : "first";
  const markOnboarded = useAppStore((s) => s.markOnboarded);

  // ---------- State
  const [selectedType, setSelectedType] = useState<HabitOption["type"] | "">("");
  const [answers, setAnswers] = useState<Answers>({});
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [existingTypes, setExistingTypes] = useState<string[]>([]);

  // Multi-step defaults (fix: safe defaults so submit never blocks silently)
  const [step, setStep] = useState<StepKey>("food");
  const [food, setFood] = useState<{
    enabled: boolean;
    diet: "veg" | "egg" | "nonveg";
    meals: Array<"breakfast" | "lunch" | "dinner">;
  }>({
    enabled: true,
    diet: "veg", // ✅ default to veg so users aren’t blocked
    meals: ["breakfast", "lunch", "dinner"], // ✅ sensible default
  });

  const [movement, setMovement] = useState<{
    walking: boolean;
    workout: boolean;
    workoutDays: number;
  }>({
    walking: true,
    workout: false,
    workoutDays: 3, // default; will clamp 1–7
  });

  const [goals, setGoals] = useState<{ steps?: number; weightLossKg?: number }>(
    { steps: 5000 }
  );

  // ---------- Legacy onboarded flag (unchanged)
  useEffect(() => {
    if (!user) return;
    try {
      const legacyKey = `fv_onboarded_${user.uid}`;
      if (localStorage.getItem(legacyKey) === "1") {
        markOnboarded(user.uid);
      }
    } catch {}
  }, [user, markOnboarded]);

  // ---------- Load existing habit types for this user (to avoid duplicates)
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        setLoading(true);
        const qRef = query(collection(db, "user_habits"), where("uid", "==", user.uid));
        const snap = await getDocs(qRef);
        const types: string[] = [];
        snap.forEach((d) => {
          const data = d.data() as any;
          if (data?.type && typeof data.type === "string") types.push(String(data.type));
        });
        setExistingTypes(types);
      } catch (e: any) {
        console.error(e);
        setErr(e?.message || "Could not load your habits.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // ---------- ADD MODE (single habit — backward compatible)
  const renderDynamicQuestionsAddMode = () => {
    if (!selectedType) return null;

    if (selectedType === "eat_healthy") {
      const meals: string[] = answers.meals ?? ["breakfast", "lunch", "dinner"];
      return (
        <div className="space-y-3">
          <label className="block text-sm text-slate-300">Diet preference</label>
          <select
            className="input"
            value={answers.diet ?? "veg"} // default veg
            onChange={(e) => setAnswers((s) => ({ ...s, diet: e.target.value }))}
          >
            <option value="veg">Vegetarian</option>
            <option value="egg">Eggetarian</option>
            <option value="nonveg">Non-vegetarian</option>
          </select>

          <label className="block text-sm text-slate-300">Meals to track</label>
          <div className="flex gap-2 flex-wrap">
            {(["breakfast", "lunch", "dinner"] as const).map((m) => {
              const on = meals.includes(m);
              return (
                <button
                  key={m}
                  type="button"
                  className={`px-3 py-1 rounded-xl border ${
                    on
                      ? "bg-emerald-500/20 border-emerald-500/40"
                      : "bg-slate-800/60 border-slate-700"
                  }`}
                  onClick={() => {
                    const next = new Set(meals);
                    if (on) next.delete(m);
                    else next.add(m);
                    const list = Array.from(next);
                    setAnswers((s) => ({
                      ...s,
                      meals: list.length ? list : ["breakfast"], // keep at least one
                    }));
                  }}
                >
                  {m[0].toUpperCase() + m.slice(1)}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (selectedType === "workout") {
      const val = clamp(Number(answers.workoutDays ?? 3), 1, 7);
      return (
        <div className="space-y-3">
          <label className="block text-sm text-slate-300">Target days/week</label>
          <input
            type="number"
            min={1}
            max={7}
            className="input"
            value={val}
            onChange={(e) =>
              setAnswers((s) => ({
                ...s,
                workoutDays: clamp(Number(e.target.value || 3), 1, 7),
              }))
            }
          />
          <p className="text-xs text-slate-400">Allowed range: 1–7 days/week.</p>
        </div>
      );
    }

    if (selectedType === "walking_10k") {
      return (
        <div className="space-y-3">
          <label className="block text-sm text-slate-300">Daily step goal</label>
          <input
            type="number"
            min={1000}
            step={500}
            className="input"
            value={answers.steps ?? 5000}
            onChange={(e) =>
              setAnswers((s) => ({ ...s, steps: Number(e.target.value || 5000) }))
            }
          />
        </div>
      );
    }

    return null;
  };

  const handleSaveAddMode = async () => {
    if (!user || saving || !selectedType) return;

    setSaving(true);
    setErr(null);

    try {
      // Re-check current habits
      const reQ = query(collection(db, "user_habits"), where("uid", "==", user.uid));
      const reSnap = await getDocs(reQ);
      const typesNow: string[] = [];
      reSnap.forEach((d) => {
        const data = d.data() as any;
        if (data?.type) typesNow.push(String(data.type));
      });

      if (typesNow.includes(selectedType)) {
        throw new Error(
          `You already have ${selectedType.replaceAll("_", " ")} habit.`
        );
      }
      if (typesNow.length >= 3) {
        throw new Error("You can have up to 3 habits only.");
      }

      // Prepare safe answers (with clamps/defaults)
      let safeAnswers = { ...answers };
      if (selectedType === "eat_healthy") {
        safeAnswers.diet = (safeAnswers.diet ?? "veg") as "veg" | "egg" | "nonveg";
        const meals: string[] = safeAnswers.meals ?? ["breakfast", "lunch", "dinner"];
        safeAnswers.meals = meals.length ? meals : ["breakfast"];
      }
      if (selectedType === "workout") {
        safeAnswers.workoutDays = clamp(Number(safeAnswers.workoutDays ?? 3), 1, 7);
      }

      const meta = HABIT_OPTIONS.find((o) => o.type === selectedType)!;

      await addDoc(collection(db, "user_habits"), {
        uid: user.uid,
        type: meta.type,
        name: meta.name,
        answers: safeAnswers,
        createdAt: serverTimestamp(),
      });

      // mark onboarded
      try {
        markOnboarded(user.uid);
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

  // ---------- FIRST-TIME MULTI-STEP FLOW
  const canProceedFood = useMemo(() => {
    // With defaults, this is always OK if food.enabled, because diet is preselected and meals has ≥1.
    return !food.enabled || (!!food.diet && food.meals.length > 0);
  }, [food]);

  const handleSaveFirstTime = async () => {
    if (!user || saving) return;
    setSaving(true);
    setErr(null);

    try {
      // Fetch current to avoid duplicates and enforce max 3
      const reQ = query(collection(db, "user_habits"), where("uid", "==", user.uid));
      const reSnap = await getDocs(reQ);
      const typesNow: string[] = [];
      reSnap.forEach((d) => {
        const data = d.data() as any;
        if (data?.type) typesNow.push(String(data.type));
      });

      const created: string[] = [];
      const canAddMore = (willAdd: number) =>
        typesNow.length + created.length + willAdd <= 3;

      // Food habit (safe defaults already in state)
      if (food.enabled && canAddMore(1) && !typesNow.includes("eat_healthy")) {
        const safeMeals =
          food.meals && food.meals.length ? food.meals : (["breakfast"] as const);
        await addDoc(collection(db, "user_habits"), {
          uid: user.uid,
          type: "eat_healthy",
          name: "Eat healthy",
          answers: { diet: food.diet ?? "veg", meals: safeMeals },
          createdAt: serverTimestamp(),
        });
        created.push("eat_healthy");
      }

      // Walking habit
      if (movement.walking && canAddMore(1) && !typesNow.includes("walking_10k")) {
        await addDoc(collection(db, "user_habits"), {
          uid: user.uid,
          type: "walking_10k",
          name: "Walking (10k steps)",
          answers: { steps: goals.steps ?? 5000 },
          createdAt: serverTimestamp(),
        });
        created.push("walking_10k");
      }

      // Workout habit (clamped 1–7)
      if (movement.workout && canAddMore(1) && !typesNow.includes("workout")) {
        const wd = clamp(Number(movement.workoutDays ?? 3), 1, 7);
        await addDoc(collection(db, "user_habits"), {
          uid: user.uid,
          type: "workout",
          name: "Workout",
          answers: { workoutDays: wd },
          createdAt: serverTimestamp(),
        });
        created.push("workout");
      }

      // Mark onboarded
      try {
        markOnboarded(user.uid);
        localStorage.setItem(`fv_onboarded_${user.uid}`, "1");
      } catch {}

      navigate("/dashboard", { replace: true });
    } catch (e: any) {
      console.error(e);
      setErr(e?.message || "Could not finish setup. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Helmet>
        <title>{mode === "add" ? "Add a habit" : "Welcome • Setup"} | Fitterverse</title>
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href="https://fitterverse.in/onboarding" />
      </Helmet>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 md:px-10 py-8 md:py-10">
        <Card className="bg-slate-900/70 border-slate-800 p-5">
          <h1 className="text-2xl md:text-3xl font-bold">
            {mode === "add" ? "Add a habit" : "Quick setup"}
          </h1>

          {mode === "add" ? (
            <>
              <p className="mt-2 text-slate-300">
                You can have up to <strong>3 habits</strong>. No duplicates.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {HABIT_OPTIONS.map((opt) => {
                  const on = selectedType === opt.type;
                  const exists = existingTypes.includes(opt.type);
                  return (
                    <button
                      key={opt.type}
                      type="button"
                      disabled={exists}
                      onClick={() => setSelectedType(opt.type)}
                      className={`rounded-xl border px-3 py-3 text-left ${
                        on
                          ? "bg-emerald-500/20 border-emerald-500/40"
                          : "bg-slate-900/60 border-slate-800"
                      } ${exists ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="font-semibold">{opt.name}</div>
                      <div className="text-xs text-slate-400 mt-1">
                        {exists ? "Already added" : opt.type}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6">{renderDynamicQuestionsAddMode()}</div>

              {err && (
                <div className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {err}
                </div>
              )}

              <div className="mt-6 flex items-center justify-end gap-2">
                <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveAddMode}
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
            </>
          ) : (
            <>
              {/* FIRST-TIME MULTI-STEP */}
              <div className="mt-4">
                {/* Tabs */}
                <div className="flex gap-2 text-sm">
                  {(["food", "movement", "goals", "review"] as StepKey[]).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setStep(k)}
                      className={`px-3 py-1 rounded-xl border ${
                        step === k
                          ? "bg-indigo-500/20 border-indigo-500/40"
                          : "bg-slate-900/60 border-slate-800"
                      }`}
                    >
                      {k[0].toUpperCase() + k.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Panels */}
                {step === "food" && (
                  <div className="mt-5 space-y-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={food.enabled}
                        onChange={(e) => setFood((s) => ({ ...s, enabled: e.target.checked }))}
                      />
                      <span className="text-slate-200">Track healthy food</span>
                    </label>

                    {food.enabled && (
                      <>
                        <div>
                          <div className="text-sm text-slate-300 mb-1">Diet preference</div>
                          <div className="flex gap-2 flex-wrap">
                            {(["veg", "egg", "nonveg"] as const).map((d) => (
                              <button
                                key={d}
                                type="button"
                                className={`px-3 py-1 rounded-xl border ${
                                  food.diet === d
                                    ? "bg-emerald-500/20 border-emerald-500/40"
                                    : "bg-slate-800/60 border-slate-700"
                                }`}
                                onClick={() => setFood((s) => ({ ...s, diet: d }))}
                              >
                                {d === "veg" ? "Vegetarian" : d === "egg" ? "Eggetarian" : "Non-veg"}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-slate-300 mb-1">Meals to track</div>
                          <div className="flex gap-2 flex-wrap">
                            {(["breakfast", "lunch", "dinner"] as const).map((m) => {
                              const on = food.meals.includes(m);
                              return (
                                <button
                                  key={m}
                                  type="button"
                                  className={`px-3 py-1 rounded-xl border ${
                                    on
                                      ? "bg-emerald-500/20 border-emerald-500/40"
                                      : "bg-slate-800/60 border-slate-700"
                                  }`}
                                  onClick={() => {
                                    const next = new Set(food.meals);
                                    if (on) next.delete(m);
                                    else next.add(m);
                                    const list = Array.from(next);
                                    setFood((s) => ({
                                      ...s,
                                      meals: (list.length ? list : ["breakfast"]) as Array<
                                        "breakfast" | "lunch" | "dinner"
                                      >,
                                    }));
                                  }}
                                >
                                  {m[0].toUpperCase() + m.slice(1)}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {step === "movement" && (
                  <div className="mt-5 space-y-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={movement.walking}
                        onChange={(e) => setMovement((s) => ({ ...s, walking: e.target.checked }))}
                      />
                      <span className="text-slate-200">Walking</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={movement.workout}
                        onChange={(e) => setMovement((s) => ({ ...s, workout: e.target.checked }))}
                      />
                      <span className="text-slate-200">Workout</span>
                    </label>

                    {movement.workout && (
                      <div>
                        <div className="text-sm text-slate-300 mb-1">Workout days/week</div>
                        <input
                          type="number"
                          min={1}
                          max={7}
                          className="input"
                          value={movement.workoutDays}
                          onChange={(e) =>
                            setMovement((s) => ({
                              ...s,
                              workoutDays: clamp(Number(e.target.value || 3), 1, 7),
                            }))
                          }
                        />
                        <p className="text-xs text-slate-400 mt-1">Allowed range: 1–7.</p>
                      </div>
                    )}
                  </div>
                )}

                {step === "goals" && (
                  <div className="mt-5 space-y-4">
                    <div>
                      <label className="block text-sm text-slate-300">Daily steps goal</label>
                      <input
                        type="number"
                        min={1000}
                        step={500}
                        className="input"
                        value={goals.steps ?? 5000}
                        onChange={(e) =>
                          setGoals((s) => ({ ...s, steps: Number(e.target.value || 5000) }))
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-slate-300">Weight loss target (kg)</label>
                      <input
                        type="number"
                        min={1}
                        step={1}
                        className="input"
                        value={goals.weightLossKg ?? ""}
                        onChange={(e) =>
                          setGoals((s) => ({
                            ...s,
                            weightLossKg: e.target.value ? Number(e.target.value) : undefined,
                          }))
                        }
                        placeholder="optional"
                      />
                    </div>
                  </div>
                )}

                {step === "review" && (
                  <div className="mt-5 space-y-2 text-sm text-slate-300">
                    <div>
                      Food:{" "}
                      {food.enabled
                        ? `${food.diet} • ${food.meals.join(", ")}`
                        : "Not enabled"}
                    </div>
                    <div>Walking: {movement.walking ? "Yes" : "No"}</div>
                    <div>
                      Workout:{" "}
                      {movement.workout ? `${movement.workoutDays} days/week` : "No"}
                    </div>
                    <div>Steps goal: {goals.steps ?? 5000}</div>
                    <div>Weight loss target: {goals.weightLossKg ?? "—"}</div>
                  </div>
                )}

                {err && (
                  <div className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                    {err}
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between gap-2">
                  <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                    Skip
                  </Button>
                  <div className="flex gap-2">
                    {step !== "food" && (
                      <Button
                        variant="ghost"
                        onClick={() =>
                          setStep((prev) =>
                            prev === "movement" ? "food" : prev === "goals" ? "movement" : "goals"
                          )
                        }
                      >
                        Back
                      </Button>
                    )}
                    {step !== "review" ? (
                      <Button
                        onClick={() => {
                          if (step === "food" && !canProceedFood) return;
                          setStep((prev) =>
                            prev === "food" ? "movement" : prev === "movement" ? "goals" : "review"
                          );
                        }}
                        disabled={step === "food" && !canProceedFood}
                        className="bg-indigo-500 hover:bg-indigo-400 text-black"
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSaveFirstTime}
                        disabled={
                          saving ||
                          (food.enabled && (!food.diet || food.meals.length === 0)) ||
                          (movement.workout &&
                            (movement.workoutDays < 1 || movement.workoutDays > 7))
                        }
                        className="bg-teal-500 hover:bg-teal-400 text-black"
                      >
                        {saving ? "Setting up…" : "Finish setup"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </Card>
      </section>
    </div>
  );
}
