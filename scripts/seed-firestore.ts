// scripts/seed-firestore.ts
import { readFileSync } from "fs";
import { initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

/**
 * 1) Put your service account JSON in the project root.
 * 2) Set SERVICE_ACCOUNT_PATH below to its filename.
 * 3) (Optional) Pass USER_UID to seed a real account UID:
 *      USER_UID=yourAuthUid npx tsx scripts/seed-firestore.ts
 */

const SERVICE_ACCOUNT_PATH = "./fitterverse-9e3bb351e383.json"; // <-- rename if yours differs
const USER_UID = process.env.USER_UID || "demo-user-01";

function dateKey(yyyy_mm_dd: string) {
  return yyyy_mm_dd;
}

async function run() {
  const sa = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, "utf8")) as ServiceAccount;
  initializeApp({ credential: cert(sa) });
  const db = getFirestore();
  const now = Timestamp.now();

  // /users/{uid}
  await db.collection("users").doc(USER_UID).set({
    name: "Aarav Mehta",
    photoURL: "https://i.pravatar.cc/150?img=3",
    email: "aarav@example.com",
    phone: "+919876543210",
    createdAt: now,
    lastActiveAt: now,
    inOnboarding: false,
    planId: "habit-reset-001",
    subscription: { status: "trial", tier: "monthly", amount: 199, startedAt: now },
  });

  // /users/{uid}/meta/profile
  await db.collection("users").doc(USER_UID).collection("meta").doc("profile").set({
    baseline: { goal: "Get consistent", experience: "Beginner" },
    preferences: { dailyTracking: true, notifications: true, timezone: "Asia/Kolkata", weeklyReviewDay: 0 },
    schedule: { timeOfDay: "Morning", reminders: true },
    avatar: "teal",
    tags: ["consistency", "morning-person"],
  });

  // /users/{uid}/plans/{planId}
  const planId = "habit-reset-001";
  await db.collection("users").doc(USER_UID).collection("plans").doc(planId).set({
    title: "Habit Reset (4 weeks)",
    description: "Rebuild consistency with 10-min daily actions.",
    startDate: now,
    active: true,
    cadence: "daily",
  });

  // /users/{uid}/plans/{planId}/habits
  const habits = db.collection("users").doc(USER_UID).collection("plans").doc(planId).collection("habits");
  await habits.doc("walk").set({
    name: "10-min walk",
    targetPerWeek: 7,
    unit: "mins",
    streak: 4,
    longestStreak: 9,
    totalCompletions: 42,
    color: "#22d3ee",
  });
  await habits.doc("water").set({
    name: "Drink 2L water",
    targetPerWeek: 7,
    unit: "count",
    streak: 2,
    longestStreak: 6,
    totalCompletions: 31,
    color: "#a78bfa",
  });

  // /users/{uid}/checkins
  const checkins = [
    { d: "2025-09-22", entries: [{ habitId: "walk", value: 12 }, { habitId: "water", value: 1 }], mood: 4, energy: 3 },
    { d: "2025-09-23", entries: [{ habitId: "walk", value: 10 }], mood: 3, energy: 3 },
    { d: "2025-09-24", entries: [{ habitId: "walk", value: 15 }, { habitId: "water", value: 1 }], mood: 4, energy: 4 },
    { d: "2025-09-25", entries: [{ habitId: "water", value: 1 }], mood: 3, energy: 2 },
    { d: "2025-09-26", entries: [{ habitId: "walk", value: 8 }], mood: 4, energy: 3 },
    { d: "2025-09-27", entries: [], mood: 2, energy: 2 },
    { d: "2025-09-28", entries: [{ habitId: "walk", value: 11 }, { habitId: "water", value: 1 }], mood: 5, energy: 4 },
  ];

  for (const c of checkins) {
    await db.collection("users").doc(USER_UID).collection("checkins").doc(dateKey(c.d)).set({
      date: c.d,
      entries: c.entries,
      mood: c.mood,
      energy: c.energy,
      createdAt: now,
    });
  }

  // /users/{uid}/weeklyReviews
  await db.collection("users").doc(USER_UID).collection("weeklyReviews").add({
    weekOf: "2025-W39",
    summary: "Much better consistency, walks feel natural now.",
    rating: 4,
    wins: ["5 walking days", "Hydration improved"],
    blockers: ["Late meetings broke routine"],
    nextFocus: ["Prep shoes night before", "Water bottle on desk"],
    createdAt: now,
  });

  // /users/{uid}/analytics/rollups
  await db.collection("users").doc(USER_UID).collection("analytics").doc("rollups").set({
    last7: { daysCompleted: 5, minutes: 56, streak: 3 },
    last30: { daysCompleted: 18, minutes: 210 },
    allTime: { daysCompleted: 72, minutes: 820 },
  });

  // /subscriptions/{uid}
  await db.collection("subscriptions").doc(USER_UID).set({
    status: "trial",
    tier: "monthly",
    amount: 199,
    startedAt: now,
    renewsAt: Timestamp.fromMillis(now.toMillis() + 1000 * 60 * 60 * 24 * 14),
  });

  console.log("✅ Seed complete for uid:", USER_UID);
}

run().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
