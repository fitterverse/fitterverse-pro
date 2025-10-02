// src/state/authStore.ts
import { create } from "zustand";
import {
  GoogleAuthProvider,
  OAuthProvider,
  RecaptchaVerifier,
  signInWithPopup,
  signInWithPhoneNumber,
  onAuthStateChanged,
  signOut,
  type ConfirmationResult,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

type AuthState = {
  // data
  user: User | null;
  loading: boolean;
  error: string | null;

  // modal
  showAuthModal: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;

  // oauth
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;

  // phone
  phone: string;
  otp: string;
  setPhone: (v: string) => void;
  setOtp: (v: string) => void;
  startPhoneSignIn: () => Promise<void>;
  verifyOtp: () => Promise<void>;

  // misc
  logout: () => Promise<void>;
};

let _confirmation: ConfirmationResult | null = null;
let _recaptcha: RecaptchaVerifier | null = null;

export const useAuth = create<AuthState>((set, get) => {
  // Keep auth state in sync
  if (typeof window !== "undefined") {
    onAuthStateChanged(auth, (user) => set({ user }));
  }

  const setLoading = (loading: boolean) => set({ loading });
  const setError = (error: string | null) => set({ error });

  return {
    user: null,
    loading: false,
    error: null,

    showAuthModal: false,
    openAuthModal: () => set({ showAuthModal: true }),
    closeAuthModal: () =>
      set({
        showAuthModal: false,
        error: null,
        phone: "",
        otp: "",
      }),

    async loginWithGoogle() {
      try {
        setLoading(true);
        setError(null);
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        set({ showAuthModal: false });
      } catch (e: any) {
        setError(e?.message ?? "Google sign-in failed");
      } finally {
        setLoading(false);
      }
    },

    async loginWithApple() {
      try {
        setLoading(true);
        setError(null);
        const provider = new OAuthProvider("apple.com");
        provider.addScope("email");
        provider.addScope("name");
        await signInWithPopup(auth, provider);
        set({ showAuthModal: false });
      } catch (e: any) {
        setError(e?.message ?? "Apple sign-in failed");
      } finally {
        setLoading(false);
      }
    },

    phone: "",
    otp: "",
    setPhone: (v) => set({ phone: v }),
    setOtp: (v) => set({ otp: v }),

    async startPhoneSignIn() {
      try {
        setLoading(true);
        setError(null);

        const phone = get().phone?.trim();
        if (!phone) throw new Error("Enter a valid phone number");

        // Create / reuse invisible reCAPTCHA bound to <div id="recaptcha-container" />
        if (!_recaptcha) {
          _recaptcha = new RecaptchaVerifier(auth, "recaptcha-container", {
            size: "invisible",
          });
        }

        _confirmation = await signInWithPhoneNumber(auth, phone, _recaptcha);
      } catch (e: any) {
        setError(e?.message ?? "Could not send OTP");
        // reset recaptcha so user can retry cleanly
        try {
          _recaptcha?.clear();
        } catch {}
        _recaptcha = null;
        _confirmation = null;
        throw e;
      } finally {
        setLoading(false);
      }
    },

    async verifyOtp() {
      try {
        setLoading(true);
        setError(null);
        const code = get().otp?.trim();
        if (!_confirmation) throw new Error("Please request a code first");
        if (!code || code.length < 6) throw new Error("Enter the 6-digit code");

        await _confirmation.confirm(code);
        set({ showAuthModal: false });
      } catch (e: any) {
        setError(e?.message ?? "Invalid code");
        throw e;
      } finally {
        setLoading(false);
      }
    },

    async logout() {
      try {
        setLoading(true);
        await signOut(auth);
      } finally {
        setLoading(false);
      }
    },
  };
});
