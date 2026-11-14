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
  sourceUrl?: string;
  image?: string;
  lastVerified?: string;
};

export type ScoredOffer = Offer & {
  score: number;
  reasons: string[];
  rank?: "cheapest" | "best-value" | "best-overall" | null;
};

export type Bundle = {
  offers: ScoredOffer[];
  totalPrice: number;
  score: number;
  quality: number;
};

const img = {
  housingVienna1: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
  housingVienna2: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
  housingVienna3: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
  housingMilan1: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
  housingMilan2: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  housingShared: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80",
  mobile: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
  transportVienna: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80",
  transportMilan: "https://images.unsplash.com/photo-1544620341-11cb2cd7c5c2?auto=format&fit=crop&w=1200&q=80",
  gym: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80",
  streaming: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=1200&q=80",
};

export const offers: Offer[] = [
  { id: 1, name: "home4students Erlachplatz", category: "housing", price: 289, priceLabel: "From €289 / month", location: "Vienna", quality: 7.6, flexibility: 7.5, studentFriendly: true, transport: 8, description: "Shared room entry price at home4students (10th district).", tags: ["student", "budget", "vienna", "dorm", "home4students"], image: img.housingVienna1, lastVerified: "2026-10-21" },
  { id: 2, name: "Akademikerhilfe Michaelerstraße", category: "housing", price: 316, priceLabel: "From €316 / month", location: "Vienna", quality: 7.8, flexibility: 7.8, studentFriendly: true, transport: 8.5, description: "Non-profit Akademikerhilfe residence · strong student network.", tags: ["student", "vienna", "akademikerhilfe", "dorm"], image: img.housingVienna2 },
  { id: 3, name: "OeAD Brigittenauer Lände", category: "housing", price: 372, priceLabel: "From €372 / month", location: "Vienna", quality: 8.0, flexibility: 8.0, studentFriendly: true, transport: 8.5, description: "OeAD international student housing · House Panorama.", tags: ["student", "vienna", "oead", "international"], image: img.housingVienna3 },
  { id: 4, name: "WIHAST network", category: "housing", price: 320, priceLabel: "From ≈ €320 / month", location: "Vienna", quality: 7.7, flexibility: 7.5, studentFriendly: true, transport: 8, description: "Among the more affordable Vienna dorm networks on average.", tags: ["student", "budget", "vienna", "wihast"], image: img.housingVienna1 },
  { id: 5, name: "STUWO modern residences", category: "housing", price: 430, priceLabel: "From ≈ €430 / month", location: "Vienna", quality: 9.0, flexibility: 8.0, studentFriendly: true, transport: 9, description: "Newer STUWO buildings · higher comfort band.", tags: ["student", "modern", "vienna", "stuwo"], image: img.housingVienna2 },
  { id: 6, name: "ÖJAB network", category: "housing", price: 301, priceLabel: "From ≈ €301 / month", location: "Vienna", quality: 8.0, flexibility: 8.2, studentFriendly: true, transport: 8.5, description: "Large ÖJAB network with wide price range across houses.", tags: ["student", "vienna", "oejab", "budget"], image: img.housingVienna3 },
  { id: 7, name: "Bocconi residence (preferential band)", category: "housing", price: 615, priceLabel: "≈ €615 / month", location: "Milan", quality: 9.0, flexibility: 6.5, studentFriendly: true, transport: 8.5, description: "University residence via Bocconi process · not open market.", tags: ["student", "milan", "bocconi", "university"], image: img.housingMilan1 },
  { id: 8, name: "Unimi DSU residences", category: "housing", price: 280, priceLabel: "Subsidised · competitive", location: "Milan", quality: 8.0, flexibility: 5.5, studentFriendly: true, transport: 8, description: "University of Milan allocation · eligibility ranking required.", tags: ["student", "milan", "unimi", "budget", "university"], image: img.housingMilan2 },
  { id: 9, name: "Milan private single room (avg)", category: "housing", price: 700, priceLabel: "≈ €650–800 / month", location: "Milan", quality: 7.5, flexibility: 9.0, studentFriendly: true, transport: 8, description: "Typical shared-flat single room on the private market.", tags: ["student", "milan", "private", "room"], image: img.housingShared },
  { id: 17, name: "Vienna shared flat (budget)", category: "housing", price: 450, priceLabel: "≈ €400–500 / month", location: "Vienna", quality: 7.2, flexibility: 8.5, studentFriendly: true, transport: 7.5, description: "Typical private shared-flat room in outer districts.", tags: ["student", "vienna", "private", "budget", "shared"], image: img.housingShared },
  { id: 18, name: "Milan student residence (private)", category: "housing", price: 520, priceLabel: "From €520 / month", location: "Milan", quality: 8.2, flexibility: 7.0, studentFriendly: true, transport: 8.0, description: "Modern private student residence with common areas.", tags: ["student", "milan", "private", "modern"], image: img.housingMilan1 },
  { id: 10, name: "Spusu Student", category: "mobile", price: 12, priceLabel: "€12 / month", location: "Austria", quality: 8.0, flexibility: 9.0, studentFriendly: true, transport: 5, description: "Low-cost mobile plan suitable for students.", tags: ["student", "cheap", "mobile", "data"], image: img.mobile },
  { id: 11, name: "A1 Basic Mobile", category: "mobile", price: 18, priceLabel: "€18 / month", location: "Austria", quality: 9.2, flexibility: 8.0, studentFriendly: true, transport: 5, description: "Reliable mobile plan with strong network coverage.", tags: ["mobile", "network", "quality"], image: img.mobile },
  { id: 12, name: "Premium Mobile Plan", category: "mobile", price: 25, priceLabel: "€25 / month", location: "Austria", quality: 9.7, flexibility: 8.5, studentFriendly: false, transport: 5, description: "Premium mobile plan with more data and additional services.", tags: ["mobile", "premium", "data"], image: img.mobile },
  { id: 19, name: "HoT Student SIM", category: "mobile", price: 10, priceLabel: "€10 / month", location: "Austria", quality: 7.8, flexibility: 9.5, studentFriendly: true, transport: 5, description: "Very affordable prepaid/student SIM with decent data.", tags: ["student", "cheap", "mobile", "prepaid", "austria"], image: img.mobile },
  { id: 20, name: "Iliad Italy Student", category: "mobile", price: 8, priceLabel: "€8 / month", location: "Italy", quality: 8.3, flexibility: 9.0, studentFriendly: true, transport: 5, description: "Competitive Italian mobile plan popular with students.", tags: ["student", "cheap", "mobile", "italy", "iliad"], image: img.mobile },
  { id: 13, name: "Vienna Public Transport", category: "transport", price: 25, priceLabel: "≈ €25 / month", location: "Vienna", quality: 9.0, flexibility: 9.0, studentFriendly: true, transport: 10, description: "Public transport option for Vienna students.", tags: ["vienna", "transport", "student"], image: img.transportVienna },
  { id: 14, name: "ATM Under 27 Milan", category: "transport", price: 22, priceLabel: "≈ €22 / month", location: "Milan", quality: 8.8, flexibility: 9.0, studentFriendly: true, transport: 10, description: "Indicative young/student-oriented city transport pass band.", tags: ["milan", "transport", "student", "atm"], image: img.transportMilan },
  { id: 15, name: "Fit4Students", category: "gym", price: 25, priceLabel: "€25 / month", location: "Vienna", quality: 8.0, flexibility: 8.5, studentFriendly: true, transport: 8, description: "Affordable gym membership designed for students.", tags: ["gym", "student", "fitness", "vienna"], image: img.gym },
  { id: 21, name: "McFit Student", category: "gym", price: 20, priceLabel: "€20 / month", location: "Vienna", quality: 7.5, flexibility: 8.0, studentFriendly: true, transport: 7.5, description: "Budget gym chain with student rates in multiple locations.", tags: ["gym", "student", "budget", "vienna", "fitness"], image: img.gym },
  { id: 22, name: "Milan gym student pass", category: "gym", price: 28, priceLabel: "€28 / month", location: "Milan", quality: 8.1, flexibility: 8.2, studentFriendly: true, transport: 8, description: "Typical student-friendly gym membership in Milan.", tags: ["gym", "student", "milan", "fitness"], image: img.gym },
  { id: 16, name: "Netflix Basic", category: "streaming", price: 8, priceLabel: "€8 / month", location: "Austria", quality: 8.5, flexibility: 8.5, studentFriendly: true, transport: 5, description: "Affordable streaming option.", tags: ["streaming", "movies", "series"], image: img.streaming },
  { id: 23, name: "Disney+ Student", category: "streaming", price: 7, priceLabel: "€7 / month", location: "Austria", quality: 8.7, flexibility: 8.0, studentFriendly: true, transport: 5, description: "Disney+ with student discount where available.", tags: ["streaming", "disney", "student", "movies"], image: img.streaming },
  { id: 24, name: "Spotify Student", category: "streaming", price: 5, priceLabel: "€5 / month", location: "Austria", quality: 9.0, flexibility: 9.0, studentFriendly: true, transport: 5, description: "Spotify Premium student plan with ad-free music.", tags: ["streaming", "spotify", "student", "music"], image: img.streaming },

  { id: 25, name: "CampusX Milano", category: "housing", price: 480, priceLabel: "From €480 / month", location: "Milan", quality: 8.4, flexibility: 7.5, studentFriendly: true, transport: 8.2, description: "Modern student residence near Bicocca / Navigli options.", tags: ["student", "milan", "private", "modern"], image: img.housingMilan1, lastVerified: "2026-10-20" },
  { id: 26, name: "The Student Hotel Milan", category: "housing", price: 650, priceLabel: "From €650 / month", location: "Milan", quality: 9.1, flexibility: 8.0, studentFriendly: true, transport: 9.0, description: "Hybrid student/hotel residences with flexible stays.", tags: ["student", "milan", "premium", "flexible"], image: img.housingMilan2, lastVerified: "2026-10-18" },
  { id: 27, name: "Iliad Flash 100", category: "mobile", price: 9.99, priceLabel: "€9.99 / month", location: "Italy", quality: 8.5, flexibility: 9.0, studentFriendly: true, transport: 5, description: "Unlimited-style data plan popular with students in Italy.", tags: ["student", "cheap", "mobile", "italy", "iliad"], image: img.mobile, lastVerified: "2026-10-15" },
  { id: 28, name: "Very Mobile Student", category: "mobile", price: 7.99, priceLabel: "€7.99 / month", location: "Italy", quality: 8.0, flexibility: 8.5, studentFriendly: true, transport: 5, description: "Affordable WindTre sub-brand plan with student promotions.", tags: ["student", "mobile", "italy", "budget"], image: img.mobile, lastVerified: "2026-10-15" },
  { id: 29, name: "ATM Under 26 Milan", category: "transport", price: 20, priceLabel: "≈ €20 / month", location: "Milan", quality: 8.9, flexibility: 9.0, studentFriendly: true, transport: 10, description: "Age-based public transport pass for young people in Milan.", tags: ["milan", "transport", "student", "atm"], image: img.transportMilan, lastVerified: "2026-10-10" },
  { id: 30, name: "McFit Milan student", category: "gym", price: 22, priceLabel: "€22 / month", location: "Milan", quality: 7.8, flexibility: 8.0, studentFriendly: true, transport: 7.8, description: "Budget gym chain with student rates across Milan.", tags: ["gym", "student", "milan", "fitness"], image: img.gym, lastVerified: "2026-10-12" },
  { id: 31, name: "Spotify Student Italy", category: "streaming", price: 5.99, priceLabel: "€5.99 / month", location: "Italy", quality: 9.0, flexibility: 9.0, studentFriendly: true, transport: 5, description: "Spotify Premium student plan available in Italy.", tags: ["streaming", "spotify", "student", "italy"], image: img.streaming, lastVerified: "2026-10-01" },
  { id: 32, name: "Disney+ Italy", category: "streaming", price: 8.99, priceLabel: "€8.99 / month", location: "Italy", quality: 8.6, flexibility: 8.0, studentFriendly: true, transport: 5, description: "Disney+ standard plan (student discounts may apply via partners).", tags: ["streaming", "disney", "italy"], image: img.streaming, lastVerified: "2026-10-01" },
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
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/€/g, " euro ");
}

export const categoryKeywords: Record<Category, string[]> = {
  housing: ["house", "housing", "room", "bedroom", "apartment", "flat", "rent", "accommodation", "dorm", "student residence", "casa", "stanza", "camera", "appartamento", "affitto", "alloggio", "monolocale", "wohn", "zimmer", "wohnung", "miete", "studentenheim", "residenza"],
  mobile: ["mobile", "phone", "telephone", "cellphone", "sim", "tariff", "phone plan", "mobile plan", "data plan", "abbonamento", "telefonia", "cellulare", "telefono", "tariffa", "gb", "handy", "mobilfunk"],
  transport: ["transport", "public transport", "metro", "subway", "tram", "bus", "u-bahn", "travel pass", "transport pass", "trasporti", "trasporto", "abbonamento trasporti", "mezzi pubblici", "autobus", "treno", "jahreskarte", "atm"],
  gym: ["gym", "fitness", "workout", "gym membership", "palestra", "allenamento", "fitnessstudio"],
  streaming: ["streaming", "netflix", "disney+", "spotify", "youtube premium", "movies", "series", "film", "serie tv", "musica in streaming"],
};

export function detectCategories(text: string): Category[] {
  const t = normalizeSearchText(text);
  const detected = (Object.keys(categoryKeywords) as Category[]).filter((category) => categoryKeywords[category].some((keyword) => t.includes(keyword)));
  const explicitMobile = ["mobile", "phone", "telephone", "cellphone", "sim", "tariff", "phone plan", "mobile plan", "data plan", "telefonia", "cellulare", "telefono", "tariffa", "gb", "handy", "mobilfunk"].some((keyword) => t.includes(keyword));
  const explicitOtherSubscription = ["netflix", "disney+", "spotify", "youtube premium", "streaming", "palestra", "gym", "fitness", "trasporti", "mezzi pubblici", "transport pass"].some((keyword) => t.includes(keyword));
  if (t.includes("abbonamento") && !explicitMobile && !explicitOtherSubscription && !detected.includes("mobile")) {
    detected.push("mobile");
  }
  return detected;
}

export function detectBudgets(text: string, categories: Category[]): Partial<Record<Category, number>> {
  const normalized = normalizeSearchText(text);
  const budgets: Partial<Record<Category, number>> = {};
  const numberMatches = Array.from(normalized.matchAll(/\d+(?:[.,]\d+)?/g)).map((match) => ({ value: Number(match[0].replace(",", ".")), position: match.index ?? 0 })).filter((item) => Number.isFinite(item.value));
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
    const nearest = occurrences.map((item) => ({ ...item, distance: Math.abs(item.position - number.position) })).sort((a, b) => a.distance - b.distance)[0];
    if (nearest) budgets[nearest.category] = number.value;
  }
  return budgets;
}

export function detectPreferences(text: string) {
  const t = text.toLowerCase();
  return {
    student: t.includes("student") || t.includes("student-friendly") || t.includes("student friendly") || t.includes("studente"),
    quality: t.includes("quality") || t.includes("premium") || t.includes("best"),
    cheap: t.includes("cheap") || t.includes("cheapest") || t.includes("affordable") || t.includes("budget") || t.includes("economico"),
    vienna: t.includes("vienna") || t.includes("wien"),
    milan: t.includes("milan") || t.includes("milano"),
    university: t.includes("university") || t.includes("university nearby") || t.includes("fh wien") || t.includes("bocconi") || t.includes("politecnico"),
  };
}

export function calculateScore(offer: Offer, preferences: ReturnType<typeof detectPreferences>, budget?: number): ScoredOffer {
  let score = 7;
  const reasons: string[] = [];
  if (preferences.student && offer.studentFriendly) { score += 1; reasons.push("student-friendly"); }
  if (preferences.quality) { score += (offer.quality - 8) * 0.8; if (offer.quality >= 9) reasons.push("high quality"); }
  if (preferences.cheap) {
    if (offer.price <= 20) { score += 1; reasons.push("low price"); }
    else if (offer.price <= 50) { score += 0.4; }
    else if (offer.category === "housing" && offer.price <= 400) { score += 0.6; reasons.push("budget housing"); }
  }
  if (preferences.vienna && offer.location.toLowerCase().includes("vienna")) { score += 0.8; reasons.push("Vienna"); }
  if (preferences.milan && offer.location.toLowerCase().includes("milan")) { score += 0.8; reasons.push("Milan"); }
  if (preferences.university && offer.category === "housing") { score += 0.6; reasons.push("good university fit"); }
  if (budget !== undefined) {
    if (offer.price <= budget) { score += 1; reasons.push(`within €${budget} budget`); }
    else { score -= Math.min(3, ((offer.price - budget) / Math.max(20, budget)) * 3); }
  }
  score += (offer.flexibility - 7) * 0.15;
  score = Math.max(1, Math.min(10, score));
  return { ...offer, score: Number(score.toFixed(1)), reasons };
}

export function createBundles(categoryResults: Record<Category, ScoredOffer[]>, categories: Category[]): Bundle[] {
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
    const averageScore = bundleOffers.reduce((sum, offer) => sum + offer.score, 0) / bundleOffers.length;
    const quality = bundleOffers.reduce((sum, offer) => sum + offer.quality, 0) / bundleOffers.length;
    const score = Number((averageScore * 0.65 + quality * 0.35).toFixed(1));
    return { offers: bundleOffers, totalPrice, score, quality: Number(quality.toFixed(1)) };
  });
}

export function formatPrice(price: number) {
  return `€${price.toFixed(0)}`;
}

/** Rank offers within a category: cheapest, best value (score/price), best overall. */
export function rankOffers(scored: ScoredOffer[]): ScoredOffer[] {
  if (scored.length === 0) return [];
  const cheapest = [...scored].sort((a, b) => a.price - b.price)[0];
  const bestOverall = [...scored].sort((a, b) => b.score - a.score)[0];
  const bestValue = [...scored].sort((a, b) => (b.score / Math.max(a.price, 1)) - (a.score / Math.max(b.price, 1)))[0];
  return scored.map((o) => ({
    ...o,
    rank: o.id === cheapest.id ? "cheapest" : o.id === bestValue.id ? "best-value" : o.id === bestOverall.id ? "best-overall" : null,
  }));
}
