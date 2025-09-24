import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useApp } from "../state/appStore";

/** Compact habit catalog */
const HABITS = [
  { id: "morning-routine", emoji: "🌤️", title: "Morning Reset", payoff: "3 small wins before 9am", why: ["Reduce decision fatigue", "Higher focus", "More energy"] },
  { id: "screen-time",     emoji: "📵",  title: "Screen Sanity", payoff: "Reclaim 60–90 minutes/day",   why: ["Better sleep", "Less anxiety", "More deep work"] },
  { id: "exercise",        emoji: "🏃",  title: "Move Daily",     payoff: "10-minute starter plan",      why: ["Mood boost", "Metabolism", "Longevity"] },
  { id: "workout",         emoji: "💪",  title: "Workout Starter",payoff: "Strength x3/week (10 min)",   why: ["Build muscle", "Bone density", "Metabolic health"] },
  { id: "healthy-diet",    emoji: "🥗",  title: "Healthy Plate",  payoff: "1 optimized meal/day",        why: ["Steadier energy", "Better markers", "Fewer cravings"] },
  { id: "walk-10k",        emoji: "🚶‍♂️",title: "10k Steps",      payoff: "Move more, stress less",      why: ["Cardio fitness", "Lower stress", "Incidental burn"] },
] as const;

type Habit = (typeof HABITS)[number];

export default function Onboarding() {
  const nav = useNavigate();
  const { profile, setProfile } = useApp();

  const [step, setStep] = React.useState<"choose" | "otp">("choose");
  const [selected, setSelected] = React.useState<Habit | null>(null);
  const [showWhy, setShowWhy] = React.useState(false);
  const [phone, setPhone] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  function pickHabit(h: Habit) {
    setSelected(h);
    setShowWhy(false);
    // safe cast in case your HabitId union doesn't include all new ids yet
    setProfile({ ...profile, habit: (h.id as unknown) as any });
  }

  async function goOtp() {
    if (!selected) return;
    if (!phone || phone.replace(/\D/g, "").length < 10) {
      alert("Enter a valid phone number");
      return;
    }
    setBusy(true);
    // simulate sending code
    await new Promise((r) => setTimeout(r, 500));
    setBusy(false);
    setStep("otp");
  }

  async function verify() {
    if (otp !== "1234") {
      alert("Incorrect code (use 1234 for demo)");
      return;
    }
    setBusy(true);
    await new Promise((r) => setTimeout(r, 400));
    setBusy(false);
    nav("/dashboard");
  }

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100">
      {/* header */}
      <div className="container pt-10 pb-2">
        <div className="mb-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-xs tracking-wide uppercase text-slate-400">
              <span className={`h-1 w-10 rounded ${step === "choose" ? "bg-emerald-400" : "bg-slate-700"}`} />
              <span>Choose</span>
              <span className={`h-1 w-10 rounded ${step === "otp" ? "bg-emerald-400" : "bg-slate-700"}`} />
              <span>Verify</span>
              <span className="h-1 w-10 rounded bg-slate-700" />
              <span>Start</span>
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl font-semibold">
              {step === "choose" ? "One habit. Real momentum." : "Verify your number"}
            </h1>
            <p className="mt-2 text-slate-400">
              {step === "choose"
                ? "Pick one lever. Keep it simple. Compounding wins start here."
                : "We’ll use this to personalize and keep you accountable (demo code: 1234)."}
            </p>
          </div>
        </div>
      </div>

      {/* body */}
      <div className="container pb-24">
        {step === "choose" ? (
          <>
            {/* habit grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {HABITS.map((h) => {
                const active = selected?.id === h.id;
                return (
                  <button
                    key={h.id}
                    onClick={() => pickHabit(h)}
                    className={[
                      "rounded-2xl p-5 text-left transition border bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400",
                      active
                        ? "border-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.25)]"
                        : "border-slate-800 hover:border-slate-700",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{h.emoji}</span>
                      <div>
                        <div className="font-medium text-lg">{h.title}</div>
                        <div className="text-slate-400 text-sm">{h.payoff}</div>
                      </div>
                    </div>

                    {/* only the selected card reveals details (progressive disclosure) */}
                    {active && (
                      <div className="mt-4">
                        {!showWhy ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowWhy(true);
                            }}
                            className="text-xs text-emerald-400 hover:text-emerald-300"
                          >
                            Why this works →
                          </button>
                        ) : (
                          <Card>
                            <div className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                              Why this works
                            </div>
                            <ul className="text-sm text-slate-200 space-y-1">
                              {h.why.map((w) => (
                                <li key={w}>• {w}</li>
                              ))}
                            </ul>
                            <div className="mt-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowWhy(false);
                                }}
                                className="text-xs text-slate-400 hover:text-slate-300"
                              >
                                Hide
                              </button>
                            </div>
                          </Card>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* phone capture — clean, single field */}
            <div className="mt-8 max-w-md">
              <Card>
                <div className="space-y-4">
                  <Input
                    label="Phone number"
                    placeholder="e.g. +1 415 555 0199"
                    value={phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                  />
                  <div className="text-xs text-slate-400">
                    We’ll send a one-time code for setup (demo flow — no SMS is sent).
                  </div>
                </div>
              </Card>
            </div>
          </>
        ) : (
          // OTP step
          <div className="max-w-md">
            <Card>
              <div className="space-y-4">
                <button
                  className="text-emerald-400 hover:text-emerald-300 text-sm"
                  onClick={() => setStep("choose")}
                >
                  ← Back
                </button>
                <Input
                  label="Verification code"
                  placeholder="Enter code (demo: 1234)"
                  value={otp}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOtp(e.target.value)}
                />
                <div className="text-xs text-slate-400">
                  Tip: If you’re testing, the code is <span className="text-slate-300 font-semibold">1234</span>.
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* sticky action bar (mobile friendly, one clear CTA) */}
      <div className="fixed inset-x-0 bottom-0 border-t border-slate-800 bg-slate-950/90 backdrop-blur supports-[backdrop-filter]:bg-slate-950/70">
        <div className="container py-3 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="text-sm text-slate-400">
            {step === "choose"
              ? selected
                ? `Selected: ${selected.title}`
                : "Pick one habit to start."
              : "Enter the code we sent (demo: 1234)."}
          </div>
          {step === "choose" ? (
            <Button
              disabled={!selected || !phone || busy}
              onClick={goOtp}
              className="min-w-48"
            >
              {busy ? "Sending…" : selected ? `Continue with ${selected.title}` : "Continue"}
            </Button>
          ) : (
            <Button disabled={!otp || busy} onClick={verify} className="min-w-48">
              {busy ? "Checking…" : "Verify & Start"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
