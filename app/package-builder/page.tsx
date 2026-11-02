"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { offers as baseOffers, categoryLabels, categoryIcons, type Category, type Offer, formatPrice } from "@/lib/home-data";

const categories = Object.keys(categoryLabels) as Category[];

export default function PackageBuilderPage() {
  const [selected, setSelected] = useState<Category[]>(["housing", "mobile", "transport", "gym"]);
  const [catalogue, setCatalogue] = useState<Offer[]>(baseOffers);
  const [catalogueStatus, setCatalogueStatus] = useState("Loading available offers…");
  const [budget, setBudget] = useState("");
  const [location, setLocation] = useState<"Vienna" | "Milan">("Vienna");
  const [built, setBuilt] = useState(false);
  const [chosenOffers, setChosenOffers] = useState<Partial<Record<Category, string>>>({});
  const resultRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (built) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [built]);

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

  useEffect(() => {
    let cancelled = false;
    async function loadCatalogue() {
      const endpoints = ["/api/housing", "/api/offers", "/api/transport", "/api/gyms", "/api/streaming"];
      const responses = await Promise.all(endpoints.map(async (url) => {
        try { const response = await fetch(url, { cache: "no-store" }); return response.ok ? await response.json() : null; }
        catch { return null; }
      }));
      const [housingData, mobileData, transportData, gymData, streamingData] = responses;
      const expanded: Offer[] = [];
      let id = 1000;
      const add = (item: Omit<Offer, "id">) => expanded.push({ ...item, id: id++ });

      for (const item of housingData?.offers ?? []) {
        const raw = Number(item.priceValue);
        if (!Number.isFinite(raw) || raw <= 0) continue;
        const price = item.pricePeriod === "year" ? raw / 12 : raw;
        const city = String(item.city ?? "");
        add({ name: String(item.property ?? item.name ?? "Housing offer"), category: "housing", price, priceLabel: String(item.priceLabel ?? `€${price.toFixed(0)}/month`), location: city || String(item.country ?? ""), quality: 7.5, flexibility: 7, studentFriendly: true, transport: 7, description: String(item.availability ?? item.roomType ?? "Check current price and availability with the provider."), tags: ["housing", String(item.country ?? "").toLowerCase(), city.toLowerCase()], sourceUrl: typeof item.officialUrl === "string" ? item.officialUrl : undefined });
      }
      for (const item of mobileData?.offers ?? []) {
        const price = Number(item.monthlyPrice);
        if (!Number.isFinite(price) || price <= 0) continue;
        add({ name: `${String(item.provider ?? "Mobile provider")} · ${String(item.plan ?? "Mobile plan")}`, category: "mobile", price, priceLabel: `€${price.toFixed(2)}/month`, location: String(item.country ?? ""), quality: 7.5, flexibility: 7.5, studentFriendly: true, transport: 5, description: `${Number(item.dataGB) || 0} GB data · ${String(item.contract ?? "Check current terms")}`, tags: ["mobile", String(item.country ?? "").toLowerCase()], sourceUrl: typeof item.officialUrl === "string" ? item.officialUrl : undefined });
      }
      for (const [data, category] of [[transportData, "transport"], [gymData, "gym"], [streamingData, "streaming"]] as const) {
        for (const item of data?.offers ?? []) {
          const raw = Number(item.priceValue);
          if (!Number.isFinite(raw) || raw <= 0) continue;
          const price = item.pricePeriod === "year" ? raw / 12 : raw;
          add({ name: `${String(item.provider ?? "")} ${String(item.name ?? "offer")}`.trim(), category, price, priceLabel: String(item.priceLabel ?? `€${price.toFixed(0)}/month`), location: String(item.city ?? item.country ?? ""), quality: 7.5, flexibility: 7, studentFriendly: true, transport: category === "transport" ? 10 : 5, description: String(item.details ?? "Check current price and conditions with the provider."), tags: [category, String(item.country ?? "").toLowerCase(), String(item.city ?? "").toLowerCase()], sourceUrl: typeof item.url === "string" ? item.url : undefined });
        }
      }
      if (!cancelled) {
        setCatalogue([...baseOffers, ...expanded]);
        setCatalogueStatus(`${expanded.length} additional offers loaded. Prices and availability are indicative.`);
      }
    }
    loadCatalogue().catch(() => { if (!cancelled) setCatalogueStatus("Showing the core catalogue. Some provider lists could not be loaded."); });
    return () => { cancelled = true; };
  }, []);

  const locationOffers = useMemo(() => catalogue.filter((offer) => {
    const place = offer.location.toLowerCase();
    return location === "Vienna"
      ? place.includes("vienna") || place.includes("austria") || place === "all austria"
      : place.includes("milan") || place.includes("italy") || place === "all italy";
  }), [location, catalogue]);

  const offersByCategory = useMemo(() => Object.fromEntries(categories.map((category) => [
    category, locationOffers.filter((offer) => offer.category === category).sort((a, b) => a.price - b.price),
  ])) as Record<Category, Offer[]>, [locationOffers]);

  const picks = useMemo(() => selected.map((category) => {
    const alternatives = offersByCategory[category] ?? [];
    return alternatives.find((offer) => offer.name === chosenOffers[category]) ?? alternatives[0];
  }).filter((offer): offer is Offer => Boolean(offer)), [selected, offersByCategory, chosenOffers]);

  const total = picks.reduce((sum, offer) => sum + offer.price, 0);
  const budgetValue = budget === "" ? Number.POSITIVE_INFINITY : Number(budget);
  const withinBudget = total <= budgetValue;
  const enoughOffers = picks.length >= 2;

  function toggle(category: Category) {
    setSelected((current) => current.includes(category) ? current.filter((item) => item !== category) : [...current, category]);
    setBuilt(false);
  }

  return (
    <main className="min-h-screen bg-[#f7f9fd] text-[#10182b]">
      <header className="border-b border-[#e1e7f1] bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <a href="/" className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#17336f] text-lg font-bold text-white">C</span><span><span className="block text-xl font-bold">CompareX</span><span className="block text-xs text-slate-500">Your life. One package.</span></span></a>
          <a href="/" className="text-sm font-semibold text-slate-500 hover:text-[#17336f]">← Home</a>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-9 md:py-12">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-wider text-[#2860c8]">Your personalised package</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Let’s put your package together.</h1>
          <p className="mt-2 text-slate-600">AI has brought your needs here. Adjust anything you want, then review your monthly total.</p>
          <p className="mt-2 text-xs text-slate-400" aria-live="polite">{catalogueStatus}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_330px]">
          <section className="space-y-5">
            <div className="rounded-2xl border border-[#e1e7f1] bg-white p-5 md:p-6">
              <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold">1. Your destination</h2><span className="text-xs font-semibold text-[#2860c8]">Step 1 of 3</span></div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {(["Vienna", "Milan"] as const).map((city) => <button key={city} type="button" aria-pressed={location === city} onClick={() => { setLocation(city); setBuilt(false); }} className={`rounded-xl border px-4 py-3 text-left font-semibold transition ${location === city ? "border-[#2860c8] bg-[#f0f5ff] ring-2 ring-[#dce8ff]" : "border-[#e1e7f1] hover:border-[#2860c8]"}`}>{city === "Vienna" ? "🇦🇹 Vienna" : "🇮🇹 Milan"}<span className="mt-1 block text-xs font-normal text-slate-500">{city === "Vienna" ? "Austria" : "Italy"}</span></button>)}
              </div>
              <label className="mt-4 block text-sm font-semibold">Your monthly budget
                <div className="mt-2 flex items-center rounded-xl border border-[#e1e7f1] px-4 focus-within:border-[#2860c8]"><span className="text-slate-400">€</span><input type="number" min="0" value={budget} onChange={(event) => { setBudget(event.target.value); setBuilt(false); }} placeholder="e.g. 900" className="w-full bg-transparent px-2 py-3 font-semibold outline-none" /><span className="text-xs text-slate-400">/ month</span></div>
              </label>
            </div>

            <div className="rounded-2xl border border-[#e1e7f1] bg-white p-5 md:p-6">
              <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold">2. Services in your package</h2><span className="text-xs font-semibold text-[#2860c8]">Step 2 of 3</span></div>
              <p className="mt-1 text-sm text-slate-500">Choose what you need. We’ll suggest the lowest listed option in each category.</p>
              <div className="mt-4 space-y-2">
                {categories.map((category) => {
                  const active = selected.includes(category);
                  const options = offersByCategory[category] ?? [];
                  return <button key={category} type="button" disabled={options.length === 0} aria-pressed={active} onClick={() => toggle(category)} className={`flex w-full items-center justify-between gap-3 rounded-xl border p-4 text-left transition ${options.length === 0 ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-50" : active ? "border-[#2860c8] bg-[#f3f7ff]" : "border-[#e1e7f1] hover:border-[#2860c8]"}`}>
                    <span className="flex min-w-0 items-center gap-3"><span className="text-2xl">{categoryIcons[category]}</span><span className="min-w-0"><span className="block font-semibold">{categoryLabels[category]}</span><span className="block text-xs text-slate-500">{options.length ? `${options.length} listed option${options.length === 1 ? "" : "s"}` : `No listed options for ${location}`}</span></span></span>
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${active ? "bg-[#17336f] text-white" : "bg-slate-100 text-slate-500"}`}>{active ? "✓" : "+"}</span>
                  </button>;
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-[#e1e7f1] bg-white p-5 md:p-6">
              <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold">3. Review your package</h2><span className="text-xs font-semibold text-[#2860c8]">Step 3 of 3</span></div>
              <p className="mt-1 text-sm text-slate-500">You can change the suggested provider for each service.</p>
              <div className="mt-4 space-y-4">
                {picks.map((offer) => {
                  const alternatives = offersByCategory[offer.category] ?? [];
                  return <div key={offer.category} className="rounded-xl border border-[#e1e7f1] p-4">
                    <div className="flex items-center justify-between gap-3"><p className="font-semibold">{categoryIcons[offer.category]} {categoryLabels[offer.category]}</p><p className="shrink-0 font-bold text-[#17336f]">{formatPrice(offer.price)}<span className="text-xs font-normal text-slate-400">/mo</span></p></div>
                    <select value={offer.name} onChange={(event) => { setChosenOffers((current) => ({ ...current, [offer.category]: event.target.value })); setBuilt(false); }} className="mt-2 w-full rounded-lg border border-[#e1e7f1] bg-white px-3 py-2 text-sm font-medium">
                      {alternatives.map((option) => <option key={`${option.id}-${option.name}`} value={option.name}>{option.name} · {formatPrice(option.price)}/mo</option>)}
                    </select>
                    <p className="mt-2 text-xs text-slate-500">{offer.description}</p>
                    {offer.sourceUrl && <a href={offer.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-xs font-semibold text-[#2860c8] underline underline-offset-4">Check provider details ↗</a>}
                  </div>;
                })}
                {selected.length > picks.length && <p className="text-sm text-amber-700">Some selected services have no listed offers for this destination. Remove them or choose another destination.</p>}
              </div>
              <button type="button" disabled={!enoughOffers} onClick={() => setBuilt(true)} className="mt-5 w-full rounded-xl bg-[#17336f] px-5 py-4 font-bold text-white transition hover:bg-[#102653] disabled:cursor-not-allowed disabled:opacity-50">Confirm my package →</button>
            </div>
          </section>

          <aside className="h-fit rounded-2xl border border-[#dce4f2] bg-white p-5 shadow-sm lg:sticky lg:top-5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#2860c8]">Your package</p>
            <h2 className="mt-2 text-xl font-bold">Monthly total</h2>
            <p className="mt-1 text-sm text-slate-500">{picks.length} services included · {location}</p>
            <div className="mt-5 space-y-3">
              {picks.map((offer) => <div key={offer.category} className="flex justify-between gap-3 border-b border-slate-100 pb-3 text-sm"><span className="text-slate-600">{categoryLabels[offer.category]}</span><span className="shrink-0 font-semibold">{formatPrice(offer.price)}</span></div>)}
            </div>
            <div className="mt-5 border-t border-slate-200 pt-4"><p className="text-sm text-slate-500">Estimated monthly cost</p><p className="mt-1 text-3xl font-bold text-[#17336f]">{formatPrice(total)}<span className="text-sm font-medium text-slate-400"> / month</span></p><p className={`mt-2 text-sm font-semibold ${withinBudget ? "text-emerald-700" : "text-amber-700"}`}>{budget === "" ? "Add a budget to compare" : withinBudget ? "Within your budget" : `€${(total - budgetValue).toFixed(2)} above budget`}</p></div>
            {built && <div className="mt-5 rounded-xl bg-[#f0f5ff] p-4"><p className="font-bold text-[#17336f]">Your package is ready to review</p><p className="mt-1 text-sm text-slate-600">Next: checkout and payment.</p><button type="button" disabled className="mt-3 w-full cursor-not-allowed rounded-lg bg-slate-300 px-4 py-3 text-sm font-bold text-slate-600">Secure payment coming soon</button><p className="mt-2 text-xs text-slate-500">Combined checkout is not connected yet. No payment will be taken.</p></div>}
            <p className="mt-4 text-xs leading-5 text-slate-400">Prices are indicative catalogue estimates, not live quotes. Confirm terms and availability with providers.</p>
          </aside>
        </div>
      </div>
    </main>
  );
}
