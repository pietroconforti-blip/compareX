"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

type HousingListing = { id: string; country: string; city: string; provider: string; property: string; roomType: string; priceValue: number; priceLabel: string; availability: string; details: string[]; officialUrl: string; images?: string[]; };

function OfferDetails() {
  const params = useSearchParams();
  const title = params.get("title") || "CompareX offer";
  const provider = params.get("provider") || "Provider details";
  const price = params.get("price") || "Check current price";
  const badge = params.get("badge") || "Offer details";
  const href = params.get("href") || "/";
  const category = params.get("category") || "";
  const offerId = params.get("offerId") || "";
  const originalQuery = params.get("query") || "";
  const budgetMatch = originalQuery.match(/(?:under|below|max|maximum|less than|unter|bis zu|sotto(?: i| a)?|meno di|around under)\s*€?\s*(\d+(?:[.,]\d+)?)/i);
  const initialBudget = budgetMatch ? Number(budgetMatch[1].replace(",", ".")) : null;
  const [housing, setHousing] = useState<HousingListing[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const isHousing = category === "housing" || /residence|room|housing|student/i.test(badge + " " + title);
  const isProviderHub = isHousing && provider.trim().toLowerCase() === "stuwo";

  useEffect(() => {
    if (!isHousing) return;
    fetch("/api/housing", { cache: "no-store" })
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data) => setHousing(data.offers ?? []))
      .catch(() => setHousing([]));
  }, [isHousing]);

  useEffect(() => {
    try {
      const current = JSON.parse(window.localStorage.getItem("comparex-selected-offers") || "[]");
      if (Array.isArray(current)) setSavedIds(current.map((item: { id: string }) => String(item.id)));
    } catch { setSavedIds([]); }
  }, []);

  const related = useMemo(() => housing.filter((item) =>
    item.provider.toLowerCase() === provider.toLowerCase() && item.id !== offerId
  ).sort((a, b) => a.priceValue - b.priceValue), [housing, provider, offerId]);

  function addResidenceToPackage(item: HousingListing) {
    try {
      const current = JSON.parse(window.localStorage.getItem("comparex-selected-offers") || "[]");
      const saved = {
        id: item.id,
        title: item.property,
        provider: item.provider,
        price: item.priceLabel,
        href: item.officialUrl,
        category: "housing",
        badge: `${item.city} · ${item.country}`,
      };
      const next = [...current.filter((entry: { id: string }) => entry.id !== item.id), saved];
      window.localStorage.setItem("comparex-selected-offers", JSON.stringify(next));
      setSavedIds((ids) => ids.includes(item.id) ? ids : [...ids, item.id]);
    } catch {
      window.alert("Could not save this offer. Please check your browser storage settings.");
    }
  }

  function addCurrentToPackage() {
    try {
      const current = JSON.parse(window.localStorage.getItem("comparex-selected-offers") || "[]");
      const item = { id: offerId || title, title, provider, price, href, category, badge };
      const next = [...current.filter((entry: { id: string }) => entry.id !== item.id), item];
      window.localStorage.setItem("comparex-selected-offers", JSON.stringify(next));
      setSavedIds((ids) => ids.includes(item.id) ? ids : [...ids, item.id]);
    } catch {
      window.alert("Could not save this offer. Please check your browser storage settings.");
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f9fd] text-[#0c1222]">
      <header className="border-b border-[#d5dceb] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1a3470] text-lg font-bold text-white">C</span>
            <span><span className="block text-xl font-bold">CompareX</span><span className="block text-xs text-slate-500">Compare better. Choose better.</span></span>
          </a>
          <a href="/search?q=housing&city=Vienna" className="rounded-xl border border-[#d5dceb] px-3 py-2 text-sm font-semibold">← Back to results</a>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-8 md:py-12">
        {isProviderHub ? (
          <>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563eb]">Housing provider · Austria</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Explore STUWO residences in Vienna</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">You selected STUWO. Here are the individual STUWO residences and their advertised starting prices. Choose a specific residence below.</p>
            {initialBudget !== null && <p className="mt-3 inline-flex rounded-full bg-[#eef3ff] px-3 py-1.5 text-xs font-semibold text-[#203b72]">Your original search budget: up to €{initialBudget}/month · matching residences are marked</p>}
            <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {related.map((item) => {
                const withinBudget = initialBudget === null || item.priceValue <= initialBudget;
                return (
                  <article key={item.id} className="flex flex-col overflow-hidden rounded-2xl border border-[#d5dceb] bg-white shadow-sm">
                    {item.images?.[0] && <img src={item.images[0]} alt={item.property} className="h-40 w-full object-cover" />}
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.city} · {item.country}</span>
                        {initialBudget !== null && <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${withinBudget ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{withinBudget ? "Within budget" : "Above budget"}</span>}
                      </div>
                      <h2 className="mt-3 text-lg font-bold">{item.property}</h2>
                      <p className="mt-2 text-sm text-slate-600">{item.details[0]}</p>
                      <p className="mt-3 text-sm text-slate-600">{item.roomType}</p>
                      <p className="mt-4 text-2xl font-bold text-[#1a3470]">{item.priceLabel}</p>
                      <p className="mt-2 text-xs leading-5 text-slate-500">{item.availability}</p>
                      <div className="mt-auto grid gap-2 pt-5">
                        <button type="button" onClick={() => addResidenceToPackage(item)} className="rounded-xl border border-[#1a3470] px-4 py-3 text-sm font-bold text-[#1a3470] hover:bg-blue-50">{savedIds.includes(item.id) ? "Added to my package ✓" : "Add to my package"}</button>
                        <a href={item.officialUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-[#1a3470] px-4 py-3 text-center text-sm font-bold text-white hover:bg-[#12254f]">Direct checkout with STUWO ↗</a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            {related.length === 0 && <p className="mt-6 rounded-2xl border border-[#d5dceb] bg-white p-6 text-slate-600">Loading STUWO residences…</p>}
            <p className="mt-7 text-xs leading-5 text-slate-500">Prices are advertised starting rents from STUWO’s official Vienna residence pages. Final rent depends on room category and contract period; availability must be confirmed with STUWO.</p>
          </>
        ) : (
          <>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563eb]">{badge}</p>
            <section className="mt-4 grid gap-8 lg:grid-cols-[1fr_340px]">
              <div className="rounded-3xl border border-[#d5dceb] bg-white p-6 shadow-sm md:p-10">
                <p className="text-sm font-semibold text-slate-500">{provider}</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
                <p className="mt-5 text-sm text-slate-500">Listed price</p>
                <p className="mt-1 text-3xl font-bold text-[#1a3470]">{price}</p>
                <div className="mt-6 rounded-2xl bg-[#f5f8ff] p-5">
                  <h2 className="font-bold">Offer information</h2>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                    <li>• Review the room or plan details and the provider’s current conditions.</li>
                    <li>• Prices and availability can change; confirm them with the provider.</li>
                    <li>• CompareX is a comparison platform and does not claim a partnership unless stated.</li>
                  </ul>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button type="button" onClick={addCurrentToPackage} className="rounded-xl border border-[#1a3470] px-5 py-4 text-sm font-bold text-[#1a3470] hover:bg-blue-50">{savedIds.includes(offerId || title) ? "Added to my package ✓" : "Add to my package"}</button>
                  <a href={href} target="_blank" rel="noreferrer" className="rounded-xl bg-[#1a3470] px-5 py-4 text-center text-sm font-bold text-white hover:bg-[#12254f]">Direct checkout ↗</a>
                </div>
              </div>
              <aside className="h-fit rounded-3xl border border-[#d5dceb] bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-[#203b72]">Your selection</p>
                <h2 className="mt-2 text-xl font-bold">At a glance</h2>
                <p className="mt-3 text-sm text-slate-600">{provider} · {badge}</p>
                <p className="mt-3 text-2xl font-bold text-[#1a3470]">{price}</p>
              </aside>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default function OfferPage() {
  return <Suspense fallback={<main className="min-h-screen p-8">Loading offer…</main>}><OfferDetails /></Suspense>;
}
