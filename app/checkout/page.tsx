"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";
import { offers as baseOffers } from "@/lib/home-data";
import { useSearchParams } from "next/navigation";

type PackageItem = { id: number; category: string; name: string; price: number; priceLabel?: string; location?: string; sourceUrl?: string };
type EmbeddedCheckoutInstance = { mount(target: string | HTMLElement): void; unmount(): void; destroy(): void };
type StripeBrowserInstance = { initEmbeddedCheckout(options: { clientSecret: string }): Promise<EmbeddedCheckoutInstance> };
declare global { interface Window { Stripe?: (publishableKey: string) => StripeBrowserInstance } }

function CheckoutContent() {
  const params = useSearchParams();
  const items = useMemo<PackageItem[]>(() => {
    try {
      const parsed = JSON.parse(params.get("items") || "[]");
      if (!Array.isArray(parsed)) return [];
      // Display only canonical offers from the server-maintained starter catalogue.
      const resolved = parsed.map((item) => baseOffers.find((offer) => offer.id === Number(item?.id)));
      if (resolved.length < 2 || resolved.some((offer) => !offer)) return [];
      return (resolved as (typeof baseOffers)[number][]).map((offer) => ({ id: offer.id, category: offer.category, name: offer.name, price: offer.price, priceLabel: offer.priceLabel, location: offer.location, sourceUrl: offer.sourceUrl }));
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
  const [stripeReady, setStripeReady] = useState(false);
  const [checkoutClientSecret, setCheckoutClientSecret] = useState("");
  const [returnStatus, setReturnStatus] = useState<"loading" | "paid_test" | "not_paid" | "expired" | "error" | null>(null);
  const [returnMessage, setReturnMessage] = useState("");
  const checkoutContainerRef = useRef<HTMLDivElement>(null);
  const embeddedCheckoutRef = useRef<EmbeddedCheckoutInstance | null>(null);
  const checkoutRequestIdRef = useRef<string>("");
  const linkedTestCheckoutEnabled = process.env.NEXT_PUBLIC_COMPAREX_TEST_CHECKOUT_ENABLED === "true" && process.env.NEXT_PUBLIC_COMPAREX_ORDER_LINKED_CHECKOUT_ENABLED === "true";

  useEffect(() => {
    const returnedSessionId = params.get("session_id");
    if (!returnedSessionId) return;
    if (!returnedSessionId.startsWith("cs_test_")) {
      setReturnStatus("error");
      setReturnMessage("ID sessione test non valido.");
      return;
    }
    let active = true;
    setReturnStatus("loading");
    fetch("/api/checkout/session-status?session_id=" + encodeURIComponent(returnedSessionId), { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Verifica pagamento non disponibile.");
        if (active) {
          setReturnStatus(data.status);
          setReturnMessage(data.status === "paid_test"
            ? "Stripe conferma il pagamento nell'ambiente test. Nessun servizio è stato prenotato o attivato."
            : data.status === "expired" ? "La sessione di pagamento è scaduta."
            : "Il pagamento non risulta completato. Nessun servizio è stato attivato.");
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setReturnStatus("error");
          setReturnMessage(error instanceof Error ? error.message : "Impossibile verificare il pagamento.");
        }
      });
    return () => { active = false; };
  }, [params]);

  useEffect(() => {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!checkoutClientSecret || !stripeReady || !checkoutContainerRef.current || !publishableKey || !window.Stripe) return;
    let active = true;
    let checkout: EmbeddedCheckoutInstance | undefined;
    window.Stripe(publishableKey).initEmbeddedCheckout({ clientSecret: checkoutClientSecret })
      .then((instance) => {
        if (!active) { instance.destroy(); return; }
        checkout = instance;
        embeddedCheckoutRef.current = instance;
        instance.mount(checkoutContainerRef.current!);
      })
      .catch((error: unknown) => {
        setPaymentError(error instanceof Error ? error.message : "Impossibile caricare il modulo di pagamento Stripe.");
      });
    return () => {
      active = false;
      checkout?.destroy();
      embeddedCheckoutRef.current = null;
    };
  }, [checkoutClientSecret, stripeReady]);

  async function startTestCheckout() {
    if (items.length < 2) { setPaymentError("Seleziona almeno due offerte valide."); return; }
    if (name.trim().length < 2) { setPaymentError("Inserisci prima nome e cognome."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setPaymentError("Inserisci prima un indirizzo email valido."); return; }
    if (!consent) { setPaymentError("Conferma la nota privacy prima di continuare."); return; }
    setPaymentBusy(true);
    setPaymentError("");
    try {
      if (!checkoutRequestIdRef.current) checkoutRequestIdRef.current = window.crypto.randomUUID();
      const response = await fetch("/api/checkout/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ offerIds: items.map((item) => item.id), customer: { name, email, phone }, destination, privacyConsent: consent, checkoutRequestId: checkoutRequestIdRef.current }) });
      const data = await response.json();
      if (!response.ok || typeof data.clientSecret !== "string") throw new Error(data.error || "Checkout di prova non disponibile.");
      setCheckoutClientSecret(data.clientSecret);
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Errore durante l'avvio del checkout.");
    } finally {
      setPaymentBusy(false);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (linkedTestCheckoutEnabled) {
      await startTestCheckout();
      return;
    }
    if (items.length < 2) { setMessage("Torna al Package Builder e seleziona almeno due servizi."); return; }
    if (!consent) { setMessage("Devi confermare l'informativa sulla privacy per inviare la richiesta."); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customer: { name, email, phone }, offerIds: items.map((item) => item.id), destination, privacyConsent: consent }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Non è stato possibile salvare la richiesta.");
      setSuccess(true);
      setMessage("Richiesta salvata. Il pagamento non è ancora attivo: non è stato effettuato alcun addebito.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Errore durante l'invio.");
    } finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-[#f7f9fd] px-5 py-10 text-[#0c1222]">
    {linkedTestCheckoutEnabled && <Script src="https://js.stripe.com/v3/" strategy="afterInteractive" onReady={() => setStripeReady(true)} />}
    <div className="mx-auto max-w-5xl">
    <a href="/package-builder" className="font-semibold text-[#1a3470]">← Torna al pacchetto</a>
    <p className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">CompareX checkout</p>
    <h1 className="mt-3 text-4xl font-bold tracking-tight">Completa i tuoi dati</h1>
    <p className="mt-3 max-w-2xl leading-7 text-slate-600">Il pacchetto rimane su CompareX. Inserisci i dati di contatto per preparare la richiesta; il checkout di pagamento qui sotto è ancora una dimostrazione in modalità test.</p>
    {returnStatus && <div role="status" className={"mt-5 rounded-2xl border p-4 text-sm leading-6 " + (returnStatus === "paid_test" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : returnStatus === "loading" ? "border-blue-200 bg-blue-50 text-blue-900" : "border-amber-200 bg-amber-50 text-amber-900")}>
      <p className="font-bold">{returnStatus === "loading" ? "Verifica pagamento…" : returnStatus === "paid_test" ? "Pagamento test completato" : returnStatus === "expired" ? "Sessione scaduta" : "Pagamento non confermato"}</p>
      <p className="mt-1">{returnMessage || "Stiamo verificando la sessione direttamente con Stripe."}</p>
    </div>}
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
      <form onSubmit={submit} className="space-y-5 rounded-3xl border border-[#d5dceb] bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-bold">Dati del cliente</h2>
        <label className="block text-sm font-semibold">Nome e cognome<input required minLength={2} maxLength={120} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal" /></label>
        <label className="block text-sm font-semibold">Email<input required type="email" maxLength={254} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal" /></label>
        <label className="block text-sm font-semibold">Telefono (facoltativo)<input type="tel" maxLength={40} autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal" /></label>
        <label className="flex items-start gap-3 text-sm leading-6 text-slate-600"><input required type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4" /><span>Ho letto la <a href="/privacy" target="_blank" className="font-semibold text-[#1a3470] underline">nota privacy pre-lancio</a>. Per i test uso esclusivamente dati fittizi: non inserisco dati personali reali.</span></label>
        {message && <p role="status" className={"rounded-xl p-4 text-sm " + (success ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900")}>{message}</p>}
        <button type="submit" disabled={busy || success} className="w-full rounded-xl bg-[#1a3470] px-5 py-4 font-bold text-white disabled:opacity-60">{linkedTestCheckoutEnabled ? (paymentBusy ? "Preparazione pagamento…" : "Continua al pagamento test →") : busy ? "Salvataggio…" : success ? "Richiesta salvata" : "Salva i dati e prepara il pacchetto →"}</button>
        {linkedTestCheckoutEnabled && <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <p className="font-bold text-blue-950">Pagamento incorporato in CompareX (solo test)</p>
          <p className="mt-1 text-sm leading-6 text-blue-900">Il modulo Stripe apparirà direttamente qui, senza aprire una pagina di pagamento esterna. Usa esclusivamente dati fittizi. È un addebito dimostrativo una tantum nell'ambiente test: gli importi sono stime mensili e nessun servizio viene prenotato o attivato.</p>
          {paymentError && <p role="alert" className="mt-3 rounded-lg bg-white p-3 text-sm text-red-700">{paymentError}</p>}
          {checkoutClientSecret && <div className="mt-4 rounded-xl bg-white p-3"><div ref={checkoutContainerRef} /><p className="mt-3 text-xs leading-5 text-slate-500">Stripe opera in modalità test. Usa solo i dati di carta di prova Stripe, mai una carta reale.</p></div>}
        </div>}
        <p className="text-xs leading-5 text-slate-500">Questa fase non è una prenotazione confermata. Usa soltanto dati fittizi; non inserire dati personali reali, documenti d'identità o dati bancari.</p>
      </form>
      <aside className="h-fit rounded-3xl border border-[#d5dceb] bg-white p-6 shadow-sm lg:sticky lg:top-6"><p className="text-xs font-bold uppercase tracking-wider text-blue-700">Riepilogo</p><h2 className="mt-2 text-2xl font-bold">Il tuo pacchetto</h2><p className="mt-1 text-sm text-slate-500">Destinazione: {destination} · stima mensile</p>
        <div className="mt-5 space-y-4">{items.map((item, index) => <div key={item.category + "-" + item.name + "-" + index} className="border-b border-slate-100 pb-4"><p className="text-xs font-semibold uppercase text-slate-500">{item.category}</p><p className="mt-1 font-semibold">{item.name}</p><p className="mt-1 text-sm text-slate-600">€{item.price.toFixed(2)} / mese (stima)</p></div>)}{items.length === 0 && <p className="text-sm text-amber-800">Nessun pacchetto verificato disponibile. Alcune offerte selezionate non sono ancora abilitate al checkout: torna al builder e scegli almeno due offerte del catalogo verificato.</p>}</div>
        <div className="mt-5 border-t border-slate-200 pt-5"><p className="text-sm text-slate-500">Totale mensile stimato</p><p className="mt-1 text-3xl font-bold text-[#1a3470]">€{total.toFixed(2)}<span className="text-sm font-medium text-slate-500"> / mese</span></p></div>
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">Il checkout attuale è esclusivamente una dimostrazione Stripe test: importi stimati, pagamento una tantum e nessuna attivazione del servizio.</div>
      </aside>
    </div>
  </div></main>;
}
export default function CheckoutPage() { return <Suspense fallback={<main className="p-10">Caricamento checkout…</main>}><CheckoutContent /></Suspense>; }
