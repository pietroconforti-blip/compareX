"use client";

import { Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Country = "Austria" | "Italy";

type MobileOffer = { id: string; country: Country; provider: string; plan: string; monthlyPrice: number; dataGB: number; maxSpeed: string | null; callsSms: string; euRoamingGB: number | null; activationFee: number | null; contract: string; officialUrl: string; lastVerified: string; };
type HousingOffer = { id: string; country: Country; provider: string; property: string; city: string; roomType: string; priceValue: number; pricePeriod: "month" | "year"; priceLabel: string; availability: string; details: string[]; officialUrl: string; lastVerified: string; images?: string[]; imageSourceLabel?: string; };
type GenericOffer = { id: string; country: string; city?: string; name: string; provider: string; priceValue: number; pricePeriod: string; priceLabel: string; details: string; url: string; };

const categories = [
  { id: "mobile", title: "Mobile plans", icon: "📱" },
  { id: "housing", title: "Housing", icon: "🏠" },
  { id: "transport", title: "Transport", icon: "🚆" },
  { id: "gym", title: "Fitness & Gyms", icon: "🏋️" },
  { id: "streaming", title: "Streaming", icon: "▶️" },
];

function detectCategory(query: string) {
  const q = query.toLowerCase();
  if (/mobile|phone|tariff|sim|spusu|yesss|a1|telefonia|handy|smartphone/.test(q)) return "mobile";
  if (/room|housing|rent|apartment|wohnung|zimmer|affitto|stanza|casa|home4students|stuwo|student residence|student dorm/.test(q)) return "housing";
  if (/transport|train|bus|metro|tram|trasporto|treno|autobus|wiener linien/.test(q)) return "transport";
  if (/gym|fitness|palestra|sport membership|fitinn/.test(q)) return "gym";
  if (/streaming|netflix|disney|spotify|subscription/.test(q)) return "streaming";
  return null;
}

function detectCountry(query: string): "All" | Country {
  const q = query.toLowerCase();
  if (["italy","italia","milan","milano","rome","roma","turin","torino","bologna","florence","firenze","venice","venezia","naples","napoli","verona"].some((city) => q.includes(city))) return "Italy";
  if (["austria","österreich","osterreich","vienna","wien","graz","linz","salzburg","innsbruck","sankt pölten","st pölten"].some((city) => q.includes(city))) return "Austria";
  return "All";
}

function getInitialBudget(query: string) {
  const match = query.match(/(?:under|below|max|maximum|less than|unter|bis zu|sotto(?: i| a)?|meno di)\s*€?\s*(\d+(?:[.,]\d+)?)/i);
  return match ? match[1].replace(",", ".") : "";
}

function Filters({ country, setCountry, budget, setBudget, budgetLabel, sort, setSort, showSort }: { country: "All" | Country; setCountry: (v: "All" | Country) => void; budget: string; setBudget: (v: string) => void; budgetLabel: string; sort?: string; setSort?: (v: "price-asc" | "price-desc" | "data") => void; showSort?: boolean; }) {
  return (
    <div className="mt-8 grid gap-4 rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm md:grid-cols-2 lg:grid-cols-3">
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">{budgetLabel}</span>
        <input type="number" min="0" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="No price limit" className="w-full rounded-xl border border-[#e2e8f0] bg-white px-4 py-3 transition focus:border-[#203b72]" />
      </label>
      {showSort && setSort && (
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">Sort by</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as "price-asc" | "price-desc" | "data")} className="w-full rounded-xl border border-[#e2e8f0] bg-white px-4 py-3 transition focus:border-[#203b72]">
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="data">Data allowance</option>
          </select>
        </label>
      )}
    </div>
  );
}

function OfferCard({ badge, title, subtitle, price, body, href, images = [], category = "", offerId = "" }: { badge: string; title: string; subtitle: string; price: string; body: ReactNode; href: string; images?: string[]; category?: string; offerId?: string; }) {
  const brand = subtitle.split(/\s+/).slice(0, 2).join(" ");
  return (
    <article className="card-hover flex flex-col overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-sm transition hover:shadow-lg">
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1">
          {images.slice(0, 3).map((src, index) => (
            <img key={src} src={src} alt={`${title} photo ${index + 1}`} className={`h-28 w-full object-cover ${index === 0 ? "col-span-2 row-span-2 h-[232px] rounded-l-xl" : "rounded-r-xl"}`} />
          ))}
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{badge}</span>
          <span className="inline-flex max-w-[48%] items-center rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-xs font-extrabold text-[#203b72]" title={`Provider: ${subtitle}`}>{brand}</span>
        </div>
        <h2 className="mt-3 text-xl font-bold">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        <div className="mt-4 text-2xl font-bold text-[#203b72]">{price}</div>
        <div className="mt-3 text-sm leading-6 text-slate-600">{body}</div>
        <div className="mt-auto pt-5">
          <a href={`/offer?title=${encodeURIComponent(title)}&provider=${encodeURIComponent(subtitle)}&price=${encodeURIComponent(price)}&href=${encodeURIComponent(href)}&badge=${encodeURIComponent(badge)}&category=${encodeURIComponent(category)}&offerId=${encodeURIComponent(offerId)}`} className="block rounded-xl bg-[#203b72] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-[#152a52]">View offer details →</a>
          <a href={href} target="_blank" rel="noreferrer" className="mt-2 block rounded-xl border border-[#e2e8f0] px-4 py-3 text-center text-sm font-semibold text-[#203b72] hover:bg-slate-50">Visit provider website ↗</a>
        </div>
      </div>
    </article>
  );
}

function SearchResults() {
  const params = useSearchParams();
  const router = useRouter();
  const query = params.get("q") ?? "";
  const category = detectCategory(query);
  const providerTerm = ["home4students", "wiener linien", "spusu", "fitinn", "netflix", "a1", "stuwo"].find((term) => query.toLowerCase().includes(term)) ?? "";

  const requestedCity = params.get("city");
  const [country, setCountry] = useState<"All" | Country>(() => requestedCity === "Milan" ? "Italy" : requestedCity === "Vienna" ? "Austria" : detectCountry(query));
  const [budget, setBudget] = useState(() => getInitialBudget(query));

  useEffect(() => {
    if (requestedCity === "Vienna" || requestedCity === "Milan") return;
    const savedCity = window.localStorage.getItem("comparex-city");
    if (savedCity === "Vienna") setCountry("Austria");
    if (savedCity === "Milan") setCountry("Italy");
  }, [requestedCity]);

  function changeCity(city: "Vienna" | "Milan") {
    const nextCountry = city === "Vienna" ? "Austria" : "Italy";
    setCountry(nextCountry);
    window.localStorage.setItem("comparex-city", city);
    router.replace(`/search?q=${encodeURIComponent(query)}&city=${city}`);
  }
  const [sort, setSort] = useState<"price-asc" | "price-desc" | "data">("price-asc");

  const [offers, setOffers] = useState<MobileOffer[]>([]);
  const [mobileLastVerified, setMobileLastVerified] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [housingOffers, setHousingOffers] = useState<HousingOffer[]>([]);
  const [housingLastVerified, setHousingLastVerified] = useState<string | null>(null);
  const [housingLoading, setHousingLoading] = useState(false);
  const [housingError, setHousingError] = useState(false);

  const [genericOffers, setGenericOffers] = useState<GenericOffer[]>([]);
  const [genericLoading, setGenericLoading] = useState(false);
  const [genericError, setGenericError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setLoadError(false);
        const res = await fetch("/api/offers", { cache: "no-store" });
        if (!res.ok) throw new Error("fail");
        const data = await res.json();
        if (!cancelled) {
          setOffers(data.offers ?? []);
          setMobileLastVerified(data.lastVerified ?? data.offers?.[0]?.lastVerified ?? null);
        }
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
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
        if (!cancelled) {
          setHousingOffers(data.offers ?? []);
          setHousingLastVerified(data.lastVerified ?? data.offers?.[0]?.lastVerified ?? null);
        }
      } catch {
        if (!cancelled) setHousingError(true);
      } finally {
        if (!cancelled) setHousingLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [category]);

  useEffect(() => {
    if (!category || category === "mobile" || category === "housing") return;
    const endpoint = category === "transport" ? "/api/transport" : category === "gym" ? "/api/gyms" : "/api/streaming";
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
        if (!cancelled) setGenericError("Could not load offers. Please try again.");
      } finally {
        if (!cancelled) setGenericLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [category]);

  const filteredMobile = useMemo(() => {
    let result = offers.filter((o) => (country === "All" || o.country === country) && (!providerTerm || `${o.provider} ${o.plan}`.toLowerCase().includes(providerTerm)));
    const max = Number(budget);
    if (budget.trim() !== "" && Number.isFinite(max)) result = result.filter((o) => o.monthlyPrice <= max);
    return [...result].sort((a, b) => {
      if (sort === "price-desc") return b.monthlyPrice - a.monthlyPrice;
      if (sort === "data") return b.dataGB - a.dataGB;
      return a.monthlyPrice - b.monthlyPrice;
    });
  }, [offers, country, budget, sort, providerTerm]);

  const filteredHousing = useMemo(() => {
    let result = housingOffers.filter((o) => (country === "All" || o.country === country) && (!providerTerm || `${o.provider} ${o.property}`.toLowerCase().includes(providerTerm)));
    const max = Number(budget);
    if (budget.trim() !== "" && Number.isFinite(max)) result = result.filter((o) => o.pricePeriod === "year" || o.priceValue <= max);
    return [...result].sort((a, b) => {
      // Search-only marketplace links have no comparable price (priceValue = 0).
      // Keep them visible, but never rank them as the cheapest option.
      const aUnpriced = a.priceValue <= 0;
      const bUnpriced = b.priceValue <= 0;
      if (aUnpriced !== bUnpriced) return aUnpriced ? 1 : -1;
      if (a.pricePeriod !== b.pricePeriod) return a.pricePeriod === "month" ? -1 : 1;
      return a.priceValue - b.priceValue;
    });
  }, [housingOffers, country, budget, providerTerm]);

  const filteredGeneric = useMemo(() => {
    const max = budget.trim() === "" ? Infinity : Number(budget);
    return genericOffers.filter((o) => {
      const matchProvider = !providerTerm || `${o.provider} ${o.name}`.toLowerCase().includes(providerTerm);
      const matchCountry = (country === "All" || o.country === country) && matchProvider;
      const matchBudget = !Number.isFinite(max) || o.priceValue <= max;
      return matchCountry && matchBudget;
    });
  }, [genericOffers, country, budget, providerTerm]);

  const selected = categories.find((c) => c.id === category);

  return (
    <main className="min-h-screen bg-[#f8f9fc] text-[#0c1222]">
      <header className="sticky top-0 z-40 border-b border-[#e2e8f0]/80 header-glass">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <button onClick={() => router.push("/")} className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#203b72] text-lg font-bold text-white shadow-sm">C</span>
            <span className="text-xl font-bold">CompareX</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-xl border border-[#e2e8f0] bg-white p-1 shadow-sm" role="group" aria-label="Choose your country">
              <button type="button" onClick={() => changeCity("Vienna")} aria-pressed={country === "Austria"} className={`rounded-lg px-3 py-2 text-xs font-semibold transition sm:px-4 ${country === "Austria" ? "bg-[#203b72] text-white shadow-sm" : "text-[#475569] hover:bg-[#f1f5f9]"}`}>Austria</button>
              <button type="button" onClick={() => changeCity("Milan")} aria-pressed={country === "Italy"} className={`rounded-lg px-3 py-2 text-xs font-semibold transition sm:px-4 ${country === "Italy" ? "bg-[#203b72] text-white shadow-sm" : "text-[#475569] hover:bg-[#f1f5f9]"}`}>Italy</button>
            </div>
            <button onClick={() => router.push("/")} className="rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 text-xs font-semibold shadow-sm transition hover:border-[#203b72] hover:bg-slate-50 sm:px-4 sm:text-sm">Home</button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <p className="text-sm font-semibold uppercase tracking-wider text-[#203b72]">CompareX · Search results</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{selected?.title ?? "Explore services"}</h1>
        <p className="mt-3 break-words text-slate-600">Your search: “{query}”</p>

        {category === "mobile" && (
          <>
            <h2 className="mt-7 text-xl font-bold">{filteredMobile.length} mobile plans</h2>
            {mobileLastVerified && <p className="mt-1 text-xs text-slate-500">Last checked: {new Date(`${mobileLastVerified}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}. Not live quotes.</p>}
            {loading && <p className="mt-5 text-slate-600">Loading mobile plans…</p>}
            {loadError && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">Could not load mobile plans. Please try again.</div>}
            {!loading && !loadError && filteredMobile.length === 0 && <div className="mt-5 rounded-2xl border border-[#e2e8f0] bg-white p-6">No mobile plans match these filters. Try another country or budget.</div>}
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredMobile.map((o) => (
                <OfferCard key={o.id} badge={o.country} title={o.plan} subtitle={o.provider} price={`€${o.monthlyPrice}/month`} href={o.officialUrl} category="mobile" offerId={o.id} body={
                  <ul className="space-y-1">
                    <li>{o.dataGB} GB data</li>
                    {o.maxSpeed && <li>Max speed: {o.maxSpeed}</li>}
                    <li>{o.callsSms}</li>
                    {o.euRoamingGB != null && <li>EU roaming: {o.euRoamingGB} GB</li>}
                    <li>{o.contract}</li>
                  </ul>
                } />
              ))}
            </div>
            <p className="mt-8 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-slate-700">Prices and plan details may change. Always verify on the official provider website before subscribing.</p>
          </>
        )}

        {category === "housing" && (
          <>
            <h2 className="mt-7 text-xl font-bold">{filteredHousing.length} housing listings</h2>
            {housingLastVerified && <p className="mt-1 text-xs text-slate-500">Last checked: {new Date(`${housingLastVerified}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}. Confirm availability.</p>}
            {housingLoading && <p className="mt-5 text-slate-600">Loading housing…</p>}
            {housingError && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">Could not load housing listings. Please try again.</div>}
            {!housingLoading && !housingError && filteredHousing.length === 0 && <div className="mt-5 rounded-2xl border border-[#e2e8f0] bg-white p-6">No housing matches these filters.</div>}
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredHousing.map((o) => (
                <OfferCard key={o.id} badge={`${o.country} · ${o.city}`} title={o.property} subtitle={o.provider} price={o.priceLabel} href={o.officialUrl} images={o.images} category="housing" offerId={o.id} body={
                  <ul className="space-y-1">
                    <li>{o.roomType}</li>
                    <li>{o.availability}</li>
                    {o.details.slice(0, 3).map((d) => <li key={d}>{d}</li>)}
                  </ul>
                } />
              ))}
            </div>
          </>
        )}

        {category && category !== "mobile" && category !== "housing" && (
          <>
            <Filters country={country} setCountry={setCountry} budget={budget} setBudget={setBudget} budgetLabel="Maximum price (€)" />
            <h2 className="mt-7 text-xl font-bold">{filteredGeneric.length} offers</h2>
            {genericLoading && <p className="mt-5 text-slate-600">Loading…</p>}
            {genericError && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{genericError}</div>}
            {!genericLoading && !genericError && filteredGeneric.length === 0 && <div className="mt-5 rounded-2xl border border-[#e2e8f0] bg-white p-6">No offers match these filters.</div>}
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredGeneric.map((o) => (
                <OfferCard key={o.id} badge={o.country} title={o.name} subtitle={o.provider} price={o.priceLabel} href={o.url} category={category} offerId={o.id} body={<p>{o.details}</p>} />
              ))}
            </div>
          </>
        )}

        {!category && (
          <div className="mt-10 rounded-2xl border border-[#e2e8f0] bg-white p-8 text-center">
            <p className="text-lg font-semibold">Try searching for a category</p>
            <p className="mt-2 text-slate-600">Examples: student room Vienna, mobile plan Austria, gym membership</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {categories.map((c) => (
                <button key={c.id} onClick={() => router.push(`/search?q=${c.id}`)} className="rounded-xl border border-[#e2e8f0] bg-white px-4 py-2 text-sm font-semibold hover:border-[#203b72] hover:text-[#203b72]">{c.icon} {c.title}</button>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center"><p className="text-slate-600">Loading search…</p></main>}>
      <SearchResults />
    </Suspense>
  );
}
