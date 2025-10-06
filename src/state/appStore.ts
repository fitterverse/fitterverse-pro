// src/state/appStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

type AppState = {
  onboardedUsers: Record<string, boolean>;
  markOnboarded: (uid: string) => void;
  isOnboarded: (uid: string) => boolean;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      onboardedUsers: {},
      markOnboarded: (uid: string) =>
        set((s) => ({ onboardedUsers: { ...s.onboardedUsers, [uid]: true } })),
      isOnboarded: (uid: string) => !!get().onboardedUsers[uid],
    }),
    { name: "app-store" }
  )
);

/**
 * Backward-compatibility alias for legacy imports:
 *   import { useApp } from "../state/appStore"
 * This exposes the same hook instance as useAppStore.
 */
export const useApp = useAppStore;

/** Convenience export for one-off checks without a hook */
export const isOnboarded = (uid: string) => useAppStore.getState().isOnboarded(uid);
