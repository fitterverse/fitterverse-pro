// src/components/AuthModal.tsx
import React, { useEffect, useRef } from "react";
import { useAuth } from "@/state/authStore";

type AuthButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  bg?: string;
  text?: string;
  ring?: string;
  hover?: string;
  icon?: React.ReactNode;
  dataTestId?: string;
};

function AuthButton({
  children,
  onClick,
  disabled,
  bg = "bg-slate-800",
  text = "text-white",
  ring = "ring-1 ring-slate-700",
  hover = "hover:opacity-95",
  icon,
  dataTestId,
}: AuthButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-testid={dataTestId}
      className={[
        "w-full relative inline-flex items-center justify-center gap-3 rounded-xl px-4 py-3",
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        bg,
        text,
        ring,
        hover,
      ].join(" ")}
    >
      <span className="h-5 w-5">{icon}</span>
      <span className="text-[15px] font-medium">{children}</span>
    </button>
  );
}

/** Brand icons (inline SVG = no extra deps) **/
const GoogleIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
    <path
      d="M12 11v3.6h5.1c-.2 1.4-1.5 4.1-5.1 4.1-3.1 0-5.7-2.6-5.7-5.7S8.9 7.3 12 7.3c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.7 4.8 14.6 4 12 4 6.9 4 2.8 8.1 2.8 13.2S6.9 22.4 12 22.4c7 0 9.6-4.9 9.6-7.4 0-.5 0-.8-.1-1.2H12z"
      fill="#fff"
    />
  </svg>
);

const MicrosoftIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
    <path fill="#f25022" d="M11 11H4V4h7z" />
    <path fill="#7fba00" d="M20 11h-7V4h7z" />
    <path fill="#00a4ef" d="M11 20H4v-7h7z" />
    <path fill="#ffb900" d="M20 20h-7v-7h7z" />
  </svg>
);

const AppleIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
    <path
      fill="currentColor"
      d="M16.365 12.56c-.02-2.236 1.825-3.306 1.91-3.356-1.04-1.52-2.654-1.727-3.224-1.75-1.37-.14-2.67.8-3.36.8-.69 0-1.77-.78-2.9-.76-1.49.02-2.86.87-3.62 2.22-1.54 2.69-.39 6.66 1.09 8.84.72 1.02 1.58 2.16 2.7 2.12 1.09-.04 1.5-.69 2.82-.69s1.7.69 2.88.67c1.19-.02 1.95-1.05 2.67-2.07.84-1.23 1.19-2.42 1.21-2.49-.03-.01-2.32-.89-2.33-3.47zM14.53 5.66c.6-.74 1.01-1.76.9-2.78-.87.03-1.93.57-2.56 1.31-.56.65-1.06 1.67-.93 2.66.99.08 1.99-.5 2.59-1.19z"
    />
  </svg>
);

export default function AuthModal() {
  const {
    showAuthModal,
    closeAuthModal,
    loginWithGoogle,
    loginWithMicrosoft,
    loginWithApple,
    loading,
    error,
  } = useAuth();

  const panelRef = useRef<HTMLDivElement | null>(null);

  // Close on ESC
  useEffect(() => {
    if (!showAuthModal) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeAuthModal();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showAuthModal, closeAuthModal]);

  // Focus the first action on open
  useEffect(() => {
    if (showAuthModal && panelRef.current) {
      const btn = panelRef.current.querySelector("button");
      (btn as HTMLButtonElement | null)?.focus();
    }
  }, [showAuthModal]);

  if (!showAuthModal) return null;

  return (
    <div
      aria-modal
      role="dialog"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      {/* Panel */}
      <div
        ref={panelRef}
        className={[
          "w-[92%] max-w-md rounded-2xl border border-slate-700 bg-slate-900/95 shadow-2xl",
          "p-5 sm:p-6",
          "transition-all duration-200 ease-out",
          "opacity-100 scale-100",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 shrink-0 rounded-xl bg-emerald-500/15 flex items-center justify-center">
            <span className="text-emerald-400 text-lg">▣</span>
          </div>
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-semibold">
              Continue to Fitterverse
            </h3>
            <p className="text-xs text-slate-400">
              One account for progress, streaks, and your personal plan.
            </p>
          </div>
          <button
            aria-label="Close"
            onClick={closeAuthModal}
            className="text-slate-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Actions */}
        <div className="mt-4 space-y-2">
          <AuthButton
            onClick={loginWithGoogle}
            disabled={loading}
            bg="bg-white"
            text="text-slate-900"
            ring="ring-1 ring-slate-200"
            hover="hover:bg-white/95"
            icon={GoogleIcon}
            dataTestId="auth-google"
          >
            Continue with Google
          </AuthButton>

          <AuthButton
            onClick={loginWithMicrosoft}
            disabled={loading}
            bg="bg-[#2f2f2f]"
            text="text-white"
            ring="ring-1 ring-[#3b3b3b]"
            hover="hover:bg-[#383838]"
            icon={MicrosoftIcon}
            dataTestId="auth-microsoft"
          >
            Continue with Microsoft (Outlook)
          </AuthButton>

          <AuthButton
            onClick={loginWithApple}
            disabled={loading}
            bg="bg-black"
            text="text-white"
            ring="ring-1 ring-slate-800"
            hover="hover:bg-black/90"
            icon={AppleIcon}
            dataTestId="auth-apple"
          >
            Continue with Apple
          </AuthButton>
        </div>

        {/* Divider */}
        <div className="my-4 flex items-center gap-3 text-[11px] text-slate-400">
          <div className="h-px flex-1 bg-slate-700" />
          or
          <div className="h-px flex-1 bg-slate-700" />
        </div>

        {/* Guest link */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={closeAuthModal}
            className="text-sm text-emerald-300 hover:text-emerald-200 underline underline-offset-4"
          >
            Continue as guest
          </button>
          <span className="text-[11px] text-slate-400">
            Press <kbd className="px-1 py-0.5 bg-slate-800 rounded">Esc</kbd> to close
          </span>
        </div>

        {/* Footer */}
        {!!error && (
          <div className="mt-4 text-[13px] text-red-400">{error}</div>
        )}
        <p className="mt-3 text-[11px] leading-5 text-slate-500">
          By continuing, you agree to our Terms and acknowledge our Privacy Policy.
          We never share your data.
        </p>
      </div>
    </div>
  );
}
