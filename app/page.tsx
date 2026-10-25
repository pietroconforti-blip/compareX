"use client";

import { useMemo, useState } from "react";
import {
  type Category,
  offers,
  categoryLabels,
  categoryIcons,
  calculateScore,
  createBundles,
  formatPrice,
} from "@/lib/home-data";

type AiRec = {
  id: number;
  name: string;
  category: Category;
  priceLabel: string;
  price: number;
  location: string;
  description: string;
  score: number;
  reasons: string[];
  searchUrl: string;
};

const HERO_IMG =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80";
const HOUSING_IMG =
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80";
const MOBILE_IMG =
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80";
const TRANSPORT_IMG =
  "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80";
const GYM_IMG =
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80";

export default function Home() {
  const [query, setQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [recs, setRecs] = useState<AiRec[]>([]);
  const [packageBudget, setPackageBudget] = useState(900);
  const [packageCategories, setPackageCategories] = useState<Category[]>([
    "housing",
    "mobile",
    "transport",
    "gym",
  ]);
  const [packageSearchRun, setPackageSearchRun] = useState(false);

  const packageCategoryResults = useMemo(() => {
    const output = {} as Record<Category, ReturnType<typeof calculateScore>[]>;
    for (const category of packageCategories) {
      output[category] = offers
        .filter((o) => o.category === category)
        .map((o) =>
          calculateScore(o, {
            student: true,
            quality: false,
            cheap: false,
            vienna: true,
            milan: false,
            university: false,
          }),
        )
        .sort((a, b) => b.score - a.score);
    }
    return output;
  }, [packageCategories]);

  const packageBundles = useMemo(() => {
    if (packageCategories.length < 2) return [];
    if (packageCategories.some((c) => packageCategoryResults[c]?.length === 0))
      return [];
    return createBundles(packageCategoryResults, packageCategories);
  }, [packageCategoryResults, packageCategories]);

  const affordable = packageBundles.filter((b) => b.totalPrice <= packageBudget);
  const pool = affordable.length > 0 ? affordable : packageBundles;
  const best =
    [...pool].sort((a, b) => b.score - a.score || a.totalPrice - b.totalPrice)[0] ??
    null;

  function toggleCategory(category: Category) {
    setPackageCategories((cur) =>
      cur.includes(category)
        ? cur.filter((x) => x !== category)
        : [...cur, category],
    );
    setPackageSearchRun(false);
  }

  function goSearch(q: string) {
    window.location.href = `/search?q=${encodeURIComponent(q)}`;
  }

  async function runAiSearch(q: string) {
    const text = q.trim();
    if (!text) return;
    setAiLoading(true);
    setAiError("");
    setRecs([]);
    setInterpretation("");
    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI search failed");
      setInterpretation(data.interpretation || "");
      setRecs(data.recommendations || []);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-transparent text-[#0c1222]">
      <header className="sticky top-0 z-40 border-b border-[#d5dceb]/80 header-glass">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1a3470] text-lg font-bold text-white shadow-sm">
              C
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight">CompareX</div>
              <div className="text-xs text-slate-500">
                Compare better. Choose better.
              </div>
            </div>
          </div>
          <details className="relative">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl border border-[#d5dceb] bg-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:border-[#1a3470]">
              Menu
            </summary>
            <nav className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-[#d5dceb] bg-white p-2 shadow-xl">
              {[
                ["student room", "Housing"],
                ["mobile plan", "Mobile"],
                ["transport", "Transport"],
                ["gym", "Gym"],
                ["streaming", "Streaming"],
              ].map(([q, label]) => (
                <button
                  key={q}
                  onClick={() => goSearch(q)}
                  className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium hover:bg-blue-50 hover:text-[#1a3470]"
                >
                  {label}
                </button>
              ))}
            </nav>
          </details>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-14 lg:grid-cols-2 lg:items-center">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#c7d7f5] bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#1a3470] shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2563eb]" />
            AI search · Real offers
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl">
            Compare smarter.
            <span className="block text-[#2563eb]">Live better.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Tell the AI what you need in plain language — it finds the best
            offers already on CompareX for students in Austria and Italy.
          </p>

          <form
            className="mt-8 rounded-2xl border border-[#d5dceb] bg-white p-2 shadow-lg shadow-[#1a3470]/10"
            onSubmit={(e) => {
              e.preventDefault();
              runAiSearch(query);
            }}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-2 px-3">
                <span className="text-lg" aria-hidden>
                  ✨
                </span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. student room under €500 in Vienna with cheap mobile"
                  className="w-full border-0 bg-transparent py-3 text-[15px] outline-none placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                disabled={aiLoading}
                className="rounded-xl bg-[#1a3470] px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#12254f] disabled:opacity-60"
              >
                {aiLoading ? "Thinking…" : "Ask AI →"}
              </button>
            </div>
          </form>

          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "Student room under €450 in Vienna",
              "Cheap mobile plan Austria",
              "Gym + transport for students",
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => {
                  setQuery(chip);
                  runAiSearch(chip);
                }}
                className="rounded-full border border-[#d5dceb] bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:border-[#1a3470] hover:text-[#1a3470]"
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <a href="#build-package" className="inline-flex items-center justify-center rounded-xl bg-[#1a3470] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#12254f]">
              Build my package ↓
            </a>
            <span className="self-center text-sm text-slate-500">Housing · Transport · Mobile · Gym · Streaming</span>
          </div>

          {aiError && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {aiError}
            </p>
          )}

          {(interpretation || recs.length > 0) && (
            <div className="mt-6 rounded-2xl border border-[#c7d7f5] bg-[#f5f8ff] p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#1a3470]">
                CompareX AI
              </p>
              {interpretation && (
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {interpretation}
                </p>
              )}
              <div className="mt-4 space-y-3">
                {recs.map((r) => (
                  <a
                    key={r.id}
                    href={r.searchUrl}
                    className="card-hover flex items-start justify-between gap-3 rounded-xl border border-[#d5dceb] bg-white px-4 py-3 shadow-sm"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {categoryLabels[r.category]} · {r.location}
                      </p>
                      <p className="mt-0.5 font-semibold">{r.name}</p>
                      <p className="mt-1 text-sm text-slate-600">{r.description}</p>
                      {r.reasons?.length > 0 && (
                        <p className="mt-1 text-xs text-[#2563eb]">
                          {r.reasons.join(" · ")}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-bold text-[#1a3470]">{r.priceLabel}</p>
                      <p className="text-xs text-slate-500">Score {r.score}/10</p>
                    </div>
                  </a>
                ))}
              </div>
              {query.trim() && (
                <button
                  onClick={() => goSearch(query)}
                  className="mt-4 text-sm font-semibold text-[#1a3470] hover:underline"
                >
                  See all results for “{query}” →
                </button>
              )}
            </div>
          )}
        </div>

        <div className="relative animate-fade-up overflow-hidden rounded-[2rem] border border-[#d5dceb] shadow-xl shadow-[#1a3470]/10">
          <div className="relative aspect-[4/3] min-h-[280px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={HERO_IMG}
              alt="Bright student apartment living room"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c1222]/70 via-[#0c1222]/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-200">
                Your next chapter
              </p>
              <h2 className="mt-1 text-2xl font-bold">
                Find a place that feels like home.
              </h2>
              <p className="mt-1 text-sm text-white/85">
                Real photos · Compare before you choose
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="build-package" className="mx-auto max-w-7xl px-6 pb-20">
        <div className="overflow-hidden rounded-[2rem] border border-[#d5dceb] bg-white shadow-xl shadow-[#1a3470]/10">
          <div className="grid gap-8 bg-gradient-to-br from-white via-[#f5f8ff] to-[#eaf1ff] p-6 md:p-10 lg:grid-cols-[1fr_300px]">
            <div>
              <span className="inline-flex rounded-full border border-[#c7d7f5] bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#1a3470]">
                CompareX Package Builder
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                Your life in one package.
              </h2>
              <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                Combine housing, transport, mobile and fitness. Choose the services you need and see the estimated monthly total update in one place.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {(Object.keys(categoryLabels) as Category[]).map((cat) => {
                  const on = packageCategories.includes(cat);
                  const categoryImage =
                    cat === "housing" ? HOUSING_IMG :
                    cat === "mobile" ? MOBILE_IMG :
                    cat === "transport" ? TRANSPORT_IMG :
                    cat === "gym" ? GYM_IMG : HERO_IMG;
                  const sample = offers.find((o) => o.category === cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      aria-pressed={on}
                      className={`group overflow-hidden rounded-2xl border text-left transition ${on ? "border-[#1a3470] bg-white ring-2 ring-[#c7d7f5] shadow-md" : "border-[#d5dceb] bg-white/70 hover:border-[#1a3470]"}`}
                    >
                      <div className="relative h-28 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={categoryImage} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                        <span className={`absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${on ? "bg-[#1a3470] text-white" : "bg-white/95 text-slate-500"}`}>
                          {on ? "✓" : "+"}
                        </span>
                      </div>
                      <div className="p-4">
                        <p className="font-semibold">{categoryIcons[cat]} {categoryLabels[cat]}</p>
                        <p className="mt-1 text-sm text-slate-500">{sample ? sample.description : "Choose a service to add it to your package."}</p>
                        <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[#1a3470]">{on ? "Included in package" : "Add to package"}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-[#d5dceb] bg-white p-5 sm:flex-row sm:items-end sm:justify-between">
                <label className="block w-full sm:max-w-xs">
                  <span className="mb-2 block text-sm font-semibold">Your monthly budget (€)</span>
                  <input
                    type="number"
                    min={0}
                    value={packageBudget}
                    onChange={(e) => { setPackageBudget(Number(e.target.value) || 0); setPackageSearchRun(false); }}
                    className="w-full rounded-xl border border-[#d5dceb] bg-white px-4 py-3 font-semibold outline-none focus:border-[#2563eb]"
                  />
                </label>
                <button
                  onClick={() => setPackageSearchRun(true)}
                  disabled={packageCategories.length < 2}
                  className="rounded-xl bg-[#1a3470] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#1a3470]/20 transition hover:bg-[#12254f] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Build my package →
                </button>
              </div>
            </div>

            <aside className="h-fit rounded-2xl border border-[#d5dceb] bg-white p-5 shadow-lg shadow-[#1a3470]/5 lg:sticky lg:top-24">
              <p className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Your package</p>
              <h3 className="mt-2 text-xl font-bold">Monthly overview</h3>
              <p className="mt-1 text-sm text-slate-500">{packageCategories.length} services selected</p>
              <div className="mt-5 space-y-3">
                {packageCategories.map((cat) => {
                  const selectedOffer = offers
                    .filter((o) => o.category === cat)
                    .sort((a, b) => a.price - b.price)[0];
                  return selectedOffer ? (
                    <div key={cat} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{categoryIcons[cat]} {categoryLabels[cat]}</p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">{selectedOffer.name}</p>
                      </div>
                      <span className="shrink-0 text-sm font-bold text-[#1a3470]">{formatPrice(selectedOffer.price)}</span>
                    </div>
                  ) : null;
                })}
              </div>
              <div className="mt-5 border-t border-slate-200 pt-4">
                <p className="text-sm text-slate-500">Estimated starting total</p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-[#1a3470]">
                  {formatPrice(packageCategories.reduce((sum, cat) => {
                    const cheapest = offers.filter((o) => o.category === cat).sort((a, b) => a.price - b.price)[0];
                    return sum + (cheapest?.price ?? 0);
                  }, 0))}
                  <span className="text-sm font-medium text-slate-500"> / month</span>
                </p>
                <p className={`mt-2 text-sm font-medium ${packageCategories.reduce((sum, cat) => sum + (offers.filter((o) => o.category === cat).sort((a, b) => a.price - b.price)[0]?.price ?? 0), 0) <= packageBudget ? "text-emerald-700" : "text-amber-700"}`}>
                  {packageCategories.reduce((sum, cat) => sum + (offers.filter((o) => o.category === cat).sort((a, b) => a.price - b.price)[0]?.price ?? 0), 0) <= packageBudget ? "Within your budget" : "Above your budget"}
                </p>
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-500">
                Estimates use the sample offers currently listed on CompareX. Prices and availability must be verified with each provider.
              </p>
            </aside>
          </div>

          {packageSearchRun && (
            <div className="border-t border-[#d5dceb] bg-white p-6 md:p-10">
              {best ? (
                <>
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Recommended combination</p>
                      <h3 className="mt-2 text-2xl font-bold">Best match for your selected services</h3>
                      <p className="mt-1 text-sm text-slate-600">Ranked by value and student suitability. This is a comparison, not a single provider checkout.</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm text-slate-500">Combined monthly price</p>
                      <p className="text-3xl font-bold text-[#1a3470]">{formatPrice(best.totalPrice)}<span className="text-sm font-medium text-slate-500"> / month</span></p>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {best.offers.map((o) => (
                      <div key={o.id} className="flex items-start gap-3 rounded-xl border border-[#d5dceb] bg-[#f8faff] p-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">{categoryIcons[o.category]}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{categoryLabels[o.category]}</p>
                          <p className="mt-1 font-semibold">{o.name}</p>
                          <p className="mt-1 text-sm text-slate-600">{o.priceLabel}</p>
                          <p className="mt-2 text-xs text-[#1a3470]">{o.reasons.join(" · ") || "Selected match"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-5 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-slate-700">
                    Each service is supplied separately. CompareX currently combines and compares offers; it does not process one combined payment or confirm live bookings.
                  </p>
                </>
              ) : (
                <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Select at least two categories with available sample offers to build a package.</p>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-12">
        <h2 className="text-2xl font-bold tracking-tight">Explore by category</h2>
        <p className="mt-2 text-slate-600">Real photos · Offers from Austria and Italy</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { q: "housing", title: "Housing", img: HOUSING_IMG, alt: "Modern apartment interior" },
            { q: "mobile plan", title: "Mobile", img: MOBILE_IMG, alt: "Smartphone on desk" },
            { q: "transport", title: "Transport", img: TRANSPORT_IMG, alt: "City tram and transit" },
            { q: "gym", title: "Gym", img: GYM_IMG, alt: "Fitness gym interior" },
          ].map((c) => (
            <button
              key={c.q}
              onClick={() => goSearch(c.q)}
              className="card-hover group overflow-hidden rounded-2xl border border-[#d5dceb] bg-white text-left shadow-sm"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.img}
                  alt={c.alt}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <div className="px-4 py-3">
                <p className="font-semibold">{c.title}</p>
                <p className="text-sm text-slate-500">Compare offers →</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#d5dceb] bg-white/50 py-10 text-center text-sm text-slate-500">
        <p className="font-semibold text-[#0c1222]">CompareX</p>
        <p className="mt-1">Compare better. Choose better.</p>
        <a
          href="mailto:pietro_conforti@yahoo.com"
          className="mt-3 inline-block font-medium text-[#1a3470] hover:underline"
        >
          Contact
        </a>
      </footer>
    </main>
  );
}
