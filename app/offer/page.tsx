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
  const [housing, setHousing] = useState<HousingListing[]>([]);
  const [saved, setSaved] = useState(false);
  const isHousing = category === "housing" || /residence|room|housing|student/i.test(badge + " " + title);

  useEffect(() => {
    if (!isHousing) return;
    fetch("/api/housing", { cache: "no-store" })
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data) => setHousing(data.offers ?? []))
      .catch(() => setHousing([]));
  }, [isHousing]);

  const related = useMemo(() => housing.filter((item) =>
    item.provider.toLowerCase() === provider.toLowerCase() && item.id !== offerId
  ), [housing, provider, offerId]);

  function addToPackage() {
    try {
      const current = JSON.parse(window.localStorage.getItem("comparex-selected-offers") || "[]");
      const item = { id: offerId || title, title, provider, price, href, category, badge };
      const next = [...current.filter((entry: { id: string }) => entry.id !== item.id), item];
      window.localStorage.setItem("comparex-selected-offers", JSON.stringify(next));
      setSaved(true);
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
          <a href="/search?q=student%20offers" className="rounded-xl border border-[#d5dceb] px-3 py-2 text-sm font-semibold">← Back to results</a>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-8 md:py-12">
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
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={addToPackage} className="flex-1 rounded-xl border border-[#1a3470] px-5 py-4 text-sm font-bold text-[#1a3470] hover:bg-blue-50">{saved ? "Added to my package ✓" : "Add to my package +"}</button>
              <a href={href} target="_blank" rel="noreferrer" className="flex-1 rounded-xl bg-[#1a3470] px-5 py-4 text-center text-sm font-bold text-white hover:bg-[#12254f]">Checkout with provider ↗</a>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">Checkout opens the provider’s official booking or purchase page. CompareX does not charge you for third-party offers.</p>
          </div>
          <aside className="h-fit rounded-3xl border border-[#d5dceb] bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-[#203b72]">Your selection</p>
            <h2 className="mt-2 text-xl font-bold">At a glance</h2>
            <p className="mt-3 text-sm text-slate-600">{provider} · {badge}</p>
            <p className="mt-3 text-2xl font-bold text-[#1a3470]">{price}</p>
            <a href={href} target="_blank" rel="noreferrer" className="mt-5 block rounded-xl bg-[#1a3470] px-4 py-3 text-center text-sm font-bold text-white">Go to booking ↗</a>
          </aside>
        </section>

        {isHousing && related.length > 0 && (
          <section className="mt-10">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#203b72]">More from {provider}</p>
              <h2 className="mt-2 text-2xl font-bold">Explore other residences</h2>
              <p className="mt-1 text-sm text-slate-600">Choose the residence that fits your budget and preferred location.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {related.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-2xl border border-[#d5dceb] bg-white">
                  {item.images?.[0] && <img src={item.images[0]} alt={item.property} className="h-40 w-full object-cover" />}
                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase text-slate-500">{item.city} · {item.country}</p>
                    <h3 className="mt-2 font-bold">{item.property}</h3>
                    <p className="mt-2 text-sm text-slate-600">{item.roomType}</p>
                    <p className="mt-3 text-lg font-bold text-[#1a3470]">{item.priceLabel}</p>
                    <p className="mt-2 text-xs text-slate-500">{item.availability}</p>
                    <a href={item.officialUrl} target="_blank" rel="noreferrer" className="mt-4 block rounded-xl bg-[#1a3470] px-4 py-3 text-center text-sm font-bold text-white">View residence ↗</a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default function OfferPage() {
  return <Suspense fallback={<main className="min-h-screen p-8">Loading offer…</main>}><OfferDetails /></Suspense>;
}
