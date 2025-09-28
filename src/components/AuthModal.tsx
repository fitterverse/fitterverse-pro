import React from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/state/authStore";

type PhoneStage = "enter" | "otp";

function BrandWordmark() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 shadow-sm" />
      <span className="text-sm tracking-wide text-slate-300">Fitterverse</span>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.9 29.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16.3 18 14 22 14c3 0 5.7 1.1 7.8 3l5.7-5.7C32.3 7.1 28.4 6 24 6c-6.9 0-12.8 3.5-16.3 8.7z"/>
      <path fill="#4CAF50" d="M24 44c5 0 9.6-1.9 13.1-5.1l-6-4.9C28.9 35.6 26.6 36 24 36c-5.1 0-9.6-3.1-11.3-7.5l-6.6 5.1C9.6 40.4 16.3 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.4 3.4-4.9 6-9.3 6-4 0-7.4-2.3-9.1-5.6l-6.6 5.1C12.2 38.5 17.7 42 24 42c8.6 0 16-7 16-16 0-1.2-.1-2.3-.4-3.5z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="currentColor">
      <path d="M16.365 1.43c0 1.14-.463 2.206-1.213 2.98-.77.794-1.998 1.415-3.187 1.333-.104-1.115.462-2.264 1.213-3.037.79-.81 2.167-1.41 3.187-1.276zM20.79 17.05c-.552 1.13-.81 1.61-1.522 2.595-.989 1.376-2.386 3.095-4.11 3.12-1.03.02-1.72-.3-2.64-.3-.93 0-1.65.29-2.65.31-1.77.03-3.126-1.49-4.12-2.86C3.754 18.07 2 14.15 3.64 10.96c.69-1.35 1.918-2.2 3.342-2.23 1.04-.02 2.02.36 2.65.36.62 0 1.79-.45 3.02-.39 1.15.05 2.21.47 2.99 1.21-2.64 1.43-2.22 5.17.42 6.2.5.2 1.1.29 1.67.31-.17.49-.35.98-.54 1.33z"/>
    </svg>
  );
}

export default function AuthModal() {
  const {
    showAuthModal,
    closeAuthModal,
    loginWithGoogle,
    loginWithApple,
    // phone auth
    phone, setPhone,
    otp, setOtp,
    startPhoneSignIn,
    verifyOtp,
    loading,
    error,
  } = useAuth();

  const [phoneStage, setPhoneStage] = React.useState<PhoneStage>("enter");
  const [view, setView] = React.useState<"oauth" | "phone">("oauth");

  React.useEffect(() => {
    if (!showAuthModal) {
      // reset when closed
      setView("oauth");
      setPhoneStage("enter");
    }
  }, [showAuthModal]);

  if (!showAuthModal) return null;

  return (
    <div className="fixed inset-0 z-[200] grid place-items-center bg-black/70 px-4" role="dialog" aria-modal="true">
      <div id="recaptcha-container" />

      <Card className="w-full max-w-[420px] overflow-hidden border-slate-700 bg-slate-900/95 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <BrandWordmark />
          <button
            onClick={closeAuthModal}
            aria-label="Close sign-in"
            className="rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Title */}
        <div className="px-5">
          <h3 className="text-xl font-extrabold tracking-tight">Welcome back</h3>
          <p className="mt-1 text-sm text-slate-400">Sign in to start your habit plan.</p>
        </div>

        {/* Body */}
        <div className="px-5 pb-5 pt-4">
          {view === "oauth" && (
            <>
              <div className="space-y-3">
                <Button
                  onClick={loginWithGoogle}
                  disabled={loading}
                  className="group w-full justify-center bg-white text-slate-900 hover:bg-white/90"
                >
                  <span className="mr-2"><GoogleIcon /></span>
                  Continue with Google
                </Button>
                <Button
                  onClick={loginWithApple}
                  disabled={loading}
                  className="group w-full justify-center bg-black text-white hover:bg-black/90"
                >
                  <span className="mr-2"><AppleIcon /></span>
                  Continue with Apple
                </Button>
              </div>

              <div className="mt-5">
                <button
                  onClick={() => setView("phone")}
                  className="w-full rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-800"
                >
                  Use phone instead
                </button>
              </div>
            </>
          )}

          {view === "phone" && (
            <>
              {/* Stepper */}
              <div className="mb-4 flex items-center gap-2 text-xs text-slate-400">
                <div className={`h-1.5 w-1.5 rounded-full ${phoneStage === "enter" ? "bg-emerald-400" : "bg-slate-600"}`} />
                <span>Enter phone</span>
                <span className="mx-1">•</span>
                <div className={`h-1.5 w-1.5 rounded-full ${phoneStage === "otp" ? "bg-emerald-400" : "bg-slate-600"}`} />
                <span>Enter code</span>
              </div>

              {phoneStage === "enter" && (
                <div className="space-y-4">
                  <Input
                    label="Phone (with country code)"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Button
                    onClick={async () => {
                      await startPhoneSignIn();
                      // only advance if start succeeded (you can also gate on an error flag)
                      setPhoneStage("otp");
                    }}
                    disabled={loading || !phone?.trim()}
                    className="w-full"
                  >
                    Send code
                  </Button>

                  <button
                    onClick={() => setView("oauth")}
                    className="w-full rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-800"
                  >
                    Back to Google / Apple
                  </button>
                </div>
              )}

              {phoneStage === "otp" && (
                <div className="space-y-4">
                  <div className="rounded-lg bg-slate-800/60 p-3 text-sm text-slate-300">
                    Code sent to <strong className="text-white">{phone}</strong>
                  </div>

                  <Input
                    label="OTP"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    inputMode="numeric"
                    maxLength={6}
                  />

                  <Button
                    onClick={verifyOtp}
                    disabled={loading || (otp?.trim().length ?? 0) < 6}
                    className="w-full"
                  >
                    Verify & continue
                  </Button>

                  <div className="flex items-center justify-between text-xs">
                    <button
                      onClick={() => setPhoneStage("enter")}
                      className="text-slate-400 underline underline-offset-4 hover:text-slate-200"
                    >
                      Change number
                    </button>
                    <button
                      onClick={() => setView("oauth")}
                      className="text-slate-400 underline underline-offset-4 hover:text-slate-200"
                    >
                      Use Google / Apple
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <div role="alert" className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          {/* Footer microcopy */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400/90" />
              SSO secured
            </div>
            <div className="text-[11px] text-slate-500">
              By continuing you agree to our{" "}
              <a className="underline underline-offset-2" href="/terms">Terms</a> &{" "}
              <a className="underline underline-offset-2" href="/privacy">Privacy</a>.
            </div>
          </div>

          <div className="mt-3 text-right">
            <button
              onClick={closeAuthModal}
              className="text-xs text-slate-400 underline underline-offset-4 hover:text-slate-200"
            >
              Continue without an account
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
