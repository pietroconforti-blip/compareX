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
  rankOffers,
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

const HERO_IMG = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80";
const HOUSING_IMG = "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80";
const MOBILE_IMG = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80";
const TRANSPORT_IMG = "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80";
const GYM_IMG = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80";

export default function Home() {
  const [query, setQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [recs, setRecs] = useState<AiRec[]>([]);
  const [packageBudget, setPackageBudget] = useState("900");
  const [packageCategories, setPackageCategories] = useState<Category[]>(["housing", "mobile", "transport", "gym"]);

  const packageCategoryResults = useMemo(() => {
    const output = {} as Record<Category, ReturnType<typeof calculateScore>[]>;
    for (const category of packageCategories) {
      const scored = offers.filter((o) => o.category === category).map((o) => calculateScore(o, { student: true, quality: false, cheap: false, vienna: true, milan: false, university: false })).sort((a, b) => b.score - a.score);
      output[category] = rankOffers(scored);
    }
    return output;
  }, [packageCategories]);

  const packageBundles = useMemo(() => {
    if (packageCategories.length < 2) return [];
    if (packageCategories.some((c) => packageCategoryResults[c]?.length === 0)) return [];
    return createBundles(packageCategoryResults, packageCategories);
  }, [packageCategoryResults, packageCategories]);

  const budgetValue = packageBudget === "" ? Number.POSITIVE_INFINITY : Number(packageBudget);
  const affordable = packageBundles.filter((b) => b.totalPrice <= budgetValue);
  const pool = affordable.length > 0 ? affordable : packageBundles;
  const best = [...pool].sort((a, b) => b.score - a.score || a.totalPrice - b.totalPrice)[0] ?? null;

  function toggleCategory(category: Category) {
    setPackageCategories((cur) => cur.includes(category) ? cur.filter((x) => x !== category) : [...cur, category]);
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
      const res = await fetch("/api/ai-search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: text }) });
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
      <header className="sticky top-0 z-40 border-b border-[#e2e8f0]/80 header-glass">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#203b72] text-lg font-bold text-white shadow-sm">C</div>
            <div>
              <div className="text-xl font-bold tracking-tight">CompareX</div>
              <div className="text-xs text-slate-500">Compare better. Choose better.</div>
            </div>
          </div>
          <details className="relative">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:border-[#203b72]">Menu</summary>
            <nav className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-[#e2e8f0] bg-white p-2 shadow-xl">
              {[["student room", "Housing"], ["mobile plan", "Mobile"], ["transport", "Transport"], ["gym", "Gym"], ["streaming", "Streaming"]].map(([q, label]) => (
                <button key={q} onClick={() => goSearch(q)} className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium hover:bg-blue-50 hover:text-[#203b72]">{label}</button>
              ))}
              <a href="/marketplace-test" className="mt-1 block w-full rounded-xl border-t border-slate-100 px-3 py-3 text-left text-sm font-semibold text-[#203b72] hover:bg-blue-50">Marketplace · Buy, sell, rent →</a>
              <a href="/dashboard" className="block w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-[#203b72] hover:bg-blue-50">My student dashboard →</a>
              <a href="/moving" className="block w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-[#203b72] hover:bg-blue-50">Student moving guide →</a>
              <a href="/contact" className="block w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-[#203b72] hover:bg-blue-50">Contact support →</a>
            </nav>
          </details>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-14 lg:grid-cols-2 lg:items-center">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#c7d7f5] bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#203b72] shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3b82f6]" /> AI search · Student offers
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl">Compare smarter.<span className="block text-[#203b72]">Live better.</span></h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">Tell the AI what you need in plain language — it finds the best offers for students in Austria and Italy.</p>

          <form className="mt-8 rounded-2xl border border-[#e2e8f0] bg-white p-2 shadow-lg shadow-[#203b72]/10" onSubmit={(e) => { e.preventDefault(); runAiSearch(query); }}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-2 px-3">
                <span className="text-lg" aria-hidden>✨</span>
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. student room under €500 in Vienna with cheap mobile" className="w-full border-0 bg-transparent py-3 text-[15px] outline-none placeholder:text-slate-400" />
              </div>
              <button type="submit" disabled={aiLoading} className="rounded-xl bg-[#203b72] px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#152a52] disabled:opacity-60">{aiLoading ? "Thinking…" : "Ask AI →"}</button>
            </div>
          </form>

          <div className="mt-3 flex flex-wrap gap-2">
            {["Student room under €450 in Vienna", "Cheap mobile plan Austria", "Gym + transport for students"].map((chip) => (
              <button key={chip} onClick={() => { setQuery(chip); runAiSearch(chip); }} className="rounded-full border border-[#e2e8f0] bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:border-[#203b72] hover:text-[#203b72]">{chip}</button>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <a href="/package-builder" className="inline-flex items-center justify-center rounded-xl bg-[#203b72] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#152a52]">Build my package →</a>
            <span className="self-center text-sm text-slate-500">Housing · Transport · Mobile · Gym · Streaming</span>
          </div>

          {aiError && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{aiError}</p>}

          {(interpretation || recs.length > 0) && (
            <div className="mt-6 rounded-2xl border border-[#c7d7f5] bg-[#f5f8ff] p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#203b72]">CompareX AI</p>
              {interpretation && <p className="mt-2 text-sm leading-6 text-slate-700">{interpretation}</p>}
              <div className="mt-4 space-y-3">
                {recs.map((r) => (
                  <a key={r.id} href={r.searchUrl} className="card-hover flex items-start justify-between gap-3 rounded-xl border border-[#e2e8f0] bg-white px-4 py-3 shadow-sm">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{categoryLabels[r.category]} · {r.location}</p>
                      <p className="mt-0.5 font-semibold">{r.name}</p>
                      <p className="mt-1 text-sm text-slate-600">{r.description}</p>
                      {r.reasons?.length > 0 && <p className="mt-1 text-xs text-[#3b82f6]">{r.reasons.join(" · ")}</p>}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-bold text-[#203b72]">{r.priceLabel}</p>
                      <p className="text-xs text-slate-500">Score {r.score}/10</p>
                    </div>
                  </a>
                ))}
              </div>
              {query.trim() && <button onClick={() => goSearch(query)} className="mt-4 text-sm font-semibold text-[#203b72] hover:underline">See all results for “{query}” →</button>}
            </div>
          )}
        </div>

        <div className="relative animate-fade-up overflow-hidden rounded-[2rem] border border-[#e2e8f0] shadow-xl shadow-[#203b72]/10">
          <div className="relative aspect-[4/3] min-h-[280px]">
            <img src={HERO_IMG} alt="Bright student apartment living room" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c1222]/70 via-[#0c1222]/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-200">Your next chapter</p>
              <h2 className="mt-1 text-2xl font-bold">Find a place that feels like home.</h2>
              <p className="mt-1 text-sm text-white/85">Explore options · Compare before you choose</p>
            </div>
          </div>
        </div>
      </section>

      <section id="build-package" className="mx-auto max-w-7xl px-6 pb-20">
        <div className="overflow-hidden rounded-[2rem] border border-[#e2e8f0] bg-white shadow-xl shadow-[#203b72]/10">
          <div className="grid gap-8 bg-gradient-to-br from-white via-[#f5f8ff] to-[#eaf1ff] p-6 md:p-10 lg:grid-cols-[1fr_300px]">
            <div>
              <span className="inline-flex rounded-full border border-[#c7d7f5] bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#203b72]">CompareX Package Builder</span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">Your life in one package.</h2>
              <p className="mt-3 max-w-2xl leading-7 text-slate-600">Combine housing, transport, mobile and fitness. See the estimated monthly total update in one place.</p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {(Object.keys(categoryLabels) as Category[]).map((cat) => {
                  const on = packageCategories.includes(cat);
                  const categoryImage = cat === "housing" ? HOUSING_IMG : cat === "mobile" ? MOBILE_IMG : cat === "transport" ? TRANSPORT_IMG : cat === "gym" ? GYM_IMG : HERO_IMG;
                  const sample = offers.find((o) => o.category === cat);
                  const ranked = packageCategoryResults[cat] || [];
                  const top = ranked[0];
                  return (
                    <button key={cat} onClick={() => toggleCategory(cat)} aria-pressed={on} className={`group overflow-hidden rounded-2xl border text-left transition ${on ? "border-[#203b72] bg-white ring-2 ring-[#c7d7f5] shadow-md" : "border-[#e2e8f0] bg-white/70 hover:border-[#203b72]"}`}>
                      <div className="relative h-28 overflow-hidden">
                        <img src={categoryImage} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                        <span className={`absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${on ? "bg-[#203b72] text-white" : "bg-white/95 text-slate-500"}`}>{on ? "✓" : "+"}</span>
                      </div>
                      <div className="p-4">
                        <p className="font-semibold">{categoryIcons[cat]} {categoryLabels[cat]}</p>
                        <p className="mt-1 text-sm text-slate-500">{sample ? sample.description : "Choose a service to add it to your package."}</p>
                        {top?.rank && <span className={`mt-2 inline-block ${top.rank === "cheapest" ? "badge-cheapest" : top.rank === "best-value" ? "badge-value" : "badge-best"}`}>{top.rank.replace("-", " ")}</span>}
                        <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[#203b72]">{on ? "Included in package" : "Add to package"}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-[#e2e8f0] bg-white p-5 sm:flex-row sm:items-end sm:justify-between">
                <label className="block w-full sm:max-w-xs">
                  <span className="mb-2 block text-sm font-semibold">Your monthly budget (€)</span>
                  <input type="number" min={0} value={packageBudget} onChange={(e) => setPackageBudget(e.target.value)} className="w-full rounded-xl border border-[#e2e8f0] bg-white px-4 py-3 font-semibold outline-none focus:border-[#203b72]" />
                </label>
                <button onClick={() => { const params = new URLSearchParams({ budget: packageBudget, categories: packageCategories.join(","), location: "Vienna" }); window.location.assign("/package-builder?" + params.toString()); }} disabled={packageCategories.length < 2} className="rounded-xl bg-[#203b72] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#203b72]/20 transition hover:bg-[#152a52] disabled:cursor-not-allowed disabled:opacity-50">Build my package →</button>
              </div>
            </div>

            <aside className="h-fit rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-lg shadow-[#203b72]/5 lg:sticky lg:top-24">
              <p className="text-xs font-bold uppercase tracking-wider text-[#203b72]">Your package</p>
              <h3 className="mt-2 text-xl font-bold">Monthly overview</h3>
              <p className="mt-1 text-sm text-slate-500">{packageCategories.length} services selected</p>
              {best && (
                <div className="mt-4 rounded-xl bg-[#203b72]/5 p-3">
                  <p className="text-xs font-bold text-[#203b72]">Best value bundle</p>
                  <p className="text-lg font-bold">{formatPrice(best.totalPrice)} / mo</p>
                  <p className="text-xs text-slate-500">Score {best.score}</p>
                </div>
              )}
              <div className="mt-5 space-y-3">
                {packageCategories.map((cat) => {
                  const ranked = packageCategoryResults[cat] || [];
                  const cheapest = ranked.find((o) => o.rank === "cheapest") || ranked[0];
                  return cheapest ? (
                    <div key={cat} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{categoryIcons[cat]} {categoryLabels[cat]}</p>
                        <p className="truncate text-xs text-slate-500">{cheapest.name}</p>
                        {cheapest.rank && <span className="mt-1 inline-block text-[10px] font-bold uppercase tracking-wide text-[#203b72]">{cheapest.rank.replace("-", " ")}</span>}
                      </div>
                      <p className="shrink-0 font-bold text-[#203b72]">{formatPrice(cheapest.price)}</p>
                    </div>
                  ) : null;
                })}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e2e8f0] bg-white py-10">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-slate-500">
          <p className="font-semibold text-[#203b72]">CompareX</p>
          <p className="mt-1">Student comparison platform for Austria & Italy</p>
          <div className="mt-4 flex justify-center gap-6">
            <a href="/privacy" className="hover:text-[#203b72]">Privacy</a>
            <a href="/contact" className="hover:text-[#203b72]">Contact</a>
            <a href="https://github.com/pietroconforti-blip/compareX" target="_blank" rel="noreferrer" className="hover:text-[#203b72]">GitHub</a>
          </div>
          <p className="mt-4 text-xs">Prices are indicative. Always verify with providers.</p>
        </div>
      </footer>
    </main>
  );
}
