"use client";

import { useEffect, useMemo, useState } from "react";

type CheckoutItem = {
  category: string;
  name: string;
  price: number;
  priceLabel?: string;
  location?: string;
  sourceUrl?: string;
};
type SavedPackage = {
  items: CheckoutItem[];
  destination: string;
  budget: string;
  savedAt: string;
};

const labels: Record<string, string> = {
  housing: "Housing",
  mobile: "Mobile",
  transport: "Transport",
  gym: "Gym & fitness",
  streaming: "Streaming",
};

export default function CheckoutPage() {
  const [saved, setSaved] = useState<SavedPackage | null>(null);
  const [ready, setReady] = useState(false);
  const [showProviders, setShowProviders] = useState(false);
  const total = useMemo(() => saved?.items.reduce((sum, item) => sum + Number(item.price || 0), 0) ?? 0, [saved]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("comparex-saved-package");
      if (raw) {
        const parsed = JSON.parse(raw) as SavedPackage;
        if (Array.isArray(parsed.items)) setSaved(parsed);
      }
    } catch {
      setSaved(null);
    }
    setReady(true);
  }, []);

  return (
    <main className="min-h-screen bg-[#f7f9fd] px-5 py-10 text-[#0c1222]">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between gap-3">
          <a href="/" className="text-xl font-bold text-[#1a3470]">CompareX</a>
          <a href="/account" className="rounded-xl border border-[#d5dceb] bg-white px-4 py-2 text-sm font-semibold">My account</a>
        </header>
        <p className="mt-10 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Checkout</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Review your package.</h1>
        <p className="mt-3 leading-7 text-slate-600">One final overview before you continue to the selected service providers.</p>

        {!ready ? <p className="mt-8 text-slate-500">Loading your package…</p> : !saved || saved.items.length === 0 ? (
          <section className="mt-8 rounded-3xl border border-[#d5dceb] bg-white p-7">
            <h2 className="text-xl font-bold">No package to check out</h2>
            <p className="mt-2 text-slate-600">Build your package first. Your selected services will appear here for a final review.</p>
            <a href="/package-builder" className="mt-5 inline-flex rounded-xl bg-[#1a3470] px-5 py-3 font-semibold text-white">Build my package →</a>
          </section>
        ) : (
          <section className="mt-8 rounded-3xl border border-[#d5dceb] bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Your package</p>
                <h2 className="mt-2 text-2xl font-bold">{saved.destination} student package</h2>
                <p className="mt-1 text-sm text-slate-500">{saved.items.length} selected services</p>
              </div>
              <div className="rounded-2xl bg-[#f2f6ff] px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estimated monthly total</p>
                <p className="mt-1 text-2xl font-bold text-[#1a3470]">€{total.toFixed(2)} <span className="text-sm font-medium text-slate-500">/ month</span></p>
              </div>
            </div>
            <div className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-200">
              {saved.items.map((item, index) => (
                <div key={item.category + item.name + index} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{labels[item.category] ?? item.category}</p>
                    <p className="mt-1 font-semibold">{item.name}</p>
                  </div>
                  <p className="font-bold text-[#1a3470]">€{Number(item.price).toFixed(2)} <span className="text-xs font-normal text-slate-500">/ month</span></p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
              <span>Monthly budget: {saved.budget ? `€${Number(saved.budget).toFixed(2)}` : "Not specified"}</span>
              <a href="/package-builder" className="font-semibold text-[#1a3470] underline underline-offset-4">Edit package</a>
            </div>
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              Prices are estimates until confirmed by each provider. CompareX does not collect payment for these third-party services. Each provider remains responsible for its contract, final price and payment.
            </div>
            {!showProviders ? (
              <button type="button" onClick={() => setShowProviders(true)} className="mt-6 w-full rounded-xl bg-[#1a3470] px-6 py-4 font-bold text-white shadow-md hover:bg-[#12254f]">
                Continue to provider checkout →
              </button>
            ) : (
              <div className="mt-6">
                <h3 className="text-lg font-bold">Complete each service with its provider</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">You will be redirected to the official provider website. Your contract and payment are handled directly by that provider.</p>
                <div className="mt-4 space-y-3">
                  {saved.items.map((item, index) => (
                    <div key={item.category + item.name + index} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{labels[item.category] ?? item.category}</p>
                        <p className="mt-1 font-semibold">{item.name}</p>
                      </div>
                      {item.sourceUrl ? (
                        <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-[#1a3470] px-4 py-2.5 text-sm font-bold text-white">Continue ↗</a>
                      ) : (
                        <span className="text-xs text-slate-500">Provider link not available yet</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
        <p className="mt-8 text-center text-xs leading-5 text-slate-500">CompareX is currently a comparison and referral platform. A checkout link does not mean a contract has been submitted or accepted.</p>
      </div>
    </main>
  );
}
