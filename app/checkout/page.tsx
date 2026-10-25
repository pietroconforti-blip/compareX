"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { offers, categoryLabels, categoryIcons, formatPrice } from "@/lib/home-data";

function CheckoutContent() {
  const params = useSearchParams();
  const router = useRouter();
  const ids = (params.get("ids") ?? "").split(",").map(Number).filter(Number.isFinite);
  const selected = useMemo(() => offers.filter((o) => ids.includes(o.id)), [params]);
  const total = selected.reduce((sum, offer) => sum + offer.price, 0);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("Austria");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#f7f9fd] px-5 py-16 text-[#0c1222]">
        <div className="mx-auto max-w-xl rounded-3xl border border-[#d5dceb] bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl">✓</div>
          <h1 className="mt-5 text-3xl font-bold">Your package is ready to review</h1>
          <p className="mt-3 leading-7 text-slate-600">This is a checkout preview only. No order was sent, no provider was contacted, and no payment was taken. Live ordering will require provider agreements and a payment integration.</p>
          <button onClick={() => router.push("/")} className="mt-6 rounded-xl bg-[#1a3470] px-6 py-3 font-semibold text-white">Back to CompareX</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f9fd] text-[#0c1222]">
      <header className="border-b border-[#d5dceb] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <button onClick={() => router.push("/")} className="text-xl font-bold">Compare<span className="text-blue-600">X</span></button>
          <span className="text-sm text-slate-500">Secure checkout preview</span>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-10 md:py-14">
        <button onClick={() => router.push("/")} className="text-sm font-semibold text-[#1a3470] hover:underline">← Back to package builder</button>
        <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_390px]">
          <section>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Step 2 of 2</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">Review your package</h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-600">Everything is kept inside CompareX for this step. Review the selected services and enter your contact details to preview the next stage.</p>
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="mt-8 space-y-5 rounded-3xl border border-[#d5dceb] bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-xl font-bold">Your details</h2>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Full name</span>
                <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Email address</span>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Country for your package</span>
                <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-600">
                  <option>Austria</option><option>Italy</option>
                </select>
              </label>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                <strong>Demo checkout:</strong> continuing only shows a local confirmation screen. It does not place an order or charge money.
              </div>
              <button type="submit" disabled={selected.length === 0} className="w-full rounded-xl bg-[#1a3470] px-6 py-4 font-bold text-white shadow-lg transition hover:bg-[#12254f] disabled:opacity-50">Review package →</button>
            </form>
          </section>
          <aside className="h-fit rounded-3xl border border-[#d5dceb] bg-white p-6 shadow-sm lg:sticky lg:top-6">
            <h2 className="text-xl font-bold">Your package</h2>
            <p className="mt-1 text-sm text-slate-500">{selected.length} selected services · monthly estimate</p>
            <div className="mt-5 space-y-4">
              {selected.map((o) => (
                <div key={o.id} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0f5ff] text-xl">{categoryIcons[o.category]}</span>
                    <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{categoryLabels[o.category]}</p><p className="mt-1 font-semibold">{o.name}</p><p className="mt-1 text-sm text-slate-500">{o.location}</p></div>
                  </div>
                  <span className="shrink-0 text-sm font-bold">{formatPrice(o.price)}</span>
                </div>
              ))}
              {selected.length === 0 && <p className="text-sm text-slate-600">No services were passed to checkout. Go back and build a package first.</p>}
            </div>
            <div className="mt-5 border-t border-slate-200 pt-5">
              <p className="text-sm text-slate-500">Estimated monthly total</p>
              <p className="mt-1 text-3xl font-bold text-[#1a3470]">{formatPrice(total)}<span className="text-sm font-medium text-slate-500"> / month</span></p>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">Sample catalogue prices only. Supplier inventory, final terms and combined payments are not connected yet.</p>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return <Suspense fallback={<main className="min-h-screen p-10">Loading checkout…</main>}><CheckoutContent /></Suspense>;
}
