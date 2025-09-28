// src/state/authStore.ts
import { create } from "zustand";
import { auth } from "../lib/firebase";
import {
  GoogleAuthProvider,
  OAuthProvider, // <-- for Apple
  signInWithPopup,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signOut,
  User,
} from "firebase/auth";

type AuthState = {
  user: User | null;
  showAuthModal: boolean;

  // phone flow
  phone: string;
  otp: string;
  loading: boolean;
  error?: string;
  _confirmation?: ConfirmationResult;

  // UI controls
  openAuthModal: () => void;
  closeAuthModal: () => void;

  // OAuth
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>; // <-- NEW

  // Phone
  setPhone: (v: string) => void;
  setOtp: (v: string) => void;
  startPhoneSignIn: () => Promise<void>;
  verifyOtp: () => Promise<void>;

  // misc
  logout: () => Promise<void>;
};

declare global {
  interface Window {
    _fvRecaptcha?: RecaptchaVerifier;
  }
}

export const useAuth = create<AuthState>((set, get) => {
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
    closeAuthModal: () =>
      set({ showAuthModal: false, error: undefined, otp: "" }),

    // ---- OAuth: Google ----
    loginWithGoogle: async () => {
      try {
        set({ loading: true, error: undefined });
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        set({ showAuthModal: false });
      } catch (e: any) {
        set({
          error:
            e?.message?.toString?.() ??
            "Google sign-in failed. Please try again.",
        });
      } finally {
        set({ loading: false });
      }
    },

    // ---- OAuth: Apple ----
    loginWithApple: async () => {
      try {
        set({ loading: true, error: undefined });
        // Apple provider via Firebase
        const provider = new OAuthProvider("apple.com");
        // Request user name & email first sign-in (optional)
        provider.addScope("email");
        provider.addScope("name");
        await signInWithPopup(auth, provider);
        set({ showAuthModal: false });
      } catch (e: any) {
        // Friendly error for common “not configured” cases
        const msg =
          e?.code === "auth/operation-not-allowed"
            ? "Apple sign-in isn’t fully configured yet."
            : e?.message?.toString?.() ?? "Apple sign-in failed.";
        set({ error: msg });
      } finally {
        set({ loading: false });
      }
    },

    // ---- Phone: send code ----
    setPhone: (v) => set({ phone: v }),
    setOtp: (v) => set({ otp: v }),

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

        const confirmation = await signInWithPhoneNumber(
          auth,
          phone,
          window._fvRecaptcha
        );
        set({ _confirmation: confirmation });
      } catch (e: any) {
        set({ error: e?.message?.toString?.() ?? "Failed to send OTP" });
      } finally {
        set({ loading: false });
      }
    },

    // ---- Phone: verify ----
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
        set({ error: e?.message?.toString?.() ?? "Invalid code" });
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
