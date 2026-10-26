"use client";
import { useState } from "react";
type Audience = "seller" | "agency";
export default function ContactPage() {
  const [audience, setAudience] = useState<Audience>("agency");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("package");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ audience, name, email, topic, message }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invio non riuscito.");
      setSent(true);
    } catch (e) { setError(e instanceof Error ? e.message : "Invio non riuscito."); }
    finally { setBusy(false); }
  }
  return <main className="min-h-screen bg-[#f7f9fd] px-5 py-10 text-[#0c1222]"><div className="mx-auto max-w-2xl"><a href="/" className="font-bold text-[#1a3470]">← CompareX</a><p className="mt-8 text-xs font-bold uppercase tracking-widest text-blue-700">CompareX support</p><h1 className="mt-2 text-4xl font-bold">Parla con chi può aiutarti.</h1><p className="mt-3 leading-7 text-slate-600">Invia una richiesta dalla piattaforma. Non devi aprire WhatsApp o andare sul sito del venditore.</p>
  {sent ? <section className="mt-8 rounded-3xl border border-emerald-200 bg-white p-8"><h2 className="text-2xl font-bold text-emerald-800">Richiesta inviata</h2><p className="mt-2 text-slate-600">La richiesta è stata inoltrata al canale configurato. Puoi tornare a CompareX.</p><a href="/" className="mt-5 inline-flex rounded-xl bg-[#1a3470] px-5 py-3 font-semibold text-white">Torna alla piattaforma</a></section> : <form onSubmit={submit} className="mt-8 space-y-5 rounded-3xl border border-[#d5dceb] bg-white p-6 shadow-sm md:p-8">
  <div><p className="mb-2 text-sm font-semibold">Chi vuoi contattare?</p><div className="grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => setAudience("agency")} className={`rounded-xl border p-4 text-left ${audience === "agency" ? "border-[#1a3470] bg-blue-50" : "border-slate-200"}`}><strong>Assistenza CompareX</strong><span className="mt-1 block text-sm text-slate-500">Pacchetti, pagamenti e supporto</span></button><button type="button" onClick={() => setAudience("seller")} className={`rounded-xl border p-4 text-left ${audience === "seller" ? "border-[#1a3470] bg-blue-50" : "border-slate-200"}`}><strong>Venditore</strong><span className="mt-1 block text-sm text-slate-500">Domande su un'offerta specifica</span></button></div></div>
  <label className="block text-sm font-semibold">Nome<input required value={name} onChange={e => setName(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal" autoComplete="name"/></label>
  <label className="block text-sm font-semibold">Email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal" autoComplete="email"/></label>
  <label className="block text-sm font-semibold">Argomento<select value={topic} onChange={e => setTopic(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal"><option value="package">Pacchetto</option><option value="offer">Offerta / fornitore</option><option value="billing">Abbonamento o pagamento</option><option value="other">Altro</option></select></label>
  <label className="block text-sm font-semibold">Messaggio<textarea required minLength={10} maxLength={3000} value={message} onChange={e => setMessage(e.target.value)} rows={5} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal" placeholder="Come possiamo aiutarti?"/></label>
  {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
  <button disabled={busy} className="w-full rounded-xl bg-[#1a3470] px-5 py-4 font-bold text-white disabled:opacity-60">{busy ? "Invio in corso…" : "Invia richiesta →"}</button><p className="text-xs leading-5 text-slate-500">La richiesta resta nella piattaforma fino all'inoltro al canale di assistenza configurato.</p>
  </form>}
  </div></main>;
}