"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function OfferDetails() {
  const params = useSearchParams();
  const title = params.get("title") || "CompareX offer";
  const provider = params.get("provider") || "Provider details";
  const price = params.get("price") || "Check current price";
  const badge = params.get("badge") || "Offer details";
  const href = params.get("href") || "/";
  return (
    <main className="min-h-screen bg-[#f7f9fd] text-[#0c1222]">
      <header className="border-b border-[#d5dceb] bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <a href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1a3470] text-lg font-bold text-white">C</span>
            <span><span className="block text-xl font-bold">CompareX</span><span className="block text-xs text-slate-500">Compare better. Choose better.</span></span>
          </a>
          <a href="/search?q=student%20offers" className="rounded-xl border border-[#d5dceb] px-3 py-2 text-sm font-semibold">← Back to results</a>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-5 py-8 md:py-14">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563eb]">{badge}</p>
        <section className="mt-4 rounded-3xl border border-[#d5dceb] bg-white p-6 shadow-sm md:p-10">
          <p className="text-sm font-semibold text-slate-500">{provider}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
          <p className="mt-5 text-sm text-slate-500">Listed price</p>
          <p className="mt-1 text-3xl font-bold text-[#1a3470]">{price}</p>
          <div className="mt-6 rounded-2xl bg-[#f5f8ff] p-5">
            <h2 className="font-bold">Before you continue</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <li>• Check the provider’s current price, terms and availability.</li>
              <li>• The listed price is indicative and may not be a live quote.</li>
              <li>• CompareX does not claim an official partnership unless explicitly stated.</li>
            </ul>
          </div>
          <a href={href} target="_blank" rel="noreferrer" className="mt-6 block rounded-xl bg-[#1a3470] px-5 py-4 text-center text-sm font-bold text-white hover:bg-[#12254f]">Continue to provider website ↗</a>
          <a href="/package-builder" className="mt-3 block rounded-xl border border-[#d5dceb] px-5 py-4 text-center text-sm font-semibold text-[#1a3470] hover:bg-slate-50">Build a package with this type of service →</a>
        </section>
      </div>
    </main>
  );
}

export default function OfferPage() {
  return <Suspense fallback={<main className="min-h-screen p-8">Loading offer…</main>}><OfferDetails /></Suspense>;
}
