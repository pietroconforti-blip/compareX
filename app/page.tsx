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

const HERO_IMG = "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80";

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
    <main className="min-h-screen bg-[#0a0a0b] text-[#f5f5f4]">
      <header className="sticky top-0 z-40 header-glass">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#c9a87c]/40 bg-[#c9a87c]/10 text-sm font-medium text-[#c9a87c]">C</div>
            <div>
              <div className="text-lg font-medium tracking-tight">CompareX</div>
              <div className="text-[11px] text-[#a8a29e]">Studio</div>
            </div>
          </div>
          <details className="relative">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-[#27272a] px-4 py-2 text-sm text-[#a8a29e] hover:border-[#3f3f46] hover:text-[#f5f5f4]">Menu</summary>
            <nav className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-[#27272a] bg-[#141416] p-2 shadow-2xl">
              {[["student room", "Housing"], ["mobile plan", "Mobile"], ["transport", "Transport"], ["gym", "Gym"], ["streaming", "Streaming"]].map(([q, label]) => (
                <button key={q} onClick={() => goSearch(q)} className="block w-full rounded-xl px-3 py-2.5 text-left text-sm text-[#a8a29e] hover:bg-[#1c1c1f] hover:text-[#f5f5f4]">{label}</button>
              ))}
              <a href="/package-builder" className="mt-1 block rounded-xl border-t border-[#27272a] px-3 py-2.5 text-sm text-[#c9a87c] hover:bg-[#1c1c1f]">Package builder</a>
            </nav>
          </details>
        </div>
      </header>

      <section className="relative mx-auto max-w-6xl px-6 pb-20 pt-12 lg:pt-20">
        <div className="grid items-end gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="animate-fade-up">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9a87c]">Vienna · Milan</p>
            <h1 className="mt-4 text-5xl font-medium leading-[1.05] tracking-tight md:text-7xl">
              Find your place.<br />
              <span className="text-[#a8a29e]">Build your life.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-8 text-[#a8a29e]">
              Student housing, mobile, transport and more — compared in one quiet place.
            </p>

            <form className="mt-10 max-w-lg" onSubmit={(e) => { e.preventDefault(); runAiSearch(query); }}>
              <div className="flex items-center gap-2 rounded-full border border-[#27272a] bg-[#141416] px-2 py-1.5 focus-within:border-[#c9a87c]/50">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="A quiet room under 450 in Vienna…"
                  className="flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-[#57534e]"
                />
                <button type="submit" disabled={aiLoading} className="rounded-full bg-[#c9a87c] px-5 py-2.5 text-sm font-medium text-[#0a0a0b] hover:bg-[#d4c09a] disabled:opacity-50">
                  {aiLoading ? "…" : "Ask"}
                </button>
              </div>
            </form>

            <div className="mt-5 flex flex-wrap gap-2">
              {["Room under €450 Vienna", "Mobile under €15", "Near Bocconi"].map((chip) => (
                <button key={chip} onClick={() => { setQuery(chip); runAiSearch(chip); }} className="rounded-full border border-[#27272a] px-3 py-1 text-xs text-[#a8a29e] hover:border-[#3f3f46] hover:text-[#f5f5f4]">
                  {chip}
                </button>
              ))}
            </div>

            {aiError && <p className="mt-4 text-sm text-red-400">{aiError}</p>}

            {(interpretation || recs.length > 0) && (
              <div className="mt-8 space-y-3">
                {interpretation && <p className="text-sm text-[#a8a29e]">{interpretation}</p>}
                {recs.slice(0, 3).map((r) => (
                  <a key={r.id} href={r.searchUrl} className="card-hover block rounded-2xl border border-[#27272a] bg-[#141416] px-4 py-3 hover:bg-[#1c1c1f]">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="font-medium">{r.name}</p>
                      <p className="text-sm text-[#c9a87c]">{r.priceLabel}</p>
                    </div>
                    <p className="mt-0.5 text-xs text-[#a8a29e]">{r.location} · {categoryLabels[r.category]}</p>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="relative animate-fade-up overflow-hidden rounded-[1.75rem] border border-[#27272a]">
            <div className="aspect-[4/5] min-h-[420px]">
              <img src={HERO_IMG} alt="Student apartment interior" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-xs uppercase tracking-wider text-[#c9a87c]">Featured</p>
                <p className="mt-1 text-lg font-medium">Spaces that feel like yours.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#c9a87c]">Package</p>
            <h2 className="mt-2 text-3xl font-medium tracking-tight">One monthly total.</h2>
          </div>
          <a href="/package-builder" className="text-sm text-[#c9a87c] hover:underline">Open builder →</a>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(categoryLabels) as Category[]).map((cat) => {
            const on = packageCategories.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`rounded-2xl border p-5 text-left transition ${on ? "border-[#c9a87c]/40 bg-[#c9a87c]/5" : "border-[#27272a] bg-[#141416] hover:border-[#3f3f46]"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{categoryIcons[cat]}</span>
                  <span className={`h-5 w-5 rounded-full border ${on ? "border-[#c9a87c] bg-[#c9a87c]" : "border-[#3f3f46]"}`} />
                </div>
                <p className="mt-4 font-medium">{categoryLabels[cat]}</p>
                <p className="mt-1 text-sm text-[#a8a29e]">{on ? "Included" : "Add to package"}</p>
              </button>
            );
          })}
        </div>

        {best && (
          <div className="mt-8 rounded-2xl border border-[#27272a] bg-[#141416] p-6">
            <p className="text-xs uppercase tracking-wider text-[#c9a87c]">Estimated</p>
            <p className="mt-1 text-3xl font-medium">{formatPrice(best.totalPrice)} <span className="text-base text-[#a8a29e]">/ month</span></p>
            <p className="mt-2 text-sm text-[#a8a29e]">Score {best.score} · {packageCategories.length} services</p>
          </div>
        )}
      </section>

      <footer className="border-t border-[#27272a] py-10">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-[#a8a29e]">
          <p className="font-medium text-[#f5f5f4]">CompareX Studio</p>
          <p className="mt-1">Vienna & Milan · Student life, simplified</p>
          <div className="mt-4 flex justify-center gap-6 text-xs">
            <a href="/privacy" className="hover:text-[#f5f5f4]">Privacy</a>
            <a href="/contact" className="hover:text-[#f5f5f4]">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
