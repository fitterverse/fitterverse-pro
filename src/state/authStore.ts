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
} from "firebase/auth";

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
    closeAuthModal: () => set({ showAuthModal: false, error: undefined, otp: "" }),

    // Google OAuth
    loginWithGoogle: async () => {
      try {
        set({ loading: true, error: undefined });
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        set({ showAuthModal: false });
      } catch (e: any) {
        set({ error: e?.message ?? "Google sign-in failed" });
      } finally {
        set({ loading: false });
      }
    },

    setPhone: (v) => set({ phone: v }),
    setOtp: (v) => set({ otp: v }),

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
