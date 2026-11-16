"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type Category,
  offers,
  categoryIcons,
  calculateScore,
  createBundles,
  formatPrice,
  rankOffers,
} from "@/lib/home-data";

const categories: { id: Category; title: string; description: string; query: string }[] = [
  { id: "housing", title: "Housing", description: "Student rooms, residences and shared apartments", query: "student room" },
  { id: "mobile", title: "Mobile", description: "Mobile plans, data and student-friendly tariffs", query: "mobile plan" },
  { id: "transport", title: "Transport", description: "Public transport passes and local mobility", query: "transport" },
  { id: "gym", title: "Gym & fitness", description: "Memberships, gyms and fitness options", query: "gym" },
  { id: "streaming", title: "Streaming", description: "Entertainment and streaming subscriptions", query: "streaming" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState<"Vienna" | "Milan">("Vienna");
  const [packageBudget, setPackageBudget] = useState("900");
  const [packageCategories, setPackageCategories] = useState<Category[]>(["housing", "mobile", "transport"]);

  useEffect(() => {
    const savedCity = window.localStorage.getItem("comparex-city");
    if (savedCity === "Vienna" || savedCity === "Milan") setCity(savedCity);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("comparex-city", city);
  }, [city]);

  const packageCategoryResults = useMemo(() => {
    const output = {} as Record<Category, ReturnType<typeof calculateScore>[]>;
    for (const category of packageCategories) {
      const scored = offers
        .filter((offer) => offer.category === category && (
          city === "Vienna"
            ? ["Vienna", "Austria"].includes(offer.location)
            : ["Milan", "Italy"].includes(offer.location)
        ))
        .map((offer) => calculateScore(offer, {
          student: true,
          quality: false,
          cheap: false,
          vienna: city === "Vienna",
          milan: city === "Milan",
          university: false,
        }))
        .sort((a, b) => b.score - a.score);
      output[category] = rankOffers(scored);
    }
    return output;
  }, [packageCategories, city]);

  const packageBundles = useMemo(() => {
    if (packageCategories.length < 2) return [];
    if (packageCategories.some((category) => packageCategoryResults[category]?.length === 0)) return [];
    return createBundles(packageCategoryResults, packageCategories);
  }, [packageCategoryResults, packageCategories]);

  const budgetValue = packageBudget.trim() === "" ? Number.POSITIVE_INFINITY : Number(packageBudget);
  const validBudget = packageBudget.trim() === "" || (Number.isFinite(budgetValue) && budgetValue > 0);
  const affordable = packageBundles.filter((bundle) => bundle.totalPrice <= budgetValue);
  const best = [...(affordable.length > 0 ? affordable : packageBundles)]
    .sort((a, b) => b.score - a.score || a.totalPrice - b.totalPrice)[0] ?? null;

  function toggleCategory(category: Category) {
    setPackageCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  }

  function goSearch(searchQuery: string) {
    const cleanQuery = searchQuery.trim();
    if (!cleanQuery) return;
    window.location.href = `/search?q=${encodeURIComponent(cleanQuery)}&city=${encodeURIComponent(city)}`;
  }

  return (
    <main className="min-h-screen bg-white text-[#0f172a]">
      <header className="sticky top-0 z-40 header-glass">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-6">
          <a href="/" className="flex shrink-0 items-center gap-2.5" aria-label="CompareX home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1e40af] text-sm font-bold text-white">C</span>
            <span>
              <span className="block text-lg font-semibold tracking-tight">CompareX</span>
              <span className="block text-[11px] text-[#64748b]">Student essentials</span>
            </span>
          </a>
          <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
            <a href="#categories" className="text-sm font-medium text-[#475569] transition hover:text-[#1e40af]">Explore</a>
            <a href="/package-builder" className="text-sm font-medium text-[#475569] transition hover:text-[#1e40af]">Package builder</a>
            <a href="/dashboard" className="text-sm font-medium text-[#475569] transition hover:text-[#1e40af]">Dashboard</a>
          </nav>
          <div className="flex items-center gap-2">
            <a href="/account" className="hidden rounded-lg border border-[#e2e8f0] bg-white px-3.5 py-2 text-sm font-semibold text-[#334155] transition hover:border-[#1e40af] sm:inline-flex">My account</a>
            <details className="relative md:hidden">
              <summary className="flex cursor-pointer list-none items-center rounded-lg border border-[#e2e8f0] bg-white px-3.5 py-2 text-sm font-medium text-[#334155]">Menu</summary>
              <nav className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-[#e2e8f0] bg-white p-1.5 shadow-xl" aria-label="Mobile navigation">
                <a href="#categories" className="block rounded-lg px-3 py-2.5 text-sm text-[#334155] hover:bg-[#eff6ff]">Explore categories</a>
                <a href="/package-builder" className="block rounded-lg px-3 py-2.5 text-sm text-[#334155] hover:bg-[#eff6ff]">Build my package</a>
                <a href="/dashboard" className="block rounded-lg px-3 py-2.5 text-sm text-[#334155] hover:bg-[#eff6ff]">My dashboard</a>
                <a href="/account" className="block rounded-lg px-3 py-2.5 text-sm text-[#334155] hover:bg-[#eff6ff]">My account</a>
              </nav>
            </details>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-[#e2e8f0] bg-[#f8fafc]">
        <div className="pointer-events-none absolute -right-32 -top-36 h-96 w-96 rounded-full bg-blue-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-slate-200/70 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 sm:px-6 md:grid-cols-[1.05fr_0.95fr] md:py-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#dbe5f5] bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#1e40af] shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Student life, made simpler
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#1e40af]">Your city. Your essentials. One place.</p>
            <h1 className="mt-3 max-w-xl text-4xl font-semibold leading-[1.08] tracking-tight text-[#0f172a] sm:text-5xl lg:text-[3.6rem]">
              Compare smarter.<br />Settle in faster.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-[#64748b]">
              Find student housing, mobile plans, transport, gyms and streaming in one place — and see what your monthly essentials could cost.
            </p>

            <form className="mt-8 max-w-xl" onSubmit={(event) => { event.preventDefault(); goSearch(query); }}>
              <label htmlFor="comparex-search" className="mb-2 block text-sm font-semibold text-[#334155]">What are you looking for?</label>
              <div className="flex items-center gap-2 rounded-2xl border border-[#dbe2ee] bg-white p-1.5 shadow-lg shadow-slate-900/5 transition focus-within:border-[#1e40af] focus-within:ring-4 focus-within:ring-[#1e40af]/10">
                <span className="pl-3 text-[#94a3b8]" aria-hidden="true">⌕</span>
                <input
                  id="comparex-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={city === "Vienna" ? "e.g. student room under €450 in Vienna" : "e.g. student room under €650 in Milan"}
                  className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm outline-none placeholder:text-[#94a3b8]"
                />
                <button type="submit" disabled={!query.trim()} className="rounded-xl bg-[#1e40af] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1e3a8a] disabled:cursor-not-allowed disabled:opacity-45">
                  Search <span aria-hidden="true">→</span>
                </button>
              </div>
              <p className="mt-2 text-xs text-[#94a3b8]">Search opens a dedicated results page where you can compare and filter offers.</p>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-medium text-[#64748b]">Popular:</span>
              {(city === "Vienna"
                ? ["Room under €450", "Mobile under €15", "Student room near FHWien"]
                : ["Room under €650", "Mobile under €15", "Student room near Bocconi"]
              ).map((suggestion) => (
                <button key={suggestion} type="button" onClick={() => goSearch(suggestion)} className="rounded-full border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs font-medium text-[#475569] transition hover:border-[#1e40af] hover:text-[#1e40af]">
                  {suggestion}
                </button>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">Explore</span>
              <div className="inline-flex rounded-xl border border-[#e2e8f0] bg-white p-1 shadow-sm" role="group" aria-label="Choose your city">
                <button type="button" onClick={() => setCity("Vienna")} aria-pressed={city === "Vienna"} className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${city === "Vienna" ? "bg-[#203b72] text-white shadow-sm" : "text-[#475569] hover:bg-[#f1f5f9]"}`}>🇦🇹 Vienna</button>
                <button type="button" onClick={() => setCity("Milan")} aria-pressed={city === "Milan"} className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${city === "Milan" ? "bg-[#203b72] text-white shadow-sm" : "text-[#475569] hover:bg-[#f1f5f9]"}`}>🇮🇹 Milan</button>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-blue-100 to-slate-100 blur-xl" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white bg-white p-2 shadow-2xl shadow-slate-900/10">
              <div className="relative h-64 overflow-hidden rounded-[1.25rem] sm:h-80">
                <img
                  src={city === "Vienna" ? "https://images.contentstack.io/v3/assets/blt06f605a34f1194ff/blt12393c9e299ed438/66c730b83f4c1968bc1ce76d/iStock-1196925572-MOBILE-HEADER.jpg?auto=avif&format=webp&quality=100&width=1440" : "https://cdn.tourradar.com/s3/tour/1500x800/223479_61ad9ded8f29c.jpg"}
                  alt={city === "Vienna" ? "Panoramic view over Vienna's historic city centre" : "Panoramic view over Milan and the Duomo"}
                  className="h-full w-full object-cover"
                  fetchPriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/5 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-left text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">Your next chapter</p>
                  <p className="mt-1 text-2xl font-semibold">{city === "Vienna" ? "Make Vienna your home." : "Make Milan your home."}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 divide-x divide-[#e2e8f0] px-2 py-4 text-center">
                <div><p className="text-lg font-bold text-[#1e3a8a]">01</p><p className="mt-0.5 text-[11px] text-[#64748b]">Search</p></div>
                <div><p className="text-lg font-bold text-[#1e3a8a]">02</p><p className="mt-0.5 text-[11px] text-[#64748b]">Compare</p></div>
                <div><p className="text-lg font-bold text-[#1e3a8a]">03</p><p className="mt-0.5 text-[11px] text-[#64748b]">Choose</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#e2e8f0] bg-white">
        <div className="mx-auto grid max-w-6xl gap-5 px-5 py-6 sm:grid-cols-3 sm:px-6">
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">◎</span><div><p className="text-sm font-semibold">Free for students</p><p className="text-xs text-[#64748b]">CompareX does not charge students.</p></div></div>
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">↗</span><div><p className="text-sm font-semibold">Choose with clarity</p><p className="text-xs text-[#64748b]">Compare prices and key conditions.</p></div></div>
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">⌂</span><div><p className="text-sm font-semibold">Providers stay in control</p><p className="text-xs text-[#64748b]">Contracts and payments stay with providers.</p></div></div>
        </div>
      </section>

      <section id="categories" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-14 sm:px-6 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1e40af]">Everything you need</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Start with one essential.</h2>
            <p className="mt-2 text-sm text-[#64748b]">Browse categories available in {city}.</p>
          </div>
          <a href="/package-builder" className="text-sm font-semibold text-[#1e40af] transition hover:underline">Build a complete package →</a>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <button key={category.id} type="button" onClick={() => goSearch(category.query)} className="group rounded-2xl border border-[#e2e8f0] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#9db6e8] hover:shadow-lg hover:shadow-blue-950/5">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f1f5fb] text-xl">{categoryIcons[category.id]}</span>
                <span className="text-lg text-[#94a3b8] transition group-hover:translate-x-1 group-hover:text-[#1e40af]" aria-hidden="true">→</span>
              </div>
              <h3 className="mt-4 font-semibold text-[#0f172a]">{category.title}</h3>
              <p className="mt-1 text-sm leading-6 text-[#64748b]">{category.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="border-y border-[#e2e8f0] bg-[#f8fafc]">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6 md:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1e40af]">Plan your monthly costs</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Build your student package.</h2>
              <p className="mt-2 text-sm text-[#64748b]">Select the essentials you need and get an indicative monthly total.</p>
            </div>
            <a href="/package-builder" className="rounded-xl bg-[#203b72] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#152a52]">Open full builder →</a>
          </div>

          <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_320px]">
            <div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => {
                  const selected = packageCategories.includes(category.id);
                  return (
                    <button key={category.id} type="button" aria-pressed={selected} onClick={() => toggleCategory(category.id)} className={`rounded-2xl border p-4 text-left transition ${selected ? "border-[#1e40af] bg-blue-50/80 shadow-sm" : "border-[#e2e8f0] bg-white hover:border-[#9db6e8]"}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{categoryIcons[category.id]}</span>
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${selected ? "bg-[#1e40af] text-white" : "border border-[#cbd5e1] text-[#64748b]"}`}>{selected ? "✓" : "+"}</span>
                      </div>
                      <p className="mt-3 text-sm font-semibold">{category.title}</p>
                      <p className="mt-1 text-xs text-[#64748b]">{selected ? "Included in your package" : "Add to your package"}</p>
                    </button>
                  );
                })}
              </div>
              <div className="mt-5 flex flex-wrap items-end gap-3">
                <label className="block text-sm font-semibold text-[#334155]">Monthly budget (€)
                  <input type="number" min="1" inputMode="decimal" value={packageBudget} onChange={(event) => setPackageBudget(event.target.value)} className="mt-2 block w-44 rounded-xl border border-[#dbe2ee] bg-white px-3.5 py-3 text-sm font-medium outline-none transition focus:border-[#1e40af] focus:ring-4 focus:ring-[#1e40af]/10" />
                </label>
                <p className="pb-3 text-xs text-[#64748b]">You can leave this blank for no budget limit.</p>
              </div>
            </div>

            <aside className="h-fit rounded-2xl border border-[#dbe5f5] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1e40af]">Your estimate</p>
              {best ? (
                <>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-[#0f172a]">{formatPrice(best.totalPrice)}<span className="text-sm font-normal text-[#64748b]"> / month</span></p>
                  <p className="mt-2 text-sm text-[#64748b]">{packageCategories.length} categories selected · {city}</p>
                  {validBudget && affordable.length > 0 ? (
                    <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">Within your monthly budget</p>
                  ) : validBudget && packageBudget.trim() !== "" ? (
                    <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">Best available combination is above your budget</p>
                  ) : null}
                  <p className="mt-3 text-xs leading-5 text-[#94a3b8]">Indicative catalogue estimate only. Confirm prices, fees and availability with each provider.</p>
                </>
              ) : (
                <p className="mt-3 text-sm leading-6 text-[#64748b]">Select at least two categories with available offers to see a combined estimate.</p>
              )}
              <a href="/package-builder" className="mt-5 flex w-full items-center justify-center rounded-xl bg-[#1e40af] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1e3a8a]">Continue building →</a>
            </aside>
          </div>
        </div>
      </section>

      <footer className="bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-9 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold tracking-tight text-[#0f172a]">CompareX</p>
            <p className="mt-1 text-xs text-[#64748b]">Student essentials, compared clearly.</p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-[#64748b]">
            <a href="/privacy" className="transition hover:text-[#1e40af]">Privacy</a>
            <a href="/contact" className="transition hover:text-[#1e40af]">Contact</a>
            <a href="/account" className="transition hover:text-[#1e40af]">My account</a>
          </div>
          <p className="text-xs text-[#94a3b8]">© {new Date().getFullYear()} CompareX</p>
        </div>
      </footer>
    </main>
  );
}
