"use client";

import { Suspense, useMemo, useState } from "react";
import { offers as baseOffers } from "@/lib/home-data";
import { useSearchParams } from "next/navigation";

type PackageItem = {
  id: number;
  category: string;
  name: string;
  price: number;
  priceLabel?: string;
  location?: string;
};

function CheckoutContent() {
  const params = useSearchParams();
  const items = useMemo<PackageItem[]>(() => {
    try {
      const parsed = JSON.parse(params.get("items") || "[]");
      if (!Array.isArray(parsed)) return [];
      const resolved = parsed
        .map((item) => baseOffers.find((offer) => offer.id === Number(item?.id)))
        .filter(Boolean);
      return resolved.map((offer) => ({
        id: offer!.id,
        category: offer!.category,
        name: offer!.name,
        price: offer!.price,
        priceLabel: offer!.priceLabel,
        location: offer!.location,
      }));
    } catch {
      return [];
    }
  }, [params]);

  const total = items.reduce((sum, item) => sum + item.price, 0);
  const destination = params.get("destination") || "Vienna";
  const cancelled = params.get("cancelled") === "1";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (items.length < 1) {
      setError("Select at least one offer from the package builder.");
      return;
    }
    if (name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email.");
      return;
    }
    if (!consent) {
      setError("Please confirm the privacy notice.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerIds: items.map((i) => i.id),
          email,
          destination,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Could not start payment.");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed to start.");
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f9fc] px-5 py-10 text-[#0c1222]">
      <div className="mx-auto max-w-5xl">
        <a href="/package-builder" className="font-semibold text-[#203b72]">
          ← Back to package builder
        </a>

        <p className="mt-8 text-xs font-bold uppercase tracking-wider text-[#203b72]">
          CompareX checkout
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Complete your payment</h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">
          Review your package and pay securely with Stripe. Prices are monthly estimates charged once for this demo.
        </p>

        {cancelled && (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Payment was cancelled. You can try again below.
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <form onSubmit={handlePay} className="space-y-5 rounded-3xl border border-[#e2e8f0] bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-xl font-bold">Your details</h2>

            <label className="block text-sm font-semibold">
              Full name
              <input
                required
                minLength={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal"
              />
            </label>

            <label className="block text-sm font-semibold">
              Email
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal"
              />
            </label>

            <label className="block text-sm font-semibold">
              Phone (optional)
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal"
              />
            </label>

            <label className="flex items-start gap-3 text-sm leading-6 text-slate-600">
              <input
                required
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4"
              />
              <span>
                I have read the{" "}
                <a href="/privacy" className="font-semibold text-[#203b72] underline" target="_blank">
                  privacy notice
                </a>
                .
              </span>
            </label>

            {error && (
              <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy || items.length === 0}
              className="w-full rounded-xl bg-[#203b72] px-5 py-4 font-bold text-white hover:bg-[#152a52] disabled:opacity-60"
            >
              {busy ? "Redirecting to Stripe…" : `Pay €${total.toFixed(2)} with Stripe →`}
            </button>

            <p className="text-xs leading-5 text-slate-500">
              You will be redirected to Stripe’s secure payment page. Card details are never stored on CompareX.
            </p>
          </form>

          <aside className="h-fit rounded-3xl border border-[#e2e8f0] bg-white p-6 shadow-sm lg:sticky lg:top-6">
            <p className="text-xs font-bold uppercase tracking-wider text-[#203b72]">Summary</p>
            <h2 className="mt-2 text-2xl font-bold">Your package</h2>
            <p className="mt-1 text-sm text-slate-500">Destination: {destination}</p>

            <div className="mt-5 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="border-b border-slate-100 pb-4">
                  <p className="text-xs font-semibold uppercase text-slate-500">{item.category}</p>
                  <p className="mt-1 font-semibold">{item.name}</p>
                  <p className="mt-1 text-sm text-slate-600">€{item.price.toFixed(2)} / month (estimate)</p>
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-sm text-amber-800">
                  No package selected. Go back to the package builder and choose offers.
                </p>
              )}
            </div>

            <div className="mt-5 border-t border-slate-200 pt-5">
              <p className="text-sm text-slate-500">Total (one-time charge of monthly estimate)</p>
              <p className="mt-1 text-3xl font-bold text-[#203b72]">
                €{total.toFixed(2)}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<main className="p-10">Loading checkout…</main>}>
      <CheckoutContent />
    </Suspense>
  );
}
