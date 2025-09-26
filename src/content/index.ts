// src/content/index.ts

// ---- Types ----
export type Hub =
  | "fitness-habits"
  | "nutrition-habits"
  | "sleep-habits"
  | "mindset-habits"
  | "productivity-habits"
  | "bad-habits"
  | "tracking-technology"
  | "community-accountability";

export type HubMeta = {
  id: Hub;
  title: string;
  path: string;    // e.g. /blog/fitness-habits
  blurb: string;
  icon?: string;   // optional emoji/icon
};

export type Post = {
  id: string;          // unique id
  hubId: Hub;          // which hub it belongs to
  slug: string;        // url segment after /blog/:hubId/
  title: string;
  description?: string;
  excerpt?: string;
  date?: string;       // YYYY-MM-DD
  keywords?: string[];
  body?: string | string[];
};

// ---- Data (seed) ----
export const hubs: HubMeta[] = [
  {
    id: "fitness-habits",
    title: "Fitness Habits",
    path: "/blog/fitness-habits",
    blurb: "Daily workouts, home vs. gym, and beating procrastination.",
    icon: "💪",
  },
  {
    id: "nutrition-habits",
    title: "Nutrition Habits",
    path: "/blog/nutrition-habits",
    blurb: "Meal prep, healthy eating routines, and smart swaps.",
    icon: "🥗",
  },
  {
    id: "sleep-habits",
    title: "Sleep Habits",
    path: "/blog/sleep-habits",
    blurb: "Sleep science, fixing cycles, and evening routines.",
    icon: "😴",
  },
  {
    id: "mindset-habits",
    title: "Mental Health & Mindset",
    path: "/blog/mindset-habits",
    blurb: "Meditation, journaling, and stress management.",
    icon: "🧠",
  },
  {
    id: "productivity-habits",
    title: "Productivity & Lifestyle",
    path: "/blog/productivity-habits",
    blurb: "Morning routines, habit stacking, and time management.",
    icon: "⏱️",
  },
  {
    id: "bad-habits",
    title: "Breaking Bad Habits",
    path: "/blog/bad-habits",
    blurb: "Quit sugar, stop binges, and detox from your phone.",
    icon: "🧹",
  },
  {
    id: "tracking-technology",
    title: "Tracking & Technology",
    path: "/blog/tracking-technology",
    blurb: "Apps, wearables, and AI that help habits stick.",
    icon: "📱",
  },
  {
    id: "community-accountability",
    title: "Community & Accountability",
    path: "/blog/community-accountability",
    blurb: "Groups, coaching vs. self-tracking, sharing progress.",
    icon: "👥",
  },
];

export const posts: Post[] = [
  {
    id: "fh-001",
    hubId: "fitness-habits",
    slug: "daily-workout-routine-beginners",
    title: "A Daily Workout Routine for Busy Beginners",
    description:
      "Start tiny, stay consistent: a 15-minute routine that builds the habit without burnout.",
    excerpt:
      "Build momentum with micro-sets, anchor cues, and weekly review.",
    date: "2025-09-01",
    keywords: ["daily workout", "beginner routine", "habit stacking"],
    body: [
      "If you’re starting from scratch, consistency beats intensity.",
      "Use an anchor cue (e.g., after coffee) and do one set of three movements for 5 minutes.",
      "Review weekly, not daily. Adjust the plan, never your identity.",
    ],
  },
  {
    id: "nh-001",
    hubId: "nutrition-habits",
    slug: "meal-prep-blueprint",
    title: "The 45-Minute Meal Prep Blueprint",
    description:
      "Minimal prep, maximal payoff: set up your week with 3 fast bases + 3 mix-ins.",
    date: "2025-09-05",
    keywords: ["meal prep", "healthy eating", "weight loss"],
    body:
      "Choose a carb base, a protein, and a veg mix. Batch once, remix all week. Simplicity sticks.",
  },
];

// ---- Helpers (named exports) ----
export function listHubs(): HubMeta[] {
  return hubs;
}
export function getHubById(id: string): HubMeta | undefined {
  return hubs.find((h) => h.id === id);
}
export function listPostsByHub(hubId: string): Post[] {
  return posts.filter((p) => p.hubId === hubId);
}
export function getPostBySlug(hubId: string, slug: string): Post | undefined {
  return posts.find((p) => p.hubId === hubId && p.slug === slug);
}
