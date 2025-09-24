// src/components/AuthModal.tsx
// -----------------------------------------------------------------------------
// A polished, production-style auth modal with:
//  - Prominent Google / Apple buttons with brand-appropriate styling
//  - "Continue with phone" that expands inline to a focused OTP flow
//  - Backdrop click + Esc to close
//  - Clear error messaging and subtle trust copy
//  - Uses your existing Zustand store and Firebase logic (no API changes)
// -----------------------------------------------------------------------------

import React from "react";
import { useAuth } from "@/state/authStore";
import Card from "./ui/Card";
import Input from "./ui/Input";
import Button from "./ui/Button";

export default function AuthModal() {
  const {
    showAuthModal,
    closeAuthModal,
    loginWithGoogle,
    phone,
    otp,
    setPhone,
    setOtp,
    startPhoneSignIn,
    verifyOtp,
    loading,
    error,
  } = useAuth();

  // Local UI state for expanding/collapsing the phone flow
  const [showPhone, setShowPhone] = React.useState(false);

  // Close on Esc
  React.useEffect(() => {
    if (!showAuthModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuthModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showAuthModal, closeAuthModal]);

  if (!showAuthModal) return null;

  // Click backdrop to close (but ignore clicks inside the card)
  const onBackdropClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === e.currentTarget) closeAuthModal();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
      onClick={onBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="auth-title"
    >
      {/* Invisible Recaptcha anchor for Firebase phone auth */}
      <div id="recaptcha-container" />

      <Card className="relative w-full max-w-md bg-slate-900 border-slate-700 shadow-2xl">
        {/* Close button (top-right) */}
        <button
          onClick={closeAuthModal}
          className="absolute right-3 top-3 rounded-md p-2 text-slate-400 hover:text-white hover:bg-slate-800/60"
          aria-label="Close"
        >
          ×
        </button>

        {/* Header */}
        <div className="px-6 pt-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/30">
            {/* Simple FV monogram */}
            <span className="font-extrabold text-emerald-400">FV</span>
          </div>
          <h3 id="auth-title" className="text-lg font-semibold">
            Continue to Fitterverse
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            Sign in to save progress and sync across devices.
          </p>
        </div>

        {/* OAuth options */}
        <div className="px-6 pt-5">
          <button
            onClick={loginWithGoogle}
            disabled={loading}
            className="group inline-flex w-full items-center justify-center gap-3 rounded-lg bg-white px-4 py-2.5 font-medium text-slate-900 ring-1 ring-black/10 transition hover:bg-white/90 disabled:opacity-70"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <button
            disabled // remove this once Apple is configured in Firebase
            className="mt-2 inline-flex w-full items-center justify-center gap-3 rounded-lg bg-black px-4 py-2.5 font-medium text-white ring-1 ring-white/10 transition disabled:opacity-50"
            title="Coming soon"
          >
            <AppleIcon />
            Continue with Apple
          </button>
        </div>

        {/* Divider */}
        <div className="mx-6 my-5 flex items-center gap-3 text-xs text-slate-400">
          <div className="h-px flex-1 bg-slate-700" />
          or
          <div className="h-px flex-1 bg-slate-700" />
        </div>

        {/* Phone option (collapsed by default) */}
        <div className="px-6 pb-2">
          {!showPhone ? (
            <button
              onClick={() => setShowPhone(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-100 transition hover:bg-slate-800/60"
            >
              <PhoneIcon />
              Continue with phone
            </button>
          ) : (
            <div className="space-y-3">
              <div className="text-sm font-medium text-slate-200">Phone sign-in</div>
              <Input
                label="Phone (with country code)"
                placeholder="+1 555 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              {/* Send + Verify row */}
              <div className="grid grid-cols-5 gap-2">
                <button
                  onClick={startPhoneSignIn}
                  disabled={loading}
                  className="col-span-2 rounded-lg bg-emerald-500 px-3 py-2.5 font-semibold text-slate-900 transition hover:bg-emerald-400 disabled:opacity-60"
                >
                  {loading ? "Sending…" : "Send code"}
                </button>

                <div className="col-span-2">
                  <Input
                    label="Code"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>

                <button
                  onClick={verifyOtp}
                  disabled={loading}
                  className="col-span-1 rounded-lg bg-emerald-600 px-3 py-2.5 font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
                >
                  Verify
                </button>
              </div>

              <button
                onClick={() => setShowPhone(false)}
                className="text-sm text-slate-400 underline underline-offset-4 hover:text-slate-200"
              >
                Use another method
              </button>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="px-6 pt-2">
            <div className="rounded-lg border border-red-900/40 bg-red-950/40 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          </div>
        )}

        {/* Trust / compliance copy */}
        <div className="px-6 pb-6 pt-5">
          <p className="text-center text-[11px] leading-5 text-slate-500">
            By continuing, you agree to our{" "}
            <a href="/legal/terms" className="text-slate-300 underline hover:text-white">
              Terms
            </a>{" "}
            and{" "}
            <a href="/legal/privacy" className="text-slate-300 underline hover:text-white">
              Privacy Policy
            </a>
            . We never post without permission.
          </p>
        </div>
      </Card>
    </div>
  );
}

/* --- Inline brand icons (accessible, lightweight) ------------------------ */

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.72 1.22 9.23 3.6l6.92-6.92C35.9 2.32 30.47 0 24 0 14.62 0 6.51 5.39 2.56 13.22l8.63 6.69C13.1 14.09 18.11 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.56-.14-3.05-.41-4.5H24v9h12.7c-.55 3-2.3 5.54-4.9 7.22l7.49 5.81C43.95 38.39 46.5 31.91 46.5 24.5z"
      />
      <path
        fill="#FBBC05"
        d="M11.19 19.91l-8.63-6.69C1.13 16.01 0 19.86 0 24c0 4.1 1.12 7.92 3.09 11.2l8.79-6.8C10.97 26.62 10.5 25.35 10.5 24c0-1.06.25-2.07.69-3.09z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.91-5.78l-7.49-5.81C30.67 37.78 27.53 39 24 39c-5.9 0-10.92-4.6-12.33-10.3l-8.79 6.8C6.84 42.63 14.72 48 24 48z"
      />
      <path fill="none" d="M0 0h48v48H0z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 17 20" className="h-[18px] w-[18px]">
      <path
        fill="currentColor"
        d="M13.545 10.87c-.02-2.18 1.785-3.23 1.866-3.28-1.02-1.49-2.6-1.69-3.16-1.72-1.35-.14-2.63.8-3.31.8-.68 0-1.74-.78-2.87-.76-1.47.02-2.83.86-3.58 2.19-1.53 2.67-.39 6.62 1.09 8.78.72 1.04 1.58 2.2 2.7 2.16 1.09-.04 1.5-.7 2.82-.7 1.32 0 1.69.7 2.86.68 1.18-.02 1.93-1.06 2.65-2.1.83-1.2 1.17-2.37 1.19-2.43-.03-.01-2.29-.88-2.31-3.6zM11.3 4.9c.6-.73 1-1.75.9-2.77-.87.04-1.94.58-2.57 1.31-.56.64-1.05 1.68-.92 2.67.98.08 1.98-.5 2.59-1.21z"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px]">
      <path
        fill="currentColor"
        d="M17 1H7a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 19h-4v-2h4v2Zm3-4H7V4h10v12Z"
      />
    </svg>
  );
}
