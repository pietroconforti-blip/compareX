"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { offers, categoryLabels, categoryIcons, formatPrice } from "@/lib/home-data";

type PaymentMethod = "card" | "paypal" | "applepay";

function CheckoutContent() {
  const params = useSearchParams();
  const router = useRouter();
  const idsParam = params.get("ids");
  const ids = (idsParam ? idsParam.split(",").map(Number).filter(Number.isFinite) : [1, 10, 13, 15]);
  const selected = useMemo(() => offers.filter((o) => ids.includes(o.id)), [params]);
  const total = selected.reduce((sum, offer) => sum + offer.price, 0);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("Austria");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#f7f9fd] px-5 py-16 text-[#0c1222]">
        <div className="mx-auto max-w-xl rounded-3xl border border-[#d5dceb] bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-3xl">!</div>
          <h1 className="mt-5 text-3xl font-bold">Payment setup needed</h1>
          <p className="mt-3 leading-7 text-slate-600">
            Your selected payment method is {paymentMethod === "card" ? "Card" : paymentMethod === "paypal" ? "PayPal" : "Apple Pay"}.
            CompareX is not connected to a payment processor yet, so no payment was taken and no order was placed.
            To accept real payments, the site owner must connect and configure a payment provider.
          </p>
          <button onClick={() => setSubmitted(false)} className="mt-6 rounded-xl bg-[#1a3470] px-6 py-3 font-semibold text-white">Back to payment options</button>
        </div>
      </main>
    );
  }

  const paymentOptions: { id: PaymentMethod; title: string; detail: string; mark: string }[] = [
    { id: "card", title: "Credit or debit card", detail: "Visa, Mastercard and other supported cards", mark: "💳" },
    { id: "paypal", title: "PayPal", detail: "Pay using your PayPal account", mark: "P" },
    { id: "applepay", title: "Apple Pay", detail: "Fast checkout on compatible Apple devices and browsers", mark: "" },
  ];

  return (
    <main className="min-h-screen bg-[#f7f9fd] text-[#0c1222]">
      <header className="border-b border-[#d5dceb] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <button onClick={() => router.push("/")} className="text-xl font-bold">Compare<span className="text-blue-600">X</span></button>
          <span className="text-sm text-slate-500">Checkout</span>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-10 md:py-14">
        <button onClick={() => router.push("/")} className="text-sm font-semibold text-[#1a3470] hover:underline">← Back to package builder</button>
        <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_390px]">
          <section>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Final step</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">Choose how to pay</h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-600">Review your package, add your contact details and select your preferred payment method.</p>
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="mt-8 space-y-6 rounded-3xl border border-[#d5dceb] bg-white p-6 shadow-sm md:p-8">
              <div>
                <h2 className="text-xl font-bold">Contact details</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold">Full name</span>
                    <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" autoComplete="name" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600" />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold">Email address</span>
                    <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-600" />
                  </label>
                </div>
                <label className="mt-4 block">
                  <span className="mb-2 block text-sm font-semibold">Country</span>
                  <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-600">
                    <option>Austria</option><option>Italy</option><option>Germany</option><option>Other</option>
                  </select>
                </label>
              </div>

              <div>
                <h2 className="text-xl font-bold">Payment method</h2>
                <p className="mt-1 text-sm text-slate-500">Choose your preferred method below.</p>
                <div className="mt-4 space-y-3">
                  {paymentOptions.map((option) => (
                    <label key={option.id} className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition ${paymentMethod === option.id ? "border-[#1a3470] bg-[#f3f6ff] ring-2 ring-[#d5e1ff]" : "border-slate-200 hover:border-slate-400"}`}>
                      <input type="radio" name="paymentMethod" value={option.id} checked={paymentMethod === option.id} onChange={() => setPaymentMethod(option.id)} className="h-4 w-4 accent-[#1a3470]" />
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl font-bold shadow-sm">{option.mark}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">{option.title}</span>
                        <span className="mt-0.5 block text-sm text-slate-500">{option.detail}</span>
                      </span>
                      {paymentMethod === option.id && <span className="font-bold text-[#1a3470]">✓</span>}
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                <strong>Demo mode:</strong> payment methods are selectable, but real payment processing has not been connected yet. This button will not charge you.
              </div>
              <button type="submit" disabled={selected.length === 0} className="w-full rounded-xl bg-[#1a3470] px-6 py-4 font-bold text-white shadow-lg transition hover:bg-[#12254f] disabled:opacity-50">
                Continue with {paymentMethod === "card" ? "card" : paymentMethod === "paypal" ? "PayPal" : "Apple Pay"} · {formatPrice(total)}/month →
              </button>
              <p className="text-center text-xs text-slate-500">No card details are collected by this demo page.</p>
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
              {selected.length === 0 && <p className="text-sm text-slate-600">No valid services were selected. Return to the builder and choose your package.</p>}
            </div>
            <div className="mt-5 border-t border-slate-200 pt-5">
              <p className="text-sm text-slate-500">Estimated monthly total</p>
              <p className="mt-1 text-3xl font-bold text-[#1a3470]">{formatPrice(total)}<span className="text-sm font-medium text-slate-500"> / month</span></p>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">These are sample catalogue prices. Supplier inventory, final terms and combined payments are not connected yet.</p>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return <Suspense fallback={<main className="min-h-screen p-10">Loading checkout…</main>}><CheckoutContent /></Suspense>;
}
