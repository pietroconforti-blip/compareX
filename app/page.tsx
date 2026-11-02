"use client";

import { useMemo, useState } from "react";
import type { Category } from "@/lib/home-data";

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

const categoryNames: Record<Category, string> = {
  housing: "Housing",
  mobile: "Mobile",
  transport: "Transport",
  gym: "Gym",
  streaming: "Streaming",
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [budget, setBudget] = useState("900");
  const [location, setLocation] = useState<"Vienna" | "Milan">("Vienna");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [recs, setRecs] = useState<AiRec[]>([]);
  const [searched, setSearched] = useState(false);

  const suggestedCategories = useMemo(() => {
    const fromAi = [...new Set(recs.map((item) => item.category))];
    return fromAi.length >= 2 ? fromAi : (["housing", "mobile", "transport", "gym"] as Category[]);
  }, [recs]);

  async function startWithAi(event?: React.FormEvent) {
    event?.preventDefault();
    if (!query.trim()) {
      setAiError("Tell us what you need first.");
      return;
    }
    setAiLoading(true);
    setAiError("");
    setRecs([]);
    setInterpretation("");
    setSearched(false);
    try {
      const response = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI search failed. Please try again.");
      setInterpretation(data.interpretation || "");
      setRecs(data.recommendations || []);
      setSearched(true);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setAiLoading(false);
    }
  }

  function buildPackage() {
    const params = new URLSearchParams({
      budget,
      categories: suggestedCategories.join(","),
      location,
    });
    window.location.assign("/package-builder?" + params.toString());
  }

  return (
    <main className="min-h-screen bg-[#f7f9fd] text-[#10182b]">
      <header className="border-b border-[#e1e7f1] bg-white/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <a href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#17336f] text-lg font-bold text-white">C</span>
            <span><span className="block text-xl font-bold">CompareX</span><span className="block text-xs text-slate-500">Your life. One package.</span></span>
          </a>
          <a href="/contact" className="text-sm font-semibold text-slate-600 hover:text-[#17336f]">Help</a>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-5 pb-16 pt-14 md:pt-20">
        <div className="text-center">
          <span className="inline-flex rounded-full bg-[#eaf0ff] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#17336f]">Your AI package assistant</span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">Everything you need.<br /><span className="text-[#2860c8]">One simple package.</span></h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">Tell us about your life, your destination and your budget. AI helps put the right student services together.</p>
        </div>

        <div className="mt-10 rounded-3xl border border-[#dce4f2] bg-white p-5 shadow-xl shadow-[#17336f]/8 md:p-8">
          <form onSubmit={startWithAi}>
            <label className="block text-sm font-bold">1. What do you need?</label>
            <textarea
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              rows={3}
              placeholder="For example: I'm moving to Vienna to study. I need a room, a cheap phone plan, public transport and a gym. I want to stay within my budget."
              className="mt-2 w-full resize-y rounded-2xl border border-[#dce4f2] bg-[#fbfcff] px-4 py-4 text-base outline-none transition focus:border-[#2860c8] focus:ring-2 focus:ring-[#2860c8]/10"
            />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-bold">2. Where are you going?
                <select value={location} onChange={(event) => setLocation(event.target.value as "Vienna" | "Milan")} className="mt-2 w-full rounded-xl border border-[#dce4f2] bg-white px-4 py-3 font-medium outline-none focus:border-[#2860c8]">
                  <option value="Vienna">Vienna, Austria</option>
                  <option value="Milan">Milan, Italy</option>
                </select>
              </label>
              <label className="block text-sm font-bold">3. Monthly budget
                <div className="mt-2 flex items-center rounded-xl border border-[#dce4f2] px-4 focus-within:border-[#2860c8]">
                  <span className="text-slate-500">€</span>
                  <input type="number" min="0" value={budget} onChange={(event) => setBudget(event.target.value)} className="w-full bg-transparent px-2 py-3 font-semibold outline-none" />
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
              </label>
            </div>
            <button type="submit" disabled={aiLoading || !query.trim()} className="mt-6 w-full rounded-xl bg-[#17336f] px-6 py-4 text-base font-bold text-white shadow-lg transition hover:bg-[#102653] disabled:cursor-not-allowed disabled:opacity-50">
              {aiLoading ? "AI is understanding your needs…" : "Start with AI →"}
            </button>
            {aiError && <p role="alert" className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{aiError}</p>}
          </form>

          {searched && (
            <div className="mt-7 border-t border-slate-100 pt-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#2860c8]">Your AI starting point</p>
              {interpretation && <p className="mt-2 text-sm leading-6 text-slate-600">{interpretation}</p>}
              {recs.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {recs.map((item) => (
                    <div key={item.id} className="flex flex-col justify-between gap-2 rounded-xl border border-[#e1e7f1] p-4 sm:flex-row sm:items-center">
                      <div><p className="text-xs font-semibold uppercase text-slate-500">{categoryNames[item.category]} · {item.location}</p><p className="mt-1 font-bold">{item.name}</p><p className="mt-1 text-sm text-slate-600">{item.description}</p></div>
                      <div className="shrink-0 font-bold text-[#17336f]">{item.priceLabel}</div>
                    </div>
                  ))}
                </div>
              ) : <p className="mt-3 text-sm text-slate-600">AI understood your request. Continue to build your package and choose the available options.</p>}
              <button type="button" onClick={buildPackage} className="mt-5 w-full rounded-xl bg-[#2860c8] px-6 py-4 font-bold text-white transition hover:bg-[#1f4fa8]">Build my package →</button>
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            ["01", "Start with AI", "Tell us what you need."],
            ["02", "Build your package", "Compare services and prices."],
            ["03", "Review & pay", "One clear total before checkout."],
          ].map(([number, title, description]) => (
            <div key={number} className="rounded-2xl border border-[#e1e7f1] bg-white p-4">
              <span className="text-xs font-bold text-[#2860c8]">{number}</span>
              <p className="mt-2 font-bold">{title}</p>
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-center text-xs leading-5 text-slate-400">CompareX currently provides package comparisons and indicative catalogue prices. A single combined checkout and payment are not active yet; provider prices and availability must be confirmed.</p>
      </section>
    </main>
  );
}
