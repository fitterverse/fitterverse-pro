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

/* ──────────────────────────────────────────────────────────────────────────────
   Steps
────────────────────────────────────────────────────────────────────────────── */
type StepKey =
  | "welcome"
  | "goal"
  | "secondary"
  | "sex"
  | "age"
  | "diet"
  | "activity"
  | "workoutsNow"
  | "targets"
  | "height"
  | "weight"
  | "experienceA"
  | "experienceB"
  | "almost"
  | "review"
  | "processing";

const ORDER: StepKey[] = [
  "welcome",
  "goal",
  "secondary",
  "sex",
  "age",
  "diet",
  "activity",
  "workoutsNow",
  "targets",
  "height",
  "weight",
  "experienceA",
  "experienceB",
  "almost",
  "review",
];

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v || 0));
const isMedicalGoal = (g: string) => ["Manage PCOS", "Manage Diabetes", "Manage Thyroid"].includes(g);

/* ──────────────────────────────────────────────────────────────────────────────
   Page
────────────────────────────────────────────────────────────────────────────── */
export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<StepKey>("welcome");
  const [furthestIdx, setFurthestIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [procError, setProcError] = useState<string | null>(null);

  // Answers (all required; offer “None / Prefer not to say” where sensible)
  const [ans, setAns] = useState<any>({
    primaryGoal: "Lose fat",
    secondary: [] as string[],

    sex: "" as "" | "Male" | "Female" | "Prefer not to say",
    age: "",

    dietPattern: "Veg",
    exclusions: [] as string[],
    exclusionsOther: "",

    activityLevel: "Light (5–7k)",
    currentWorkouts: "None",

    targetSteps: 7000 as 0 | 5000 | 7000 | 10000,
    targetWorkoutDays: 3 as 0 | 2 | 3 | 4 | 5 | 6 | 7,

    heightCm: "",
    weightKg: "",

    experience: null as "first_time" | "self" | "program" | "apps" | "inconsistent" | null,
    stopReasons: [] as string[],
    stopOther: "",
  });

  useEffect(() => {
    if (!user) navigate("/", { replace: true });
  }, [user, navigate]);

  const stepIndex = Math.max(0, ORDER.indexOf(step));
  const progressPct = Math.round(((stepIndex + 1) / ORDER.length) * 100);

  function goTo(next: StepKey) {
    const nextIdx = ORDER.indexOf(next);
    if (nextIdx <= furthestIdx + 1) {
      setStep(next);
      setFurthestIdx((f) => Math.max(f, nextIdx));
      // scroll to top on small screens
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
  const nextStep = () => goTo(ORDER[Math.min(stepIndex + 1, ORDER.length - 1)]);
  const prevStep = () => goTo(ORDER[Math.max(stepIndex - 1, 0)]);

  /* ── Validation (all steps required) */
  const errors = useMemo(() => {
    const e: Partial<Record<StepKey, string | null>> = {};
    e.welcome = null; // CTA screen
    e.goal = ans.primaryGoal ? null : "Choose your main goal.";
    e.secondary = null; // optional choices, but step still passes
    e.sex = ans.sex ? null : "Please choose an option.";
    e.age = Number(ans.age) > 0 ? null : "Please enter your age.";
    e.diet = ans.dietPattern ? null : "Select your diet pattern.";
    e.activity = ans.activityLevel ? null : "Pick your baseline activity.";
    e.workoutsNow = ans.currentWorkouts ? null : "Tell us your current workout frequency.";
    e.targets = null; // both can be 0 (“None”)
    e.height = Number(ans.heightCm) > 0 ? null : "Height is required.";
    e.weight = Number(ans.weightKg) > 0 ? null : "Weight is required.";
    e.experienceA = ans.experience ? null : "Pick the closest past attempt.";
    e.experienceB = null; // reasons list may be empty; still continue
    e.almost = null;
    e.review = canFinish(ans) ? null : "Please complete previous steps.";
    return e;
  }, [ans]);

  const nextDisabled = !!errors[step as keyof typeof errors];

  /* ── Save handler (with processing screen) */
  const saveAll = async () => {
    if (!user || saving) return;
    if (!canFinish(ans)) {
      // jump to first missing required step
      const firstMissing =
        (["goal","sex","age","diet","activity","workoutsNow","height","weight","experienceA"] as StepKey[])
          .find((k) => !!errors[k]);
      if (firstMissing) goTo(firstMissing);
      return;
    }
    setSaving(true);
    setProcError(null);
    setStep("processing");

    setTimeout(async () => {
      try {
        // profile
        const profileRef = doc(db, "user_profiles", user.uid);
        const existing = await getDoc(profileRef);
        const payload = {
          primaryGoal: ans.primaryGoal,
          secondary: ans.secondary,
          sex: ans.sex,
          age: Number(ans.age) || null,
          dietPattern: normDiet(ans.dietPattern),
          exclusions: ans.exclusions,
          exclusionsOther: ans.exclusionsOther || null,
          activityLevel: mapActivity(ans.activityLevel),
          currentWorkouts: mapWorkNow(ans.currentWorkouts),
          targetSteps: Number(ans.targetSteps || 0),
          targetWorkoutDays: Number(ans.targetWorkoutDays || 0),
          heightCm: Number(ans.heightCm),
          weightKg: Number(ans.weightKg),
          experience: ans.experience || null,
          stopReasons: ans.stopReasons || [],
          stopOther: ans.stopOther || null,
          updatedAt: serverTimestamp(),
          createdAt:
            existing.exists() ? existing.data()?.createdAt ?? serverTimestamp() : serverTimestamp(),
        };
        await setDoc(profileRef, payload, { merge: true });

        // habits
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

        // Walking (if target set)
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

        // Workout (if target set)
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
    }, 1300);
  };

  if (!user) return null;

  /* ────────────────────────────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Helmet>
        <title>Quick setup • Fitterverse</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <section className="max-w-xl mx-auto px-4 sm:px-6 md:px-10 py-8">
        <Card className="bg-slate-900/70 border-slate-800 p-5 md:p-6 rounded-2xl">
          {/* Header (mobile-first, single badge) */}
          <h1 className="text-2xl md:text-3xl font-extrabold">Let’s personalize your plan</h1>
          <p className="text-slate-300 mt-1 text-sm">Takes ~2–3 minutes.</p>

          <div className="mt-3">
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
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs text-slate-200">
              <span>{stepIndex + 1} / {ORDER.length}</span>
              <span>•</span>
              <span>{labelFor(step)}</span>
            </div>
          </div>

          {/* Body */}
          <div className="mt-6 space-y-6">
            {/* 0) Welcome */}
            {step === "welcome" && (
              <StepWrap
                title="Welcome 🎉"
                help="We’ll convert your answers into tiny daily habits, flexible streaks and weekly reviews."
                onNext={nextStep}
              >
                <InfoCard
                  title="How this works"
                  bullets={[
                    "Start small — 1–2 minute actions to build momentum.",
                    "Miss a day? Your chain bends, not breaks.",
                    "Weekly mini-review to course-correct early.",
                  ]}
                />
              </StepWrap>
            )}

            {/* 1) Goal */}
            {step === "goal" && (
              <StepWrap title="Main goal 🎯" help="You can change this later." onBack={prevStep} onNext={nextStep} nextDisabled={!!errors.goal}>
                <StackSelect
                  value={ans.primaryGoal}
                  onChange={(v) => setAns((s: any) => ({ ...s, primaryGoal: v }))}
                  options={[
                    { value: "Lose fat", label: "Lose fat" },
                    { value: "Build muscle", label: "Build muscle" },
                    { value: "General fitness", label: "General fitness" },
                    { value: "Manage PCOS", label: "Manage PCOS" },
                    { value: "Manage Diabetes", label: "Manage Diabetes" },
                    { value: "Manage Thyroid", label: "Manage Thyroid" },
                  ]}
                />
                {errors.goal && <InlineError text={errors.goal} />}
              </StepWrap>
            )}

            {/* 2) Secondary */}
            {step === "secondary" && (
              <StepWrap title="Secondary focus 💡" help="Pick what matters right now." onBack={prevStep} onNext={nextStep}>
                <StackMulti
                  values={ans.secondary}
                  onToggle={(v) => setAns((s: any) => ({ ...s, secondary: toggleSet(s.secondary, v) }))}
                  options={[
                    "Energy & sleep",
                    "Mobility/flexibility",
                    "Cardio fitness",
                    "Stress reduction",
                    "Habit consistency",
                  ]}
                />
              </StepWrap>
            )}

            {/* 3) Sex */}
            {step === "sex" && (
              <StepWrap title="Sex 🧬" help="Used only to fine-tune nutrition." onBack={prevStep} onNext={nextStep} nextDisabled={!!errors.sex}>
                <StackSelect
                  value={ans.sex}
                  onChange={(v) => setAns((s: any) => ({ ...s, sex: v }))}
                  options={[
                    { value: "Male", label: "Male" },
                    { value: "Female", label: "Female" },
                    { value: "Prefer not to say", label: "Prefer not to say" },
                  ]}
                />
                {errors.sex && <InlineError text={errors.sex} />}
              </StepWrap>
            )}

            {/* 4) Age */}
            {step === "age" && (
              <StepWrap title="Age 📅" help="We’ll use this to personalize recovery tips." onBack={prevStep} onNext={nextStep} nextDisabled={!!errors.age}>
                <LabeledInput
                  label="Your age"
                  type="number"
                  value={ans.age}
                  onChange={(v) => setAns((s: any) => ({ ...s, age: v }))}
                />
                {errors.age && <InlineError text={errors.age} />}
              </StepWrap>
            )}

            {/* 5) Diet */}
            {step === "diet" && (
              <StepWrap title="Diet pattern 🥗" help="We’ll match recipes, grocery and foods-to-avoid." onBack={prevStep} onNext={nextStep} nextDisabled={!!errors.diet}>
                <StackSelect
                  value={ans.dietPattern}
                  onChange={(v) => setAns((s: any) => ({ ...s, dietPattern: v }))}
                  options={[
                    { value: "Veg", label: "Vegetarian" },
                    { value: "Eggetarian", label: "Eggetarian" },
                    { value: "Non-veg", label: "Non-veg" },
                    { value: "Vegan", label: "Vegan" },
                    { value: "Jain", label: "Jain" },
                  ]}
                />
                <div className="mt-4">
                  <div className="text-sm text-slate-300 mb-2">Exclusions</div>
                  <StackMulti
                    values={ans.exclusions}
                    onToggle={(v) => setAns((s: any) => ({ ...s, exclusions: toggleSet(s.exclusions, v) }))}
                    options={[
                      "None",
                      "No eggs",
                      "No onion/garlic",
                      "Lactose-free",
                      "Gluten-free",
                      "Nut allergy",
                    ]}
                  />
                  <input
                    className="mt-3 w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm"
                    placeholder="Other (optional)"
                    value={ans.exclusionsOther}
                    onChange={(e) => setAns((s: any) => ({ ...s, exclusionsOther: e.target.value }))}
                  />
                </div>
                {errors.diet && <InlineError text={errors.diet} />}
              </StepWrap>
            )}

            {/* 6) Activity */}
            {step === "activity" && (
              <StepWrap title="Current activity 🚶" help="A rough guess is okay." onBack={prevStep} onNext={nextStep} nextDisabled={!!errors.activity}>
                <StackSelect
                  value={ans.activityLevel}
                  onChange={(v) => setAns((s: any) => ({ ...s, activityLevel: v }))}
                  options={[
                    { value: "Sedentary (<5k)", label: "Sedentary (<5k)" },
                    { value: "Light (5–7k)", label: "Light (5–7k)" },
                    { value: "Moderate (7–10k)", label: "Moderate (7–10k)" },
                    { value: "Active (10k+)", label: "Active (10k+)" },
                    { value: "Very active", label: "Very active" },
                  ]}
                />
                {errors.activity && <InlineError text={errors.activity} />}
              </StepWrap>
            )}

            {/* 7) Workouts now */}
            {step === "workoutsNow" && (
              <StepWrap title="Current workouts 🏋️" help="Be honest—this helps us right-size your plan." onBack={prevStep} onNext={nextStep} nextDisabled={!!errors.workoutsNow}>
                <StackSelect
                  value={ans.currentWorkouts}
                  onChange={(v) => setAns((s: any) => ({ ...s, currentWorkouts: v }))}
                  options={[
                    { value: "None", label: "None" },
                    { value: "≤1×/wk", label: "≤1×/wk" },
                    { value: "2–3×/wk", label: "2–3×/wk" },
                    { value: "4–5×/wk", label: "4–5×/wk" },
                    { value: "6–7×/wk", label: "6–7×/wk" },
                  ]}
                />
                {errors.workoutsNow && <InlineError text={errors.workoutsNow} />}
              </StepWrap>
            )}

            {/* 8) Targets */}
            {step === "targets" && (
              <StepWrap title="Targets for week one 🎯" help="Pick what’s realistic. You can change this later." onBack={prevStep} onNext={nextStep}>
                <div>
                  <div className="text-sm text-slate-300 mb-2">Walking target</div>
                  <StackSelect
                    value={String(ans.targetSteps)}
                    onChange={(v) => setAns((s: any) => ({ ...s, targetSteps: Number(v) }))}
                    options={[
                      { value: "0", label: "None" },
                      { value: "5000", label: "5k" },
                      { value: "7000", label: "7k" },
                      { value: "10000", label: "10k" },
                    ]}
                  />
                </div>
                <div className="mt-6">
                  <div className="text-sm text-slate-300 mb-2">Workout days / week</div>
                  <StackSelect
                    value={String(ans.targetWorkoutDays)}
                    onChange={(v) => setAns((s: any) => ({ ...s, targetWorkoutDays: clamp(Number(v), 0, 7) }))}
                    options={[
                      { value: "0", label: "None" },
                      { value: "2", label: "2" },
                      { value: "3", label: "3" },
                      { value: "4", label: "4" },
                      { value: "5", label: "5" },
                      { value: "6", label: "6" },
                      { value: "7", label: "7" },
                    ]}
                  />
                </div>
              </StepWrap>
            )}

            {/* 9) Height */}
            {step === "height" && (
              <StepWrap title="Height 📏" help="Used only to personalize your plan." onBack={prevStep} onNext={nextStep} nextDisabled={!!errors.height}>
                <LabeledInput
                  label="Height (cm) *"
                  type="number"
                  value={ans.heightCm}
                  onChange={(v) => setAns((s: any) => ({ ...s, heightCm: v }))}
                />
                {errors.height && <InlineError text={errors.height} />}
              </StepWrap>
            )}

            {/* 10) Weight */}
            {step === "weight" && (
              <StepWrap title="Weight ⚖️" help="Used only to personalize your plan." onBack={prevStep} onNext={nextStep} nextDisabled={!!errors.weight}>
                <LabeledInput
                  label="Weight (kg) *"
                  type="number"
                  value={ans.weightKg}
                  onChange={(v) => setAns((s: any) => ({ ...s, weightKg: v }))}
                />
                {errors.weight && <InlineError text={errors.weight} />}
              </StepWrap>
            )}

            {/* 11) Experience A */}
            {step === "experienceA" && (
              <StepWrap title="Have you tried before? 🔁" help="This helps us tailor the support and pace." onBack={prevStep} onNext={nextStep} nextDisabled={!!errors.experienceA}>
                <StackSelect
                  value={ans.experience}
                  onChange={(v) => setAns((s: any) => ({ ...s, experience: v }))}
                  options={[
                    { value: "first_time", label: "First time" },
                    { value: "self", label: "Tried on my own" },
                    { value: "program", label: "Program/coach" },
                    { value: "apps", label: "Used apps" },
                    { value: "inconsistent", label: "On & off" },
                  ]}
                />
                {errors.experienceA && <InlineError text={errors.experienceA} />}
              </StepWrap>
            )}

            {/* 12) Experience B */}
            {step === "experienceB" && (
              <StepWrap title="What usually gets in the way? 🧱" help="Pick anything that applies." onBack={prevStep} onNext={nextStep}>
                <StackMulti
                  values={ans.stopReasons}
                  onToggle={(v) => setAns((s: any) => ({ ...s, stopReasons: toggleSet(s.stopReasons, v) }))}
                  options={[
                    "Time/energy",
                    "Travel/routine",
                    "Boring meals",
                    "Soreness/injury",
                    "Motivation dips",
                    "Budget/food access",
                    "Nothing — I’m all in",
                  ]}
                />
                <input
                  className="mt-3 w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm"
                  placeholder="Other (optional)"
                  value={ans.stopOther}
                  onChange={(e) => setAns((s: any) => ({ ...s, stopOther: e.target.value }))}
                />
              </StepWrap>
            )}

            {/* 13) Almost (motivation card) */}
            {step === "almost" && (
              <StepWrap title="Nice — plan almost ready ✨" help="Quick reminder on how Fitterverse is different." onBack={prevStep} onNext={nextStep}>
                <MotivationCard />
              </StepWrap>
            )}

            {/* 14) Review */}
            {step === "review" && (
              <StepWrap
                title="Review your selections ✅"
                onBack={prevStep}
                primaryLabel="Finish setup"
                primaryDisabled={!canFinish(ans) || saving}
                onPrimary={saveAll}
              >
                <ReviewList ans={ans} />
              </StepWrap>
            )}

            {/* Processing */}
            {step === "processing" && (
              <div className="text-center">
                <Card className="bg-slate-900/80 border-slate-800 p-6 rounded-2xl">
                  <div className="text-2xl font-bold">Building your starter plan…</div>
                  <p className="text-slate-300 mt-2">
                    Setting up habits, recipes and grocery list based on your answers.
                  </p>
                  <div className="mt-5 h-2 w-full bg-slate-800 rounded-full overflow-hidden">
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

        {/* Small footer reassurance */}
        <p className="mt-3 text-center text-xs text-slate-400">
          Private by default • You can edit anything later
        </p>
      </section>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────────
   Presentational helpers
────────────────────────────────────────────────────────────────────────────── */

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
}) {
  return (
    <div>
      <h2 className="text-2xl font-extrabold">{title}</h2>
      {help && <p className="text-slate-300 text-sm mt-1">{help}</p>}
      <div className="mt-5">{children}</div>
      <div className="mt-7 flex items-center justify-between">
        {onBack ? (
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-3">
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
  return <div className="mt-3 text-xs text-rose-300">{text}</div>;
}

function labelFor(k: StepKey) {
  switch (k) {
    case "welcome": return "Welcome";
    case "goal": return "Goal";
    case "secondary": return "Secondary";
    case "sex": return "Sex";
    case "age": return "Age";
    case "diet": return "Diet";
    case "activity": return "Activity";
    case "workoutsNow": return "Workouts";
    case "targets": return "Targets";
    case "height": return "Height";
    case "weight": return "Weight";
    case "experienceA": return "Experience";
    case "experienceB": return "Barriers";
    case "almost": return "Almost";
    case "review": return "Review";
    default: return "Processing";
  }
}

function canFinish(ans: any) {
  return (
    !!ans.primaryGoal &&
    !!ans.sex &&
    Number(ans.age) > 0 &&
    !!ans.dietPattern &&
    !!ans.activityLevel &&
    !!ans.currentWorkouts &&
    Number(ans.heightCm) > 0 &&
    Number(ans.weightKg) > 0 &&
    !!ans.experience
  );
}

/* ── Stacked selectors (one option per line) */
function StackButton({
  selected,
  label,
  onClick,
}: {
  selected: boolean;
  label: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl border text-base mb-2 transition-all
      ${selected ? "bg-teal-500/20 border-teal-400"
                 : "bg-slate-900/60 border-slate-800 hover:border-slate-600"}`}
    >
      {label}
    </button>
  );
}

function StackSelect({
  value,
  onChange,
  options,
}: {
  value: string | null | undefined;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      {options.map((o) => (
        <StackButton key={o.value} selected={value === o.value} label={o.label} onClick={() => onChange(o.value)} />
      ))}
    </div>
  );
}

function StackMulti({
  values,
  onToggle,
  options,
}: {
  values: string[];
  onToggle: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      {options.map((o) => (
        <StackButton key={o} selected={values.includes(o)} label={o} onClick={() => onToggle(o)} />
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
        className="mt-2 w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-3 text-base"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function InfoCard({ title, bullets }: { title: string; bullets: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
      <div className="font-semibold">{title}</div>
      <ul className="mt-2 space-y-1 text-sm text-slate-300">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-teal-400" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MotivationCard() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-teal-900/20 to-slate-900/40 p-5">
      <div className="text-lg font-semibold">Why this works 💚</div>
      <p className="mt-2 text-sm text-slate-300">
        We focus on identity-based habits, flexible streaks, and weekly <i>micro</i>-reviews.
        You’ll start tiny, build momentum, and stay consistent without guilt.
      </p>
      <div className="mt-3 grid gap-2">
        <Badge>✨ Tiny wins daily</Badge>
        <Badge>🔗 Streaks that bend, not break</Badge>
        <Badge>🧭 Adjust weekly in 3 minutes</Badge>
      </div>
    </div>
  );
}
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs text-teal-200 w-max">
      {children}
    </div>
  );
}

function ReviewList({ ans }: { ans: any }) {
  return (
    <div className="text-sm text-slate-200 space-y-2">
      <Row label="Main goal" value={ans.primaryGoal} />
      <Row label="Secondary" value={ans.secondary?.length ? ans.secondary.join(", ") : "—"} />
      <Row label="Sex" value={ans.sex} />
      <Row label="Age" value={ans.age} />
      <Row
        label="Diet"
        value={
          ans.dietPattern +
          (ans.exclusions?.length ? ` • Exclusions: ${ans.exclusions.join(", ")}` : "")
        }
      />
      <Row
        label="Activity"
        value={`${ans.activityLevel} • Workouts now: ${ans.currentWorkouts}`}
      />
      <Row
        label="Targets"
        value={`Walking ${ans.targetSteps ? ans.targetSteps.toLocaleString() + " steps" : "None"} • Workouts ${ans.targetWorkoutDays ? `${ans.targetWorkoutDays}×/wk` : "None"}`}
      />
      <Row
        label="Stats"
        value={`${ans.heightCm || "—"} cm • ${ans.weightKg || "—"} kg`}
      />
      <Row
        label="Experience"
        value={ans.experience ? prettyExperience(ans.experience) : "—"}
      />
      <Row
        label="Barriers"
        value={
          ans.stopReasons?.length
            ? ans.stopReasons.join(", ") + (ans.stopOther ? `, ${ans.stopOther}` : "")
            : ans.stopOther || "—"
        }
      />
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-slate-400">{label}: </span>
      <b className="text-slate-100">{value}</b>
    </div>
  );
}
function prettyExperience(v: string) {
  switch (v) {
    case "first_time": return "First time";
    case "self": return "Tried on my own";
    case "program": return "Program/coach";
    case "apps": return "Used apps";
    case "inconsistent": return "On & off";
    default: return v;
  }
}

/* ──────────────────────────────────────────────────────────────────────────────
   Mappers
────────────────────────────────────────────────────────────────────────────── */
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
    case "None": return "none";
    case "≤1×/wk": return "occasional";
    case "2–3×/wk": return "regular";
    case "4–5×/wk": return "consistent";
    default: return "athlete";
  }
}
