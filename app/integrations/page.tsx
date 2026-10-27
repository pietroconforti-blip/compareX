"use client";

import { useMemo, useState } from "react";

type Integration = {
  category: string;
  name: string;
  coverage: string;
  access: "Public data" | "Partner approval" | "Affiliate / deeplink";
  detail: string;
  url: string;
  nextStep: string;
};

const integrations: Integration[] = [
  { category: "Transport", name: "ÖBB", coverage: "Austria", access: "Partner approval", detail: "Official ticketshop web services can provide connections and prices; full booking integration requires a commercial agreement and technical onboarding.", url: "https://www.oebb.at/de/kooperationen/online-kooperationen", nextStep: "Request webservice access and commercial terms." },
  { category: "Transport", name: "ÖBB API Portal", coverage: "Austria", access: "Partner approval", detail: "Official API portal for discovering available APIs and requesting access tokens.", url: "https://apiportal.oebb.at/", nextStep: "Register and check API access requirements." },
  { category: "Transport", name: "FlixBus", coverage: "Europe", access: "Partner approval", detail: "Offers affiliate links and a dynamic API integration for approved online partners. API access is requested directly from the distribution team.", url: "https://www.flixbus.at/unternehmen/partner/affiliate-partner", nextStep: "Apply to the affiliate network or request API access." },
  { category: "Transport", name: "ATM Milano", coverage: "Milan", access: "Affiliate / deeplink", detail: "Official fare and pass information can be linked directly; no public live inventory feed is assumed by CompareX.", url: "https://www.atm.it/en/ViaggiaConNoi/Abbonamenti/Pages/PublictransportinMilanhowtosubscribe.aspx", nextStep: "Use official fare pages and request a formal integration if available." },
  { category: "Mobile", name: "Airalo", coverage: "International eSIM", access: "Partner approval", detail: "Offers API, SDK, e-commerce and affiliate integrations for eligible partners.", url: "https://partners.airalo.com/solutions/integrations", nextStep: "Apply for partner access; credentials are required for live prices." },
  { category: "Housing", name: "OeAD Student Housing", coverage: "Austria", access: "Affiliate / deeplink", detail: "Official residence pages can be linked, but current availability must be confirmed with the provider; CompareX does not scrape private inventory.", url: "https://www.oeadstudenthousing.at/en/accommodation/", nextStep: "Ask OeAD whether a partner feed or referral arrangement is available." },
  { category: "Housing", name: "Akademikerhilfe", coverage: "Austria", access: "Affiliate / deeplink", detail: "Official residence listings and application routes can be linked; places are assigned through the provider.", url: "https://www.akademikerhilfe.at/en/vienna", nextStep: "Request permission for structured listing or referral integration." },
  { category: "Housing", name: "home4students", coverage: "Austria", access: "Affiliate / deeplink", detail: "Official residence information and applications can be linked. No public live availability API is assumed.", url: "https://www.home4students.at/", nextStep: "Ask for an approved feed or referral partnership." },
  { category: "Housing", name: "HousingAnywhere", coverage: "Europe", access: "Partner approval", detail: "Marketplace inventory should be imported only through an authorized partner feed/API, not scraping.", url: "https://www.housinganywhere.com/", nextStep: "Contact its partnership team for approved inventory access." },
  { category: "Housing", name: "Spotahome", coverage: "Europe", access: "Partner approval", detail: "Use an approved partner integration for listing data; public search pages are linked as a fallback.", url: "https://www.spotahome.com/", nextStep: "Request partner feed/API access." },
  { category: "Housing", name: "Airbnb", coverage: "International", access: "Partner approval", detail: "Live listings and pricing must come through an authorized Airbnb integration; CompareX should not scrape search results.", url: "https://www.airbnb.com/", nextStep: "Check eligibility for an official software/partner integration." },
  { category: "Gym", name: "FITINN", coverage: "Austria", access: "Affiliate / deeplink", detail: "Membership and price pages are available to link to. Live price feeds require a separate agreement.", url: "https://fitinn.at/mitgliedschaft/", nextStep: "Request a partner or affiliate arrangement for current tariffs." },
  { category: "Gym", name: "McFIT", coverage: "Austria and Italy", access: "Affiliate / deeplink", detail: "Official membership pages can be linked; promotional prices and contract terms need provider verification.", url: "https://www.mcfit.com/", nextStep: "Ask for an approved feed or referral partnership." },
  { category: "Streaming", name: "Netflix", coverage: "Austria and Italy", access: "Affiliate / deeplink", detail: "Official subscription pages can be linked. No public pricing API is assumed.", url: "https://www.netflix.com/", nextStep: "Use official plan pages and refresh curated prices only after verification." },
  { category: "Streaming", name: "Disney+", coverage: "Austria and Italy", access: "Affiliate / deeplink", detail: "Official plan pages can be linked. No public pricing API is assumed.", url: "https://www.disneyplus.com/", nextStep: "Check for an eligible commercial partnership; otherwise use official plan pages." },
];

const accessStyles: Record<Integration["access"], string> = {
  "Public data": "bg-emerald-50 text-emerald-800",
  "Partner approval": "bg-amber-50 text-amber-800",
  "Affiliate / deeplink": "bg-blue-50 text-blue-800",
};

export default function IntegrationsPage() {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const visible = useMemo(() => integrations.filter((item) =>
    (category === "All" || item.category === category) &&
    (item.name + " " + item.coverage + " " + item.detail).toLowerCase().includes(query.toLowerCase())
  ), [category, query]);

  return (
    <main className="min-h-screen bg-[#f7f9fd] text-[#0c1222]">
      <header className="border-b border-[#d5dceb] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1a3470] text-lg font-bold text-white">C</span><span><span className="block text-xl font-bold">CompareX</span><span className="block text-xs text-slate-500">Integration directory</span></span></a>
          <a href="/package-builder" className="rounded-xl border border-[#d5dceb] px-4 py-2 text-sm font-semibold hover:border-[#1a3470]">← Package builder</a>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563eb]">Grow the catalogue</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">More providers. Authorized data.</h1>
        <p className="mt-4 max-w-3xl text-lg leading-7 text-slate-600">These are provider routes that CompareX can use without scraping websites: official partner APIs, affiliate/deep links and provider pages. An entry here does not mean access has already been granted. Live feeds require provider approval, API credentials or a signed partnership where applicable.</p>
        <div className="mt-7 flex flex-col gap-3 md:flex-row">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search providers or countries…" className="w-full rounded-xl border border-[#d5dceb] bg-white px-4 py-3 outline-none focus:border-[#2563eb] md:max-w-sm" />
          <div className="flex flex-wrap gap-2">{["All", "Housing", "Mobile", "Transport", "Gym", "Streaming"].map((item) => <button key={item} onClick={() => setCategory(item)} className={`rounded-xl border px-4 py-2 text-sm font-semibold ${category === item ? "border-[#1a3470] bg-[#1a3470] text-white" : "border-[#d5dceb] bg-white hover:border-[#1a3470]"}`}>{item}</button>)}</div>
        </div>
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {visible.map((item) => <article key={item.name} className="rounded-2xl border border-[#d5dceb] bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-bold uppercase tracking-wide text-slate-500">{item.category} · {item.coverage}</span><span className={`rounded-full px-3 py-1 text-xs font-semibold ${accessStyles[item.access]}`}>{item.access}</span></div>
            <h2 className="mt-3 text-xl font-bold">{item.name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
            <p className="mt-3 text-sm"><strong>Next step:</strong> {item.nextStep}</p>
            <a href={item.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-xl border border-[#d5dceb] px-4 py-2 text-sm font-semibold text-[#1a3470] hover:border-[#1a3470]">Official partner / provider page ↗</a>
          </article>)}
        </div>
        <div className="mt-8 rounded-2xl border border-[#d5dceb] bg-white p-5 text-sm leading-6 text-slate-600">
          <strong className="text-slate-900">Important:</strong> CompareX currently uses curated in-app catalogues for its core offers. This directory identifies official integration paths and safe fallbacks; it does not claim that all providers have granted API access or that the displayed provider pages expose live pricing feeds. Never store partner secrets in client-side code—approved API credentials must be configured as server-side environment variables.
        </div>
      </div>
    </main>
  );
}
