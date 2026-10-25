"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Country = "Austria" | "Italy";

type MobileOffer = {
  id: string;
  country: Country;
  provider: string;
  plan: string;
  monthlyPrice: number;
  dataGB: number;
  maxSpeed: string | null;
  callsSms: string;
  euRoamingGB: number | null;
  activationFee: number | null;
  contract: string;
  officialUrl: string;
  lastVerified: string;
};

type HousingOffer = {
  id: string;
  country: Country;
  provider: string;
  property: string;
  city: string;
  roomType: string;
  priceValue: number;
  pricePeriod: "month" | "year";
  priceLabel: string;
  availability: string;
  details: string[];
  officialUrl: string;
  lastVerified: string;
};

type GenericOffer = {
  id: string;
  country: string;
  city?: string;
  name: string;
  provider: string;
  priceValue: number;
  pricePeriod: string;
  priceLabel: string;
  details: string;
  url: string;
};

const categories = [
  { id: "mobile", title: "Mobile plans", icon: "📱" },
  { id: "housing", title: "Housing", icon: "🏠" },
  { id: "transport", title: "Transport", icon: "🚆" },
  { id: "gym", title: "Fitness & Gyms", icon: "🏋️" },
  { id: "streaming", title: "Streaming", icon: "▶️" },
];

function detectCategory(query: string) {
  const q = query.toLowerCase();
  if (/mobile|phone|tariff|sim|spusu|yesss|telefonia|handy|smartphone/.test(q))
    return "mobile";
  if (/room|housing|rent|apartment|wohnung|zimmer|affitto|stanza|casa/.test(q))
    return "housing";
  if (/transport|train|bus|metro|tram|trasporto|treno|autobus/.test(q))
    return "transport";
  if (/gym|fitness|palestra|sport membership/.test(q)) return "gym";
  if (/streaming|netflix|disney|spotify|subscription/.test(q)) return "streaming";
  return null;
}

function detectCountry(query: string): "All" | Country {
  const q = query.toLowerCase();
  // A named destination should select its country automatically.
  if (/\\b(italy|italia|milan|milano|rome|roma|turin|torino|bologna|florence|firenze|venice|venezia|naples|napoli|verona)\\b/.test(q)) return "Italy";
  if (/\\b(austria|österreich|osterreich|vienna|wien|graz|linz|salzburg|innsbruck|sankt pölten|st pölten)\\b/.test(q)) return "Austria";
  return "All";
}

function getInitialBudget(query: string) {
  const match = query.match(
    /(?:under|below|max|maximum|less than|unter|bis zu|sotto(?: i| a)?|meno di)\s*€?\s*(\d+(?:[.,]\d+)?)/i,
  );
  return match ? match[1].replace(",", ".") : "";
}

function Filters({
  country,
  setCountry,
  budget,
  setBudget,
  budgetLabel,
  sort,
  setSort,
  showSort,
}: {
  country: "All" | Country;
  setCountry: (v: "All" | Country) => void;
  budget: string;
  setBudget: (v: string) => void;
  budgetLabel: string;
  sort?: string;
  setSort?: (v: "price-asc" | "price-desc" | "data") => void;
  showSort?: boolean;
}) {
  return (
    <div className="mt-8 grid gap-4 rounded-2xl border border-[#e8e6e0] bg-white p-5 shadow-sm md:grid-cols-2 lg:grid-cols-3">
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Country</span>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value as "All" | Country)}
          className="w-full rounded-xl border border-[#e8e6e0] bg-white px-4 py-3 transition focus:border-[#3b82f6]"
        >
          <option value="All">Austria and Italy</option>
          <option value="Austria">Austria</option>
          <option value="Italy">Italy</option>
        </select>
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">{budgetLabel}</span>
        <input
          type="number"
          min="0"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="No price limit"
          className="w-full rounded-xl border border-[#e8e6e0] bg-white px-4 py-3 transition focus:border-[#3b82f6]"
        />
      </label>
      {showSort && setSort && (
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Sort by</span>
          <select
            value={sort}
            onChange={(e) =>
              setSort(e.target.value as "price-asc" | "price-desc" | "data")
            }
            className="w-full rounded-xl border border-[#e8e6e0] bg-white px-4 py-3 transition focus:border-[#3b82f6]"
          >
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="data">Data allowance</option>
          </select>
        </label>
      )}
    </div>
  );
}

function OfferCard({
  badge,
  title,
  subtitle,
  price,
  body,
  href,
}: {
  badge: string;
  title: string;
  subtitle: string;
  price: string;
  body: ReactNode;
  href: string;
}) {
  return (
    <article className="card-hover flex flex-col rounded-2xl border border-[#e8e6e0] bg-white p-6 shadow-sm">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {badge}
      </span>
      <h2 className="mt-2 text-xl font-bold">{title}</h2>
      <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
      <div className="mt-5 text-2xl font-bold text-[#1e3a6e]">{price}</div>
      <div className="mt-3 text-sm leading-6 text-slate-600">{body}</div>
      <div className="mt-auto pt-6">
        <a
          href="/#package-builder"
          className="block rounded-xl bg-[#1e3a6e] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-[#152a52]"
        >
          Build a package inside CompareX →
        </a>
      </div>
    </article>
  );
}

function SearchResults() {
  const params = useSearchParams();
  const router = useRouter();
  const query = params.get("q") ?? "";
  const category = detectCategory(query);

  const [country, setCountry] = useState<"All" | Country>(() => detectCountry(query));
  const [budget, setBudget] = useState(() => getInitialBudget(query));
  const [sort, setSort] = useState<"price-asc" | "price-desc" | "data">(
    "price-asc",
  );

  const [offers, setOffers] = useState<MobileOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [housingOffers, setHousingOffers] = useState<HousingOffer[]>([]);
  const [housingLoading, setHousingLoading] = useState(false);
  const [housingError, setHousingError] = useState(false);

  const [genericOffers, setGenericOffers] = useState<GenericOffer[]>([]);
  const [genericLoading, setGenericLoading] = useState(false);
  const [genericError, setGenericError] = useState("");

  useEffect(() => {
    const navigation = performance.getEntriesByType(
      "navigation",
    ) as PerformanceNavigationTiming[];
    if (navigation[0]?.type === "reload") router.replace("/");
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setLoadError(false);
        const res = await fetch("/api/offers", { cache: "no-store" });
        if (!res.ok) throw new Error("fail");
        const data = await res.json();
        if (!cancelled) setOffers(data.offers ?? []);
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (category !== "housing") return;
    let cancelled = false;
    async function load() {
      try {
        setHousingLoading(true);
        setHousingError(false);
        const res = await fetch("/api/housing", { cache: "no-store" });
        if (!res.ok) throw new Error("fail");
        const data = await res.json();
        if (!cancelled) setHousingOffers(data.offers ?? []);
      } catch {
        if (!cancelled) setHousingError(true);
      } finally {
        if (!cancelled) setHousingLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [category]);

  useEffect(() => {
    if (!category || category === "mobile" || category === "housing") return;
    const endpoint =
      category === "transport"
        ? "/api/transport"
        : category === "gym"
          ? "/api/gyms"
          : "/api/streaming";
    let cancelled = false;
    async function load() {
      try {
        setGenericLoading(true);
        setGenericError("");
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error("fail");
        const data = await res.json();
        if (!cancelled) setGenericOffers(data.offers ?? []);
      } catch {
        if (!cancelled)
          setGenericError("Could not load offers. Please try again.");
      } finally {
        if (!cancelled) setGenericLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [category]);

  const filteredMobile = useMemo(() => {
    let result = offers.filter(
      (o) => country === "All" || o.country === country,
    );
    const max = Number(budget);
    if (budget.trim() !== "" && Number.isFinite(max)) {
      result = result.filter((o) => o.monthlyPrice <= max);
    }
    return [...result].sort((a, b) => {
      if (sort === "price-desc") return b.monthlyPrice - a.monthlyPrice;
      if (sort === "data") return b.dataGB - a.dataGB;
      return a.monthlyPrice - b.monthlyPrice;
    });
  }, [offers, country, budget, sort]);

  const filteredHousing = useMemo(() => {
    let result = housingOffers.filter(
      (o) => country === "All" || o.country === country,
    );
    const max = Number(budget);
    if (budget.trim() !== "" && Number.isFinite(max)) {
      result = result.filter(
        (o) => o.pricePeriod === "year" || o.priceValue <= max,
      );
    }
    return [...result].sort((a, b) => {
      if (a.pricePeriod !== b.pricePeriod)
        return a.pricePeriod === "month" ? -1 : 1;
      return a.priceValue - b.priceValue;
    });
  }, [housingOffers, country, budget]);

  const filteredGeneric = useMemo(() => {
    const max = budget.trim() === "" ? Infinity : Number(budget);
    return genericOffers.filter((o) => {
      const matchCountry = country === "All" || o.country === country;
      const matchBudget = !Number.isFinite(max) || o.priceValue <= max;
      return matchCountry && matchBudget;
    });
  }, [genericOffers, country, budget]);

  const selected = categories.find((c) => c.id === category);

  return (
    <main className="min-h-screen bg-[#f7f6f2] text-[#0f1a2e]">
      <header className="sticky top-0 z-40 border-b border-[#e8e6e0]/80 header-glass">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-3"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1e3a6e] text-lg font-bold text-white shadow-sm">
              C
            </span>
            <span className="text-xl font-bold">CompareX</span>
          </button>
          <button
            onClick={() => router.push("/")}
            className="rounded-xl border border-[#e8e6e0] bg-white px-4 py-2 text-sm font-semibold shadow-sm transition hover:border-[#1e3a6e] hover:bg-slate-50"
          >
            ← Home
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <p className="text-sm font-semibold uppercase tracking-wider text-[#1e3a6e]">
          CompareX · Search results
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
          {selected?.title ?? "Explore services"}
        </h1>
        <p className="mt-3 break-words text-slate-600">
          Your search: “{query}”
        </p>

        {category === "mobile" && (
          <>
            <Filters
              country={country}
              setCountry={setCountry}
              budget={budget}
              setBudget={setBudget}
              budgetLabel="Maximum monthly price (€)"
              sort={sort}
              setSort={setSort}
              showSort
            />
            <h2 className="mt-7 text-xl font-bold">
              {filteredMobile.length} mobile plans
            </h2>
            {loading && (
              <p className="mt-5 text-slate-600">Loading mobile plans…</p>
            )}
            {loadError && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
                Could not load mobile plans. Please try again.
              </div>
            )}
            {!loading && !loadError && filteredMobile.length === 0 && (
              <div className="mt-5 rounded-2xl border border-[#e8e6e0] bg-white p-6">
                No mobile plans match these filters. Try another country or
                budget.
              </div>
            )}
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredMobile.map((o) => (
                <OfferCard
                  key={o.id}
                  badge={o.country}
                  title={o.plan}
                  subtitle={o.provider}
                  price={`€${o.monthlyPrice}/month`}
                  href={o.officialUrl}
                  body={
                    <ul className="space-y-1">
                      <li>{o.dataGB} GB data</li>
                      {o.maxSpeed && <li>Max speed: {o.maxSpeed}</li>}
                      <li>{o.callsSms}</li>
                      {o.euRoamingGB != null && (
                        <li>EU roaming: {o.euRoamingGB} GB</li>
                      )}
                      <li>{o.contract}</li>
                    </ul>
                  }
                />
              ))}
            </div>
            <p className="mt-8 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-slate-700">
              Prices and plan details may change. Always verify on the official
              provider website before subscribing.
            </p>
          </>
        )}

        {category === "housing" && (
          <>
            <Filters
              country={country}
              setCountry={setCountry}
              budget={budget}
              setBudget={setBudget}
              budgetLabel="Maximum monthly price (€)"
            />
            <h2 className="mt-7 text-xl font-bold">
              {filteredHousing.length} housing listings
            </h2>
            {housingLoading && (
              <p className="mt-5 text-slate-600">Loading housing…</p>
            )}
            {housingError && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
                Could not load housing listings. Please try again.
              </div>
            )}
            {!housingLoading &&
              !housingError &&
              filteredHousing.length === 0 && (
                <div className="mt-5 rounded-2xl border border-[#e8e6e0] bg-white p-6">
                  No housing listings match these filters.
                </div>
              )}
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredHousing.map((o) => (
                <OfferCard
                  key={o.id}
                  badge={`${o.country} · ${o.city}`}
                  title={o.property}
                  subtitle={o.provider}
                  price={o.priceLabel}
                  href={o.officialUrl}
                  body={
                    <>
                      <p className="mb-2">{o.roomType}</p>
                      <p className="mb-2 rounded-lg bg-amber-50 px-2 py-1 text-amber-900">
                        {o.availability}
                      </p>
                      <ul className="space-y-1">
                        {o.details.map((d) => (
                          <li key={d}>• {d}</li>
                        ))}
                      </ul>
                    </>
                  }
                />
              ))}
            </div>
            <p className="mt-8 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-slate-700">
              Listings priced annually remain visible because fees are not
              directly comparable with monthly rent. Always check current
              availability on the official site.
            </p>
          </>
        )}

        {(category === "transport" ||
          category === "gym" ||
          category === "streaming") && (
          <>
            <Filters
              country={country}
              setCountry={setCountry}
              budget={budget}
              setBudget={setBudget}
              budgetLabel="Maximum monthly price (€)"
            />
            <h2 className="mt-7 text-xl font-bold">
              {filteredGeneric.length}{" "}
              {category === "gym"
                ? "gym offers"
                : category === "transport"
                  ? "transport options"
                  : "streaming plans"}
            </h2>
            {genericLoading && (
              <p className="mt-5 text-slate-600">Loading offers…</p>
            )}
            {genericError && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
                {genericError}
              </div>
            )}
            {!genericLoading &&
              !genericError &&
              filteredGeneric.length === 0 && (
                <div className="mt-5 rounded-2xl border border-[#e8e6e0] bg-white p-6">
                  No offers match these filters. Try another country or budget.
                </div>
              )}
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredGeneric.map((o) => (
                <OfferCard
                  key={o.id}
                  badge={
                    o.city ? `${o.country} · ${o.city}` : o.country
                  }
                  title={o.name}
                  subtitle={o.provider}
                  price={o.priceLabel}
                  href={o.url}
                  body={<p>{o.details}</p>}
                />
              ))}
            </div>
            <p className="mt-8 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-slate-700">
              Prices and features may change. Check the official provider
              website before subscribing. Displayed prices are not live feeds.
            </p>
          </>
        )}

        {!category && (
          <div className="mt-8 rounded-2xl border border-[#e8e6e0] bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold">Choose a category to explore</h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              Try searching for housing, mobile plans, transport, gyms or
              streaming to see comparable offers.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() =>
                    router.push(
                      `/search?q=${encodeURIComponent(c.title.toLowerCase())}`,
                    )
                  }
                  className="rounded-xl border border-[#e8e6e0] bg-white px-4 py-3 text-sm font-semibold shadow-sm transition hover:border-[#1e3a6e] hover:bg-slate-50"
                >
                  {c.icon} {c.title}
                </button>
              ))}
            </div>
            <button
              onClick={() => router.push("/")}
              className="mt-6 rounded-xl bg-[#1e3a6e] px-5 py-3 font-semibold text-white hover:bg-[#152a52]"
            >
              Back to homepage
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f7f6f2] p-10">
          Loading CompareX…
        </main>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
