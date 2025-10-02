// src/state/authStore.ts
import { create } from "zustand";
import app, { auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signOut,
  User,
} from "firebase/auth";

type AuthState = {
  // Firebase user + init gate (prevents UI from flashing the wrong route)
  user: User | null;
  initDone: boolean;

  // UI state
  showAuthModal: boolean;
  loading: boolean;
  error?: string;

  // phone flow
  phone: string;
  otp: string;
  _confirmation?: ConfirmationResult;

  // actions
  openAuthModal: () => void;
  closeAuthModal: () => void;

  loginWithGoogle: () => Promise<void>;
  // loginWithApple: () => Promise<void>; // when you enable it later
  startPhoneSignIn: () => Promise<void>;
  verifyOtp: () => Promise<void>;

  logout: () => Promise<void>;
};

declare global {
  interface Window {
    _fvRecaptcha?: RecaptchaVerifier;
    _openAuth?: () => void; // used by non-Link CTAs
  }
}

// helper to read/write the “onboarded” flag
export function onboardKeyFor(uid?: string | null) {
  return uid ? `fv_onboarded_${uid}` : null;
}

export function getOnboarded(uid?: string | null): boolean {
  const k = onboardKeyFor(uid);
  if (!k) return false;
  return localStorage.getItem(k) === "1";
}
export function setOnboarded(uid?: string | null) {
  const k = onboardKeyFor(uid);
  if (!k) return;
  localStorage.setItem(k, "1");
}

export const useAuth = create<AuthState>((set, get) => {
  // one-time init listener
  onAuthStateChanged(auth, (u) => {
    set({ user: u, initDone: true });
  });

  return {
    user: null,
    initDone: false,

    showAuthModal: false,
    loading: false,
    error: undefined,

    phone: "",
    otp: "",
    _confirmation: undefined,

    openAuthModal: () => set({ showAuthModal: true, error: undefined }),
    closeAuthModal: () => set({ showAuthModal: false, error: undefined, otp: "" }),

    // Google sign-in (popup). If Safari gives trouble, flip to signInWithRedirect.
    loginWithGoogle: async () => {
      try {
        set({ loading: true, error: undefined });
        const provider = new GoogleAuthProvider();

        // Use popup by default:
        await signInWithPopup(auth, provider);

        set({ showAuthModal: false });
      } catch (e: any) {
        // fallback: uncomment to try redirect for browsers blocking popups:
        // const provider = new GoogleAuthProvider();
        // await signInWithRedirect(auth, provider);

        set({ error: e?.message ?? "Google sign-in failed" });
      } finally {
        set({ loading: false });
      }
    },

    // Phone OTP — send
    startPhoneSignIn: async () => {
      const { phone } = get();
      if (!phone) {
        set({ error: "Enter phone number incl. country code (e.g. +1…)" });
        return;
      }
      try {
        set({ loading: true, error: undefined });

        if (!window._fvRecaptcha) {
          window._fvRecaptcha = new RecaptchaVerifier(auth, "recaptcha-container", {
            size: "invisible",
          });
        }

        const confirmation = await signInWithPhoneNumber(auth, phone, window._fvRecaptcha);
        set({ _confirmation: confirmation });
      } catch (e: any) {
        set({ error: e?.message ?? "Failed to send OTP" });
      } finally {
        set({ loading: false });
      }
    },

    // Phone OTP — verify
    verifyOtp: async () => {
      const { _confirmation, otp } = get();
      if (!_confirmation || !otp) {
        set({ error: "Enter the 6-digit code" });
        return;
      }
      try {
        set({ loading: true, error: undefined });
        await _confirmation.confirm(otp);
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
