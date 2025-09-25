// src/state/authStore.ts
import { create } from "zustand";
import { auth } from "../lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signOut,
  User,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

/**
 * We set persistence once on module load so user sessions survive refreshes.
 * If this ever throws (rare), we simply continue; onAuthStateChanged still runs.
 */
setPersistence(auth, browserLocalPersistence).catch(() => { /* no-op */ });

// Ensure consistent SMS content (optional)
auth.languageCode = "en";

type AuthState = {
  user: User | null;
  showAuthModal: boolean;

  phone: string;
  otp: string;
  loading: boolean;
  error?: string;
  _confirmation?: ConfirmationResult;

  openAuthModal: () => void;
  closeAuthModal: () => void;

  loginWithGoogle: () => Promise<void>;

  setPhone: (v: string) => void;
  setOtp: (v: string) => void;
  startPhoneSignIn: () => Promise<void>;
  verifyOtp: () => Promise<void>;

  logout: () => Promise<void>;
};

/**
 * We keep a single invisible reCAPTCHA instance around.
 * If it fails (e.g., browser blocks), we fall back to a visible widget by
 * switching size to 'normal' and rendering into #recaptcha-container.
 */
function ensureRecaptcha(): RecaptchaVerifier {
  // @ts-expect-error: attach to window for reuse/debug
  if (!window._fvRecaptcha) {
    window._fvRecaptcha = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible", // best UX; Firebase will show challenges if needed
      callback: () => {
        // solved automatically for invisible; nothing to do here
      },
      "expired-callback": () => {
        // Token expired; will be recreated next call
        try {
          // @ts-expect-error
          window._fvRecaptcha?.clear();
        } catch {}
        // @ts-expect-error
        window._fvRecaptcha = undefined;
      },
    });
  }
  // @ts-expect-error
  return window._fvRecaptcha as RecaptchaVerifier;
}

export const useAuth = create<AuthState>((set, get) => {
  // Keep Zustand in sync with Firebase auth
  onAuthStateChanged(auth, (u) => set({ user: u }));

  return {
    user: null,
    showAuthModal: false,

    phone: "",
    otp: "",
    loading: false,
    error: undefined,
    _confirmation: undefined,

    openAuthModal: () => set({ showAuthModal: true, error: undefined }),
    closeAuthModal: () => set({ showAuthModal: false, error: undefined, otp: "" }),

    // --- Google OAuth ---
    loginWithGoogle: async () => {
      try {
        set({ loading: true, error: undefined });
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        set({ showAuthModal: false });
      } catch (e: any) {
        const msg =
          e?.code === "auth/popup-blocked"
            ? "Popup blocked by the browser. Please allow popups and try again."
            : e?.message ?? "Google sign-in failed";
        set({ error: msg });
      } finally {
        set({ loading: false });
      }
    },

    setPhone: (v) => set({ phone: v }),
    setOtp: (v) => set({ otp: v }),

    // --- Phone OTP (send) ---
    startPhoneSignIn: async () => {
      const { phone } = get();
      if (!phone || !phone.trim().startsWith("+")) {
        set({ error: "Enter phone number incl. country code (e.g. +1…)" });
        return;
      }

      try {
        set({ loading: true, error: undefined });

        let verifier = ensureRecaptcha();

        // Attempt invisible first; if it fails due to browser policy,
        // recreate visibly as a fallback.
        try {
          const confirmation = await signInWithPhoneNumber(auth, phone.trim(), verifier);
          set({ _confirmation: confirmation });
          return;
        } catch (e: any) {
          // fallback to visible captcha
          try {
            // @ts-expect-error
            window._fvRecaptcha?.clear?.();
          } catch {}
          // @ts-expect-error
          window._fvRecaptcha = new RecaptchaVerifier(auth, "recaptcha-container", {
            size: "normal",
          });
          // @ts-expect-error
          verifier = window._fvRecaptcha;
          const confirmation = await signInWithPhoneNumber(auth, phone.trim(), verifier);
          set({ _confirmation: confirmation });
        }
      } catch (e: any) {
        set({ error: e?.message ?? "Failed to send OTP" });
      } finally {
        set({ loading: false });
      }
    },

    // --- Phone OTP (verify) ---
    verifyOtp: async () => {
      const { _confirmation, otp } = get();
      if (!_confirmation || !otp || otp.trim().length < 4) {
        set({ error: "Enter the 6-digit code" });
        return;
      }
      try {
        set({ loading: true, error: undefined });
        await _confirmation.confirm(otp.trim());
        set({ showAuthModal: false, otp: "" });
      } catch (e: any) {
        set({ error: e?.message ?? "Invalid code" });
      } finally {
        set({ loading: false });
      }
    },

    logout: async () => {
      await signOut(auth);
      set({ showAuthModal: false });
    },
  };
});
