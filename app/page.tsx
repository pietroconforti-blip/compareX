"use client";

import { useMemo, useState } from "react";
import {
  type Category,
  offers,
  categoryLabels,
  categoryIcons,
  detectCategories,
  detectBudgets,
  detectPreferences,
  calculateScore,
  createBundles,
  formatPrice,
  normalizeSearchText,
} from "@/lib/home-data";

export default function Home() {
  const [query, setQuery] = useState("");
  const [packageBudget, setPackageBudget] = useState(700);
  const [packageCategories, setPackageCategories] = useState<Category[]>([
    "housing",
    "mobile",
    "transport",
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
  const best = [...pool].sort((a, b) => b.score - a.score || a.totalPrice - b.totalPrice)[0] ?? null;

  function toggleCategory(category: Category) {
    setPackageCategories((cur) =>
      cur.includes(category) ? cur.filter((x) => x !== category) : [...cur, category],
    );
    setPackageSearchRun(false);
  }

  function goSearch(q: string) {
    window.location.href = `/search?q=${encodeURIComponent(q)}`;
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
              <div className="text-xs text-slate-500">Compare better. Choose better.</div>
            </div>
          </div>
          <details className="relative">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl border border-[#d5dceb] bg-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:border-[#1a3470]">
              Menu
              <span className="flex w-4 flex-col gap-1" aria-hidden>
                <span className="h-0.5 w-4 rounded bg-[#1a3470]" />
                <span className="h-0.5 w-4 rounded bg-[#1a3470]" />
                <span className="h-0.5 w-4 rounded bg-[#1a3470]" />
              </span>
            </summary>
            <nav className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-[#d5dceb] bg-white p-2 shadow-xl">
              {[
                ["student room", "🏠 Housing"],
                ["mobile plan", "📱 Mobile"],
                ["transport", "🚆 Transport"],
                ["gym", "🏋️ Gym"],
                ["streaming", "▶️ Streaming"],
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
            ✦ New look · CompareX 2026
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl">
            Compare smarter.
            <span className="block text-[#2563eb]">Live better.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Housing, mobile, transport, gyms & streaming — compared in one place
            for students in Austria and Italy.
          </p>
          <form
            className="mt-8 flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (query.trim()) goSearch(query.trim());
            }}
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. a room under €500 in Vienna"
              className="flex-1 rounded-2xl border border-[#d5dceb] bg-white px-5 py-3.5 shadow-sm outline-none focus:border-[#2563eb]"
            />
            <button
              type="submit"
              className="rounded-2xl bg-[#1a3470] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#1a3470]/30 hover:bg-[#12254f]"
            >
              Search now →
            </button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Room under €500", "Phone plan under €20", "Gym in Vienna"].map((chip) => (
              <button
                key={chip}
                onClick={() => goSearch(chip)}
                className="rounded-full border border-[#d5dceb] bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:border-[#1a3470] hover:text-[#1a3470]"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        <div className="relative animate-fade-up overflow-hidden rounded-[2rem] border border-[#d5dceb] bg-white shadow-xl shadow-[#1a3470]/10">
          <div className="aspect-[4/3] bg-gradient-to-br from-[#dbe7f8] via-white to-[#eef2f9] p-8">
            <p className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">
              Your next chapter
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight">
              Find a place that feels like home.
            </h2>
            <p className="mt-2 text-slate-600">
              Start with your needs. Compare your options.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                ["🏠", "Housing"],
                ["📱", "Mobile"],
                ["🚆", "Transport"],
                ["🏋️", "Gym"],
              ].map(([icon, label]) => (
                <button
                  key={label}
                  onClick={() => goSearch(label.toLowerCase())}
                  className="card-hover flex items-center gap-2 rounded-2xl border border-[#d5dceb] bg-white px-4 py-3 text-sm font-semibold shadow-sm"
                >
                  <span>{icon}</span> {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-[2rem] border border-[#d5dceb] bg-white/90 p-8 shadow-lg shadow-[#1a3470]/5 md:p-10">
          <p className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">
            Build your package
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">
            Everything you need, one smart choice.
          </h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            Choose categories and set your monthly budget. We score packages by
            value, price and quality.
          </p>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
            <div>
              <p className="mb-3 text-sm font-semibold">Choose your categories</p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(categoryLabels) as Category[]).map((cat) => {
                  const on = packageCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                        on
                          ? "border-[#1a3470] bg-[#1a3470] text-white shadow-md"
                          : "border-[#d5dceb] bg-white text-slate-700 hover:border-[#1a3470]"
                      }`}
                    >
                      {categoryIcons[cat]} {categoryLabels[cat]}
                    </button>
                  );
                })}
              </div>
            </div>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Monthly budget (€)</span>
              <input
                type="number"
                min={100}
                value={packageBudget}
                onChange={(e) => setPackageBudget(Number(e.target.value) || 0)}
                className="w-full rounded-xl border border-[#d5dceb] bg-white px-4 py-3 font-semibold outline-none focus:border-[#2563eb]"
              />
            </label>
          </div>

          <button
            onClick={() => setPackageSearchRun(true)}
            className="mt-8 rounded-2xl bg-[#1a3470] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#1a3470]/30 hover:bg-[#12254f]"
          >
            Build my package
          </button>

          {packageSearchRun && best && (
            <div className="mt-8 rounded-2xl border border-[#c7d7f5] bg-[#f0f5ff] p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#1a3470]">
                Best overall package
              </p>
              <p className="mt-2 text-2xl font-bold">
                {formatPrice(best.totalPrice)}
                <span className="text-base font-medium text-slate-500"> / month</span>
              </p>
              <p className="mt-1 text-sm text-slate-600">Score {best.score}/10</p>
              <ul className="mt-4 space-y-2">
                {best.offers.map((o) => (
                  <li
                    key={o.id}
                    className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm shadow-sm"
                  >
                    <span className="font-medium">
                      {categoryIcons[o.category]} {o.name}
                    </span>
                    <span className="font-semibold text-[#1a3470]">{o.priceLabel}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {packageSearchRun && !best && (
            <p className="mt-6 text-slate-600">
              Select at least two categories to build a package.
            </p>
          )}
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
