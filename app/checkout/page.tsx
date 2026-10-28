"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type PackageItem = { category: string; name: string; price: number; priceLabel?: string; location?: string; sourceUrl?: string };
function CheckoutContent() {
  const params = useSearchParams();
  const items = useMemo<PackageItem[]>(() => {
    try {
      const parsed = JSON.parse(params.get("items") || "[]");
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((item) => item && typeof item.name === "string" && typeof item.category === "string" && Number.isFinite(Number(item.price)) && Number(item.price) >= 0).map((item) => ({ category: String(item.category), name: String(item.name), price: Number(item.price), priceLabel: typeof item.priceLabel === "string" ? item.priceLabel : undefined, location: typeof item.location === "string" ? item.location : "", sourceUrl: typeof item.sourceUrl === "string" ? item.sourceUrl : undefined }));
    } catch { return []; }
  }, [params]);
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const destination = params.get("destination") || "Vienna";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  async function startTestCheckout() {
    if (name.trim().length < 2) { setPaymentError("Inserisci prima nome e cognome."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setPaymentError("Inserisci prima un indirizzo email valido."); return; }
    if (!consent) { setPaymentError("Conferma la nota privacy prima di continuare."); return; }
    setPaymentBusy(true);
    setPaymentError("");
    try {
      const response = await fetch("/api/checkout/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items, email }) });
      const data = await response.json();
      if (!response.ok || typeof data.url !== "string") throw new Error(data.error || "Checkout di prova non disponibile.");
      window.location.href = data.url;
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Errore durante l'avvio del checkout.");
      setPaymentBusy(false);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (items.length < 2) { setMessage("Torna al Package Builder e seleziona almeno due servizi."); return; }
    if (!consent) { setMessage("Devi confermare l'informativa sulla privacy per inviare la richiesta."); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customer: { name, email, phone }, items, destination, privacyConsent: consent }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Non è stato possibile salvare la richiesta.");
      setSuccess(true);
      setMessage("Richiesta salvata. Il pagamento non è ancora attivo: non è stato effettuato alcun addebito.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Errore durante l'invio.");
    } finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-[#f7f9fd] px-5 py-10 text-[#0c1222]"><div className="mx-auto max-w-5xl">
    <a href="/package-builder" className="font-semibold text-[#1a3470]">← Torna al pacchetto</a>
    <p className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">CompareX checkout</p>
    <h1 className="mt-3 text-4xl font-bold tracking-tight">Completa i tuoi dati</h1>
    <p className="mt-3 max-w-2xl leading-7 text-slate-600">Il pacchetto rimane su CompareX. Inserisci i dati di contatto per preparare la richiesta; non stai ancora acquistando e non verrà addebitato nulla.</p>
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
      <form onSubmit={submit} className="space-y-5 rounded-3xl border border-[#d5dceb] bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-bold">Dati del cliente</h2>
        <label className="block text-sm font-semibold">Nome e cognome<input required minLength={2} maxLength={120} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal" /></label>
        <label className="block text-sm font-semibold">Email<input required type="email" maxLength={254} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal" /></label>
        <label className="block text-sm font-semibold">Telefono (facoltativo)<input type="tel" maxLength={40} autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal" /></label>
        <label className="flex items-start gap-3 text-sm leading-6 text-slate-600"><input required type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4" /><span>Ho letto la <a href="/privacy" target="_blank" className="font-semibold text-[#1a3470] underline">nota privacy pre-lancio</a> e chiedo di usare questi dati per preparare la mia richiesta. So che la registrazione è ancora disattivata e non verrà salvato nulla finché il servizio non sarà pronto.</span></label>
        {message && <p role="status" className={"rounded-xl p-4 text-sm " + (success ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900")}>{message}</p>}
        <button type="submit" disabled={busy || success} className="w-full rounded-xl bg-[#1a3470] px-5 py-4 font-bold text-white disabled:opacity-60">{busy ? "Salvataggio…" : success ? "Richiesta salvata" : "Salva i dati e prepara il pacchetto →"}</button>
        {process.env.NEXT_PUBLIC_COMPAREX_TEST_CHECKOUT_ENABLED === "true" && <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <p className="font-bold text-blue-950">Prova il pagamento unico (modalità test)</p>
          <p className="mt-1 text-sm leading-6 text-blue-900">Si aprirà il checkout Stripe di prova. Non è un pagamento reale e non attiva né prenota i servizi inclusi nel pacchetto.</p>
          {paymentError && <p role="alert" className="mt-3 rounded-lg bg-white p-3 text-sm text-red-700">{paymentError}</p>}
          <button type="button" onClick={startTestCheckout} disabled={paymentBusy || items.length < 2} className="mt-3 w-full rounded-xl border border-[#1a3470] bg-white px-5 py-3 font-bold text-[#1a3470] disabled:opacity-60">{paymentBusy ? "Apertura checkout…" : "Vai al pagamento di prova →"}</button>
        </div>}
        <p className="text-xs leading-5 text-slate-500">Questa fase non è una prenotazione confermata. Non inserire documenti d'identità o dati bancari in questo modulo.</p>
      </form>
      <aside className="h-fit rounded-3xl border border-[#d5dceb] bg-white p-6 shadow-sm lg:sticky lg:top-6"><p className="text-xs font-bold uppercase tracking-wider text-blue-700">Riepilogo</p><h2 className="mt-2 text-2xl font-bold">Il tuo pacchetto</h2><p className="mt-1 text-sm text-slate-500">Destinazione: {destination} · stima mensile</p>
        <div className="mt-5 space-y-4">{items.map((item, index) => <div key={item.category + "-" + item.name + "-" + index} className="border-b border-slate-100 pb-4"><p className="text-xs font-semibold uppercase text-slate-500">{item.category}</p><p className="mt-1 font-semibold">{item.name}</p><p className="mt-1 text-sm text-slate-600">€{item.price.toFixed(2)} / mese (stima)</p></div>)}{items.length === 0 && <p className="text-sm text-amber-800">Nessun pacchetto trovato. Torna al builder e creane uno.</p>}</div>
        <div className="mt-5 border-t border-slate-200 pt-5"><p className="text-sm text-slate-500">Totale mensile stimato</p><p className="mt-1 text-3xl font-bold text-[#1a3470]">€{total.toFixed(2)}<span className="text-sm font-medium text-slate-500"> / mese</span></p></div>
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">Pagamento unico non ancora disponibile. Per attivarlo serviranno un sistema di pagamento verificato e accordi con i fornitori.</div>
      </aside>
    </div>
  </div></main>;
}
export default function CheckoutPage() { return <Suspense fallback={<main className="p-10">Caricamento checkout…</main>}><CheckoutContent /></Suspense>; }
