"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SearchResults() {
  const params = useSearchParams();
  const router = useRouter();
  const query = params.get("q") ?? "";

  return (
    <main className="min-h-screen bg-[#f7f6f2] text-[#0f1a2e]">
      <header className="sticky top-0 z-40 border-b border-[#e8e6e0]/80 header-glass">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <button onClick={() => router.push("/")} className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1e3a6e] text-lg font-bold text-white shadow-sm">
              C
            </span>
            <span className="text-xl font-bold">CompareX</span>
          </button>
          <button
            onClick={() => router.push("/")}
            className="rounded-xl border border-[#e8e6e0] bg-white px-4 py-2 text-sm font-semibold shadow-sm transition hover:border-[#1e3a6e] hover:bg-slate-50"
          >
            ← Home
          </button>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <p className="text-sm font-semibold uppercase tracking-wider text-[#1e3a6e]">
          CompareX · Search results
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
          Search
        </h1>
        <p className="mt-3 break-words text-slate-600">
          Your search: “{query}”
        </p>
        <div className="mt-8 rounded-2xl border border-[#e8e6e0] bg-white p-6 shadow-sm">
          <p className="text-slate-600">
            The full search experience is being restored. Please use the homepage search in the meantime, or refresh in a few minutes.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 rounded-xl bg-[#1e3a6e] px-5 py-3 font-semibold text-white hover:bg-[#152a52]"
          >
            Back to homepage
          </button>
        </div>
      </section>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f7f6f2] p-10">Loading CompareX…</main>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
