# Copilot Instructions for Fitterverse Pro

## Project Overview
- **Stack:** React + Vite + TypeScript + Tailwind CSS + Zustand
- **Purpose:** Habit tracking platform focused on keystone habits (morning routine, screen-time detox, exercise)
- **Key Features:** Onboarding flow, daily checklist, streak tracking, local persistence, PWA (service worker in prod)

## Architecture & Patterns
- **Pages:** Located in `src/pages/` (e.g., `Home.tsx`, `Dashboard.tsx`, `Settings.tsx`)
- **Components:** Shared UI in `src/components/` and `src/components/ui/` (e.g., `Button.tsx`, `Card.tsx`)
- **State Management:** Zustand stores in `src/state/` (e.g., `appStore.ts`, `authStore.ts`, `habitStore.ts`)
- **Data Templates:** Habit JSONs in `src/data/habits/` (extendable for new habits)
- **Utilities:** Core logic in `src/lib/` (e.g., `storage.ts`, `time.ts`, `analytics.ts`, `notifications.ts`)
- **Styling:** Tailwind globals in `src/globals.css` and config in `tailwind.config.ts`

## Developer Workflows
- **Start Dev Server:** `npm run dev` (service worker disabled in dev)
- **Build for Production:** `npm run build`
- **Preview Production Build:** `npm run preview`
- **Install Dependencies:** `npm install`
- **Hard Reload:** Use Cmd+Shift+R if the app appears stuck (service worker caching)

## Conventions & Patterns
- **Checklist Logic:** Daily checklist and streaks are managed via Zustand stores and updated by completing all micro-habits for the day.
- **Local Persistence:** Uses `localStorage` via helpers in `src/lib/storage.ts`.
- **Onboarding:** Flows from name → goal → habit selection; starter plan auto-generated.
- **Extend Habits:** Add new templates in `src/data/habits/` and update logic in `ensureToday()`.
- **Notifications:** Web push logic in `src/lib/notifications.ts` (integrate for reminders).
- **Analytics:** Integrate backend in `src/lib/analytics.ts` (PostHog/GA supported).
- **PWA:** Service worker only enabled in production; see `vite.config.ts` and `public/manifest.webmanifest`.

## Integration Points
- **External Services:** Analytics (PostHog/GA), Notifications (Web Push)
- **API Integration:** For B2B/multi-user, swap local storage for API calls in `src/lib/storage.ts` and related stores.

## Examples
- To add a new habit: create a JSON in `src/data/habits/`, update onboarding and checklist logic.
- To add a new UI component: place in `src/components/ui/`, use Tailwind for styling.
- To persist new state: update Zustand store and use helpers from `src/lib/storage.ts`.

---

**For unclear or missing conventions, ask the user for clarification before proceeding.**
