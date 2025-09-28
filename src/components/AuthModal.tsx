// src/components/AuthModal.tsx
import React from "react";
import { createPortal } from "react-dom";
import { getAuth, GoogleAuthProvider, OAuthProvider,
         signInWithPopup, signInWithRedirect, onAuthStateChanged,
         RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useAuth } from "@/state/authStore";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

// Helper: detect environments where popups are usually blocked
function shouldUseRedirect() {
  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isInAppWebview =
    /fbios|fb_iab|instagram|twitter|snapchat|line|wechat|pinterest|miuibrowser/.test(ua);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  // Prefer redirect on iOS, Safari, and many in-app webviews
  return isIOS || isSafari || isInAppWebview;
}

export default function AuthModal() {
  const { isAuthOpen, closeAuthModal } = useAuth();
  const auth = getAuth();

  // keep a friendly message in the UI
  const [err, setErr] = React.useState<string>("");

  // mount invisible reCAPTCHA once for phone sign-in
  const recaptchaId = "fv-recaptcha-container";

  React.useEffect(() => {
    if (!(window as any)._fvRecaptcha) {
      try {
        (window as any)._fvRecaptcha = new RecaptchaVerifier(
          auth,
          recaptchaId,
          {
            size: "invisible",
            callback: () => {
              // no-op, we trigger sending code separately
            },
          }
        );
      } catch (e) {
        // ignore re-init; dev HMR sometimes tries twice
      }
    }
  }, [auth]);

  // if user signs in successfully, close the modal
  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setErr("");
        closeAuthModal();
      }
    });
    return unsub;
  }, [auth, closeAuthModal]);

  async function signInGoogle() {
    setErr("");
    const provider = new GoogleAuthProvider();
    try {
      if (shouldUseRedirect()) {
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
      }
    } catch (e: any) {
      // graceful fallback
      if (
        e?.code === "auth/popup-blocked" ||
        e?.code === "auth/operation-not-supported-in-this-environment"
      ) {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (e2: any) {
          setErr(humanizeAuthError(e2));
        }
      } else {
        setErr(humanizeAuthError(e));
      }
    }
  }

  async function signInApple() {
    setErr("");
    // Only show Apple if it is fully configured in Console.
    const provider = new OAuthProvider("apple.com");
    try {
      if (shouldUseRedirect()) {
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
      }
    } catch (e: any) {
      if (
        e?.code === "auth/popup-blocked" ||
        e?.code === "auth/operation-not-supported-in-this-environment"
      ) {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (e2: any) {
          setErr(humanizeAuthError(e2));
        }
      } else {
        setErr(humanizeAuthError(e));
      }
    }
  }

  // PHONE — two-step flow: send code, then verify
  const [phone, setPhone] = React.useState("");
  const [code, setCode] = React.useState("");
  const [confirmation, setConfirmation] =
    React.useState<ReturnType<typeof signInWithPhoneNumber> | any>(null);

  async function sendCode() {
    setErr("");
    try {
      const verifier = (window as any)._fvRecaptcha as RecaptchaVerifier;
      const conf = await signInWithPhoneNumber(auth, phone, verifier);
      setConfirmation(conf);
    } catch (e: any) {
      setErr(humanizeAuthError(e));
    }
  }

  async function verifyCode() {
    setErr("");
    try {
      if (!confirmation) return;
      await confirmation.confirm(code);
    } catch (e: any) {
      setErr(humanizeAuthError(e));
    }
  }

  if (!isAuthOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-800 shadow-2xl rounded-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-teal-400" />
              <h3 className="text-lg font-semibold">Fitterverse</h3>
            </div>
            <button
              onClick={closeAuthModal}
              className="text-slate-400 hover:text-slate-200"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <h2 className="mt-4 text-2xl font-bold">Welcome</h2>
          <p className="mt-1 text-slate-300">
            Sign in to continue your habit plan.
          </p>

          {/* OAuth buttons */}
          <div className="mt-6 space-y-3">
            <Button
              onClick={signInGoogle}
              className="w-full bg-[#1a73e8] hover:bg-[#1669c1] text-white"
            >
              Continue with Google
            </Button>

            {/* Hide Apple if you haven’t finished configuring it */}
            <Button
              onClick={signInApple}
              className="w-full bg-black hover:bg-black/80 text-white"
            >
              Continue with Apple
            </Button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-xs text-slate-500">or</span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          {/* Phone sign-in */}
          <div className="space-y-3">
            <label className="block text-sm text-slate-300">
              Phone (with country code)
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555 123 4567"
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:border-slate-500"
              inputMode="tel"
            />

            {confirmation ? (
              <>
                <label className="block text-sm text-slate-300">Code</label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:border-slate-500"
                  inputMode="numeric"
                />
                <Button onClick={verifyCode} className="w-full bg-teal-500 text-black">
                  Verify & continue
                </Button>
              </>
            ) : (
              <Button onClick={sendCode} className="w-full bg-teal-500 text-black">
                Send code
              </Button>
            )}

            {/* Invisible reCAPTCHA container */}
            <div id="fv-recaptcha-container" className="mt-2" />
          </div>

          {err && (
            <div className="mt-4 text-sm text-rose-400">
              {err}
            </div>
          )}

          <p className="mt-6 text-xs text-slate-500">
            By continuing, you agree to our Terms & Privacy.
          </p>
        </div>
      </Card>
    </div>,
    document.body
  );
}

function humanizeAuthError(e: any) {
  const code = e?.code || "";
  if (code.includes("unauthorized-domain")) {
    return "This domain isn’t authorized for sign-in. Add it in Firebase Auth → Settings → Authorized domains.";
  }
  if (code.includes("popup-blocked")) {
    return "Your browser blocked the popup. We’re switching to a full-page sign-in…";
  }
  if (code.includes("network-request-failed")) {
    return "Network error. Please check your connection and try again.";
  }
  if (code.includes("invalid-phone-number")) {
    return "That phone number looks invalid.";
  }
  if (code.includes("invalid-verification-code")) {
    return "The code doesn’t match. Please try again.";
  }
  return e?.message || "Something went wrong. Please try again.";
}
