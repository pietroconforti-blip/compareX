"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { offers, categoryLabels, categoryIcons, formatPrice } from "@/lib/home-data";

function CheckoutContent() {
  const params = useSearchParams();
  const router = useRouter();
  const idsParam = params.get("ids");
  const ids = idsParam ? idsParam.split(",").map(Number).filter(Number.isFinite) : [];
  const selected = useMemo(() => offers.filter((o) => ids.includes(o.id)), [idsParam]);
  const total = selected.reduce((sum, offer) => sum + offer.price, 0);
  const cancelled = params.get("cancelled") === "1";

  return <main className="min-h-screen bg-[#f7f9fd] text-[#0c1222]">
    <header className="border-b border-[#d5dceb] bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5"><button onClick={() => router.push("/")} className="text-xl font-bold">Compare<span className="text-blue-600">X</span></button><span className="text-sm text-slate-500">Attivazione pacchetto</span></div></header>
    <div className="mx-auto max-w-5xl px-5 py-10 md:py-14">
      <button onClick={() => router.push("/package-builder")} className="text-sm font-semibold text-[#1a3470] hover:underline">← Torna al builder</button>
      <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_390px]"><section>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Ultimo passaggio</p><h1 className="mt-3 text-4xl font-bold tracking-tight">Attiva il tuo pacchetto</h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">CompareX è attualmente uno strumento di confronto. Il checkout combinato e l’abbonamento non sono ancora attivi: non verrà effettuato alcun addebito. Per acquistare un servizio, usa il link ufficiale del relativo fornitore nel Package Builder.</p>
        {cancelled && <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Pagamento annullato: non hai completato l'acquisto.</p>}
        <div className="mt-8 rounded-3xl border border-[#d5dceb] bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-bold">Checkout non ancora attivo</h2>
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">Il pagamento è disattivato finché non sono pronti il servizio in abbonamento, le condizioni contrattuali e il processo di cancellazione. I prezzi mostrati nel pacchetto sono stime dei fornitori, non un importo da pagare qui.</div>
          <button type="button" disabled className="mt-6 w-full cursor-not-allowed rounded-xl bg-slate-300 px-6 py-4 font-bold text-slate-600">Checkout non disponibile</button>
          <p className="mt-3 text-center text-xs leading-5 text-slate-500">Nessun pagamento viene richiesto o avviato da questa pagina.</p>
          <p className="mt-4 text-xs leading-5 text-slate-500">Torna al Package Builder e apri i link ufficiali per verificare i termini e completare l’acquisto direttamente con il fornitore.</p>
        </div>
        </section>
        <aside className="h-fit rounded-3xl border border-[#d5dceb] bg-white p-6 shadow-sm lg:sticky lg:top-6"><h2 className="text-xl font-bold">Il tuo pacchetto</h2><p className="mt-1 text-sm text-slate-500">{selected.length} servizi selezionati · stima mensile</p>
          <div className="mt-5 space-y-4">{selected.map((o) => <div key={o.id} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4"><div className="flex gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0f5ff] text-xl">{categoryIcons[o.category]}</span><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{categoryLabels[o.category]}</p><p className="mt-1 font-semibold">{o.name}</p><p className="mt-1 text-sm text-slate-500">{o.location}</p></div></div><span className="shrink-0 text-sm font-bold">{formatPrice(o.price)}</span></div>)}
          {selected.length === 0 && <p className="text-sm text-amber-800">Pacchetto non valido. Torna al builder e seleziona almeno due servizi.</p>}</div>
          <div className="mt-5 border-t border-slate-200 pt-5"><p className="text-sm text-slate-500">Totale stimato fornitori</p><p className="mt-1 text-3xl font-bold text-[#1a3470]">{formatPrice(total)}<span className="text-sm font-medium text-slate-500"> / mese</span></p><p className="mt-3 text-sm text-slate-600">I servizi vengono acquistati separatamente dai rispettivi fornitori. Il checkout unico non è ancora disponibile.</p></div>
          <p className="mt-4 text-xs leading-5 text-slate-500">I prezzi dei fornitori sono stime del catalogo dimostrativo. Conferma prezzi e disponibilità con ciascun fornitore.</p>
        </aside>
      </div>
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-bold">Hai una domanda?</h2><p className="mt-1 text-sm text-slate-600">Scrivi al venditore o all'assistenza CompareX senza uscire dalla piattaforma.</p><a href="/contact" className="mt-3 inline-flex rounded-xl border border-[#1a3470] px-4 py-2 text-sm font-semibold text-[#1a3470]">Apri il centro assistenza →</a></div>
    </div>
  </main>;
}
export default function CheckoutPage() { return <Suspense fallback={<main className="min-h-screen p-10">Caricamento checkout…</main>}><CheckoutContent /></Suspense>; }
