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

export default function Home() {
  const [query, setQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [recs, setRecs] = useState<AiRec[]>([]);
  const [packageBudget, setPackageBudget] = useState("900");
  const [packageCategories, setPackageCategories] = useState<Category[]>(["housing", "mobile", "transport"]);

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
    <main className="min-h-screen bg-white text-[#0f172a]">
      <header className="sticky top-0 z-40 header-glass">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1e40af] text-sm font-bold text-white">C</div>
            <div>
              <div className="text-lg font-semibold tracking-tight">CompareX</div>
              <div className="text-[11px] text-[#64748b]">Vienna & Milan</div>
            </div>
          </div>
          <details className="relative">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-3.5 py-2 text-sm font-medium text-[#334155] hover:border-[#1e40af]">Menu</summary>
            <nav className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-[#e2e8f0] bg-white p-1.5 shadow-lg">
              {[["student room", "Housing"], ["mobile plan", "Mobile"], ["transport", "Transport"], ["gym", "Gym"], ["streaming", "Streaming"]].map(([q, label]) => (
                <button key={q} onClick={() => goSearch(q)} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[#334155] hover:bg-[#eff6ff] hover:text-[#1e40af]">{label}</button>
              ))}
              <a href="/package-builder" className="mt-1 block rounded-lg border-t border-[#e2e8f0] px-3 py-2 text-sm font-medium text-[#1e40af] hover:bg-[#eff6ff]">Package builder</a>
            </nav>
          </details>
        </div>
      </header>

      {/* Hero - centered, clean */}
      <section className="border-b border-[#e2e8f0] bg-[#f8fafc]">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center md:py-24">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#1e40af]">Student life in Austria & Italy</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            Compare everything.<br />Choose better.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[#64748b]">
            Housing, mobile, transport, gym — all in one place for students in Vienna and Milan.
          </p>

          <form className="mx-auto mt-8 max-w-xl" onSubmit={(e) => { e.preventDefault(); runAiSearch(query); }}>
            <div className="flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white p-1.5 shadow-sm focus-within:border-[#1e40af] focus-within:ring-2 focus-within:ring-[#1e40af]/20">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Student room under 450 in Vienna…"
                className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-[#94a3b8]"
              />
              <button type="submit" disabled={aiLoading} className="rounded-lg bg-[#1e40af] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1e3a8a] disabled:opacity-50">
                {aiLoading ? "…" : "Search"}
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {["Room under €450 Vienna", "Mobile under €15", "Near Bocconi"].map((chip) => (
              <button key={chip} onClick={() => { setQuery(chip); runAiSearch(chip); }} className="rounded-full border border-[#e2e8f0] bg-white px-3 py-1 text-xs text-[#64748b] hover:border-[#1e40af] hover:text-[#1e40af]">
                {chip}
              </button>
            ))}
          </div>

          {aiError && <p className="mt-4 text-sm text-red-600">{aiError}</p>}

          {(interpretation || recs.length > 0) && (
            <div className="mx-auto mt-6 max-w-xl space-y-2 text-left">
              {interpretation && <p className="text-sm text-[#64748b]">{interpretation}</p>}
              {recs.slice(0, 3).map((r) => (
                <a key={r.id} href={r.searchUrl} className="card-hover block rounded-xl border border-[#e2e8f0] bg-white px-4 py-3 hover:border-[#1e40af]">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-medium">{r.name}</p>
                    <p className="text-sm font-semibold text-[#1e40af]">{r.priceLabel}</p>
                  </div>
                  <p className="mt-0.5 text-xs text-[#64748b]">{r.location} · {categoryLabels[r.category]}</p>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories first - quick access */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">Browse by category</h2>
          <p className="mt-1 text-sm text-[#64748b]">Start with what you need most.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {([["housing", "Housing", "Student rooms & residences"], ["mobile", "Mobile", "Data plans for students"], ["transport", "Transport", "Public transport passes"], ["gym", "Gym", "Student fitness options"], ["streaming", "Streaming", "Entertainment deals"]] as const).map(([key, label, desc]) => (
            <button key={key} onClick={() => goSearch(key)} className="card-hover rounded-xl border border-[#e2e8f0] bg-white p-5 text-left hover:border-[#1e40af]">
              <p className="font-semibold">{categoryIcons[key as Category]} {label}</p>
              <p className="mt-1 text-sm text-[#64748b]">{desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Package builder */}
      <section className="border-t border-[#e2e8f0] bg-[#f8fafc]">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Build your package</h2>
              <p className="mt-1 text-sm text-[#64748b]">Combine services and see one monthly total.</p>
            </div>
            <a href="/package-builder" className="text-sm font-medium text-[#1e40af] hover:underline">Full builder →</a>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(categoryLabels) as Category[]).map((cat) => {
              const on = packageCategories.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`rounded-xl border p-4 text-left transition ${on ? "border-[#1e40af] bg-[#eff6ff]" : "border-[#e2e8f0] bg-white hover:border-[#1e40af]"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{categoryIcons[cat]}</span>
                    <span className={`h-5 w-5 rounded-full border-2 ${on ? "border-[#1e40af] bg-[#1e40af]" : "border-[#cbd5e1]"}`} />
                  </div>
                  <p className="mt-3 font-medium">{categoryLabels[cat]}</p>
                  <p className="mt-0.5 text-xs text-[#64748b]">{on ? "Included" : "Add"}</p>
                </button>
              );
            })}
          </div>

          {best && (
            <div className="mt-6 rounded-xl border border-[#e2e8f0] bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-[#1e40af]">Estimated total</p>
              <p className="mt-1 text-2xl font-semibold">{formatPrice(best.totalPrice)} <span className="text-sm font-normal text-[#64748b]">/ month</span></p>
              <p className="mt-1 text-sm text-[#64748b]">{packageCategories.length} services · Score {best.score}</p>
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-[#e2e8f0] py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-[#64748b]">
          <p className="font-semibold text-[#0f172a]">CompareX</p>
          <p className="mt-1">Student comparison for Vienna & Milan</p>
          <div className="mt-3 flex justify-center gap-5 text-xs">
            <a href="/privacy" className="hover:text-[#1e40af]">Privacy</a>
            <a href="/contact" className="hover:text-[#1e40af]">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
