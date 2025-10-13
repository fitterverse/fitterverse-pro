// src/lib/content.ts
// Minimal, typed extraction from your PDFs for in-app surfacing.
// You can add more items anytime without changing consumers.

export type DietKind = "veg" | "egg" | "nonveg";
export type MealName = "breakfast" | "lunch" | "dinner";

export const FOODS_TO_AVOID: {
  title: string;
  groups: { name: string; items: string[]; notes?: string[] }[];
} = {
  title: "Foods to Avoid",
  groups: [
    {
      name: "Carbohydrate foods",
      items: [
        "Wheat (atta), barley, oats, rice, corn, millets, quinoa, sorghum (jowar)",
      ],
      notes: [
        "Avoid breads, pastas, cookies/crackers, pizza crusts made from above grains.",
      ],
    },
    {
      name: "Beans & legumes",
      items: [
        "Chickpeas (white chana), kidney beans (rajma), black beans, lentils, black chana, black-eyed peas (lobiya)",
      ],
      notes: ["All varieties of beans to be avoided."],
    },
    {
      name: "Fruits (high sugar)",
      items: [
        "Apple, banana, pineapple, papaya, grapes, mango, orange; dried fruits (raisins, dates), syrups/concentrates",
      ],
      notes: ["Avoid juices (packed or fresh) of the above fruits."],
    },
    {
      name: "Starchy vegetables",
      items: ["Potato, sweet potato, sweet corn."],
    },
    {
      name: "Sugars & syrups",
      items: [
        "Honey, jaggery, maple syrup, cane sugar, HFCS; sweetened milk/coffee/tea",
      ],
    },
    {
      name: "Low-fat dairy & factory farmed meats",
      items: [
        "Sweetened yogurt, ‘low/reduced-fat’ dairy products; coated meats (nuggets/sticks), bacon, beef (per your plan).",
      ],
    },
    {
      name: "Unhealthy oils",
      items: [
        "Soya, canola, corn, sunflower, grapeseed (prefer cold-pressed coconut/sesame/mustard/olive).",
      ],
    },
    {
      name: "Alcohol & sweet beverages",
      items: [
        "Beer, sweet wines/cocktails; sugary/diet sodas, fruit juices; sweetened beverages.",
      ],
    },
    {
      name: "Processed foods & artificial sweeteners",
      items: [
        "Commercial cookies/cakes, candies, ice creams, fast food.",
        "Sucralose, aspartame, saccharin, etc.",
      ],
    },
    {
      name: "Condiments (red flags)",
      items: ["‘Low-fat’, ‘Added sugar’, ‘Made with unhealthy oils’"],
    },
  ],
};

export const GROCERY: {
  title: string;
  sections: { name: string; items: string[]; notes?: string[] }[];
} = {
  title: "Grocery List",
  sections: [
    {
      name: "Permissible vegetables",
      items: [
        "Cauliflower, cabbage (incl. purple), radish, broccoli, capsicum (all colors), spinach, lettuce, coriander, zucchini, cucumber, garlic, tomato, drumsticks, okra, green beans, bitter gourd, bottle gourd, ginger, turnip, dill/mint/fenugreek/curry leaves/rosemary, mushrooms, ash gourd, snake gourd, pointed gourd, spring onion, pak choi, kohlrabi, eggplant, beetroot",
      ],
      notes: ["Bold/mandatory can be enforced later via tags if needed."],
    },
    {
      name: "Permissible fruits",
      items: [
        "Avocado, lemon, blueberries, blackberries, raspberries, pomegranate, strawberries, cranberries, olives",
      ],
    },
    {
      name: "Oils & butter",
      items: [
        "Cold-pressed coconut / sesame / mustard / olive oil; grass-fed butter; natural ghee; unsweetened peanut butter",
      ],
      notes: ["Dry-roast spices first, then add oils to reduce hydrogenation."],
    },
    {
      name: "Nuts & seeds",
      items: [
        "Almonds, walnuts, macadamia, pine nuts, brazil nuts, hazelnuts; chia, flax, sunflower, pumpkin seeds",
      ],
    },
    {
      name: "Dairy / cheese / yogurt",
      items: [
        "Heavy/whipping cream, artisanal/lactose-free curd, cheddar, brie, mozzarella, parmesan, paneer/tofu, plain Greek yogurt",
      ],
    },
    {
      name: "Eggs / meat / fish",
      items: [
        "Free-range eggs/chicken; fish (salmon, mackerel, sardines, tuna), prawns",
      ],
    },
    {
      name: "Permissible liquids",
      items: [
        "Apple cider vinegar, espresso (unsweetened creamer ok), matcha/green tea, lemon water",
      ],
    },
    {
      name: "Low-carb flour & misc.",
      items: [
        "Mixed low-carb flour (preferred), almond flour, coconut flour, cocoa, flaxseed flour; stevia/xylitol; coconut/almond milk",
      ],
    },
    { name: "Salts", items: ["Sea salt, Himalayan pink, kosher salt"] },
  ],
};

// ----- Recipes (trimmed starter set; expand anytime) -----
export type Recipe = {
  id: string;
  title: string;
  level?: 1 | 2 | 3;
  diet: DietKind | "veg|egg";
  meal?: MealName | "any";
  ingredients: string[];
  steps: string[];
};

export const RECIPES: Recipe[] = [
  // Veg (from Vegetarian recipes)
  {
    id: "veg-paneer-salad",
    title: "Paneer Salad",
    level: 1,
    diet: "veg",
    meal: "any",
    ingredients: [
      "Paneer",
      "Olive oil",
      "Lemon",
      "Lettuce",
      "Cucumber",
      "Tomato",
      "Chilli paste",
      "Purple cabbage",
    ],
    steps: [
      "Marinate paneer, rest 20 min; pan-fry till golden.",
      "Combine with chopped veggies; dress and serve.",
    ],
  },
  {
    id: "veg-cauliflower-upma",
    title: "Cauliflower Upma",
    level: 1,
    diet: "veg",
    meal: "breakfast",
    ingredients: [
      "Blanched cauliflower",
      "Onion",
      "Peas",
      "Green chilies",
      "Mustard seeds",
      "Ginger",
      "Coconut/Olive oil",
      "Coriander",
      "Peanuts",
    ],
    steps: [
      "Temper mustard → onion, chilies, peas.",
      "Add mashed cauliflower; cook till dry; top with peanuts & coriander.",
    ],
  },
  {
    id: "veg-palak-paneer",
    title: "Palak Paneer",
    level: 2,
    diet: "veg",
    meal: "dinner",
    ingredients: [
      "Spinach",
      "Paneer",
      "Onion",
      "Garlic",
      "Ginger",
      "Green chili",
      "Cream",
      "Dry spices",
      "Ghee/olive oil",
    ],
    steps: [
      "Sauté aromatics + spinach; blend.",
      "Bloom spices; add puree, cream, paneer; simmer briefly.",
    ],
  },

  // Eggetarian (from Egg recipes)
  {
    id: "egg-uttappam",
    title: "Egg Uttappam",
    diet: "egg",
    meal: "breakfast",
    ingredients: [
      "Cauliflower (blanched)",
      "Spinach (boiled)",
      "Eggs",
      "Onion",
      "Red chili paste",
      "Garlic",
      "Oil",
      "Salt",
    ],
    steps: [
      "Blend cauliflower+spinach; mix with beaten eggs.",
      "Spread on tawa, top with paste+onion; cook both sides.",
    ],
  },
  {
    id: "egg-cheese-omelette",
    title: "Double Egg Cheese Omelette",
    diet: "egg",
    meal: "breakfast",
    ingredients: ["Eggs", "Butter", "Cheese", "Onion", "Green chilies", "Salt/Pepper"],
    steps: ["Beat & season eggs; cook; stuff with cheese; fold & serve."],
  },

  // Non-veg (from Non-veg recipes)
  {
    id: "nv-butter-chicken",
    title: "Meaty Delight – Butter Chicken",
    diet: "nonveg",
    meal: "dinner",
    ingredients: [
      "Boneless chicken",
      "Onion",
      "Garlic",
      "Ginger",
      "Tomato puree",
      "Cream",
      "Butter",
      "Olive oil",
      "Curry powder",
      "Lemon juice",
      "Salt/Pepper",
    ],
    steps: [
      "Marinate chicken; sauté aromatics; simmer tomato-spice base.",
      "Add chicken → cook through; finish with cream; serve.",
    ],
  },
  {
    id: "nv-tandoori-prawns",
    title: "Tandoori Prawns",
    diet: "nonveg",
    meal: "dinner",
    ingredients: [
      "Prawns",
      "Greek yogurt",
      "Ghee",
      "Ginger-garlic",
      "Turmeric",
      "Kashmiri chili",
      "Garam masala",
      "Pepper",
      "Salt",
      "Lime juice",
    ],
    steps: [
      "Marinate overnight; pan-cook on high heat without overcooking.",
      "Optional: flame/char finish; brush with ghee; serve.",
    ],
  },
];

export function recipesForDiet(diet: DietKind | "veg|egg") {
  return RECIPES.filter((r) => r.diet === diet || (diet === "egg" && r.diet === "veg|egg"));
}
