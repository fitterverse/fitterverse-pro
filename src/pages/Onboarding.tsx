// src/pages/Onboarding.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/state/authStore";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type StepKey =
  | "goal"
  | "secondary"
  | "diet"
  | "activity"
  | "workoutsNow"
  | "targets"
  | "metrics"
  | "experience"
  | "review"
  | "processing";

const ORDER: StepKey[] = [
  "goal",
  "secondary",
  "diet",
  "activity",
  "workoutsNow",
  "targets",
  "metrics",
  "experience",
  "review",
];

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v || 0));
const isMedicalGoal = (g: string) => ["Manage PCOS", "Manage Diabetes", "Manage Thyroid"].includes(g);

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<StepKey>("goal");
  const [furthestIdx, setFurthestIdx] = useState(0); // lock forward nav
  const [saving, setSaving] = useState(false);
  const [procError, setProcError] = useState<string | null>(null);

  // —— Answers (minimal, focused) ——
  const [ans, setAns] = useState<any>({
    // 1) Main goal (required)
    primaryGoal: "Lose fat",

    // 2) Secondary focus (optional, unlimited)
    secondary: [] as string[],

    // 3) Diet (dietPattern required, exclusions optional)
    dietPattern: "Veg",
    exclusions: [] as string[],
    exclusionsOther: "",

    // 4.1) Current activity (required)
    activityLevel: "Light (5–7k)",

    // 4.2) Current workouts (required)
    currentWorkouts: "None",

    // 4.3) Targets (numbers; can be 0 for “None”)
    targetSteps: 7000 as 0 | 5000 | 7000 | 10000,
    targetWorkoutDays: 3 as 0 | 2 | 3 | 4 | 5 | 6 | 7,

    // 5) Metrics (height & weight required; body fat optional)
    heightCm: "",
    weightKg: "",
    bodyFat: "",

    // 6) Experience (optional)
    experience: null as
      | "first_time"
      | "self"
      | "program"
      | "apps"
      | "inconsistent"
      | null,
    stopReasons: [] as string[],
    stopOther: "",
  });

  useEffect(() => {
    if (!user) navigate("/", { replace: true });
  }, [user, navigate]);

  // Track progress (exclude "processing")
  const stepIndex = Math.max(0, ORDER.indexOf(step));
  const progressPct = Math.round(((stepIndex + 1) / ORDER.length) * 100);

  // Enforce step order: only allow going forward one-by-one; backwards anytime
  function goTo(next: StepKey) {
    const nextIdx = ORDER.indexOf(next);
    if (nextIdx <= furthestIdx || nextIdx <= stepIndex + 1) {
      setStep(next);
      setFurthestIdx((f) => Math.max(f, nextIdx));
    }
  }

  function nextStep() {
    const nextIdx = Math.min(stepIndex + 1, ORDER.length - 1);
    goTo(ORDER[nextIdx]);
  }
  function prevStep() {
    const prevIdx = Math.max(stepIndex - 1, 0);
    goTo(ORDER[prevIdx]);
  }

  // Validation per step
  const errors = useMemo(() => {
    const e: Record<StepKey, string | null> = {
      goal: ans.primaryGoal ? null : "Please choose a main goal.",
      secondary: null, // optional
      diet: ans.dietPattern ? null : "Select your diet pattern.",
      activity: ans.activityLevel ? null : "Select your baseline activity.",
      workoutsNow: ans.currentWorkouts ? null : "How often are you working out now?",
      targets: null, // defaults set; both can be 0 (None)
      metrics:
        Number(ans.heightCm) > 0 && Number(ans.weightKg) > 0
          ? null
          : "Height and weight are required.",
      experience: null, // optional
      review: canFinish(ans) ? null : "Please complete previous steps.",
      processing: null,
    };
    return e;
  }, [ans]);

  const nextDisabled = !!errors[step as keyof typeof errors];

  // Save handler with “processing” UX
  const saveAll = async () => {
    if (!user || saving) return;
    if (!canFinish(ans)) {
      setStep("metrics");
      setFurthestIdx(Math.max(furthestIdx, ORDER.indexOf("metrics")));
      return;
    }
    setSaving(true);
    setProcError(null);
    setStep("processing");

    setTimeout(async () => {
      try {
        // 1) profile
        const profileRef = doc(db, "user_profiles", user.uid);
        const existing = await getDoc(profileRef);
        const payload = {
          primaryGoal: ans.primaryGoal,
          secondary: ans.secondary,
          dietPattern: normDiet(ans.dietPattern),
          exclusions: ans.exclusions,
          exclusionsOther: ans.exclusionsOther || null,
          activityLevel: mapActivity(ans.activityLevel),
          currentWorkouts: mapWorkNow(ans.currentWorkouts),
          targetSteps: Number(ans.targetSteps || 0),
          targetWorkoutDays: Number(ans.targetWorkoutDays || 0),
          heightCm: Number(ans.heightCm),
          weightKg: Number(ans.weightKg),
          bodyFatPct: ans.bodyFat ? Number(ans.bodyFat) : null,
          experience: ans.experience || null,
          stopReasons: ans.stopReasons || [],
          stopOther: ans.stopOther || null,
          updatedAt: serverTimestamp(),
          createdAt:
            existing.exists() ? existing.data()?.createdAt ?? serverTimestamp() : serverTimestamp(),
        };
        await setDoc(profileRef, payload, { merge: true });

        // 2) habits (ensure existing types aren’t duplicated)
        const qRef = query(collection(db, "user_habits"), where("uid", "==", user.uid));
        const snap = await getDocs(qRef);
        const have = new Set<string>();
        snap.forEach((d) => d.data()?.type && have.add(String(d.data().type)));

        // Food (always)
        if (!have.has("eat_healthy")) {
          const firstOpenTab = isMedicalGoal(ans.primaryGoal) ? "avoid" : undefined;
          await addDoc(collection(db, "user_habits"), {
            uid: user.uid,
            type: "eat_healthy",
            name: "Eat healthy",
            answers: {
              diet: normDiet(ans.dietPattern),
              meals: ["breakfast", "lunch", "dinner"],
              exclusions: ans.exclusions,
              ...(firstOpenTab ? { firstOpenTab } : {}),
            },
            createdAt: serverTimestamp(),
          });
        }

        // Walking (only if target != None)
        const steps = Number(ans.targetSteps || 0);
        if (steps > 0 && !have.has("walking_10k")) {
          await addDoc(collection(db, "user_habits"), {
            uid: user.uid,
            type: "walking_10k",
            name: "Walking",
            answers: { steps },
            createdAt: serverTimestamp(),
          });
        }

        // Workout (only if target != None)
        const days = Number(ans.targetWorkoutDays || 0);
        if (days > 0 && !have.has("workout")) {
          await addDoc(collection(db, "user_habits"), {
            uid: user.uid,
            type: "workout",
            name: "Workout",
            answers: { workoutDays: clamp(days, 1, 7) },
            createdAt: serverTimestamp(),
          });
        }

        navigate("/dashboard", { replace: true });
      } catch (e: any) {
        setProcError(e?.message || "Could not finish setup.");
        setSaving(false);
      }
    }, 2200);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Helmet>
        <title>Quick setup • Fitterverse</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 md:px-10 py-8">
        <Card className="bg-slate-900/70 border-slate-800 p-5 md:p-6">
          <h1 className="text-2xl md:text-3xl font-bold">Let’s personalize your plan</h1>
          <p className="text-slate-300 mt-1 text-sm">2–3 minutes. Simple steps.</p>

          {/* Progress */}
          <div className="mt-4">
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-teal-500 transition-[width] duration-200"
                style={{ width: `${Math.min(progressPct, 100)}%` }}
                aria-valuenow={progressPct}
                aria-valuemin={0}
                aria-valuemax={100}
                role="progressbar"
              />
            </div>

            {/* Step pills: lock forward nav */}
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {ORDER.map((k, i) => {
                const active = i === stepIndex;
                const reachable = i <= furthestIdx + 1; // next immediate step allowed
                return (
                  <button
                    key={k}
                    onClick={() => reachable && goTo(k)}
                    disabled={!reachable}
                    className={`px-2 py-0.5 rounded-full border transition-colors ${
                      active
                        ? "bg-indigo-500/20 border-indigo-400"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-600"
                    } ${!reachable ? "opacity-40 cursor-not-allowed" : ""}`}
                    aria-current={active ? "step" : undefined}
                  >
                    {i + 1}. {labelFor(k)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5">
            {/* 1) Main goal (required) */}
            {step === "goal" && (
              <StepWrap
                title="Main goal"
                help="You can change this later."
                nextDisabled={!!errors.goal}
                onNext={() => {
                  setFurthestIdx(Math.max(furthestIdx, ORDER.indexOf("secondary")));
                  goTo("secondary");
                }}
              >
                <ChipGroupSingle
                  value={ans.primaryGoal}
                  options={[
                    "Lose fat",
                    "Build muscle",
                    "General fitness",
                    "Manage PCOS",
                    "Manage Diabetes",
                    "Manage Thyroid",
                  ]}
                  onChange={(v) => setAns((s: any) => ({ ...s, primaryGoal: v }))}
                />
                {errors.goal && <InlineError text={errors.goal} />}
              </StepWrap>
            )}

            {/* 2) Secondary focus (optional) */}
            {step === "secondary" && (
              <StepWrap
                title="Secondary focus (optional)"
                help="Pick anything that matters right now."
                onBack={prevStep}
                nextDisabled={false}
                onNext={() => {
                  setFurthestIdx(Math.max(furthestIdx, ORDER.indexOf("diet")));
                  goTo("diet");
                }}
              >
                <ChipGroupMulti
                  values={ans.secondary}
                  options={[
                    "Energy & sleep",
                    "Mobility/flexibility",
                    "Cardio fitness",
                    "Stress reduction",
                    "Habit consistency",
                  ]}
                  onToggle={(v) => setAns((s: any) => ({ ...s, secondary: toggleSet(s.secondary, v) }))}
                />
              </StepWrap>
            )}

            {/* 3) Diet (diet pattern required) */}
            {step === "diet" && (
              <StepWrap
                title="Diet pattern"
                help="We’ll match recipes, grocery and foods-to-avoid."
                onBack={prevStep}
                nextDisabled={!!errors.diet}
                onNext={() => {
                  setFurthestIdx(Math.max(furthestIdx, ORDER.indexOf("activity")));
                  goTo("activity");
                }}
              >
                <div className="space-y-4">
                  <ChipGroupSingle
                    value={ans.dietPattern}
                    options={["Veg", "Eggetarian", "Non-veg", "Vegan", "Jain"]}
                    onChange={(v) => setAns((s: any) => ({ ...s, dietPattern: v }))}
                  />
                  <div>
                    <div className="text-sm text-slate-300 mb-1">Exclusions (optional)</div>
                    <ChipGroupMulti
                      values={ans.exclusions}
                      options={["No eggs", "No onion/garlic", "Lactose-free", "Gluten-free", "Nut allergy"]}
                      onToggle={(v) =>
                        setAns((s: any) => ({ ...s, exclusions: toggleSet(s.exclusions, v) }))
                      }
                    />
                    <input
                      className="mt-2 w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm"
                      placeholder="Other (optional)"
                      value={ans.exclusionsOther}
                      onChange={(e) =>
                        setAns((s: any) => ({ ...s, exclusionsOther: e.target.value }))
                      }
                    />
                  </div>
                </div>
                {errors.diet && <InlineError text={errors.diet} />}
              </StepWrap>
            )}

            {/* 4.1) Activity (required) */}
            {step === "activity" && (
              <StepWrap
                title="Current activity"
                help="A rough guess is okay."
                onBack={prevStep}
                nextDisabled={!!errors.activity}
                onNext={() => {
                  setFurthestIdx(Math.max(furthestIdx, ORDER.indexOf("workoutsNow")));
                  goTo("workoutsNow");
                }}
              >
                <ChipGroupSingle
                  value={ans.activityLevel}
                  options={[
                    "Sedentary (<5k)",
                    "Light (5–7k)",
                    "Moderate (7–10k)",
                    "Active (10k+)",
                    "Very active",
                  ]}
                  onChange={(v) => setAns((s: any) => ({ ...s, activityLevel: v }))}
                />
                {errors.activity && <InlineError text={errors.activity} />}
              </StepWrap>
            )}

            {/* 4.2) Workouts now (required) */}
            {step === "workoutsNow" && (
              <StepWrap
                title="Current workouts"
                onBack={prevStep}
                nextDisabled={!!errors.workoutsNow}
                onNext={() => {
                  setFurthestIdx(Math.max(furthestIdx, ORDER.indexOf("targets")));
                  goTo("targets");
                }}
              >
                <ChipGroupSingle
                  value={ans.currentWorkouts}
                  options={["None", "≤1×/wk", "2–3×/wk", "4–5×/wk", "6–7×/wk"]}
                  onChange={(v) => setAns((s: any) => ({ ...s, currentWorkouts: v }))}
                />
                {errors.workoutsNow && <InlineError text={errors.workoutsNow} />}
              </StepWrap>
            )}

            {/* 4.3) Targets (can be 0 / None) */}
            {step === "targets" && (
              <StepWrap
                title="Targets for week one"
                help="Pick what’s realistic. You can change this later."
                onBack={prevStep}
                nextDisabled={false}
                onNext={() => {
                  setFurthestIdx(Math.max(furthestIdx, ORDER.indexOf("metrics")));
                  goTo("metrics");
                }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-sm text-slate-300 mb-1">Walking target</div>
                    <ChipGroupSingle
                      value={String(ans.targetSteps)}
                      options={["0", "5000", "7000", "10000"]}
                      labels={{ "0": "None", "5000": "5k", "7000": "7k", "10000": "10k" }}
                      onChange={(v) => setAns((s: any) => ({ ...s, targetSteps: Number(v) }))}
                    />
                  </div>
                  <div>
                    <div className="text-sm text-slate-300 mb-1">Workout days/week</div>
                    <ChipGroupSingle
                      value={String(ans.targetWorkoutDays)}
                      options={["0", "2", "3", "4", "5", "6", "7"]}
                      labels={{
                        "0": "None",
                        "2": "2",
                        "3": "3",
                        "4": "4",
                        "5": "5",
                        "6": "6",
                        "7": "7",
                      }}
                      onChange={(v) =>
                        setAns((s: any) => ({
                          ...s,
                          targetWorkoutDays: clamp(Number(v), 0, 7),
                        }))
                      }
                    />
                  </div>
                </div>
              </StepWrap>
            )}

            {/* 5) Metrics (height & weight required; body fat optional) */}
            {step === "metrics" && (
              <StepWrap
                title="Your current stats"
                help="Used only to personalize your plan."
                onBack={prevStep}
                nextDisabled={!!errors.metrics}
                onNext={() => {
                  if (errors.metrics) return;
                  setFurthestIdx(Math.max(furthestIdx, ORDER.indexOf("experience")));
                  goTo("experience");
                }}
              >
                <div className="grid gap-3 sm:grid-cols-3">
                  <LabeledInput
                    label="Height (cm) *"
                    value={ans.heightCm}
                    onChange={(v) => setAns((s: any) => ({ ...s, heightCm: v }))}
                    type="number"
                  />
                  <LabeledInput
                    label="Weight (kg) *"
                    value={ans.weightKg}
                    onChange={(v) => setAns((s: any) => ({ ...s, weightKg: v }))}
                    type="number"
                  />
                  <LabeledInput
                    label="Body fat % (optional)"
                    value={ans.bodyFat}
                    onChange={(v) => setAns((s: any) => ({ ...s, bodyFat: v }))}
                    type="number"
                  />
                </div>
                {errors.metrics && <InlineError text={errors.metrics} />}
              </StepWrap>
            )}

            {/* 6) Experience & support (optional) */}
            {step === "experience" && (
              <StepWrap
                title="So we can support you better (optional)"
                onBack={prevStep}
                nextDisabled={false}
                onNext={() => {
                  setFurthestIdx(Math.max(furthestIdx, ORDER.indexOf("review")));
                  goTo("review");
                }}
                extra={<button className="text-sky-400 text-sm" onClick={() => goTo("review")}>Skip</button>}
              >
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-slate-300 mb-1">Past attempts</div>
                    <ChipGroupSingle
                      value={ans.experience}
                      options={[
                        { label: "First time", value: "first_time" },
                        { label: "Tried on my own", value: "self" },
                        { label: "Program/coach", value: "program" },
                        { label: "Used apps", value: "apps" },
                        { label: "On & off", value: "inconsistent" },
                      ]}
                      onChange={(v) => setAns((s: any) => ({ ...s, experience: v }))}
                    />
                  </div>

                  <div>
                    <div className="text-sm text-slate-300 mb-1">What usually makes you stop? (optional)</div>
                    <ChipGroupMulti
                      values={ans.stopReasons}
                      options={[
                        "Time/energy",
                        "Travel/routine",
                        "Boring meals",
                        "Soreness/injury",
                        "Motivation dips",
                        "Budget/food access",
                      ]}
                      onToggle={(v) =>
                        setAns((s: any) => ({ ...s, stopReasons: toggleSet(s.stopReasons, v) }))
                      }
                    />
                    <input
                      className="mt-2 w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm"
                      placeholder="Other (optional)"
                      value={ans.stopOther}
                      onChange={(e) => setAns((s: any) => ({ ...s, stopOther: e.target.value }))}
                    />
                  </div>
                </div>
              </StepWrap>
            )}

            {/* Review */}
            {step === "review" && (
              <StepWrap
                title="Review"
                onBack={prevStep}
                primaryLabel="Finish setup"
                primaryDisabled={!canFinish(ans) || saving}
                onPrimary={saveAll}
              >
                <div className="text-sm text-slate-300 space-y-1">
                  <div>
                    Main goal: <b>{ans.primaryGoal}</b>
                  </div>
                  <div>
                    Secondary:{" "}
                    {ans.secondary?.length ? (
                      <b>{ans.secondary.join(", ")}</b>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </div>
                  <div>
                    Diet: <b>{ans.dietPattern}</b>
                    {ans.exclusions?.length ? (
                      <> • Exclusions: <b>{ans.exclusions.join(", ")}</b></>
                    ) : null}
                  </div>
                  <div>
                    Activity: <b>{ans.activityLevel}</b> • Workouts now: <b>{ans.currentWorkouts}</b>
                  </div>
                  <div>
                    Targets: Walking <b>{ans.targetSteps ? `${ans.targetSteps.toLocaleString()} steps` : "None"}</b>
                    {" • "}Workouts <b>{ans.targetWorkoutDays ? `${ans.targetWorkoutDays}×/wk` : "None"}</b>
                  </div>
                  <div>
                    Stats: <b>{ans.heightCm || "—"} cm</b> • <b>{ans.weightKg || "—"} kg</b> • Body fat{" "}
                    <b>{ans.bodyFat || "—"}%</b>
                  </div>
                </div>
              </StepWrap>
            )}

            {/* Processing */}
            {step === "processing" && (
              <div className="text-center">
                <Card className="bg-slate-900/80 border-slate-800 p-6">
                  <h3 className="text-xl font-semibold">Building your starter plan…</h3>
                  <p className="text-slate-300 mt-1">
                    We’re setting up your habits, recipes and grocery list based on your answers.
                  </p>
                  <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-teal-500 animate-pulse" />
                  </div>
                  {procError && (
                    <div className="mt-4 rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                      {procError}
                      <div className="mt-2">
                        <Button onClick={saveAll} className="bg-teal-500 hover:bg-teal-400 text-black">
                          Try again
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}

/* ======= Small presentational helpers ======= */

function StepWrap({
  title,
  help,
  children,
  onBack,
  onNext,
  nextDisabled,
  primaryLabel = "Next",
  primaryDisabled,
  onPrimary,
  extra,
}: {
  title: string;
  help?: string;
  children: React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
  primaryLabel?: string;
  primaryDisabled?: boolean;
  onPrimary?: () => void;
  extra?: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
      {help && <p className="text-slate-300 text-sm mt-1">{help}</p>}
      <div className="mt-4">{children}</div>
      <div className="mt-6 flex items-center justify-between">
        {onBack ? (
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
        ) : (
          <span className="text-slate-400">Skip</span>
        )}
        <div className="flex items-center gap-3">
          {extra}
          {onPrimary ? (
            <Button
              onClick={onPrimary}
              disabled={!!primaryDisabled}
              className="bg-teal-500 hover:bg-teal-400 text-black"
            >
              {primaryLabel}
            </Button>
          ) : (
            <Button
              onClick={onNext}
              disabled={!!nextDisabled}
              className="bg-indigo-500 hover:bg-indigo-400 text-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function InlineError({ text }: { text: string }) {
  return (
    <div className="mt-3 text-xs text-rose-300">
      {text}
    </div>
  );
}

function Chip({
  selected,
  label,
  onClick,
}: {
  selected: boolean;
  label: string | React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-xl border text-sm transition-all
        ${selected ? "bg-teal-500/20 border-teal-400"
                   : "bg-slate-900/60 border-slate-800 hover:border-slate-600"}`}
    >
      {label}
    </button>
  );
}

function ChipGroupSingle({
  value,
  options,
  onChange,
  labels,
}: {
  value: string | null;
  options: (string | { label: string; value: string })[];
  onChange: (v: string) => void;
  labels?: Record<string, string>;
}) {
  const renderLabel = (v: string) => (labels?.[v] ?? v);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const v = typeof o === "string" ? o : o.value;
        const lab = typeof o === "string" ? o : o.label;
        return (
          <Chip
            key={v}
            selected={value === v}
            label={labels ? renderLabel(v) : lab}
            onClick={() => onChange(v)}
          />
        );
      })}
    </div>
  );
}

function ChipGroupMulti({
  values,
  options,
  onToggle,
}: {
  values: string[];
  options: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Chip key={o} selected={values.includes(o)} label={o} onClick={() => onToggle(o)} />
      ))}
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-sm text-slate-300">{label}</label>
      <input
        type={type}
        className="mt-1 w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function labelFor(k: StepKey) {
  switch (k) {
    case "goal":
      return "Goal";
    case "secondary":
      return "Secondary";
    case "diet":
      return "Diet";
    case "activity":
      return "Activity";
    case "workoutsNow":
      return "Workouts";
    case "targets":
      return "Targets";
    case "metrics":
      return "Metrics";
    case "experience":
      return "Experience";
    case "review":
      return "Review";
    default:
      return "Processing";
  }
}

function canFinish(ans: any) {
  const heightOk = Number(ans.heightCm) > 0;
  const weightOk = Number(ans.weightKg) > 0;
  return !!ans.primaryGoal && !!ans.dietPattern && !!ans.activityLevel && !!ans.currentWorkouts && heightOk && weightOk;
}

function toggleSet(list: string[], value: string): string[] {
  const s = new Set(list);
  s.has(value) ? s.delete(value) : s.add(value);
  return Array.from(s);
}

function normDiet(p: string): "veg" | "egg" | "nonveg" | "vegan" | "jain" {
  const s = p.toLowerCase();
  if (s.includes("egg")) return "egg";
  if (s.includes("non")) return "nonveg";
  if (s.includes("vegan")) return "vegan";
  if (s.includes("jain")) return "jain";
  return "veg";
}

function mapActivity(l: string) {
  if (l.startsWith("Sedentary")) return "sedentary";
  if (l.startsWith("Light")) return "light";
  if (l.startsWith("Moderate")) return "moderate";
  if (l.startsWith("Active")) return "active";
  return "very_active";
}

function mapWorkNow(w: string) {
  switch (w) {
    case "None":
      return "none";
    case "≤1×/wk":
      return "occasional";
    case "2–3×/wk":
      return "regular";
    case "4–5×/wk":
      return "consistent";
    default:
      return "athlete";
  }
}
