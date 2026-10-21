
"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
type TransportOffer = {
  id: string;
  country: string;
  city: string;
  name: string;
  provider: string;
  priceValue: number;
  pricePeriod: string;
  priceLabel: string;
  details: string;
  url: string;
};

type GymOffer = {
  id: string;
  country: string;
  city: string;
  name: string;
  provider: string;
  priceValue: number;
  pricePeriod: string;
  priceLabel: string;
  details: string;
  url: string;
};

type StreamingOffer = {
  id: string;
  country: string;
  name: string;
  provider: string;
  priceValue: number;
  pricePeriod: string;
  priceLabel: string;
  details: string;
  url: string;
};



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

const categories = [
  { id: "mobile", title: "Mobile plans", icon: "📱" },
  { id: "housing", title: "Housing", icon: "🏠" },
  { id: "transport", title: "Transport", icon: "🚆" },
  { id: "gym", title: "Fitness & Gyms", icon: "🏋️" },
  { id: "streaming", title: "Streaming", icon: "▶️" },
];


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

function detectCategory(query: string) {
  const q = query.toLowerCase();

  if (
    /mobile|phone|tariff|sim|spusu|yesss|telefonia|handy|smartphone/.test(q)
  ) return "mobile";

  if (
    /room|housing|rent|apartment|wohnung|zimmer|affitto|stanza|casa/.test(q)
  ) return "housing";

  if (
    /transport|train|bus|metro|tram|trasporto|treno|autobus/.test(q)
  ) return "transport";

  if (
    /gym|fitness|palestra|sport membership/.test(q)
  ) return "gym";

  if (
    /streaming|netflix|disney|spotify|subscription/.test(q)
  ) return "streaming";

  return null;
}

function getInitialBudget(query: string) {
  const match = query.match(
    /(?:under|below|max|maximum|less than|unter|bis zu|sotto(?: i| a)?|meno di)\s*€?\s*(\d+(?:[.,]\d+)?)/i,
  );

  return match ? match[1].replace(",", ".") : "";
}

function money(value: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function SearchResults() {
  const params = useSearchParams();
  const router = useRouter();

  const query = params.get("q") ?? "";
  const category = detectCategory(query);

  const [offers, setOffers] = useState<MobileOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [housingOffers, setHousingOffers] = useState<HousingOffer[]>([]);
  const [housingLoading, setHousingLoading] = useState(false);
  const [housingError, setHousingError] = useState(false);

const [transportOffers, setTransportOffers] = useState<TransportOffer[]>([]);
const [transportLoading, setTransportLoading] = useState(false);
const [transportError, setTransportError] = useState("");

useEffect(() => {
  if (category !== "transport") return;

  async function loadTransportOffers() {
    setTransportLoading(true);
    setTransportError("");

    try {
      const response = await fetch("/api/transport");

      if (!response.ok) {
        throw new Error("Could not load transport offers");
      }

      const data = await response.json();
      setTransportOffers(data.offers ?? []);
    } catch {
      setTransportError("Non è stato possibile caricare le offerte. Riprova.");
    } finally {
      setTransportLoading(false);
    }
  }

  loadTransportOffers();
}, [category]);

  const [country, setCountry] = useState<"All" | Country>("All");
  const [budget, setBudget] = useState(() => getInitialBudget(query));
  const [sort, setSort] = useState<"price-asc" | "price-desc" | "data">(
    "price-asc",
  );

  useEffect(() => {
    const navigation = performance.getEntriesByType(
      "navigation",
    ) as PerformanceNavigationTiming[];

    if (navigation[0]?.type === "reload") {
      router.replace("/");
    }
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    async function loadOffers() {
      try {
        setLoading(true);
        setLoadError(false);

        const response = await fetch("/api/offers", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Could not load offers");
        }

        const data = await response.json();

        if (!cancelled) {
          setOffers(data.offers ?? []);
        }
      } catch {
        if (!cancelled) {
          setLoadError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOffers();

    return () => {
      cancelled = true;
    };
  }, []);


  useEffect(() => {
    if (category !== "housing") return;

    let cancelled = false;

    async function loadHousing() {
      try {
        setHousingLoading(true);
        setHousingError(false);

        const response = await fetch("/api/housing", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Could not load housing listings");
        }

        const data = await response.json();

        if (!cancelled) {
          setHousingOffers(data.offers ?? []);
        }
      } catch {
        if (!cancelled) {
          setHousingError(true);
        }
      } finally {
        if (!cancelled) {
          setHousingLoading(false);
        }
      }
    }

    loadHousing();

    return () => {
      cancelled = true;
    };
  }, [category]);

  const filteredHousingOffers = useMemo(() => {
    let result = housingOffers.filter(
      (offer) => country === "All" || offer.country === country,
    );

    const maxPrice = Number(budget);

    if (budget.trim() !== "" && Number.isFinite(maxPrice)) {
      result = result.filter(
        (offer) =>
          offer.pricePeriod === "year" ||
          offer.priceValue <= maxPrice,
      );
    }

    return [...result].sort((a, b) => {
      if (a.pricePeriod !== b.pricePeriod) {
        return a.pricePeriod === "month" ? -1 : 1;
      }
      return a.priceValue - b.priceValue;
    });
  }, [housingOffers, country, budget]);

  const [gymOffers, setGymOffers] = useState<GymOffer[]>([]);
  const [gymLoading, setGymLoading] = useState(false);
  const [gymError, setGymError] = useState("");

  useEffect(() => {
    if (category !== "gym") return;

    async function loadGymOffers() {
      setGymLoading(true);
      setGymError("");

      try {
        const response = await fetch("/api/gyms");

        if (!response.ok) {
          throw new Error("Could not load gym offers");
        }

        const data = await response.json();
        setGymOffers(data.offers ?? []);
      } catch {
        setGymError("Non è stato possibile caricare le offerte delle palestre. Riprova.");
      } finally {
        setGymLoading(false);
      }
    }

    loadGymOffers();
  }, [category]);

  const [streamingOffers, setStreamingOffers] = useState<StreamingOffer[]>([]);
  const [streamingLoading, setStreamingLoading] = useState(false);
  const [streamingError, setStreamingError] = useState("");

  useEffect(() => {
    if (category !== "streaming") return;

    async function loadStreamingOffers() {
      setStreamingLoading(true);
      setStreamingError("");

      try {
        const response = await fetch("/api/streaming");

        if (!response.ok) {
          throw new Error("Could not load streaming offers");
        }

        const data = await response.json();
        setStreamingOffers(data.offers ?? []);
      } catch {
        setStreamingError("Non è stato possibile caricare le offerte Streaming. Riprova.");
      } finally {
        setStreamingLoading(false);
      }
    }

    loadStreamingOffers();
  }, [category]);

  const filteredStreamingOffers = useMemo(() => {
    const maxPrice = budget.trim() === "" ? Infinity : Number(budget);

    return streamingOffers.filter((offer) => {
      const matchesCountry =
        country === "All" || offer.country === country;
      const matchesBudget =
        !Number.isFinite(maxPrice) || offer.priceValue <= maxPrice;

      return matchesCountry && matchesBudget;
    });
  }, [streamingOffers, country, budget]);

  const filteredGymOffers = useMemo(() => {
    const maxPrice = budget.trim() === "" ? Infinity : Number(budget);

    return gymOffers.filter((offer) => {
      const matchesCountry =
        country === "All" || offer.country === country;
      const matchesBudget =
        !Number.isFinite(maxPrice) || offer.priceValue <= maxPrice;

      return matchesCountry && matchesBudget;
    });
  }, [gymOffers, country, budget]);

  const filteredTransportOffers = useMemo(() => {
    const maxPrice = budget.trim() === "" ? Infinity : Number(budget);

    return transportOffers.filter((offer) => {
      const matchesCountry =
        country === "All" || offer.country === country;
      const matchesBudget =
        !Number.isFinite(maxPrice) || offer.priceValue <= maxPrice;

      return matchesCountry && matchesBudget;
    });
  }, [transportOffers, country, budget]);

  const filteredOffers = useMemo(() => {
    let result = offers.filter(
      (offer) => country === "All" || offer.country === country,
    );

    const maxPrice = Number(budget);

    if (budget.trim() !== "" && Number.isFinite(maxPrice)) {
      result = result.filter((offer) => offer.monthlyPrice <= maxPrice);
    }

    result = [...result].sort((a, b) => {
      if (sort === "price-desc") {
        return b.monthlyPrice - a.monthlyPrice;
      }

      if (sort === "data") {
        return b.dataGB - a.dataGB;
      }

      return a.monthlyPrice - b.monthlyPrice;
    });

    return result;
  }, [offers, country, budget, sort]);

  const selectedCategory = categories.find(
    (item) => item.id === category,
  );

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#17233c]">
      <header className="border-b border-[#e8e6e0] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-3"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#203b72] text-lg font-bold text-white">
              C
            </span>
            <span className="text-xl font-bold">CompareX</span>
          </button>

          <button
            onClick={() => router.push("/")}
            className="rounded-xl border border-[#e8e6e0] px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            ← Home
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <p className="text-sm font-semibold uppercase tracking-wider text-[#203b72]">
          CompareX · Search results
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
          {selectedCategory?.title ?? "Explore services"}
        </h1>

        <p className="mt-3 break-words text-slate-600">
          Your search: “{query}”
        </p>

                {category === "streaming" ? (
          <>
            <div className="mt-8 grid gap-4 rounded-2xl border border-[#e8e6e0] bg-white p-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Country</span>
                <select
                  value={country}
                  onChange={(event) =>
                    setCountry(event.target.value as "All" | Country)
                  }
                  className="w-full rounded-xl border border-[#e8e6e0] bg-white px-4 py-3"
                >
                  <option value="All">Austria and Italy</option>
                  <option value="Austria">Austria</option>
                  <option value="Italy">Italy</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  Maximum monthly price (€)
                </span>
                <input
                  type="number"
                  min="0"
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                  placeholder="No price limit"
                  className="w-full rounded-xl border border-[#e8e6e0] px-4 py-3"
                />
              </label>
            </div>

            <h2 className="mt-7 text-xl font-bold">
              {filteredStreamingOffers.length} streaming plans
            </h2>

            {streamingLoading && (
              <p className="mt-5 text-slate-600">Loading streaming plans…</p>
            )}

            {streamingError && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
                {streamingError}
              </div>
            )}

            {!streamingLoading && !streamingError &&
              filteredStreamingOffers.length === 0 && (
                <div className="mt-5 rounded-2xl border border-[#e8e6e0] bg-white p-6">
                  No streaming plans match these filters. Try another country or budget.
                </div>
              )}

            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredStreamingOffers.map((offer) => (
                <article
                  key={offer.id}
                  className="flex flex-col rounded-2xl border border-[#e8e6e0] bg-white p-6 shadow-sm"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {offer.country}
                  </span>

                  <h2 className="mt-2 text-xl font-bold">{offer.name}</h2>
                  <p className="mt-1 text-sm text-slate-600">{offer.provider}</p>

                  <div className="mt-5 text-2xl font-bold text-[#203b72]">
                    {offer.priceLabel}
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {offer.details}
                  </p>

                  <div className="mt-auto pt-6">
                    <a
                      href={offer.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-xl bg-[#203b72] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-[#172d58]"
                    >
                      View official details ↗
                    </a>
                  </div>
                </article>
              ))}
            </div>

            <p className="mt-8 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-slate-700">
              Prices and plan features may change by country. Check the official
              provider website before subscribing. Displayed prices are not
              live offers.
            </p>
          </>
        ) : category === "gym" ? (          <>
            <div className="mt-8 grid gap-4 rounded-2xl border border-[#e8e6e0] bg-white p-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Country</span>
                <select
                  value={country}
                  onChange={(event) =>
                    setCountry(event.target.value as "All" | Country)
                  }
                  className="w-full rounded-xl border border-[#e8e6e0] bg-white px-4 py-3"
                >
                  <option value="All">Austria and Italy</option>
                  <option value="Austria">Austria</option>
                  <option value="Italy">Italy</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  Maximum listed price (€ per month)
                </span>
                <input
                  type="number"
                  min="0"
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                  placeholder="No price limit"
                  className="w-full rounded-xl border border-[#e8e6e0] px-4 py-3"
                />
              </label>
            </div>

            <h2 className="mt-7 text-xl font-bold">
              {filteredGymOffers.length} gym offers
            </h2>

            {gymLoading && (
              <p className="mt-5 text-slate-600">Loading gym offers…</p>
            )}

            {gymError && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
                {gymError}
              </div>
            )}

            {!gymLoading && !gymError &&
              filteredGymOffers.length === 0 && (
                <div className="mt-5 rounded-2xl border border-[#e8e6e0] bg-white p-6">
                  No gym offers match these filters. Try another country or budget.
                </div>
              )}

            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredGymOffers.map((offer) => (
                <article
                  key={offer.id}
                  className="flex flex-col rounded-2xl border border-[#e8e6e0] bg-white p-6 shadow-sm"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {offer.country} · {offer.city}
                  </span>

                  <h2 className="mt-2 text-xl font-bold">{offer.name}</h2>
                  <p className="mt-1 text-sm text-slate-600">{offer.provider}</p>

                  <div className="mt-5 text-2xl font-bold text-[#203b72]">
                    {offer.priceLabel}
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {offer.details}
                  </p>

                  <div className="mt-auto pt-6">
                    <a
                      href={offer.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-xl bg-[#203b72] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-[#172d58]"
                    >
                      View official details ↗
                    </a>
                  </div>
                </article>
              ))}
            </div>

            <p className="mt-8 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-slate-700">
              Prices, promotions, joining fees and contract conditions can vary
              by studio. Check the official provider website before signing up.
              The displayed offers are not live availability data.
            </p>
          </>
        ) : category === "transport" ? (          <>
            <div className="mt-8 grid gap-4 rounded-2xl border border-[#e8e6e0] bg-white p-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  Country
                </span>
                <select
                  value={country}
                  onChange={(event) =>
                    setCountry(event.target.value as "All" | Country)
                  }
                  className="w-full rounded-xl border border-[#e8e6e0] bg-white px-4 py-3"
                >
                  <option value="All">Austria and Italy</option>
                  <option value="Austria">Austria</option>
                  <option value="Italy">Italy</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  Maximum listed price (€)
                </span>
                <input
                  type="number"
                  min="0"
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                  placeholder="No price limit"
                  className="w-full rounded-xl border border-[#e8e6e0] px-4 py-3"
                />
                <span className="mt-1 block text-xs text-slate-500">
                  Monthly and annual tickets are compared by their listed price.
                </span>
              </label>
            </div>

            <h2 className="mt-7 text-xl font-bold">
              {filteredTransportOffers.length} transport offers
            </h2>

            {transportLoading && (
              <p className="mt-5 text-slate-600">Loading transport offers…</p>
            )}

            {transportError && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
                {transportError}
              </div>
            )}

            {!transportLoading && !transportError &&
              filteredTransportOffers.length === 0 && (
                <div className="mt-5 rounded-2xl border border-[#e8e6e0] bg-white p-6">
                  No transport offers match these filters. Try another country or price limit.
                </div>
              )}

            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredTransportOffers.map((offer) => (
                <article
                  key={offer.id}
                  className="flex flex-col rounded-2xl border border-[#e8e6e0] bg-white p-6 shadow-sm"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {offer.country} · {offer.city}
                  </span>

                  <h2 className="mt-2 text-xl font-bold">{offer.name}</h2>
                  <p className="mt-1 text-sm text-slate-600">{offer.provider}</p>

                  <div className="mt-5 text-2xl font-bold text-[#203b72]">
                    {offer.priceLabel}
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {offer.details}
                  </p>

                  <div className="mt-auto pt-6">
                    <a
                      href={offer.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-xl bg-[#203b72] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-[#172d58]"
                    >
                      View official details ↗
                    </a>
                  </div>
                </article>
              ))}
            </div>

            <p className="mt-8 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-slate-700">
              Prices and eligibility may change. Monthly and annual ticket
              prices are not directly comparable. Confirm the current fare,
              age requirements, validity area and conditions on the official
              provider website before purchasing.
            </p>
          </>
        ) : category === "housing" ? (
          <>
            <div className="mt-8 grid gap-4 rounded-2xl border border-[#e8e6e0] bg-white p-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  Country
                </span>
                <select
                  value={country}
                  onChange={(event) =>
                    setCountry(event.target.value as "All" | Country)
                  }
                  className="w-full rounded-xl border border-[#e8e6e0] bg-white px-4 py-3"
                >
                  <option value="All">Austria and Italy</option>
                  <option value="Austria">Austria</option>
                  <option value="Italy">Italy</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  Maximum monthly price (€)
                </span>
                <input
                  type="number"
                  min="0"
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                  placeholder="No budget limit"
                  className="w-full rounded-xl border border-[#e8e6e0] px-4 py-3"
                />
                <span className="mt-1 block text-xs text-slate-500">
                  Listings priced annually remain visible because their fees
                  are not directly comparable with monthly rent.
                </span>
              </label>
            </div>

            <h2 className="mt-7 text-xl font-bold">
              {filteredHousingOffers.length} housing listings
            </h2>

            {housingLoading && (
              <p className="mt-5 text-slate-600">Loading housing listings…</p>
            )}

            {housingError && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
                Housing listings could not be loaded. Check the development server and try again.
              </div>
            )}

            {!housingLoading && !housingError &&
              filteredHousingOffers.length === 0 && (
                <div className="mt-5 rounded-2xl border border-[#e8e6e0] bg-white p-6">
                  No listings match these filters. Try another country or budget.
                </div>
              )}

            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredHousingOffers.map((offer) => (
                <article
                  key={offer.id}
                  className="flex flex-col rounded-2xl border border-[#e8e6e0] bg-white p-6 shadow-sm"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {offer.country} · {offer.city}
                  </span>

                  <h2 className="mt-2 text-xl font-bold">{offer.property}</h2>
                  <p className="mt-1 text-sm text-slate-600">{offer.provider}</p>

                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {offer.roomType}
                  </p>

                  <div className="mt-5 text-2xl font-bold text-[#203b72]">
                    {offer.priceLabel}
                  </div>

                  <div className="mt-3 rounded-xl bg-amber-50 p-3 text-sm font-medium text-amber-900">
                    {offer.availability}
                  </div>

                  <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-5 text-slate-600">
                    {offer.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-6">
                    <a
                      href={offer.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-xl bg-[#203b72] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-[#172d58]"
                    >
                      View official details ↗
                    </a>
                    <p className="mt-3 text-xs text-slate-500">
                      Information checked: {offer.lastVerified}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <p className="mt-8 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-slate-700">
              Listings come from official provider or university pages. Prices,
              eligibility and availability differ by property and may change.
              Check the original page before applying. A published price does
              not mean a room is currently available.
            </p>
          </>
        ) : category === "mobile" ? (
          <>
            <div className="mt-8 grid gap-4 rounded-2xl border border-[#e8e6e0] bg-white p-5 md:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  Country
                </span>
                <select
                  value={country}
                  onChange={(event) =>
                    setCountry(event.target.value as "All" | Country)
                  }
                  className="w-full rounded-xl border border-[#e8e6e0] bg-white px-4 py-3"
                >
                  <option value="All">Austria and Italy</option>
                  <option value="Austria">Austria</option>
                  <option value="Italy">Italy</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  Maximum monthly price (€)
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                  placeholder="No budget limit"
                  className="w-full rounded-xl border border-[#e8e6e0] px-4 py-3"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  Sort offers
                </span>
                <select
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value as "price-asc" | "price-desc" | "data")
                  }
                  className="w-full rounded-xl border border-[#e8e6e0] bg-white px-4 py-3"
                >
                  <option value="price-asc">Lowest price first</option>
                  <option value="price-desc">Highest price first</option>
                  <option value="data">Most data first</option>
                </select>
              </label>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold">
                {filteredOffers.length} matching offers
              </h2>
              <span className="text-sm text-slate-500">
                Monthly prices · {country === "All" ? "Austria and Italy" : country}
              </span>
            </div>

            {loading && (
              <p className="mt-6 text-slate-600">Loading verified offers…</p>
            )}

            {loadError && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
                Offers could not be loaded. Check that the development server is running and try again.
              </div>
            )}

            {!loading && !loadError && filteredOffers.length === 0 && (
              <div className="mt-6 rounded-2xl border border-[#e8e6e0] bg-white p-6">
                No offers match these filters. Try another country or a higher budget.
              </div>
            )}

            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredOffers.map((offer) => (
                <article
                  key={offer.id}
                  className="flex flex-col rounded-2xl border border-[#e8e6e0] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {offer.country}
                      </span>
                      <h3 className="mt-2 text-xl font-bold">
                        {offer.provider}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {offer.plan}
                      </p>
                    </div>
                    <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#203b72]">
                      {offer.dataGB} GB
                    </span>
                  </div>

                  <div className="mt-6">
                    <span className="text-3xl font-bold tracking-tight">
                      {money(offer.monthlyPrice)}
                    </span>
                    <span className="text-sm text-slate-500"> / month</span>
                  </div>

                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between gap-3 border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Data</span>
                      <strong>{offer.dataGB} GB/month</strong>
                    </div>

                    <div className="flex justify-between gap-3 border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Speed</span>
                      <strong className="text-right">
                        {offer.maxSpeed ?? "Check provider"}
                      </strong>
                    </div>

                    <div className="flex justify-between gap-3 border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Calls / SMS</span>
                      <strong className="max-w-[60%] text-right">
                        {offer.callsSms}
                      </strong>
                    </div>

                    <div className="flex justify-between gap-3 border-b border-slate-100 pb-2">
                      <span className="text-slate-500">EU roaming data</span>
                      <strong>
                        {offer.euRoamingGB === null
                          ? "Check provider"
                          : `${offer.euRoamingGB} GB`}
                      </strong>
                    </div>

                    <div className="flex justify-between gap-3 border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Activation</span>
                      <strong>
                        {offer.activationFee === null
                          ? "Check provider"
                          : offer.activationFee === 0
                            ? "Free"
                            : `${money(offer.activationFee)} once`}
                      </strong>
                    </div>

                    <div className="pt-1">
                      <span className="text-slate-500">Contract</span>
                      <p className="mt-1 leading-5">{offer.contract}</p>
                    </div>
                  </div>

                  <div className="mt-auto pt-6">
                    <a
                      href={offer.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-xl bg-[#203b72] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-[#172d58]"
                    >
                      Check official offer ↗
                    </a>
                    <p className="mt-3 text-xs text-slate-500">
                      Price checked: {offer.lastVerified}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <p className="mt-8 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-slate-700">
              Prices and plan details were checked against official provider information on the date shown. They may change. Verify the complete terms with the provider before ordering. Some providers do not publish all details in the same place.
            </p>
          </>
        ) : (
          <div className="mt-8 rounded-2xl border border-[#e8e6e0] bg-white p-6 md:p-8">
            <h2 className="text-xl font-bold">
              {selectedCategory?.icon ?? "🔎"}{" "}
              {selectedCategory?.title ?? "Choose a service"}
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              This category is part of the CompareX roadmap. We will add verified offers and useful filters category by category. No prices are displayed until they can be checked against reliable provider information.
            </p>

            <button
              onClick={() => router.push("/")}
              className="mt-6 rounded-xl bg-[#203b72] px-5 py-3 font-semibold text-white hover:bg-[#172d58]"
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
        <main className="min-h-screen bg-[#faf9f6] p-10">
          Loading CompareX…
        </main>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
