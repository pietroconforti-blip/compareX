"use client";

import { useMemo, useRef, useState } from "react";

type Category = "housing" | "mobile" | "transport" | "gym" | "streaming";

type Offer = {
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

type ScoredOffer = Offer & {
  score: number;
  reasons: string[];
};

type Bundle = {
  offers: ScoredOffer[];
  totalPrice: number;
  score: number;
  quality: number;
};

const offers: Offer[] = [
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

const categoryLabels: Record<Category, string> = {
  housing: "Housing",
  mobile: "Mobile",
  transport: "Transport",
  gym: "Gym",
  streaming: "Streaming",
};

const categoryIcons: Record<Category, string> = {
  housing: "🏠",
  mobile: "📱",
  transport: "🚇",
  gym: "🏋️",
  streaming: "🎬",
};


function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/€/g, " euro ");
}

const categoryKeywords: Record<Category, string[]> = {
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

function detectCategories(text: string): Category[] {
  const t = normalizeSearchText(text);

  const detected = (Object.keys(categoryKeywords) as Category[])
    .filter(category =>
      categoryKeywords[category].some(keyword => t.includes(keyword))
    );

  // "Abbonamento" da solo indica probabilmente un piano mobile.
  // Se viene nominato un servizio specifico, evitiamo questa deduzione.
  const explicitMobile = [
    "mobile", "phone", "telephone", "cellphone", "sim",
    "tariff", "phone plan", "mobile plan", "data plan",
    "telefonia", "cellulare", "telefono", "tariffa", "gb",
    "handy", "mobilfunk"
  ].some(keyword => t.includes(keyword));

  const explicitOtherSubscription = [
    "netflix", "disney+", "spotify", "youtube premium",
    "streaming", "palestra", "gym", "fitness",
    "trasporti", "mezzi pubblici", "transport pass"
  ].some(keyword => t.includes(keyword));

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

function extractBudgetNumbers(text: string): number[] {
  const normalized = normalizeSearchText(text);
  const matches = normalized.match(
    /(?:under|below|less than|up to|maximum|max|under|sotto|meno di|massimo|max|fino a|bis zu|unter)\\s*€?\\s*\\d+(?:[.,]\\d+)?|€\\s*\\d+(?:[.,]\\d+)?|\\d+(?:[.,]\\d+)?\\s*(?:euro|eur|€)/gi
  );

  if (!matches) return [];

  return matches
    .map(match => {
      const number = match.match(/\\d+(?:[.,]\\d+)?/);
      return number ? Number(number[0].replace(",", ".")) : NaN;
    })
    .filter(value => Number.isFinite(value));
}

function detectBudgets(
  text: string,
  categories: Category[]
): Partial<Record<Category, number>> {
  const normalized = normalizeSearchText(text);
  const budgets: Partial<Record<Category, number>> = {};

  const numberMatches = Array.from(
    normalized.matchAll(/\\d+(?:[.,]\\d+)?/g)
  ).map(match => ({
    value: Number(match[0].replace(",", ".")),
    position: match.index ?? 0
  })).filter(item => Number.isFinite(item.value));

  if (numberMatches.length === 0 || categories.length === 0) {
    return budgets;
  }

  const occurrences: {
    category: Category;
    position: number;
  }[] = [];

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

  // Associa ogni cifra alla categoria menzionata più vicina.
  // Funziona sia con "casa 400 euro" sia con "400 euro per la casa".
  for (const number of numberMatches) {
    const nearest = occurrences
      .map(item => ({
        ...item,
        distance: Math.abs(item.position - number.position)
      }))
      .sort((a, b) => a.distance - b.distance)[0];

    if (nearest) {
      budgets[nearest.category] = number.value;
    }
  }

  return budgets;
}

function detectPreferences(text: string) {
  const t = text.toLowerCase();

  return {
    student:
      t.includes("student") ||
      t.includes("student-friendly") ||
      t.includes("student friendly"),

    quality:
      t.includes("quality") ||
      t.includes("premium") ||
      t.includes("best"),

    cheap:
      t.includes("cheap") ||
      t.includes("cheapest") ||
      t.includes("affordable") ||
      t.includes("budget"),

    vienna:
      t.includes("vienna") ||
      t.includes("wien"),

    university:
      t.includes("university") ||
      t.includes("university nearby") ||
      t.includes("fh wien"),
  };
}

function calculateScore(
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

    if (offer.quality >= 9) {
      reasons.push("high quality");
    }
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
      score -= Math.min(3, (offer.price - budget) / Math.max(20, budget) * 3);
    }
  }

  score += (offer.flexibility - 7) * 0.15;

  score = Math.max(1, Math.min(10, score));

  return {
    ...offer,
    score: Number(score.toFixed(1)),
    reasons,
  };
}

function createBundles(
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
    const totalPrice = bundleOffers.reduce(
      (sum, offer) => sum + offer.price,
      0
    );

    const averageScore =
      bundleOffers.reduce((sum, offer) => sum + offer.score, 0) /
      bundleOffers.length;

    const quality =
      bundleOffers.reduce((sum, offer) => sum + offer.quality, 0) /
      bundleOffers.length;

    const score = Number(
      (averageScore * 0.65 + quality * 0.35).toFixed(1)
    );

    return {
      offers: bundleOffers,
      totalPrice,
      score,
      quality: Number(quality.toFixed(1)),
    };
  });
}

function formatPrice(price: number) {
  return `€${price.toFixed(0)}`;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [sort, setSort] = useState<"score" | "price">("score");
  const [selectedBundle, setSelectedBundle] = useState<
    "overall" | "cheapest" | "quality"
  >("overall");

  const resultsRef = useRef<HTMLElement | null>(null);

  const detectedCategories = useMemo(
    () => detectCategories(submittedQuery),
    [submittedQuery]
  );

  const budgets = useMemo(
    () => detectBudgets(submittedQuery, detectedCategories),
    [submittedQuery, detectedCategories]
  );

  const preferences = useMemo(
    () => detectPreferences(submittedQuery),
    [submittedQuery]
  );

  const searchCountries = useMemo(() => {
    const t = normalizeSearchText(submittedQuery);

    const austriaTerms = [
      "austria", "osterreich", "vienna", "wien", "graz",
      "salzburg", "linz", "innsbruck"
    ];

    const italyTerms = [
      "italy", "italia", "milan", "milano", "rome", "roma",
      "verona", "venice", "venezia", "bologna", "florence",
      "firenze", "turin", "torino", "naples", "napoli"
    ];

    const mentionsAustria = austriaTerms.some(term => t.includes(term));
    const mentionsItaly = italyTerms.some(term => t.includes(term));

    if (mentionsAustria && mentionsItaly) return ["Austria", "Italy"];
    if (mentionsAustria) return ["Austria"];
    if (mentionsItaly) return ["Italy"];

    return ["Austria", "Italy"];
  }, [submittedQuery]);

  const resultsByCategory = useMemo(() => {
    const output = {} as Record<Category, ScoredOffer[]>;

    for (const category of detectedCategories) {
      const budget = budgets[category];

      let categoryOffers = offers
        .filter((offer) => offer.category === category)
        .map((offer) => calculateScore(offer, preferences, budget));

      if (budget !== undefined) {
        const withinBudget = categoryOffers.filter(
          (offer) => offer.price <= budget
        );

        if (withinBudget.length > 0) {
          categoryOffers = withinBudget;
        }
      }

      categoryOffers.sort((a, b) => {
        if (sort === "price") {
          return a.price - b.price;
        }

        return b.score - a.score;
      });

      output[category] = categoryOffers;
    }

    return output;
  }, [detectedCategories, budgets, preferences, sort]);

  const bundles = useMemo(() => {
    if (detectedCategories.length < 2) return [];

    return createBundles(resultsByCategory, detectedCategories);
  }, [detectedCategories, resultsByCategory]);

  const bestOverall = useMemo(() => {
    if (bundles.length === 0) return null;

    return [...bundles].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.totalPrice - b.totalPrice;
    })[0];
  }, [bundles]);

  const cheapest = useMemo(() => {
    if (bundles.length === 0) return null;

    return [...bundles].sort((a, b) => {
      if (a.totalPrice !== b.totalPrice) {
        return a.totalPrice - b.totalPrice;
      }

      return b.score - a.score;
    })[0];
  }, [bundles]);

  const bestQuality = useMemo(() => {
    if (bundles.length === 0) return null;

    return [...bundles].sort((a, b) => {
      if (b.quality !== a.quality) {
        return b.quality - a.quality;
      }

      return b.score - a.score;
    })[0];
  }, [bundles]);

  const activeBundle =
    selectedBundle === "overall"
      ? bestOverall
      : selectedBundle === "cheapest"
      ? cheapest
      : bestQuality;

  function search() {
    const cleanQuery = query.trim();

    if (!cleanQuery) return;

    setSubmittedQuery(cleanQuery);
    setSelectedBundle("overall");

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      search();
    }
  }

  const hasResults = detectedCategories.length > 0;

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1746a2] text-lg font-bold text-white">
              C
            </div>

            <div>
              <div className="text-xl font-bold tracking-tight">
                CompareX
              </div>
              <div className="text-xs text-slate-500">
                Compare better. Choose better.
              </div>
            </div>
          </div>

          <div className="hidden text-sm text-slate-500 md:block">
            AI-powered decision engine
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-5 inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-[#1746a2]">
            Compare more than just prices
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-slate-950 md:text-6xl">
            Find what actually
            <span className="text-[#2563eb]"> fits you.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Tell CompareX what you need in natural language. We compare
            different options and build the setup that makes the most sense
            for you.
          </p>

          <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/50">
            <div className="flex flex-col gap-2 md:flex-row">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Find me a student room in Vienna under €500, a phone plan under €20 and public transport"
                className="min-h-14 flex-1 rounded-xl px-4 text-base outline-none placeholder:text-slate-400"
              />

              <button
                onClick={search}
                className="min-h-14 rounded-xl bg-[#1746a2] px-8 font-semibold text-white transition hover:bg-[#123985]"
              >
                Compare
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {[
              "Student room in Vienna under €500",
              "Phone plan under €20",
              "Gym in Vienna",
              "Room + phone + transport",
            ].map((example) => (
              <button
                key={example}
                onClick={() => setQuery(example)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition hover:border-blue-200 hover:text-[#1746a2]"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </section>

      {hasResults && (
        <section
          ref={resultsRef}
          className="mx-auto max-w-7xl scroll-mt-8 px-6 pb-20"
        >
          <div className="mb-8 rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <div className="text-sm font-semibold text-[#1746a2]">
              Your request
            </div>

            <div className="mt-1 text-lg font-medium text-slate-900">
              “{submittedQuery}”
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {detectedCategories.map((category) => (
                <span
                  key={category}
                  className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-700"
                >
                  {categoryIcons[category]} {categoryLabels[category]}
                  {budgets[category] !== undefined
                    ? ` · max €${budgets[category]}`
                    : ""}
                </span>
              ))}
            </div>
          </div>

          <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-2xl font-bold">Search real offers online</h2>
            <p className="mt-2 text-slate-600">
              Search results are tailored to the country mentioned in your request.
              Check prices and availability on the original websites.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {searchCountries.map((country) => {
                const isAustria = country === "Austria";
                const countryTerms = isAustria
                  ? "Österreich Austria Angebote Preise"
                  : "Italia Italy offerte prezzi";

                return (
                  <a
                    key={country}
                    href={`https://www.google.com/search?q=${encodeURIComponent(submittedQuery + " " + countryTerms)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-[#1746a2] px-5 py-4 text-center font-semibold text-white hover:bg-[#123985]"
                  >
                    {isAustria ? "🇦🇹 Search offers in Austria" : "🇮🇹 Search offers in Italy"}
                  </a>
                );
              })}
            </div>
          </section>

          {detectedCategories.length >= 2 && bundles.length > 0 && (
            <div className="mb-12">
              <div className="mb-5">
                <h2 className="text-3xl font-bold tracking-tight">
                  Your best setup
                </h2>
                <p className="mt-2 text-slate-600">
                  CompareX combines the best options across your categories.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {[
                  {
                    id: "overall" as const,
                    title: "Best Overall",
                    subtitle: "Best balance",
                    bundle: bestOverall,
                  },
                  {
                    id: "cheapest" as const,
                    title: "Cheapest",
                    subtitle: "Lowest monthly cost",
                    bundle: cheapest,
                  },
                  {
                    id: "quality" as const,
                    title: "Best Quality",
                    subtitle: "Highest quality",
                    bundle: bestQuality,
                  },
                ].map((option) => {
                  if (!option.bundle) return null;

                  const active = selectedBundle === option.id;

                  return (
                    <button
                      key={option.id}
                      onClick={() => setSelectedBundle(option.id)}
                      className={`rounded-2xl border p-5 text-left transition ${
                        active
                          ? "border-[#2563eb] bg-white shadow-lg shadow-blue-100"
                          : "border-slate-200 bg-white hover:border-blue-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-lg font-bold">
                            {option.title}
                          </div>
                          <div className="mt-1 text-sm text-slate-500">
                            {option.subtitle}
                          </div>
                        </div>

                        {active && (
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#1746a2]">
                            Selected
                          </span>
                        )}
                      </div>

                      <div className="mt-6 text-3xl font-bold text-slate-950">
                        {formatPrice(option.bundle.totalPrice)}
                        <span className="ml-1 text-sm font-normal text-slate-500">
                          / month
                        </span>
                      </div>

                      <div className="mt-3 flex gap-3 text-sm">
                        <span className="rounded-lg bg-slate-100 px-3 py-1.5">
                          Score{" "}
                          <strong>{option.bundle.score}/10</strong>
                        </span>

                        <span className="rounded-lg bg-slate-100 px-3 py-1.5">
                          Quality{" "}
                          <strong>{option.bundle.quality}/10</strong>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {activeBundle && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <div className="text-sm font-semibold text-[#1746a2]">
                        {selectedBundle === "overall"
                          ? "Best Overall"
                          : selectedBundle === "cheapest"
                          ? "Cheapest"
                          : "Best Quality"}
                      </div>

                      <h3 className="mt-1 text-2xl font-bold">
                        Your recommended combination
                      </h3>
                    </div>

                    <div className="text-left md:text-right">
                      <div className="text-3xl font-bold">
                        {formatPrice(activeBundle.totalPrice)}
                      </div>
                      <div className="text-sm text-slate-500">
                        estimated monthly total
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    {activeBundle.offers.map((offer) => (
                      <div
                        key={offer.id}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="text-sm font-medium text-[#1746a2]">
                          {categoryIcons[offer.category]}{" "}
                          {categoryLabels[offer.category]}
                        </div>

                        <div className="mt-2 font-bold">{offer.name}</div>

                        <div className="mt-2 text-xl font-bold">
                          {offer.priceLabel}
                        </div>

                        <div className="mt-2 text-sm text-slate-600">
                          CompareX Score:{" "}
                          <strong>{offer.score}/10</strong>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-xl bg-blue-50 p-4 text-sm text-slate-700">
                    <strong className="text-[#1746a2]">
                      Why this package?
                    </strong>{" "}
                    It combines the strongest options across your selected
                    categories while balancing price, quality, flexibility and
                    your stated preferences.
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Compare individual options
              </h2>
              <p className="mt-2 text-slate-600">
                Explore the individual offers behind your recommendation.
              </p>
            </div>

            <div className="flex rounded-lg border border-slate-200 bg-white p-1">
              <button
                onClick={() => setSort("score")}
                className={`rounded-md px-4 py-2 text-sm font-medium ${
                  sort === "score"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600"
                }`}
              >
                Best match
              </button>

              <button
                onClick={() => setSort("price")}
                className={`rounded-md px-4 py-2 text-sm font-medium ${
                  sort === "price"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600"
                }`}
              >
                Lowest price
              </button>
            </div>
          </div>

          <div className="space-y-10">
            {detectedCategories.map((category) => {
              const categoryResults = resultsByCategory[category] || [];

              return (
                <div key={category}>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-2xl">
                      {categoryIcons[category]}
                    </span>

                    <div>
                      <h3 className="text-xl font-bold">
                        {categoryLabels[category]}
                      </h3>

                      <p className="text-sm text-slate-500">
                        {categoryResults.length} options found
                        {budgets[category] !== undefined
                          ? ` · budget €${budgets[category]}`
                          : ""}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {categoryResults.map((offer) => (
                      <article
                        key={offer.id}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-lg font-bold">
                              {offer.name}
                            </div>

                            <div className="mt-1 text-sm text-slate-500">
                              {offer.location}
                            </div>
                          </div>

                          <div className="rounded-xl bg-blue-50 px-3 py-2 text-center">
                            <div className="text-xs text-slate-500">
                              Score
                            </div>
                            <div className="font-bold text-[#1746a2]">
                              {offer.score}
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 text-2xl font-bold">
                          {offer.priceLabel}
                        </div>

                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          {offer.description}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {offer.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="mt-5 border-t border-slate-100 pt-4">
                          <div className="text-sm font-semibold text-slate-900">
                            Why this matches
                          </div>

                          <ul className="mt-2 space-y-1 text-sm text-slate-600">
                            {offer.reasons.length > 0 ? (
                              offer.reasons.slice(0, 4).map((reason) => (
                                <li key={reason}>✓ {reason}</li>
                              ))
                            ) : (
                              <li>✓ Good overall match</li>
                            )}
                          </ul>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {!hasResults && submittedQuery && (
        <section className="mx-auto max-w-3xl px-6 pb-20 text-center">
          <div className="rounded-2xl border border-slate-200 bg-white p-10">
            <div className="text-4xl">🔎</div>

            <h2 className="mt-4 text-2xl font-bold">
              We couldn't identify a category yet
            </h2>

            <p className="mt-2 text-slate-600">
              Try searching for housing, a phone plan, transport, a gym or
              streaming.
            </p>
          </div>
        </section>
      )}

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 text-center text-sm text-slate-500">
          CompareX demo · Prices and offers shown are demo data.
        </div>
      </footer>
    </main>
  );
}
