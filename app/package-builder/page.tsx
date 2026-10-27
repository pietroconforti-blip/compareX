"use client";

import { useEffect, useMemo, useState } from "react";
import { offers, categoryLabels, categoryIcons, type Category, formatPrice } from "@/lib/home-data";

const categories = Object.keys(categoryLabels) as Category[];

export default function PackageBuilderPage() {
  const [selected, setSelected] = useState<Category[]>(["housing", "mobile", "transport", "gym"]);
  const [budget, setBudget] = useState("");
  const [location, setLocation] = useState<"Vienna" | "Milan">("Vienna");
  const [built, setBuilt] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const incomingBudget = params.get("budget");
    const incomingCategories = params.get("categories");
    const incomingLocation = params.get("location");
    if (incomingBudget !== null) setBudget(incomingBudget);
    if (incomingLocation === "Vienna" || incomingLocation === "Milan") setLocation(incomingLocation);
    if (incomingCategories) {
      const valid = incomingCategories.split(",").filter((item): item is Category => categories.includes(item as Category));
      if (valid.length) setSelected(valid);
    }
    if (incomingBudget !== null || incomingCategories) setBuilt(true);
  }, []);

  const locationOffers = useMemo(() => offers.filter((offer) => {
    const offerLocation = offer.location.toLowerCase();
    if (location === "Vienna") return offerLocation === "vienna" || offerLocation === "austria";
    return offerLocation === "milan" || offerLocation === "italy";
  }), [location]);

  const picks = useMemo(() => selected.map((category) =>
    locationOffers.filter((offer) => offer.category === category).sort((a, b) => a.price - b.price)[0]
  ).filter(Boolean), [selected, locationOffers]);

  const total = picks.reduce((sum, offer) => sum + offer.price, 0);
  const budgetValue = budget === "" ? Number.POSITIVE_INFINITY : Number(budget);

  function toggle(category: Category) {
    setSelected((current) => current.includes(category)
      ? current.filter((item) => item !== category)
      : [...current, category]);
    setBuilt(false);
  }

  return (
    <main className="min-h-screen bg-[#f7f9fd] text-[#0c1222]">
      <header className="border-b border-[#d5dceb] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1a3470] text-lg font-bold text-white">C</span>
            <span><span className="block text-xl font-bold">CompareX</span><span className="block text-xs text-slate-500">Compare better. Choose better.</span></span>
          </a>
          <a href="/" className="rounded-xl border border-[#d5dceb] px-4 py-2 text-sm font-semibold hover:border-[#1a3470]">← Back home</a>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563eb]">Personal package builder</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Build your student life package.</h1>
        <p className="mt-4 max-w-2xl text-lg leading-7 text-slate-600">Choose where you plan to live, then select services and a budget. Your package will only include offers available in that city or country.</p>

        <div className="mt-9 grid gap-8 lg:grid-cols-[1fr_340px]">
          <section className="rounded-3xl border border-[#d5dceb] bg-white p-5 shadow-sm md:p-7">
            <h2 className="text-xl font-bold">1. Where are you going?</h2>
            <p className="mt-1 text-sm text-slate-500">The package will only show offers for your chosen destination.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(["Vienna", "Milan"] as const).map((city) => (
                <button key={city} type="button" aria-pressed={location === city}
                  onClick={() => { setLocation(city); setBuilt(false); }}
                  className={`rounded-xl border px-4 py-3 text-left font-semibold transition ${location === city ? "border-[#1a3470] bg-[#f2f6ff] ring-2 ring-[#d5e2ff]" : "border-[#d5dceb] hover:border-[#1a3470]"}`}>
                  {city === "Vienna" ? "🇦🇹 Vienna, Austria" : "🇮🇹 Milan, Italy"}
                  <span className="mt-1 block text-xs font-normal text-slate-500">{city === "Vienna" ? "Vienna and Austria-wide offers" : "Milan and Italy-wide offers"}</span>
                </button>
              ))}
            </div>
            <h2 className="mt-7 text-xl font-bold">2. Choose your services</h2>
            <p className="mt-1 text-sm text-slate-500">Select at least two categories. Unavailable categories won't be added to your package.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {categories.map((category) => {
                const active = selected.includes(category);
                const categoryOffers = locationOffers.filter((offer) => offer.category === category);
                const sample = categoryOffers[0];
                return (
                  <button key={category} type="button" aria-pressed={active} disabled={categoryOffers.length === 0} onClick={() => toggle(category)}
                    className={`rounded-2xl border p-4 text-left transition ${categoryOffers.length === 0 ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-50" : active ? "border-[#1a3470] bg-[#f2f6ff] ring-2 ring-[#d5e2ff]" : "border-[#d5dceb] hover:border-[#1a3470]"}`}>
                    <span className="flex items-center justify-between">
                      <span className="text-lg font-semibold">{categoryIcons[category]} {categoryLabels[category]}</span>
                      <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${active ? "bg-[#1a3470] text-white" : "bg-slate-100 text-slate-500"}`}>{active ? "✓" : "+"}</span>
                    </span>
                    <span className="mt-2 block text-sm text-slate-500">{sample?.description ?? `No ${categoryLabels[category].toLowerCase()} offers currently listed for ${location}.`}</span>
                    <span className="mt-3 block text-xs font-bold uppercase tracking-wide text-[#1a3470]">{categoryOffers.length === 0 ? "Not available for this destination" : active ? "Included" : "Add service"}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-7 border-t border-slate-100 pt-6">
              <label className="block max-w-xs text-sm font-semibold">Monthly budget (€)
                <input type="number" min="0" value={budget} onChange={(event) => { setBudget(event.target.value); setBuilt(false); }}
                  className="mt-2 w-full rounded-xl border border-[#d5dceb] px-4 py-3 text-base outline-none focus:border-[#2563eb]" />
              </label>
              <button type="button" disabled={selected.length < 2} onClick={() => setBuilt(true)}
                className="mt-5 w-full rounded-xl bg-[#1a3470] px-6 py-4 font-semibold text-white shadow-md transition hover:bg-[#12254f] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
                Build my package →
              </button>
            </div>
          </section>

          <aside className="h-fit rounded-3xl border border-[#d5dceb] bg-white p-6 shadow-sm lg:sticky lg:top-6">
            <p className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Your package</p>
            <h2 className="mt-2 text-2xl font-bold">Monthly overview</h2>
            <p className="mt-1 text-sm text-slate-500">{selected.length} services selected</p>
            <div className="mt-5 space-y-4">
              {picks.map((offer) => <div key={offer.id} className="flex justify-between gap-3 border-b border-slate-100 pb-3">
                <div><p className="text-sm font-semibold">{offer.name}</p><p className="text-xs text-slate-500">{categoryLabels[offer.category]}</p></div>
                <p className="shrink-0 text-sm font-bold">{formatPrice(offer.price)}</p>
              </div>)}
            </div>
            <div className="mt-5 border-t border-slate-200 pt-5">
              <p className="text-sm text-slate-500">Estimated monthly total</p>
              <p className="mt-1 text-3xl font-bold text-[#1a3470]">{formatPrice(total)}<span className="text-sm font-medium text-slate-500"> / month</span></p>
              <p className={`mt-2 text-sm font-semibold ${total <= budgetValue ? "text-emerald-700" : "text-amber-700"}`}>{total <= budgetValue ? "Within your budget" : "Above your budget"}</p>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">Indicative estimates based on sample offers. Confirm prices and availability with each provider.</p>
          </aside>
        </div>

        {built && <section className="mt-8 rounded-3xl border border-[#c7d7f5] bg-white p-6 shadow-sm md:p-8">
          <p className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Package ready</p>
          <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div><h2 className="text-2xl font-bold">Your suggested combination</h2><p className="mt-1 text-slate-600">Estimated total: {formatPrice(total)} / month</p></div>
            <a href={`/checkout?ids=${picks.map((offer) => offer.id).join(",")}`} className="inline-flex items-center justify-center rounded-xl bg-[#1a3470] px-6 py-4 font-semibold text-white hover:bg-[#12254f]">Continue to checkout →</a>
          </div>
          <p className="mt-3 text-xs text-slate-500">Destination: {location}. Creating and editing your package is free. Activation costs €5 once plus €2/month for CompareX; provider services are paid separately.</p>
        </section>}
      </div>
    </main>
  );
}
