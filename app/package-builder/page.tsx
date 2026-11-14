"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { offers as baseOffers, categoryLabels, categoryIcons, type Category, type Offer, formatPrice } from "@/lib/home-data";
import { createClient } from "@/lib/supabase";

const categories = Object.keys(categoryLabels) as Category[];

type SavedOffer = { id: string; title: string; provider: string; price: string; href: string; category: string; badge: string; };

export default function PackageBuilderPage() {
  const [selected, setSelected] = useState<Category[]>(["housing", "mobile", "transport", "gym"]);
  const [catalogue, setCatalogue] = useState<Offer[]>(baseOffers);
  const [catalogueStatus, setCatalogueStatus] = useState("Loading expanded online catalogue…");
  const [budget, setBudget] = useState("");
  const [location, setLocation] = useState<"Vienna" | "Milan">("Vienna");
  const [built, setBuilt] = useState(false);
  const [chosenOffers, setChosenOffers] = useState<Partial<Record<Category, string>>>({});
  const [savedOffers, setSavedOffers] = useState<SavedOffer[]>([]);
  const resultRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (built) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [built]);

  useEffect(() => {
    try {
      const parsed = JSON.parse(window.localStorage.getItem("comparex-selected-offers") || "[]");
      if (Array.isArray(parsed)) setSavedOffers(parsed);
    } catch {
      setSavedOffers([]);
    }
  }, []);

  function removeSavedOffer(id: string) {
    const next = savedOffers.filter((item) => item.id !== id);
    setSavedOffers(next);
    window.localStorage.setItem("comparex-selected-offers", JSON.stringify(next));
  }

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
    async function loadExpandedCatalogue() {
      const requests = [
        fetch("/api/housing", { cache: "no-store" }).then((r) => r.ok ? r.json() : null),
        fetch("/api/offers", { cache: "no-store" }).then((r) => r.ok ? r.json() : null),
        fetch("/api/transport", { cache: "no-store" }).then((r) => r.ok ? r.json() : null),
        fetch("/api/gyms", { cache: "no-store" }).then((r) => r.ok ? r.json() : null),
        fetch("/api/streaming", { cache: "no-store" }).then((r) => r.ok ? r.json() : null),
      ];
      const [housingData, mobileData, transportData, gymData, streamingData] =
        await Promise.all(requests.map((request) => request.catch(() => null)));
      const expanded: Offer[] = [];
      let id = 1000;
      const add = (item: Omit<Offer, "id">) => expanded.push({ ...item, id: id++ });

      for (const o of housingData?.offers ?? []) {
        const rawPrice = Number(o.priceValue);
        if (!Number.isFinite(rawPrice) || rawPrice <= 0) continue;
        const price = o.pricePeriod === "year" ? rawPrice / 12 : rawPrice;
        const city = String(o.city ?? "");
        add({
          name: String(o.property ?? o.name ?? "Housing offer"),
          category: "housing",
          price,
          priceLabel: String(o.priceLabel ?? `€${price.toFixed(0)}/month`),
          location: city || String(o.country ?? ""),
          quality: 7.5,
          flexibility: 7,
          studentFriendly: true,
          transport: 7,
          description: String(o.availability ?? o.roomType ?? "Check current price and availability with the provider."),
          tags: ["housing", String(o.country ?? "").toLowerCase(), city.toLowerCase()],
          sourceUrl: typeof o.officialUrl === "string" ? o.officialUrl : undefined,
        });
      }

      for (const o of mobileData?.offers ?? []) {
        const price = Number(o.monthlyPrice);
        if (!Number.isFinite(price) || price <= 0) continue;
        add({
          name: `${String(o.provider ?? "Mobile provider")} · ${String(o.plan ?? "Mobile plan")}`,
          category: "mobile",
          price,
          priceLabel: `€${price.toFixed(2)}/month`,
          location: String(o.country ?? ""),
          quality: 7.5,
          flexibility: 7.5,
          studentFriendly: true,
          transport: 5,
          description: `${Number(o.dataGB) || 0} GB data · ${String(o.contract ?? "Check current terms")}`,
          tags: ["mobile", String(o.country ?? "").toLowerCase()],
          sourceUrl: typeof o.officialUrl === "string" ? o.officialUrl : undefined,
        });
      }

      for (const [data, category] of [[transportData, "transport"], [gymData, "gym"], [streamingData, "streaming"]] as const) {
        for (const o of data?.offers ?? []) {
          const rawPrice = Number(o.priceValue);
          if (!Number.isFinite(rawPrice) || rawPrice <= 0) continue;
          const price = o.pricePeriod === "year" ? rawPrice / 12 : rawPrice;
          add({
            name: `${String(o.provider ?? "")} ${String(o.name ?? "offer")}`.trim(),
            category,
            price,
            priceLabel: String(o.priceLabel ?? `€${price.toFixed(0)}/month`),
            location: String(o.city ?? o.country ?? ""),
            quality: 7.5,
            flexibility: 7,
            studentFriendly: true,
            transport: category === "transport" ? 10 : 5,
            description: String(o.details ?? "Check current price and conditions with the provider."),
            tags: [category, String(o.country ?? "").toLowerCase(), String(o.city ?? "").toLowerCase()],
            sourceUrl: typeof o.url === "string" ? o.url : undefined,
          });
        }
      }

      if (!cancelled) {
        setCatalogue([...baseOffers, ...expanded]);
        setCatalogueStatus(`Expanded catalogue loaded: ${expanded.length} additional offers and listings. Prices and availability must be confirmed with providers.`);
      }
    }
    loadExpandedCatalogue().catch(() => {
      if (!cancelled) setCatalogueStatus("Showing the core catalogue. Some online provider lists could not be loaded.");
    });
    return () => { cancelled = true; };
  }, []);

  const locationOffers = useMemo(() => catalogue.filter((offer) => {
    const offerLocation = offer.location.toLowerCase();
    if (location === "Vienna") {
      return offerLocation.includes("vienna") || offerLocation.includes("austria") || offerLocation === "all austria";
    }
    return offerLocation.includes("milan") || offerLocation.includes("italy") || offerLocation === "all italy";
  }), [location, catalogue]);

  const offersByCategory = useMemo(() => Object.fromEntries(categories.map((category) => [
    category,
    locationOffers.filter((offer) => offer.category === category).sort((a, b) => a.price - b.price),
  ])) as Record<Category, Offer[]>, [locationOffers]);

  const automaticPicks = useMemo(() => {
    // Evaluate complete combinations and rank affordable ones by quality.
    const options = selected.map((category) => {
      const all = offersByCategory[category] ?? [];
      const byQuality = [...all].sort((a, b) =>
        (b.quality + b.flexibility * 0.25 + (b.studentFriendly ? 0.35 : 0)) -
        (a.quality + a.flexibility * 0.25 + (a.studentFriendly ? 0.35 : 0))
      ).slice(0, 8);
      const byPrice = [...all].sort((a, b) => a.price - b.price).slice(0, 5);
      return [...new Map([...byQuality, ...byPrice].map((offer) => [offer.id, offer])).values()];
    });

    if (options.some((items) => items.length === 0)) return [] as Offer[];

    const combinations: { items: Offer[]; total: number; score: number }[] = [];
    const hasBudget = budget.trim() !== "" && Number.isFinite(Number(budget)) && Number(budget) > 0;
    const limit = hasBudget ? Number(budget) : Number.POSITIVE_INFINITY;

    function visit(index: number, items: Offer[], total: number, score: number) {
      if (index === options.length) {
        combinations.push({ items, total, score });
        return;
      }
      for (const offer of options[index]) {
        visit(index + 1, [...items, offer], total + offer.price,
          score + offer.quality + offer.flexibility * 0.25 + (offer.studentFriendly ? 0.35 : 0));
      }
    }
    visit(0, [], 0, 0);

    const affordable = combinations
      .filter((combination) => combination.total <= limit)
      .sort((a, b) => b.score - a.score || a.total - b.total);
    const fallback = combinations.sort((a, b) => a.total - b.total || b.score - a.score);
    return (affordable[0] ?? fallback[0])?.items ?? [];
  }, [selected, offersByCategory, budget]);

  const picks = useMemo(() => selected.map((category) => {
    const alternatives = offersByCategory[category] ?? [];
    return alternatives.find((offer) => offer.name === chosenOffers[category]) ??
      automaticPicks.find((offer) => offer.category === category);
  }).filter((offer): offer is Offer => Boolean(offer)), [selected, offersByCategory, chosenOffers, automaticPicks]);

  // Keep the user's category choices when changing destination. The online
  // catalogue loads asynchronously; filtering selections before it finishes can
  // remove valid categories and disable Build.

  const total = picks.reduce((sum, offer) => sum + offer.price, 0);
  const budgetValue = budget === "" ? Number.POSITIVE_INFINITY : Number(budget);
  const catalogueLoading = catalogueStatus.startsWith("Loading");
  const unavailableSelected = selected.filter((category) => (offersByCategory[category] ?? []).length === 0);
  const validBudget = budget.trim() === "" || (Number.isFinite(Number(budget)) && Number(budget) > 0);

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
          <div className="flex gap-2"><a href="/account" className="rounded-xl border border-[#d5dceb] px-4 py-2 text-sm font-semibold hover:border-[#1a3470]">My profile</a><a href="/" className="rounded-xl border border-[#d5dceb] px-4 py-2 text-sm font-semibold hover:border-[#1a3470]">← Back home</a></div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">
        {savedOffers.length > 0 && <section id="saved-offers" className="mb-10 rounded-3xl border border-[#d5dceb] bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-xs font-bold uppercase tracking-wider text-[#203b72]">Your saved selections</p><h2 className="mt-2 text-2xl font-bold">My package</h2><p className="mt-1 text-sm text-slate-500">{savedOffers.length} offer{savedOffers.length === 1 ? "" : "s"} saved from the offer details pages.</p></div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {savedOffers.map((item) => <article key={item.id} className="rounded-2xl border border-[#e2e8f0] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.badge} · {item.provider}</p>
              <h3 className="mt-2 font-bold">{item.title}</h3>
              <p className="mt-2 text-lg font-bold text-[#203b72]">{item.price}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href={item.href} target="_blank" rel="noreferrer" className="rounded-lg bg-[#203b72] px-3 py-2 text-xs font-bold text-white">Continue to provider ↗</a>
                <button type="button" onClick={() => removeSavedOffer(item.id)} className="rounded-lg border border-[#d5dceb] px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Remove</button>
              </div>
            </article>)}
          </div>
        </section>}
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563eb]">Personal package builder</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Build your student life package.</h1>
        <p className="mt-4 max-w-2xl text-lg leading-7 text-slate-600">Choose where you plan to live, then select services and a budget. Your package will only include offers available in that city or country.</p>

        {!built && <div className="mt-9 grid gap-8 lg:grid-cols-[1fr_340px]">
          <section className="rounded-3xl border border-[#d5dceb] bg-white p-5 shadow-sm md:p-7">
            <h2 className="text-xl font-bold">1. Where are you going?</h2>
            <p className="mt-1 text-sm text-slate-500">The package will only show offers for your chosen destination.</p>
            <p className="mt-2 text-xs text-slate-500" aria-live="polite">{catalogueStatus}</p>
            <a href="/integrations" className="mt-2 inline-flex text-sm font-semibold text-[#1a3470] underline underline-offset-4 hover:text-[#2563eb]">Explore more providers and official integrations →</a>
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
            <div id="provider-options" className="mt-5 grid gap-3 sm:grid-cols-2">
              {categories.map((category) => {
                const active = selected.includes(category);
                const categoryOffers = locationOffers.filter((offer) => offer.category === category);
                const sample = categoryOffers[0];
                return (
                  <button key={category} type="button" aria-pressed={active} disabled={categoryOffers.length === 0 && !active} onClick={() => toggle(category)}
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
                <input type="number" min="0" value={budget} onChange={(event) => { setBudget(event.target.value); }}
                  className="mt-2 w-full rounded-xl border border-[#d5dceb] px-4 py-3 text-base outline-none focus:border-[#2563eb]" />
              </label>
              {catalogueLoading && <p className="mt-3 text-sm text-slate-500" role="status">Loading offers for your destination. You can build your package as soon as the catalogue is ready.</p>}
              {!catalogueLoading && unavailableSelected.length > 0 && <p className="mt-3 text-sm text-amber-700" role="status">Some selected categories have no offers for {location}: {unavailableSelected.map((category) => categoryLabels[category]).join(", ")}. Remove them or choose another destination.</p>}
              {!validBudget && <p className="mt-3 text-sm text-amber-700" role="alert">Enter a monthly budget greater than zero, or leave it empty for no budget limit.</p>}
              <button type="button" disabled={selected.length < 2 || catalogueLoading || unavailableSelected.length > 0 || !validBudget} onClick={() => setBuilt(true)}
                className="mt-5 w-full rounded-xl bg-[#1a3470] px-6 py-4 font-semibold text-white shadow-md transition hover:bg-[#12254f] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
                Build my package →
              </button>
            </div>
          </section>

          <aside className="h-fit rounded-3xl border border-[#d5dceb] bg-white p-6 shadow-sm lg:sticky lg:top-6">
            <p className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Your package</p>
            <h2 className="mt-2 text-2xl font-bold">Monthly overview</h2>
            <p className="mt-1 text-sm text-slate-500">{selected.length} services selected · {locationOffers.length} offers in this destination</p>
            <div className="mt-5 space-y-4">
              {selected.map((category) => {
                const alternatives = offersByCategory[category] ?? [];
                const chosen = picks.find((offer) => offer.category === category);
                if (!chosen) return null;
                return <div key={category} className="border-b border-slate-100 pb-4">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{categoryIcons[category]} {categoryLabels[category]}
                    <select value={chosen.name} onChange={(event) => { setChosenOffers((current) => ({ ...current, [category]: event.target.value })); }} className="mt-2 w-full rounded-xl border border-[#d5dceb] bg-white px-3 py-2 text-sm font-medium normal-case tracking-normal text-[#0c1222]">
                      {alternatives.map((offer) => <option key={`${offer.id}-${offer.name}`} value={offer.name}>{offer.name} · {formatPrice(offer.price)}/month</option>)}
                    </select>
                  </label>
                  <p className="mt-2 text-xs text-slate-500">{chosen.description}</p>
                  {chosen.sourceUrl && <a href={chosen.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-xs font-semibold text-[#1a3470] underline underline-offset-4 hover:text-[#2563eb]">Verify offer with provider ↗</a>}
                </div>;
              })}
            </div>
            <div className="mt-5 border-t border-slate-200 pt-5">
              <p className="text-sm text-slate-500">Estimated monthly total</p>
              <p className="mt-1 text-3xl font-bold text-[#1a3470]">{formatPrice(total)}<span className="text-sm font-medium text-slate-500"> / month</span></p>
              <p className={`mt-2 text-sm font-semibold ${total <= budgetValue ? "text-emerald-700" : "text-amber-700"}`}>{total <= budgetValue ? "Within your budget" : "Above your budget"}</p>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">Compare alternatives using the menus above. Prices are indicative catalogue data, not guaranteed live quotes; confirm price, fees and availability with each provider.</p>
          </aside>
        </div>}

        {built && <section ref={resultRef} className="mt-8 scroll-mt-6 rounded-3xl border border-[#c7d7f5] bg-white p-6 shadow-sm md:p-8">
          <p className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Package ready</p>
          <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div><h2 className="text-2xl font-bold">Your suggested combination</h2><p className="mt-1 text-slate-600">Estimated total: {formatPrice(total)} / month</p></div>
<span className="inline-flex items-center justify-center rounded-xl border border-[#d5dceb] bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-700">Choose providers below to continue ↘</span>
          </div>
<p className="mt-3 text-xs text-slate-500">Destination: {location}. Your package is based on the selected services and monthly budget. CompareX is currently a comparison tool: provider prices and availability must be confirmed on official pages.</p>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">{selected.length} selected categories · Budget: {budget ? formatPrice(Number(budget)) : "Not specified"} / month</p>
            <button type="button" onClick={() => setBuilt(false)} className="rounded-xl border border-[#d5dceb] px-4 py-2 text-sm font-semibold text-[#1a3470] hover:bg-blue-50">← Edit needs and budget</button>
          </div>
          <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-[#f2f6ff] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="font-bold text-[#12254f]">Continue with the providers</p><p className="mt-1 text-sm text-slate-600">CompareX is currently a comparison platform, not a seller or payment intermediary. Use the official provider links below to check current terms and complete any purchase directly with the provider.</p></div>
            <button type="button" onClick={async () => { const items = picks.map(({ category, name, price, priceLabel, location: offerLocation, sourceUrl }) => ({ category, name, price, priceLabel, location: offerLocation, sourceUrl })); const savedPackage = { items, destination: location, budget, savedAt: new Date().toISOString() }; try { localStorage.setItem("comparex-saved-package", JSON.stringify(savedPackage)); if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) { const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser(); if (user) { const { error } = await supabase.from("comparex_customer_packages").insert({ user_id: user.id, destination: location, budget, items }); if (error) sessionStorage.setItem("comparex-package-sync-notice", "Your package is saved on this device, but cloud sync is not ready. Check that the CompareX One database migration has been applied."); } } window.location.href = "/dashboard"; } catch { window.alert("Could not save this package. Please try again."); } }} disabled={picks.length < 2} className="shrink-0 rounded-xl bg-[#1a3470] px-5 py-3 font-bold text-white hover:bg-[#12254f] disabled:opacity-50">Save package →</button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {picks.map((offer) => (
              <div key={offer.id} className="rounded-xl border border-[#d5dceb] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{categoryIcons[offer.category]} {categoryLabels[offer.category]}</p>
                <label className="mt-2 block text-sm font-semibold">Recommended offer
                  <select value={offer.name} onChange={(event) => setChosenOffers((current) => ({ ...current, [offer.category]: event.target.value }))} className="mt-2 w-full rounded-lg border border-[#d5dceb] bg-white px-3 py-2 text-sm font-medium">
                    {(offersByCategory[offer.category] ?? []).map((alternative) => <option key={alternative.id} value={alternative.name}>{alternative.name} · {formatPrice(alternative.price)}/month</option>)}
                  </select>
                </label>
                <p className="mt-2 text-sm text-slate-600">{offer.description}</p>
                <p className="mt-2 font-bold text-[#1a3470]">{formatPrice(offer.price)} / month <span className="text-xs font-normal text-slate-500">(estimate)</span></p>
                {offer.sourceUrl ? <a href={offer.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-sm font-semibold text-[#1a3470] underline underline-offset-4">View provider ↗</a> : <span className="mt-2 block text-xs text-slate-500">Provider link not available</span>}
              </div>
            ))}
          </div>
        </section>}
      </div>
    </main>
  );
}
