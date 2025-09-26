// src/components/AuthModal.tsx
import React from "react";
import { useAuth } from "@/state/authStore";

/** Lightweight spinner for busy states */
function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin text-current/80"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-80"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v4A4 4 0 0 0 8 12H4z"
      />
    </svg>
  );
}

/** Brand icons (pixel-perfect + accessible) */
function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 31.5 29.4 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.2 2.8l5.7-5.7C33.8 6.1 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10 0 19-7.3 19-20 0-1.2-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.9C14.4 17.5 18.9 14 24 14c2.8 0 5.3 1 7.2 2.8l5.7-5.7C33.8 6.1 29.2 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z"/>
      <path fill="#4CAF50" d="M24 44c5.4 0 10-1.8 13.3-4.8l-6.2-4.7C29.3 35.5 26.9 36 24 36c-5.4 0-9.9-3.5-11.5-8.2l-6.5 5C9.7 39.7 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 3.1-3.6 5.5-7 6.5l6.2 4.7c3.6-3.3 5.8-8.2 5.8-14.2 0-1.2-.1-2.4-.4-3.5z"/>
    </svg>
  );
}
function AppleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 448 512" className="h-[18px] w-[18px]">
      <path
        fill="currentColor"
        d="M350.5 129.4c-12.4 15-32.6 26.6-52.6 25.1-2.7-20.1 7.8-41.7 19.8-54.6 13.6-15.6 36.8-27.3 55.8-27.9 2.3 20.6-6.6 42.2-23 57.4zm-43.1 30.7c-30.8-1.8-56.9 17.6-71.7 17.6-15 0-36.5-17.2-60.1-16.8-30.9.5-59.2 18-75.1 45.9-32.1 55.3-8.6 137.1 22.9 182.1 15.2 22 33.3 46.7 57.3 45.9 22.9-.9 31.6-14.8 59-14.8 27.3 0 35.1 14.8 59.1 14.4 24.6-.4 40.2-22.4 55.2-44.4 17.3-25.2 24.5-49.7 24.9-51 0-.3-47.8-18.4-48.2-72.7-.4-45.4 36.9-67.1 38.6-68.3-21.1-30.8-53.5-34.1-61.9-34.9z"
      />
    </svg>
  );
}

export default function AuthModal() {
  const {
    showAuthModal,
    closeAuthModal,
    loginWithGoogle,
    loginWithApple,
    phone,
    otp,
    setPhone,
    setOtp,
    startPhoneSignIn,
    verifyOtp,
    loading,
    error,
  } = useAuth();

  if (!showAuthModal) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4"
      aria-modal="true"
      role="dialog"
      aria-label="Sign in to Fitterverse"
    >
      {/* Focus trap anchor */}
      <div tabIndex={0} />

      {/* Outer glow frame */}
      <div className="relative w-full max-w-md">
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-emerald-500/30 via-transparent to-cyan-500/20 blur-sm opacity-70" />
        <div className="relative rounded-2xl bg-[#0B1220] border border-white/10 shadow-2xl ring-1 ring-white/10">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 pt-5 pb-4">
            <div className="h-8 w-8 rounded-md bg-emerald-500/20 flex items-center justify-center">
              <div className="h-3 w-3 rounded-sm bg-emerald-500" />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Continue to Fitterverse</h1>
              <p className="text-xs text-slate-400">Sign in or continue as guest</p>
            </div>
            <button
              onClick={closeAuthModal}
              className="p-1 text-slate-400 hover:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="px-5 pb-5">
            {/* Buttons */}
            <div className="space-y-2">
              <button
                onClick={loginWithGoogle}
                disabled={loading}
                className="group relative w-full inline-flex items-center justify-center gap-3 rounded-xl bg-white text-slate-900 px-4 py-3 font-medium shadow-sm hover:shadow transition disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                aria-label="Continue with Google"
              >
                {loading ? <Spinner /> : <GoogleIcon />}
                <span className="translate-y-[0.5px]">Continue with Google</span>
              </button>

              <button
                onClick={loginWithApple}
                disabled={loading}
                className="group relative w-full inline-flex items-center justify-center gap-3 rounded-xl bg-black text-white px-4 py-3 font-medium shadow-sm hover:shadow-lg transition disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                aria-label="Continue with Apple"
              >
                {loading ? <Spinner /> : <AppleIcon />}
                <span className="translate-y-[0.5px]">Continue with Apple</span>
              </button>
            </div>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wide text-slate-500">
              <div className="h-px flex-1 bg-white/10" />
              or use phone
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Phone: compact & clean */}
            <div className="space-y-3">
              <label className="block text-sm text-slate-300">
                Phone (with country code)
              </label>
              <div className="flex gap-2">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555 123 4567"
                  inputMode="tel"
                  className="flex-1 rounded-xl bg-slate-900/60 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-emerald-500/60"
                />
                <button
                  onClick={startPhoneSignIn}
                  disabled={loading}
                  className="rounded-xl bg-emerald-500 text-slate-900 px-4 py-3 text-sm font-semibold hover:bg-emerald-400 transition disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                >
                  {loading ? <Spinner /> : "Send code"}
                </button>
              </div>

              <label className="block text-sm text-slate-300">Code</label>
              <div className="flex gap-2">
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  inputMode="numeric"
                  className="flex-1 rounded-xl bg-slate-900/60 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-emerald-500/60 tracking-[0.2em]"
                />
                <button
                  onClick={verifyOtp}
                  disabled={loading}
                  className="rounded-xl bg-cyan-500 text-slate-900 px-4 py-3 text-sm font-semibold hover:bg-cyan-400 transition disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                >
                  {loading ? <Spinner /> : "Verify"}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
              >
                {error}
              </div>
            )}

            {/* Trust line */}
            <p className="mt-5 text-[11px] leading-4 text-slate-500">
              By continuing, you agree to our Terms and acknowledge our Privacy Policy.
              We never share your data.
            </p>
          </div>
        </div>
      </div>

      {/* Focus trap anchor */}
      <div tabIndex={0} />
    </div>
  );
}
