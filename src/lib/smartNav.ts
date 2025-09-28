// src/lib/smartNav.ts
import { isOnboarded } from "@/lib/profile";
import type { User } from "firebase/auth";

/**
 * Smart entry: if not authed → auth modal,
 * authed + onboarded → /dashboard,
 * authed + not onboarded → /onboarding
 */
export function goToAppOrOnboarding(
  user: User | null | undefined,
  navigate: (path: string) => void,
  openAuthModal: () => void
) {
  if (!user) {
    openAuthModal();
    return;
  }
  if (isOnboarded(user.uid)) {
    navigate("/dashboard");
  } else {
    navigate("/onboarding");
  }
}
