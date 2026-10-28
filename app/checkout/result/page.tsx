"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ResultContent() {
  const params = useSearchParams();
  const status = params.get("status");
  const sessionId = params.get("session_id");
  const [verification, setVerification] = useState<{ status: string; amountTotal?: number | null; currency?: string | null; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status !== "success" || !sessionId) return;
    let cancelled = false;
    setLoading(true);
    fetch("/api/checkout/session-status?session_id=" + encodeURIComponent(sessionId), { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Verifica non riuscita.");
        if (!cancelled) setVerification(data);
      })
      .catch((error) => { if (!cancelled) setVerification({ status: "unknown", error: error instanceof Error ? error.message : "Verifica non riuscita." }); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [status, sessionId]);

  const paid = verification?.status === "paid_test";
  return <main className="min-h-screen bg-[#f7f9fd] px-5 py-16 text-[#0c1222]"><section className="mx-auto max-w-2xl rounded-3xl border border-[#d5dceb] bg-white p-8 shadow-sm md:p-12">
    <p className="text-xs font-bold uppercase tracking-widest text-blue-700">CompareX · Checkout</p>
    {status === "cancelled" ? <>
      <h1 className="mt-4 text-3xl font-bold">Pagamento di prova annullato</h1>
      <p className="mt-3 leading-7 text-slate-600">Non è stato completato alcun pagamento. Puoi tornare al pacchetto e riprovare.</p>
    </> : <>
      <h1 className="mt-4 text-3xl font-bold">{loading ? "Verifica del pagamento…" : paid ? "Pagamento di prova riuscito" : "Stato del pagamento di prova"}</h1>
      <p className="mt-3 leading-7 text-slate-600">{loading ? "Stiamo verificando la sessione direttamente con Stripe." : paid ? "Stripe conferma che il pagamento in modalità test è riuscito. Nessun denaro reale è stato trasferito e i servizi non sono stati attivati." : verification?.error || "Non possiamo confermare un pagamento completato per questa sessione."}</p>
      {paid && typeof verification?.amountTotal === "number" && <p className="mt-5 text-2xl font-bold text-[#1a3470]">{new Intl.NumberFormat("it-IT", { style: "currency", currency: (verification.currency || "eur").toUpperCase() }).format(verification.amountTotal / 100)} <span className="text-sm font-medium text-slate-500">· modalità test</span></p>}
    </>}
    <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><strong>Demo:</strong> questo checkout verifica il pagamento unico in Stripe test mode. Non è ancora un ordine reale e non prenota, attiva o rinnova i servizi del pacchetto.</div>
    <div className="mt-7 flex flex-wrap gap-3"><a href="/package-builder" className="rounded-xl bg-[#1a3470] px-5 py-3 font-bold text-white">Torna al Package Builder</a><a href="/" className="rounded-xl border border-slate-200 px-5 py-3 font-semibold">Home</a></div>
  </section></main>;
}
export default function CheckoutResultPage() { return <Suspense fallback={<main className="p-10">Caricamento risultato…</main>}><ResultContent /></Suspense>; }
