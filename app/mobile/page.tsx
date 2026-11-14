"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";

type MobileOffer = { id: string; country: string; provider: string; plan: string; monthlyPrice: number; dataGB: number; maxSpeed?: string | null; activationFee?: number | null; contract?: string; officialUrl?: string };
type ProviderStatus = { slug: string; name: string; integrationStatus: string; capabilities: string[] };
const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

export default function MobileSetupPage() {
  const [offers, setOffers] = useState<MobileOffer[]>([]);
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [offersResponse, integrationsResponse] = await Promise.all([fetch("/api/offers", { cache: "no-store" }), fetch("/api/mobile/integrations", { cache: "no-store" })]);
        const offersData = offersResponse.ok ? await offersResponse.json() : { offers: [] };
        const integrationsData = integrationsResponse.ok ? await integrationsResponse.json() : { providers: [] };
        const austrianOffers = (offersData.offers ?? []).filter((offer: MobileOffer) => offer.country === "Austria");
        if (!active) return;
        setOffers(austrianOffers); setSelectedId(austrianOffers[0]?.id ?? ""); setProviders(integrationsData.providers ?? []);
      } catch { if (active) setMessage("The mobile catalogue could not be loaded. Please try again later."); }
      finally { if (active) setLoading(false); }
    }
    void load();
    if (configured) {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => { if (active) setUserId(data.user?.id ?? null); });
    }
    return () => { active = false; };
  }, []);

  const selected = useMemo(() => offers.find(offer => offer.id === selectedId) ?? null, [offers, selectedId]);
  const providerSlug = selected?.provider.toLowerCase().replace(/[^a-z0-9]+/g, "") ?? "";
  const provider = providers.find(item => item.slug === providerSlug) ?? null;

  async function saveDraft() {
    if (!configured) { setMessage("Account storage is not configured in this preview yet."); return; }
    if (!userId) { setMessage("Create a CompareX account or sign in before saving your mobile setup."); return; }
    if (!selected) return;
    setSaving(true); setMessage("");
    try {
      const supabase = createClient();
      const { error } = await supabase.from("comparex_mobile_application_drafts").insert({
        user_id: userId, provider_slug: providerSlug, offer_id: selected.id, offer_snapshot: selected,
        status: "draft", provider_submission_status: "not_configured",
      });
      if (error) throw error;
      setMessage("Your mobile setup has been saved to your CompareX account. No contract has been submitted and no payment has been taken.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The draft could not be saved. The CompareX One database migration may still be pending.");
    } finally { setSaving(false); }
  }

  return (
    <main className="min-h-screen bg-[#f7f9fd] px-5 py-10 text-[#0c1222]">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-4"><a href="/" className="text-xl font-bold text-[#1a3470]">CompareX</a><nav className="flex flex-wrap gap-2 text-sm font-semibold"><a href="/account" className="rounded-xl border border-[#d5dceb] bg-white px-4 py-2">My profile</a><a href="/dashboard" className="rounded-xl border border-[#d5dceb] bg-white px-4 py-2">Dashboard</a></nav></header>
        <section className="mt-10 grid gap-7 lg:grid-cols-[1fr_340px]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">CompareX One · Mobile</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Set up your mobile plan.</h1>
            <p className="mt-4 max-w-2xl text-lg leading-7 text-slate-600">Choose an Austrian tariff and save it to your CompareX account. This first release prepares your application workspace; contract activation will follow once a mobile operator authorises an API connection.</p>
            <div className="mt-7 space-y-3">
              {loading ? <p className="rounded-2xl border border-[#d5dceb] bg-white p-5">Loading Austrian mobile offers…</p> : offers.map(offer => (
                <button key={offer.id} type="button" onClick={() => setSelectedId(offer.id)} aria-pressed={selectedId === offer.id} className={"w-full rounded-2xl border bg-white p-5 text-left transition " + (selectedId === offer.id ? "border-[#1a3470] ring-2 ring-[#dce6ff]" : "border-[#d5dceb] hover:border-[#1a3470]")}>
                  <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{offer.provider}</p><h2 className="mt-1 text-xl font-bold">{offer.plan}</h2><p className="mt-2 text-sm text-slate-600">{offer.dataGB} GB data · {offer.maxSpeed ?? "Speed subject to provider terms"}</p><p className="mt-1 text-xs text-slate-500">{offer.contract ?? "Check contract terms with provider"}</p></div><div className="text-right"><p className="text-2xl font-bold text-[#1a3470]">€{offer.monthlyPrice.toFixed(2)}</p><p className="text-xs text-slate-500">per month</p>{selectedId === offer.id && <span className="mt-2 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">Selected</span>}</div></div>
                </button>
              ))}
              {!loading && offers.length === 0 && <p className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">No Austrian mobile offers are available right now.</p>}
            </div>
          </div>
          <aside className="h-fit rounded-3xl border border-[#d5dceb] bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Your mobile setup</p>
            {selected ? <><h2 className="mt-2 text-2xl font-bold">{selected.provider}</h2><p className="mt-1 text-slate-600">{selected.plan}</p><p className="mt-5 text-3xl font-bold text-[#1a3470]">€{selected.monthlyPrice.toFixed(2)}<span className="text-sm font-medium text-slate-500"> / month</span></p><p className="mt-3 text-sm text-slate-500">Activation fee: {selected.activationFee == null ? "Confirm with provider" : "€" + selected.activationFee.toFixed(2)}</p></> : <p className="mt-3 text-sm text-slate-500">Select a tariff to continue.</p>}
            <div className="mt-5 rounded-2xl bg-amber-50 p-4"><p className="text-sm font-bold text-amber-900">Provider API not connected</p><p className="mt-1 text-xs leading-5 text-amber-800">You can save your choice, but CompareX cannot submit a contract, verify your identity or charge a payment yet.</p></div>
            <button type="button" onClick={saveDraft} disabled={!selected || saving} className="mt-5 w-full rounded-xl bg-[#1a3470] px-5 py-3 font-bold text-white disabled:opacity-50">{saving ? "Saving…" : "Save mobile setup"}</button>
            {!userId && <a href="/account" className="mt-3 block text-center text-sm font-semibold text-[#1a3470] underline">Create account or sign in</a>}
            {provider && <p className="mt-3 text-xs text-slate-500">Integration status: {provider.integrationStatus.replaceAll("_", " ")}</p>}
            {message && <p role="status" className="mt-4 rounded-xl bg-blue-50 p-3 text-sm leading-6 text-[#1a3470]">{message}</p>}
            {selected?.officialUrl && <a href={selected.officialUrl} target="_blank" rel="noreferrer" className="mt-5 block text-center text-xs font-semibold text-slate-500 underline">View official provider information ↗</a>}
          </aside>
        </section>
      </div>
    </main>
  );
}
