"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Category = "housing" | "mobile" | "gym" | "streaming";

type Offer = {
  name: string;
  category: Category;
  price: number;
  priceLabel: string;
  location: number;
  quality: number;
  flexibility: number;
  studentFriendly: number;
  transport: number;
  description: string;
  tags: string[];
};

type RankedOffer = Offer & {
  score: number;
  reasons: string[];
};

const offers: Offer[] = [
  {
    name: "Pfeilgasse Student Residence",
    category: "housing",
    price: 490,
    priceLabel: "€490 / month",
    location: 9.6,
    quality: 8.8,
    flexibility: 8.2,
    studentFriendly: 10,
    transport: 9.7,
    description:
      "Central student residence with excellent access to universities, public transport and everyday services.",
    tags: ["Student", "Central", "Public transport"],
  },
  {
    name: "Student Residence Vienna",
    category: "housing",
    price: 450,
    priceLabel: "€450 / month",
    location: 9,
    quality: 9,
    flexibility: 8,
    studentFriendly: 9.8,
    transport: 9.2,
    description:
      "Student accommodation in Vienna with furnished rooms, shared facilities and good public transport connections.",
    tags: ["Student", "Furnished", "Transport"],
  },
  {
    name: "Vienna Student Living",
    category: "housing",
    price: 520,
    priceLabel: "€520 / month",
    location: 8.8,
    quality: 9.1,
    flexibility: 7.5,
    studentFriendly: 9.5,
    transport: 8.8,
    description:
      "Modern student housing with furnished rooms and convenient connections to central Vienna.",
    tags: ["Modern", "Student", "Furnished"],
  },
  {
    name: "Urban Student Rooms",
    category: "housing",
    price: 430,
    priceLabel: "€430 / month",
    location: 8,
    quality: 8.2,
    flexibility: 8.5,
    studentFriendly: 9.2,
    transport: 8.1,
    description:
      "Affordable student rooms designed for students looking for a simple and flexible living solution.",
    tags: ["Affordable", "Student", "Flexible"],
  },

  {
    name: "A1 Student Mobile",
    category: "mobile",
    price: 15,
    priceLabel: "€15 / month",
    location: 9,
    quality: 9.2,
    flexibility: 9,
    studentFriendly: 9.5,
    transport: 0,
    description:
      "Flexible mobile plan with generous data allowance and reliable Austrian network coverage.",
    tags: ["Student", "Flexible", "Data"],
  },
  {
    name: "Magenta Mobile",
    category: "mobile",
    price: 18,
    priceLabel: "€18 / month",
    location: 9.2,
    quality: 9.4,
    flexibility: 8.5,
    studentFriendly: 9,
    transport: 0,
    description:
      "High-quality mobile plan with strong coverage and a competitive monthly price.",
    tags: ["Coverage", "Quality", "Mobile"],
  },
  {
    name: "spusu Student",
    category: "mobile",
    price: 12,
    priceLabel: "€12 / month",
    location: 8.8,
    quality: 8.5,
    flexibility: 9.4,
    studentFriendly: 9.7,
    transport: 0,
    description:
      "Low-cost mobile option suitable for students who want flexibility without a high monthly cost.",
    tags: ["Low cost", "Student", "Flexible"],
  },

  {
    name: "Fitinn Vienna",
    category: "gym",
    price: 25,
    priceLabel: "€25 / month",
    location: 9.3,
    quality: 8.8,
    flexibility: 9,
    studentFriendly: 9.3,
    transport: 9.1,
    description:
      "Affordable gym membership with multiple locations and convenient opening hours.",
    tags: ["Affordable", "Student", "Flexible"],
  },
  {
    name: "McFIT Vienna",
    category: "gym",
    price: 30,
    priceLabel: "€30 / month",
    location: 9,
    quality: 9,
    flexibility: 8.8,
    studentFriendly: 9,
    transport: 9,
    description:
      "Large fitness network offering extensive equipment and long opening hours.",
    tags: ["Large network", "Equipment", "Transport"],
  },
  {
    name: "John Harris Fitness",
    category: "gym",
    price: 65,
    priceLabel: "€65 / month",
    location: 8.8,
    quality: 9.7,
    flexibility: 8,
    studentFriendly: 7.5,
    transport: 8.7,
    description:
      "Premium fitness experience with high-quality facilities and additional wellness services.",
    tags: ["Premium", "Quality", "Wellness"],
  },

  {
    name: "Netflix",
    category: "streaming",
    price: 13,
    priceLabel: "€13 / month",
    location: 9.5,
    quality: 9.5,
    flexibility: 9,
    studentFriendly: 9,
    transport: 0,
    description:
      "Large streaming library with movies, series and original content.",
    tags: ["Movies", "Series", "Originals"],
  },
  {
    name: "Disney+",
    category: "streaming",
    price: 11,
    priceLabel: "€11 / month",
    location: 9.2,
    quality: 9.1,
    flexibility: 8.8,
    studentFriendly: 9.2,
    transport: 0,
    description:
      "Family-focused streaming service with Disney, Pixar, Marvel and Star Wars content.",
    tags: ["Family", "Movies", "Series"],
  },
  {
    name: "Amazon Prime Video",
    category: "streaming",
    price: 9,
    priceLabel: "€9 / month",
    location: 9,
    quality: 8.8,
    flexibility: 9.1,
    studentFriendly: 9,
    transport: 0,
    description:
      "Affordable streaming option with movies, series and additional Prime benefits.",
    tags: ["Affordable", "Movies", "Series"],
  },
];

const suggestions = [
  "Find me a student room in Vienna under €500",
  "Best mobile plan under €20",
  "Find a gym near Vienna under €30",
  "Best streaming service under €15",
];

const categoryLabels: Record<Category, string> = {
  housing: "Housing",
  mobile: "Mobile",
  gym: "Gym",
  streaming: "Streaming",
};

function detectCategory(text: string): Category | null {
  const value = text.toLowerCase();

  if (
    value.includes("room") ||
    value.includes("housing") ||
    value.includes("apartment") ||
    value.includes("flat") ||
    value.includes("student residence") ||
    value.includes("accommodation")
  ) {
    return "housing";
  }

  if (
    value.includes("mobile") ||
    value.includes("sim") ||
    value.includes("phone") ||
    value.includes("data") ||
    value.includes("gb")
  ) {
    return "mobile";
  }

  if (
    value.includes("gym") ||
    value.includes("fitness") ||
    value.includes("workout")
  ) {
    return "gym";
  }

  if (
    value.includes("streaming") ||
    value.includes("netflix") ||
    value.includes("disney") ||
    value.includes("prime video") ||
    value.includes("series") ||
    value.includes("movies")
  ) {
    return "streaming";
  }

  return null;
}

function detectBudget(text: string): number | null {
  const euroMatch = text.match(/€\s*(\d+)/i);

  if (euroMatch) {
    return Number(euroMatch[1]);
  }

  const underMatch = text.match(/under\s*(?:€\s*)?(\d+)/i);

  if (underMatch) {
    return Number(underMatch[1]);
  }

  const lessMatch = text.match(
    /(?:less than|below|max(?:imum)?)\s*(?:€\s*)?(\d+)/i
  );

  if (lessMatch) {
    return Number(lessMatch[1]);
  }

  return null;
}

function detectPreferences(text: string) {
  const value = text.toLowerCase();

  return {
    student:
      value.includes("student") ||
      value.includes("students"),

    location:
      value.includes("vienna") ||
      value.includes("wien") ||
      value.includes("central") ||
      value.includes("near"),

    transport:
      value.includes("transport") ||
      value.includes("public transport") ||
      value.includes("u-bahn") ||
      value.includes("metro") ||
      value.includes("tram") ||
      value.includes("bus"),

    quality:
      value.includes("quality") ||
      value.includes("premium") ||
      value.includes("best") ||
      value.includes("high quality"),

    flexibility:
      value.includes("flexible") ||
      value.includes("flexibility") ||
      value.includes("no contract") ||
      value.includes("cancel"),
  };
}

function categoryIcon(category: Category) {
  if (category === "housing") return "⌂";
  if (category === "mobile") return "◉";
  if (category === "gym") return "✦";
  return "▶";
}

function calculateScore(
  offer: Offer,
  budget: number | null,
  preferences: ReturnType<typeof detectPreferences>
): RankedOffer {
  let total = 0;
  let weightTotal = 0;

  const reasons: string[] = [];

  // BASE SCORE
  total += offer.quality * 1.5;
  weightTotal += 1.5;

  total += offer.flexibility;
  weightTotal += 1;

  // PRICE
  if (budget !== null) {
    let priceScore = 10;

    if (offer.price <= budget) {
      const saving = budget - offer.price;

      if (budget > 0) {
        priceScore = Math.min(10, 8 + (saving / budget) * 2);
      }

      reasons.push(
        `€${offer.price} is within your €${budget} budget`
      );
    } else {
      priceScore = Math.max(
        0,
        10 - ((offer.price - budget) / budget) * 10
      );
    }

    total += priceScore * 2.5;
    weightTotal += 2.5;
  } else {
    total += Math.max(0, 10 - offer.price / 10);
    weightTotal += 1;
  }

  // STUDENT
  if (preferences.student) {
    total += offer.studentFriendly * 2;
    weightTotal += 2;

    if (offer.studentFriendly >= 9) {
      reasons.push("Very student-friendly");
    }
  }

  // LOCATION
  if (preferences.location) {
    total += offer.location * 2;
    weightTotal += 2;

    if (offer.location >= 9) {
      reasons.push("Excellent location");
    }
  } else {
    total += offer.location;
    weightTotal += 1;
  }

  // TRANSPORT
  if (preferences.transport) {
    total += offer.transport * 2;
    weightTotal += 2;

    if (offer.transport >= 9) {
      reasons.push("Excellent public transport");
    }
  }

  // QUALITY
  if (preferences.quality) {
    total += offer.quality * 2;
    weightTotal += 2;

    if (offer.quality >= 9) {
      reasons.push("High quality");
    }
  }

  // FLEXIBILITY
  if (preferences.flexibility) {
    total += offer.flexibility * 2;
    weightTotal += 2;

    if (offer.flexibility >= 9) {
      reasons.push("Very flexible");
    }
  }

  const score = Math.min(
    10,
    Math.max(0, total / weightTotal)
  );

  if (reasons.length === 0) {
    reasons.push("Strong overall value");
  }

  return {
    ...offer,
    score: Number(score.toFixed(1)),
    reasons: reasons.slice(0, 4),
  };
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [sort, setSort] = useState<
    "best" | "price" | "rating"
  >("best");

  const resultsRef = useRef<HTMLElement | null>(null);

  const detectedCategory = useMemo(
    () => detectCategory(query),
    [query]
  );

  const detectedBudget = useMemo(
    () => detectBudget(query),
    [query]
  );

  const preferences = useMemo(
    () => detectPreferences(query),
    [query]
  );

  const results = useMemo(() => {
    let filtered = [...offers];

    if (detectedCategory) {
      filtered = filtered.filter(
        (offer) => offer.category === detectedCategory
      );
    }

    if (detectedBudget !== null) {
      filtered = filtered.filter(
        (offer) => offer.price <= detectedBudget
      );
    }

    let ranked = filtered.map((offer) =>
      calculateScore(
        offer,
        detectedBudget,
        preferences
      )
    );

    if (sort === "best") {
      ranked.sort((a, b) => b.score - a.score);
    }

    if (sort === "price") {
      ranked.sort((a, b) => a.price - b.price);
    }

    if (sort === "rating") {
      ranked.sort((a, b) => b.quality - a.quality);
    }

    return ranked;
  }, [
    detectedCategory,
    detectedBudget,
    preferences,
    sort,
  ]);

  useEffect(() => {
    if (searched) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [searched]);

  function search() {
    if (!query.trim()) return;

    setSort("best");
    setSearched(true);
  }

  function useSuggestion(text: string) {
    setQuery(text);
    setSort("best");
    setSearched(true);
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      {/* NAVBAR */}
      <nav className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1746a2] text-lg font-black text-white shadow-sm">
              C
            </div>

            <span className="text-xl font-bold tracking-tight">
              Compare<span className="text-[#2563eb]">X</span>
            </span>
          </div>

          <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a
              href="#compare"
              className="transition hover:text-slate-950"
            >
              Compare
            </a>

            <a
              href="#how-it-works"
              className="transition hover:text-slate-950"
            >
              How it works
            </a>

            <a
              href="#pro"
              className="transition hover:text-slate-950"
            >
              Pro
            </a>

            <button className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
              Sign in
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section
        id="compare"
        className="relative overflow-hidden border-b border-slate-200 bg-white"
      >
        <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-[800px] -translate-x-1/2 rounded-full bg-blue-100/40 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-6 pb-20 pt-20 text-center md:pt-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-[#1746a2]">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            Smarter comparisons
          </div>

          <h1 className="mx-auto max-w-4xl text-5xl font-black leading-[1.05] tracking-[-0.04em] text-slate-950 md:text-7xl">
            Tell us what you need.
            <br />
            <span className="text-[#2563eb]">
              We&apos;ll find what fits.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-500 md:text-xl">
            CompareX turns what you want into a simple comparison.
            Price, quality, location and more — all ranked for you.
          </p>

          {/* SEARCH */}
          <div className="mx-auto mt-12 max-w-4xl">
            <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
              <div className="flex flex-col gap-3 md:flex-row">
                <textarea
                  value={query}
                  onChange={(e) =>
                    setQuery(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey
                    ) {
                      e.preventDefault();
                      search();
                    }
                  }}
                  rows={3}
                  placeholder="e.g. Find me a student room in Vienna under €500..."
                  className="min-h-[96px] flex-1 resize-none rounded-2xl border-0 bg-slate-50 px-5 py-4 text-base text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100"
                />

                <button
                  onClick={search}
                  className="flex min-h-[96px] items-center justify-center rounded-2xl bg-[#1746a2] px-8 text-base font-bold text-white shadow-lg shadow-blue-900/15 transition hover:bg-[#123b89] active:scale-[0.98] md:w-44"
                >
                  Compare
                  <span className="ml-2 text-xl">
                    →
                  </span>
                </button>
              </div>
            </div>

            {/* SUGGESTIONS */}
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <span className="mr-1 py-2 text-sm text-slate-400">
                Try:
              </span>

              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() =>
                    useSuggestion(suggestion)
                  }
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#1746a2]"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="mx-auto max-w-7xl px-6 py-24"
      >
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-[#2563eb]">
            How it works
          </p>

          <h2 className="text-4xl font-black tracking-tight md:text-5xl">
            Comparison without the headache.
          </h2>

          <p className="mt-4 text-lg leading-8 text-slate-500">
            You tell us what matters. CompareX does the sorting.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 font-bold text-[#2563eb]">
              01
            </div>

            <h3 className="text-xl font-bold">
              Describe your needs
            </h3>

            <p className="mt-3 leading-7 text-slate-500">
              Write naturally. Budget, location, preferences
              and priorities can all be included in one sentence.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 font-bold text-[#2563eb]">
              02
            </div>

            <h3 className="text-xl font-bold">
              We compare
            </h3>

            <p className="mt-3 leading-7 text-slate-500">
              CompareX evaluates the options using the factors
              that matter instead of simply showing a list of prices.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 font-bold text-[#2563eb]">
              03
            </div>

            <h3 className="text-xl font-bold">
              Choose with confidence
            </h3>

            <p className="mt-3 leading-7 text-slate-500">
              See the strongest matches first, with a simple
              score and the information you need to decide.
            </p>
          </div>
        </div>
      </section>

      {/* RESULTS */}
      {searched && (
        <section
          ref={resultsRef}
          className="mx-auto max-w-7xl scroll-mt-8 px-6 pb-24"
        >
          <div className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#2563eb]">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                CompareX results
              </div>

              <h2 className="text-3xl font-black tracking-tight md:text-4xl">
                Best matches
              </h2>

              <p className="mt-2 text-slate-500">
                {results.length} options found
                {detectedCategory
                  ? ` in ${categoryLabels[detectedCategory]}`
                  : ""}
                {detectedBudget !== null
                  ? ` under €${detectedBudget}`
                  : ""}
              </p>
            </div>

            {/* SORT */}
            <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              <button
                onClick={() => setSort("best")}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  sort === "best"
                    ? "bg-slate-950 text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Best Match
              </button>

              <button
                onClick={() => setSort("price")}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  sort === "price"
                    ? "bg-slate-950 text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Lowest Price
              </button>

              <button
                onClick={() => setSort("rating")}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  sort === "rating"
                    ? "bg-slate-950 text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Highest Rated
              </button>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                ?
              </div>

              <h3 className="text-2xl font-bold">
                No exact matches found
              </h3>

              <p className="mx-auto mt-3 max-w-lg text-slate-500">
                Try increasing your budget or describing your
                needs differently.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((offer, index) => (
                <div
                  key={offer.name}
                  className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg md:p-7"
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                    {/* LEFT */}
                    <div className="flex min-w-0 flex-1 gap-5">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-xl font-bold text-[#1746a2]">
                        {categoryIcon(
                          offer.category
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          {index === 0 && (
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#2563eb]">
                              BEST MATCH
                            </span>
                          )}

                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                            {categoryLabels[
                              offer.category
                            ]}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-slate-950">
                          {offer.name}
                        </h3>

                        <p className="mt-2 max-w-2xl leading-7 text-slate-500">
                          {offer.description}
                        </p>

                        {/* TAGS */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          {offer.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* WHY THIS MATCHES */}
                        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                            Why this matches
                          </p>

                          <div className="flex flex-wrap gap-x-5 gap-y-2">
                            {offer.reasons.map(
                              (reason) => (
                                <div
                                  key={reason}
                                  className="flex items-center gap-2 text-sm font-medium text-slate-700"
                                >
                                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-xs font-black text-green-700">
                                    ✓
                                  </span>

                                  {reason}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="flex items-center justify-between gap-8 border-t border-slate-100 pt-5 lg:min-w-[310px] lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Price
                        </p>

                        <p className="mt-1 whitespace-nowrap text-3xl font-black tracking-tight text-slate-950">
                          {offer.priceLabel}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Starting price
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          CompareX Score
                        </p>

                        <p className="mt-1 text-3xl font-black text-[#2563eb]">
                          {offer.score}
                        </p>

                        <button className="mt-2 text-sm font-bold text-slate-700 transition group-hover:text-[#2563eb]">
                          View offer →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* PRO */}
      <section
        id="pro"
        className="mx-auto max-w-7xl px-6 pb-24"
      >
        <div className="overflow-hidden rounded-[2rem] bg-[#1746a2] px-7 py-12 text-white md:px-12 md:py-16">
          <div className="flex flex-col justify-between gap-10 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-blue-200">
                CompareX Pro
              </p>

              <h2 className="text-3xl font-black tracking-tight md:text-4xl">
                Compare more. Decide faster.
              </h2>

              <p className="mt-4 max-w-xl text-base leading-7 text-blue-100">
                Save comparisons, create custom priorities and
                get deeper recommendations with CompareX Pro.
              </p>
            </div>

            <button className="shrink-0 rounded-2xl bg-white px-7 py-4 font-bold text-[#1746a2] shadow-lg transition hover:bg-blue-50">
              Explore Pro →
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <div className="font-semibold text-slate-600">
            Compare<span className="text-[#2563eb]">X</span>
          </div>

          <p>Compare better. Choose better.</p>

          <p>© 2026 CompareX</p>
        </div>
      </footer>
    </main>
  );
}
