// src/content/index.ts
export type Hub = {
  slug: string;
  title: string;
  blurb: string;
  keywords: string[]; // seed terms to help us write SEO-targeted posts later
  image?: string; // optional hero image per hub (can wire later)
};

export const HUBS: Hub[] = [
  {
    slug: "fitness-habits",
    title: "Fitness Habits",
    blurb:
      "Daily workout routines, smart progression, and sticking to movement — even on busy days.",
    keywords: [
      "daily workout routine",
      "home workouts",
      "gym routine for beginners",
      "workout procrastination",
    ],
  },
  {
    slug: "nutrition-habits",
    title: "Nutrition Habits",
    blurb:
      "Meal prep, healthy eating routines, and science-backed food swaps that support weight loss.",
    keywords: ["meal prep", "healthy eating routine", "food swaps", "calorie deficit tips"],
  },
  {
    slug: "sleep-better",
    title: "Sleep Better",
    blurb:
      "Recovery-first habits: circadian rhythm, evening wind-downs, and practical fixes for bad sleep.",
    keywords: ["how to sleep better", "sleep routine", "blue light", "sleep hygiene"],
  },
  {
    slug: "mindset-mental-health",
    title: "Mindset & Mental Health",
    blurb:
      "Meditation, mindfulness, and journaling systems that build calm, focus, and discipline.",
    keywords: ["meditation habit", "mindfulness routine", "journaling benefits", "stress relief"],
  },
  {
    slug: "productivity-routines",
    title: "Productivity & Lifestyle",
    blurb:
      "Morning routines, habit stacking for busy pros, and practical time-management frameworks.",
    keywords: ["morning routine", "habit stacking", "time management", "productivity tips"],
  },
  {
    slug: "break-bad-habits",
    title: "Break Bad Habits",
    blurb:
      "Quit sugar gradually, stop binge cycles, and rebuild identity with friction-reducing tactics.",
    keywords: ["quit sugar", "stop binge eating", "break bad habits", "digital detox"],
  },
  {
    slug: "habit-tracking-technology",
    title: "Tracking & Technology",
    blurb:
      "Compare habit apps, get more from wearables, and see how AI can personalize habit loops.",
    keywords: ["habit tracker apps", "fitness trackers", "AI habit building"],
  },
  {
    slug: "community-accountability",
    title: "Community & Accountability",
    blurb:
      "How support groups, coaches, and public progress sharing multiply your consistency.",
    keywords: ["accountability partner", "coaching vs self", "support groups"],
  },
];
