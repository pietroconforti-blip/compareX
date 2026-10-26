"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { offers, categoryLabels, categoryIcons, formatPrice } from "@/lib/home-data";

function CheckoutContent() {
  const params = useSearchParams();
  const router = useRouter();
  const idsParam = params.get("ids");
  const ids = (idsParam ? idsParam.split(",").map(Number).filter(Number.isFinite) : []);
  const selected = useMemo(() => offers.filter((o) => ids.includes(o.id)), [idsParam]);
  const total = selected.reduce((sum, offer) => sum + offer.price, 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const cancelled = params.get("cancelled") === "1";

  async function activatePackage() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selected.map((offer) => offer.id) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not start payment.");
      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start payment.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f9fd] text-[#0c1222]">
      <header className="border-b border-[#d5dceb] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <button onClick={() => router.push("/")} className="text-xl font-bold">Compare<span className="text-blue-600">X</span></button>
          <span className="text-sm text-slate-500">Package activation</span>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-5 py-10 md:py-14">
        <button onClick={() => router.push("/package-builder")} className="text-sm font-semibold text-[#1a3470] hover:underline">← Back to package builder</button>
        <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_390px]">
          <section>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Final step</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">Activate your package</h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-600">Building and editing your package is free. Pay a one-time €5 activation fee to CompareX; the services themselves are paid separately to each provider.</p>
            {cancelled && <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Payment cancelled. Your package is still available and you have not been charged by CompareX through this attempt.</p>}
            {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
            <div className="mt-8 rounded-3xl border border-[#d5dceb] bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-xl font-bold">CompareX activation</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">One-time payment · No monthly CompareX fee</p>
              <div className="mt-5 flex items-center justify-between border-y border-slate-100 py-5">
                <span className="font-semibold">Package activation fee</span>
                <span className="text-2xl font-bold text-[#1a3470]">€5.00</span>
              </div>
              <button type="button" onClick={activatePackage} disabled={loading || selected.length < 2}
                className="mt-6 w-full rounded-xl bg-[#1a3470] px-6 py-4 font-bold text-white shadow-lg transition hover:bg-[#12254f] disabled:cursor-not-allowed disabled:opacity-50">
                {loading ? "Connecting to secure checkout…" : "Pay €5 and activate →"}
              </button>
              <p className="mt-3 text-center text-xs leading-5 text-slate-500">Secure payment via Stripe Checkout. CompareX does not store your card details.</p>
              <p className="mt-4 text-xs leading-5 text-slate-500">Activation payment is separate from all provider prices. Check the terms before paying; no provider subscription is purchased through this payment.</p>
            </div>
          </section>
          <aside className="h-fit rounded-3xl border border-[#d5dceb] bg-white p-6 shadow-sm lg:sticky lg:top-6">
            <h2 className="text-xl font-bold">Your package</h2>
            <p className="mt-1 text-sm text-slate-500">{selected.length} selected services · monthly estimate</p>
            <div className="mt-5 space-y-4">
              {selected.map((o) => <div key={o.id} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0f5ff] text-xl">{categoryIcons[o.category]}</span><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{categoryLabels[o.category]}</p><p className="mt-1 font-semibold">{o.name}</p><p className="mt-1 text-sm text-slate-500">{o.location}</p></div></div>
                <span className="shrink-0 text-sm font-bold">{formatPrice(o.price)}</span>
              </div>)}
              {selected.length === 0 && <p className="text-sm text-amber-800">No valid services were selected. Return to the builder and choose at least two services.</p>}
            </div>
            <div className="mt-5 border-t border-slate-200 pt-5">
              <p className="text-sm text-slate-500">Estimated provider total</p>
              <p className="mt-1 text-3xl font-bold text-[#1a3470]">{formatPrice(total)}<span className="text-sm font-medium text-slate-500"> / month</span></p>
              <p className="mt-3 flex justify-between text-sm"><span>CompareX activation (once)</span><strong>€5.00</strong></p>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">Provider prices are estimates from the sample catalogue. Verify final prices and availability with each provider.</p>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return <Suspense fallback={<main className="min-h-screen p-10">Loading checkout…</main>}><CheckoutContent /></Suspense>;
}
