export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-[#f7f9fd] px-5 py-16 text-[#0c1222]">
      <section className="mx-auto max-w-2xl rounded-3xl border border-[#d5dceb] bg-white p-8 shadow-sm md:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#203b72]">CompareX · Pre-launch</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Purchases happen directly with providers.</h1>
        <p className="mt-4 leading-7 text-slate-600">CompareX helps you discover and compare student services. We do not currently sell subscriptions, bundle third-party services or process customer payments. This keeps prices, contracts and payments directly between you and the provider.</p>
        <div className="mt-6 rounded-2xl bg-[#f2f6ff] p-5 text-sm leading-6 text-slate-700">
          Your selected package is an estimate, not an order or booking. Open the official provider links in the package builder to confirm current prices, eligibility, availability and contract terms.
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href="/package-builder" className="rounded-xl bg-[#203b72] px-5 py-3 text-center font-semibold text-white hover:bg-[#152a52]">Back to my package</a>
          <a href="/" className="rounded-xl border border-[#d5dceb] px-5 py-3 text-center font-semibold text-[#203b72] hover:bg-slate-50">Explore CompareX</a>
        </div>
        <p className="mt-6 text-xs leading-5 text-slate-500">No payment details or personal information are collected on this page.</p>
      </section>
    </main>
  );
}
