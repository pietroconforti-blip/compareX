export type Category = "housing" | "mobile" | "transport" | "gym" | "streaming";

export type Offer = {
  id: number;
  name: string;
  category: Category;
  price: number;
  priceLabel: string;
  location: string;
  quality: number;
  flexibility: number;
  studentFriendly: boolean;
  transport: number;
  description: string;
  tags: string[];
};

export type ScoredOffer = Offer & {
  score: number;
  reasons: string[];
};

export type Bundle = {
  offers: ScoredOffer[];
  totalPrice: number;
  score: number;
  quality: number;
};

export const offers: Offer[] = [
  {
    id: 1,
    name: "Student House Vienna",
    category: "housing",
    price: 430,
    priceLabel: "€430 / month",
    location: "Vienna",
    quality: 7.8,
    flexibility: 8.5,
    studentFriendly: true,
    transport: 9,
    description: "Affordable student room with good public transport connections.",
    tags: ["student", "budget", "vienna", "public transport"],
  },
  {
    id: 2,
    name: "Campus Living Wien",
    category: "housing",
    price: 490,
    priceLabel: "€490 / month",
    location: "Vienna",
    quality: 9.1,
    flexibility: 8.2,
    studentFriendly: true,
    transport: 9.5,
    description: "Modern student accommodation close to universities and transport.",
    tags: ["student", "modern", "vienna", "university"],
  },
  {
    id: 3,
    name: "Premium Student Residence",
    category: "housing",
    price: 520,
    priceLabel: "€520 / month",
    location: "Vienna",
    quality: 9.7,
    flexibility: 7.5,
    studentFriendly: true,
    transport: 9.2,
    description: "Higher-quality student residence with excellent facilities.",
    tags: ["student", "premium", "vienna", "quality"],
  },
  {
    id: 4,
    name: "Spusu Student",
    category: "mobile",
    price: 12,
    priceLabel: "€12 / month",
    location: "Austria",
    quality: 8.0,
    flexibility: 9.0,
    studentFriendly: true,
    transport: 5,
    description: "Low-cost mobile plan suitable for students.",
    tags: ["student", "cheap", "mobile", "data"],
  },
  {
    id: 5,
    name: "A1 Basic Mobile",
    category: "mobile",
    price: 18,
    priceLabel: "€18 / month",
    location: "Austria",
    quality: 9.2,
    flexibility: 8.0,
    studentFriendly: true,
    transport: 5,
    description: "Reliable mobile plan with strong network coverage.",
    tags: ["mobile", "network", "quality"],
  },
  {
    id: 6,
    name: "Premium Mobile Plan",
    category: "mobile",
    price: 25,
    priceLabel: "€25 / month",
    location: "Austria",
    quality: 9.7,
    flexibility: 8.5,
    studentFriendly: false,
    transport: 5,
    description: "Premium mobile plan with more data and additional services.",
    tags: ["mobile", "premium", "data"],
  },
  {
    id: 7,
    name: "Vienna Public Transport",
    category: "transport",
    price: 25,
    priceLabel: "≈ €25 / month",
    location: "Vienna",
    quality: 9.0,
    flexibility: 9.0,
    studentFriendly: true,
    transport: 10,
    description: "Demo monthly public transport option for Vienna.",
    tags: ["vienna", "transport", "student"],
  },
  {
    id: 8,
    name: "Flexible Transport Pass",
    category: "transport",
    price: 35,
    priceLabel: "≈ €35 / month",
    location: "Vienna",
    quality: 9.4,
    flexibility: 9.8,
    studentFriendly: true,
    transport: 10,
    description: "Demo flexible transport option with additional flexibility.",
    tags: ["transport", "flexible", "vienna"],
  },
  {
    id: 9,
    name: "Fit4Students",
    category: "gym",
    price: 25,
    priceLabel: "€25 / month",
    location: "Vienna",
    quality: 8.0,
    flexibility: 8.5,
    studentFriendly: true,
    transport: 8,
    description: "Affordable gym membership designed for students.",
    tags: ["gym", "student", "fitness"],
  },
  {
    id: 10,
    name: "John Harris",
    category: "gym",
    price: 45,
    priceLabel: "€45 / month",
    location: "Vienna",
    quality: 9.5,
    flexibility: 8.0,
    studentFriendly: false,
    transport: 8,
    description: "Higher-end gym with premium facilities.",
    tags: ["gym", "premium", "fitness"],
  },
  {
    id: 11,
    name: "Netflix Basic",
    category: "streaming",
    price: 8,
    priceLabel: "€8 / month",
    location: "Austria",
    quality: 8.5,
    flexibility: 8.5,
    studentFriendly: true,
    transport: 5,
    description: "Affordable streaming option.",
    tags: ["streaming", "movies", "series"],
  },
  {
    id: 12,
    name: "Netflix Premium",
    category: "streaming",
    price: 20,
    priceLabel: "€20 / month",
    location: "Austria",
    quality: 9.5,
    flexibility: 9.0,
    studentFriendly: true,
    transport: 5,
    description: "Premium streaming plan with higher quality.",
    tags: ["streaming", "premium", "movies", "series"],
  },
];

export const categoryLabels: Record<Category, string> = {
  housing: "Housing",
  mobile: "Mobile",
  transport: "Transport",
  gym: "Gym",
  streaming: "Streaming",
};

export const categoryIcons: Record<Category, string> = {
  housing: "🏠",
  mobile: "📱",
  transport: "🚇",
  gym: "🏋️",
  streaming: "🎬",
};

export function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/€/g, " euro ");
}

export const categoryKeywords: Record<Category, string[]> = {
  housing: [
    "house", "housing", "room", "bedroom", "apartment",
    "flat", "rent", "accommodation", "dorm", "student residence",
    "casa", "stanza", "camera", "appartamento", "affitto",
    "alloggio", "monolocale", "wohn", "zimmer", "wohnung", "miete"
  ],
  mobile: [
    "mobile", "phone", "telephone", "cellphone", "sim",
    "tariff", "phone plan", "mobile plan", "data plan",
    "abbonamento", "telefonia", "cellulare", "telefono",
    "tariffa", "gb", "handy", "mobilfunk"
  ],
  transport: [
    "transport", "public transport", "metro", "subway",
    "tram", "bus", "u-bahn", "travel pass", "transport pass",
    "trasporti", "trasporto", "abbonamento trasporti",
    "mezzi pubblici", "autobus", "treno", "jahreskarte"
  ],
  gym: [
    "gym", "fitness", "workout", "gym membership",
    "palestra", "allenamento", "fitnessstudio"
  ],
  streaming: [
    "streaming", "netflix", "disney+", "spotify", "youtube premium",
    "movies", "series", "film", "serie tv", "musica in streaming"
  ]
};

export function detectCategories(text: string): Category[] {
  const t = normalizeSearchText(text);
  const detected = (Object.keys(categoryKeywords) as Category[]).filter((category) =>
    categoryKeywords[category].some((keyword) => t.includes(keyword))
  );
  const explicitMobile = [
    "mobile", "phone", "telephone", "cellphone", "sim",
    "tariff", "phone plan", "mobile plan", "data plan",
    "telefonia", "cellulare", "telefono", "tariffa", "gb",
    "handy", "mobilfunk"
  ].some((keyword) => t.includes(keyword));
  const explicitOtherSubscription = [
    "netflix", "disney+", "spotify", "youtube premium",
    "streaming", "palestra", "gym", "fitness",
    "trasporti", "mezzi pubblici", "transport pass"
  ].some((keyword) => t.includes(keyword));
  if (
    t.includes("abbonamento") &&
    !explicitMobile &&
    !explicitOtherSubscription &&
    !detected.includes("mobile")
  ) {
    detected.push("mobile");
  }
  return detected;
}

export function detectBudgets(
  text: string,
  categories: Category[]
): Partial<Record<Category, number>> {
  const normalized = normalizeSearchText(text);
  const budgets: Partial<Record<Category, number>> = {};
  const numberMatches = Array.from(normalized.matchAll(/\d+(?:[.,]\d+)?/g))
    .map((match) => ({
      value: Number(match[0].replace(",", ".")),
      position: match.index ?? 0,
    }))
    .filter((item) => Number.isFinite(item.value));
  if (numberMatches.length === 0 || categories.length === 0) return budgets;
  const occurrences: { category: Category; position: number }[] = [];
  for (const category of categories) {
    for (const keyword of categoryKeywords[category]) {
      let from = 0;
      while (true) {
        const position = normalized.indexOf(keyword, from);
        if (position === -1) break;
        occurrences.push({ category, position });
        from = position + keyword.length;
      }
    }
  }
  for (const number of numberMatches) {
    const nearest = occurrences
      .map((item) => ({
        ...item,
        distance: Math.abs(item.position - number.position),
      }))
      .sort((a, b) => a.distance - b.distance)[0];
    if (nearest) budgets[nearest.category] = number.value;
  }
  return budgets;
}

export function detectPreferences(text: string) {
  const t = text.toLowerCase();
  return {
    student:
      t.includes("student") ||
      t.includes("student-friendly") ||
      t.includes("student friendly"),
    quality: t.includes("quality") || t.includes("premium") || t.includes("best"),
    cheap:
      t.includes("cheap") ||
      t.includes("cheapest") ||
      t.includes("affordable") ||
      t.includes("budget"),
    vienna: t.includes("vienna") || t.includes("wien"),
    university:
      t.includes("university") ||
      t.includes("university nearby") ||
      t.includes("fh wien"),
  };
}

export function calculateScore(
  offer: Offer,
  preferences: ReturnType<typeof detectPreferences>,
  budget?: number
): ScoredOffer {
  let score = 7;
  const reasons: string[] = [];
  if (preferences.student && offer.studentFriendly) {
    score += 1;
    reasons.push("student-friendly");
  }
  if (preferences.quality) {
    score += (offer.quality - 8) * 0.8;
    if (offer.quality >= 9) reasons.push("high quality");
  }
  if (preferences.cheap) {
    if (offer.price <= 20) {
      score += 1;
      reasons.push("low price");
    } else if (offer.price <= 50) {
      score += 0.4;
    }
  }
  if (preferences.vienna && offer.location.toLowerCase().includes("vienna")) {
    score += 0.5;
    reasons.push("Vienna");
  }
  if (preferences.university && offer.category === "housing") {
    score += 0.6;
    reasons.push("good university fit");
  }
  if (budget !== undefined) {
    if (offer.price <= budget) {
      score += 1;
      reasons.push(`within €${budget} budget`);
    } else {
      score -= Math.min(3, ((offer.price - budget) / Math.max(20, budget)) * 3);
    }
  }
  score += (offer.flexibility - 7) * 0.15;
  score = Math.max(1, Math.min(10, score));
  return { ...offer, score: Number(score.toFixed(1)), reasons };
}

export function createBundles(
  categoryResults: Record<Category, ScoredOffer[]>,
  categories: Category[]
): Bundle[] {
  let combinations: ScoredOffer[][] = [[]];
  for (const category of categories) {
    const categoryOffers = categoryResults[category].slice(0, 3);
    const next: ScoredOffer[][] = [];
    for (const existing of combinations) {
      for (const offer of categoryOffers) {
        next.push([...existing, offer]);
      }
    }
    combinations = next;
  }
  return combinations.map((bundleOffers) => {
    const totalPrice = bundleOffers.reduce((sum, offer) => sum + offer.price, 0);
    const averageScore =
      bundleOffers.reduce((sum, offer) => sum + offer.score, 0) / bundleOffers.length;
    const quality =
      bundleOffers.reduce((sum, offer) => sum + offer.quality, 0) / bundleOffers.length;
    const score = Number((averageScore * 0.65 + quality * 0.35).toFixed(1));
    return {
      offers: bundleOffers,
      totalPrice,
      score,
      quality: Number(quality.toFixed(1)),
    };
  });
}

export function formatPrice(price: number) {
  return `€${price.toFixed(0)}`;
}
