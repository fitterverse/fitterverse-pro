// src/types/habits.ts

export type HabitKind =
  | "EATING_HEALTHY"
  | "WAKE_UP_EARLY"
  | "SLEEP_BETTER"
  | "DEEP_WORK"
  | "AM_WORKOUT"
  | "PM_WORKOUT";

export type QuestionType = "single" | "multi" | "text" | "number";

export type Question = {
  id: string;
  label: string;
  type: QuestionType;
  options?: string[]; // for single/multi
  placeholder?: string; // for text/number
  min?: number; // for number
  max?: number; // for number
};

export type HabitTemplate = {
  kind: HabitKind;
  label: string;
  emoji?: string;
  questions: Question[];
};

// MVP: detailed questionnaire for Eating Healthy; simple for others
export const HABIT_TEMPLATES: HabitTemplate[] = [
  {
    kind: "EATING_HEALTHY",
    label: "Eat Healthy",
    emoji: "🥗",
    questions: [
      {
        id: "primary_blocker",
        label: "What’s your biggest challenge right now?",
        type: "single",
        options: [
          "Sugar cravings",
          "Irregular meals",
          "Ordering too often",
          "Portion control",
          "Late-night snacking",
          "Emotional eating",
        ],
      },
      {
        id: "diet_type",
        label: "Diet preference",
        type: "single",
        options: ["Vegetarian", "Vegan", "Non-veg", "Eggetarian", "No preference"],
      },
      {
        id: "meals_per_day",
        label: "How many meals do you usually have per day?",
        type: "number",
        min: 1,
        max: 8,
        placeholder: "e.g., 3",
      },
      {
        id: "target_style",
        label: "Target style",
        type: "single",
        options: ["3 meals", "OMAD", "Intermittent fasting", "Balanced flexible"],
      },
      {
        id: "notes",
        label: "Anything else you want us to know? (optional)",
        type: "text",
        placeholder: "120 chars",
      },
    ],
  },

  { kind: "WAKE_UP_EARLY", label: "Wake Up Early", emoji: "⏰", questions: [
    { id: "target_time", label: "Target wake time (24h, e.g., 06:00)", type: "text", placeholder: "06:00" },
    { id: "current_time", label: "Current usual wake time", type: "text", placeholder: "08:30" },
  ]},

  { kind: "SLEEP_BETTER", label: "Sleep Better", emoji: "😴", questions: [
    { id: "hours_now", label: "Average hours now", type: "number", min: 0, max: 14, placeholder: "6.5" },
    { id: "hours_goal", label: "Target hours", type: "number", min: 5, max: 10, placeholder: "7.5" },
  ]},

  { kind: "DEEP_WORK", label: "Deep Work", emoji: "🧠", questions: [
    { id: "daily_goal", label: "Daily minutes goal", type: "number", min: 15, max: 600, placeholder: "120" },
  ]},

  { kind: "AM_WORKOUT", label: "AM Workout", emoji: "🌅", questions: [
    { id: "mode", label: "Usual mode", type: "single", options: ["Gym", "Cardio", "Run", "Walk 10k", "Home"] },
  ]},

  { kind: "PM_WORKOUT", label: "PM Workout", emoji: "🌇", questions: [
    { id: "mode", label: "Usual mode", type: "single", options: ["Gym", "Cardio", "Run", "Walk 10k", "Home"] },
  ]},
];

export function getTemplate(kind: HabitKind) {
  return HABIT_TEMPLATES.find(t => t.kind === kind);
}
