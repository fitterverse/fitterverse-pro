// src/pages/Onboarding.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/state/authStore";
import { markOnboarded } from "@/lib/profile";

type Step = 0 | 1 | 2 | 3;

type Baseline = {
  goal: "Lose weight" | "Build muscle" | "Get consistent" | "Boost energy" | "";
  experience: "Beginner" | "Intermediate" | "Advanced" | "";
};

type Habit = {
  id: string;
  title: string;
  description: string;
};

type Schedule = {
  timeOfDay: "Morning" | "Afternoon" | "Evening" | "";
  reminders: boolean;
};

const HABIT_TEMPLATES: Habit[] = [
  { id: "walk-10", title: "Walk 10 minutes", description: "Short daily walk to kickstart momentum." },
  { id: "pushup-5", title: "5 push-ups", description: "Micro-strength habit; add reps weekly." },
  { id: "water-2l", title: "Drink 2L water", description: "Hydration improves energy and recovery." },
  { id: "sleep-7h", title: "Sleep 7 hours", description: "Recovery first; fitness follows." },
];

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = React.useState<Step>(0);

  const [baseline, setBaseline] = React.useState<Baseline>({
    goal: "",
    experience: "",
  });

  const [habit, setHabit] = React.useState<Habit | null>(null);

  const [schedule, setSchedule] = React.useState<Schedule>({
    timeOfDay: "",
    reminders: true,
  });

  const canNext =
    (step === 0 && baseline.goal && baseline.experience) ||
    (step === 1 && habit) ||
    (step === 2 && schedule.timeOfDay !== "") ||
    step === 3;

  function next() {
    if (step < 3) setStep((s) => ((s + 1) as Step));
  }
  function back() {
    if (step > 0) setStep((s) => ((s - 1) as Step));
  }

  function finish() {
    // Persist a simple profile locally for now (you can swap to Firestore later).
    const profile = {
      uid: user?.uid ?? null,
      baseline,
      habit,
      schedule,
      createdAt: Date.now(),
    };
    try {
      localStorage.setItem("fv:profile", JSON.stringify(profile));
    } catch {}
    markOnboarded(user?.uid);
    navigate("/dashboard", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-10">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Step {step + 1} of 4</span>
            <span>{((step + 1) / 4) * 100}%</span>
          </div>
          <div className="mt-2 h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 transition-all"
              style={{ width: `${((step + 1) / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step cards */}
        <div className="space-y-4">
          {/* STEP 1: Baseline */}
          {step === 0 && (
            <Card className="bg-slate-900/60 border-slate-800">
              <div className="p-5 space-y-6">
                <div>
                  <h1 className="text-2xl font-bold">Let’s set your baseline</h1>
                  <p className="text-slate-300 mt-1">
                    We’ll personalize your first habit and nudge schedule based on your goal and experience.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Primary goal</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["Lose weight", "Build muscle", "Get consistent", "Boost energy"] as const).map(
                        (g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setBaseline((b) => ({ ...b, goal: g }))}
                            className={`rounded-xl border px-3 py-2 text-sm
                              ${
                                baseline.goal === g
                                  ? "border-teal-500 bg-teal-500/10 text-teal-300"
                                  : "border-slate-700 hover:border-slate-500"
                              }`}
                          >
                            {g}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Experience level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["Beginner", "Intermediate", "Advanced"] as const).map((e) => (
                        <button
                          key={e}
                          type="button"
                          onClick={() => setBaseline((b) => ({ ...b, experience: e }))}
                          className={`rounded-xl border px-3 py-2 text-sm
                            ${
                              baseline.experience === e
                                ? "border-teal-500 bg-teal-500/10 text-teal-300"
                                : "border-slate-700 hover:border-slate-500"
                            }`}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* STEP 2: Choose first habit */}
          {step === 1 && (
            <Card className="bg-slate-900/60 border-slate-800">
              <div className="p-5 space-y-5">
                <div>
                  <h2 className="text-xl font-semibold">Choose your first daily habit</h2>
                  <p className="text-slate-300 mt-1">
                    Start tiny—consistency beats intensity. You can add more later.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {HABIT_TEMPLATES.map((h) => {
                    const selected = habit?.id === h.id;
                    return (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => setHabit(h)}
                        className={`text-left rounded-xl border p-4 transition
                          ${
                            selected
                              ? "border-teal-500 bg-teal-500/10"
                              : "border-slate-700 hover:border-slate-500"
                          }`}
                      >
                        <div className="font-medium">{h.title}</div>
                        <div className="text-sm text-slate-300 mt-1">{h.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}

          {/* STEP 3: Schedule */}
          {step === 2 && (
            <Card className="bg-slate-900/60 border-slate-800">
              <div className="p-5 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">When should we nudge you?</h2>
                  <p className="text-slate-300 mt-1">
                    Pick a time you’re most likely to follow through. You can change it any time.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Preferred time</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["Morning", "Afternoon", "Evening"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSchedule((s) => ({ ...s, timeOfDay: t }))}
                          className={`rounded-xl border px-3 py-2 text-sm
                            ${
                              schedule.timeOfDay === t
                                ? "border-teal-500 bg-teal-500/10 text-teal-300"
                                : "border-slate-700 hover:border-slate-500"
                            }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Reminders</label>
                    <div className="flex items-center gap-3">
                      <input
                        id="remind"
                        type="checkbox"
                        checked={schedule.reminders}
                        onChange={(e) => setSchedule((s) => ({ ...s, reminders: e.target.checked }))}
                        className="h-4 w-4 accent-teal-500"
                      />
                      <label htmlFor="remind" className="text-sm text-slate-300">
                        Send me gentle nudges to keep me consistent
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* STEP 4: Review / Finish */}
          {step === 3 && (
            <Card className="bg-slate-900/60 border-slate-800">
              <div className="p-5 space-y-5">
                <div>
                  <h2 className="text-xl font-semibold">You’re ready! Here’s your plan</h2>
                  <p className="text-slate-300 mt-1">
                    We start tiny and build. You’ll see check-ins, streak-friendly nudges, and weekly
                    progress.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-700 p-4">
                    <div className="text-slate-400 text-xs mb-1">Goal</div>
                    <div className="font-medium">{baseline.goal || "—"}</div>
                  </div>
                  <div className="rounded-xl border border-slate-700 p-4">
                    <div className="text-slate-400 text-xs mb-1">Experience</div>
                    <div className="font-medium">{baseline.experience || "—"}</div>
                  </div>
                  <div className="rounded-xl border border-slate-700 p-4">
                    <div className="text-slate-400 text-xs mb-1">First habit</div>
                    <div className="font-medium">{habit?.title || "—"}</div>
                    <div className="text-sm text-slate-300 mt-1">{habit?.description}</div>
                  </div>
                  <div className="rounded-xl border border-slate-700 p-4">
                    <div className="text-slate-400 text-xs mb-1">Schedule</div>
                    <div className="font-medium">
                      {schedule.timeOfDay || "—"} {schedule.reminders ? "• with reminders" : ""}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Footer actions */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={back}
            className="border border-slate-700 hover:border-slate-500"
            disabled={step === 0}
          >
            Back
          </Button>

          {step < 3 ? (
            <Button onClick={next} disabled={!canNext} className="bg-teal-500 hover:bg-teal-400 text-black">
              Continue
            </Button>
          ) : (
            <Button onClick={finish} className="bg-teal-500 hover:bg-teal-400 text-black">
              Finish & Go to Dashboard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
