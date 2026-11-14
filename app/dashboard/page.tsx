"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

type SavedItem = { category: string; name: string; price: number; priceLabel?: string; location?: string; sourceUrl?: string };
type SavedPackage = { id?: string; items: SavedItem[]; destination: string; budget: string; savedAt: string };
const checklist = [
  { id: "housing", title: "Housing", detail: "Confirm rent, deposit, contract duration, utilities and move-in date with the provider." },
  { id: "mobile", title: "Mobile plan", detail: "Check coverage, activation fees, roaming allowance and cancellation terms." },
  { id: "transport", title: "Transport", detail: "Compare monthly passes with student or age-based eligibility." },
  { id: "gym", title: "Gym & fitness", detail: "Check joining fees, minimum term and cancellation notice." },
  { id: "streaming", title: "Streaming", detail: "Review current prices and whether a student plan is available." },
  { id: "documents", title: "Moving documents", detail: "Check registration, university documents and any city-specific requirements." },
];

export default function DashboardPage() {
  const [saved, setSaved] = useState<SavedPackage | null>(null);
  const [checked, setChecked] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [cloudNotice, setCloudNotice] = useState("");
  useEffect(() => {
    try {
      const raw = localStorage.getItem("comparex-saved-package");
      if (raw) setSaved(JSON.parse(raw) as SavedPackage);
      const tasks = localStorage.getItem("comparex-dashboard-checklist");
      if (tasks) setChecked(JSON.parse(tasks) as string[]);
      const syncNotice = sessionStorage.getItem("comparex-package-sync-notice");
      if (syncNotice) { setCloudNotice(syncNotice); sessionStorage.removeItem("comparex-package-sync-notice"); }
    } catch { /* Keep a usable empty dashboard if browser storage is unavailable. */ }
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
      const supabase = createClient();
      supabase.auth.getUser().then(async ({ data }) => {
        if (!data.user) return;
        setAccountEmail(data.user.email ?? null);
        const { data: cloudPackage, error } = await supabase.from("comparex_customer_packages")
          .select("id, destination, budget, items, created_at")
          .eq("user_id", data.user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
        if (error) { setCloudNotice("Cloud package sync is waiting for the CompareX database migration."); return; }
        if (cloudPackage) {
          const nextSaved = { id: cloudPackage.id, items: cloudPackage.items as SavedItem[], destination: cloudPackage.destination, budget: cloudPackage.budget, savedAt: cloudPackage.created_at };
          setSaved(nextSaved);
          try { localStorage.setItem("comparex-saved-package", JSON.stringify(nextSaved)); } catch {}
        }
      }).catch(() => setCloudNotice("Could not check your CompareX account sync."));
    }
    setReady(true);
  }, []);
  function toggle(id: string) {
    setChecked(current => {
      const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
      try { localStorage.setItem("comparex-dashboard-checklist", JSON.stringify(next)); } catch {}
      return next;
    });
  }
  async function removePackage() {
    if (saved?.id && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (data.user) await supabase.from("comparex_customer_packages").delete().eq("id", saved.id).eq("user_id", data.user.id);
      } catch { /* Local dashboard can still be cleared if cloud deletion is unavailable. */ }
    }
    try { localStorage.removeItem("comparex-saved-package"); } catch {}
    setSaved(null);
  }
  const total = saved?.items.reduce((sum, item) => sum + item.price, 0) ?? 0;
  return <main className="min-h-screen bg-[#f7f9fd] px-5 py-10 text-[#0c1222]">
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4"><a href="/" className="text-xl font-bold text-[#1a3470]">CompareX</a><nav className="flex flex-wrap gap-3 text-sm font-semibold"><a href="/package-builder" className="rounded-xl bg-[#1a3470] px-4 py-2.5 text-white">Build a package</a><a href="/account" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5">My profile</a><a href="/mobile" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5">Mobile plans</a><a href="/moving" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5">Moving guide</a></nav></div>
      <p className="mt-10 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Your CompareX account</p>{accountEmail && <p className="mt-2 text-sm text-slate-500">Signed in as {accountEmail}</p>}{cloudNotice && <p role="status" className="mt-4 rounded-xl bg-blue-50 p-3 text-sm text-[#1a3470]">{cloudNotice}</p>}<h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Your dashboard</h1>
      <p className="mt-4 max-w-2xl leading-7 text-slate-600">Keep your package and moving checklist together. Sign in to your CompareX account to sync your saved package; checklist progress remains on this device in this preview.</p>
      {!ready ? <p className="mt-8">Loading your dashboard…</p> : <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <section className="rounded-3xl border border-[#d5dceb] bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-blue-700">Saved package</p><h2 className="mt-2 text-2xl font-bold">{saved ? `${saved.destination} student package` : "No package saved yet"}</h2></div>{saved && <button onClick={removePackage} className="text-sm font-semibold text-slate-500 underline">Remove</button>}</div>
          {saved ? <><p className="mt-2 text-sm text-slate-500">Saved {new Date(saved.savedAt).toLocaleString()} · prices are estimates</p><div className="mt-5 space-y-3">{saved.items.map((item, i) => <div key={item.category + item.name + i} className="flex items-start justify-between gap-4 rounded-xl border border-slate-100 p-4"><div><p className="text-xs font-bold uppercase text-slate-500">{item.category}</p><p className="mt-1 font-semibold">{item.name}</p>{item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm text-[#1a3470] underline">Check provider details ↗</a>}</div><p className="shrink-0 font-bold">€{item.price.toFixed(2)}<span className="block text-right text-xs font-normal text-slate-500">/ month</span></p></div>)}</div><div className="mt-5 rounded-2xl bg-[#f2f6ff] p-5"><p className="text-sm text-slate-600">Estimated monthly total</p><p className="mt-1 text-3xl font-bold text-[#1a3470]">€{total.toFixed(2)}</p><p className="mt-1 text-xs leading-5 text-slate-500">Confirm price, availability, fees and eligibility directly with each provider.</p></div><a href="/package-builder" className="mt-5 inline-flex rounded-xl bg-[#1a3470] px-5 py-3 font-semibold text-white">Edit my package →</a></> : <div className="mt-5 rounded-2xl bg-slate-50 p-6"><p className="leading-7 text-slate-600">Create a package in the builder and select “Save to my dashboard”. It will be available here on this browser.</p><a href="/package-builder" className="mt-4 inline-flex rounded-xl bg-[#1a3470] px-5 py-3 font-semibold text-white">Build my first package →</a></div>}
        </section>
        <section className="rounded-3xl border border-[#d5dceb] bg-white p-6 shadow-sm md:p-8"><p className="text-xs font-bold uppercase tracking-wider text-blue-700">Personal checklist</p><h2 className="mt-2 text-2xl font-bold">Get ready to move</h2><p className="mt-2 text-sm text-slate-500">{checked.length} of {checklist.length} tasks completed · saved on this device</p><div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-700 transition-all" style={{width: `${checked.length / checklist.length * 100}%`}} /></div><div className="mt-5 space-y-3">{checklist.map(task => <label key={task.id} className="flex cursor-pointer gap-3 rounded-xl border border-slate-100 p-3"><input type="checkbox" checked={checked.includes(task.id)} onChange={() => toggle(task.id)} className="mt-1 h-4 w-4 accent-blue-800"/><span><span className={`font-semibold ${checked.includes(task.id) ? "text-slate-400 line-through" : ""}`}>{task.title}</span><span className="mt-1 block text-sm leading-5 text-slate-600">{task.detail}</span></span></label>)}</div><a href="/moving" className="mt-5 inline-flex font-semibold text-[#1a3470] underline">Open the complete moving guide →</a></section>
      </div>}
      <p className="mt-8 text-xs leading-5 text-slate-500">Preview notice: saved packages can sync to your CompareX account after the database migration is applied. This dashboard is not a contract manager or booking confirmation. Provider applications and mobile activation are not live yet.</p>
    </div>
  </main>;
}
