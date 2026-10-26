"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { offers, categoryLabels, categoryIcons, formatPrice } from "@/lib/home-data";

function CheckoutContent() {
  const params = useSearchParams();
  const router = useRouter();
  const idsParam = params.get("ids");
  const ids = idsParam ? idsParam.split(",").map(Number).filter(Number.isFinite) : [];
  const selected = useMemo(() => offers.filter((o) => ids.includes(o.id)), [idsParam]);
  const total = selected.reduce((sum, offer) => sum + offer.price, 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const cancelled = params.get("cancelled") === "1";

  async function activatePackage() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: selected.map((offer) => offer.id) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Impossibile avviare il pagamento.");
      window.location.assign(data.url);
    } catch (err) { setError(err instanceof Error ? err.message : "Impossibile avviare il pagamento."); setLoading(false); }
  }

  return <main className="min-h-screen bg-[#f7f9fd] text-[#0c1222]">
    <header className="border-b border-[#d5dceb] bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5"><button onClick={() => router.push("/")} className="text-xl font-bold">Compare<span className="text-blue-600">X</span></button><span className="text-sm text-slate-500">Attivazione pacchetto</span></div></header>
    <div className="mx-auto max-w-5xl px-5 py-10 md:py-14">
      <button onClick={() => router.push("/package-builder")} className="text-sm font-semibold text-[#1a3470] hover:underline">← Torna al builder</button>
      <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_390px]"><section>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Ultimo passaggio</p><h1 className="mt-3 text-4xl font-bold tracking-tight">Attiva il tuo pacchetto</h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">Creare e modificare pacchetti è gratuito. Per attivare CompareX paghi 5 € una sola volta e 2 € al mese, con rinnovo automatico fino alla disdetta. I servizi dei fornitori sono separati.</p>
        {cancelled && <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Pagamento annullato: non hai completato l'acquisto.</p>}
        {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
        <div className="mt-8 rounded-3xl border border-[#d5dceb] bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-bold">Prezzi CompareX</h2>
          <div className="mt-5 space-y-4 border-y border-slate-100 py-5">
            <p className="flex justify-between gap-3"><span>Attivazione una tantum</span><strong>5,00 €</strong></p>
            <p className="flex justify-between gap-3"><span>Abbonamento mensile</span><strong>2,00 € / mese</strong></p>
            <p className="flex justify-between gap-3 text-sm text-slate-500"><span>Totale iniziale</span><strong>7,00 €</strong></p>
          </div>
          <button type="button" onClick={activatePackage} disabled={loading || selected.length < 2} className="mt-6 w-full rounded-xl bg-[#1a3470] px-6 py-4 font-bold text-white shadow-lg transition hover:bg-[#12254f] disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Apertura pagamento sicuro…" : "Paga 7 € e attiva →"}</button>
          <p className="mt-3 text-center text-xs leading-5 text-slate-500">Pagamento sicuro tramite Stripe. 5 € una tantum + 2 € al mese. L'abbonamento si rinnova automaticamente finché non viene disdetto.</p>
          <p className="mt-4 text-xs leading-5 text-slate-500">Prima di pagare, verifica i termini di rinnovo e cancellazione. I prezzi dei fornitori non sono inclusi nel pagamento CompareX.</p>
        </div>
        </section>
        <aside className="h-fit rounded-3xl border border-[#d5dceb] bg-white p-6 shadow-sm lg:sticky lg:top-6"><h2 className="text-xl font-bold">Il tuo pacchetto</h2><p className="mt-1 text-sm text-slate-500">{selected.length} servizi selezionati · stima mensile</p>
          <div className="mt-5 space-y-4">{selected.map((o) => <div key={o.id} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4"><div className="flex gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0f5ff] text-xl">{categoryIcons[o.category]}</span><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{categoryLabels[o.category]}</p><p className="mt-1 font-semibold">{o.name}</p><p className="mt-1 text-sm text-slate-500">{o.location}</p></div></div><span className="shrink-0 text-sm font-bold">{formatPrice(o.price)}</span></div>)}
          {selected.length === 0 && <p className="text-sm text-amber-800">Pacchetto non valido. Torna al builder e seleziona almeno due servizi.</p>}</div>
          <div className="mt-5 border-t border-slate-200 pt-5"><p className="text-sm text-slate-500">Totale stimato fornitori</p><p className="mt-1 text-3xl font-bold text-[#1a3470]">{formatPrice(total)}<span className="text-sm font-medium text-slate-500"> / mese</span></p><p className="mt-3 flex justify-between text-sm"><span>CompareX · attivazione</span><strong>5,00 € una volta</strong></p><p className="mt-2 flex justify-between text-sm"><span>CompareX · abbonamento</span><strong>2,00 € / mese</strong></p></div>
          <p className="mt-4 text-xs leading-5 text-slate-500">I prezzi dei fornitori sono stime del catalogo dimostrativo. Conferma prezzi e disponibilità con ciascun fornitore.</p>
        </aside>
      </div>
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-bold">Hai una domanda?</h2><p className="mt-1 text-sm text-slate-600">Scrivi al venditore o all'assistenza CompareX senza uscire dalla piattaforma.</p><a href="/contact" className="mt-3 inline-flex rounded-xl border border-[#1a3470] px-4 py-2 text-sm font-semibold text-[#1a3470]">Apri il centro assistenza →</a></div>
    </div>
  </main>;
}
export default function CheckoutPage() { return <Suspense fallback={<main className="min-h-screen p-10">Caricamento checkout…</main>}><CheckoutContent /></Suspense>; }
