"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState<"loading" | "paid" | "unpaid" | "error">("loading");
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }
    fetch(`/api/checkout/session-status?session_id=${encodeURIComponent(sessionId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.paymentStatus === "paid" || data.status === "paid_test") {
          setStatus("paid");
          setDetails(data);
        } else {
          setStatus("unpaid");
        }
      })
      .catch(() => setStatus("error"));
  }, [sessionId]);

  return (
    <main className="min-h-screen bg-[#f8f9fc] px-6 py-16 text-[#0c1222]">
      <div className="mx-auto max-w-2xl text-center">
        {status === "loading" && <p className="text-lg">Verifying payment…</p>}
        {status === "paid" && (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">✓</div>
            <h1 className="mt-6 text-3xl font-bold">Payment successful</h1>
            <p className="mt-4 text-slate-600">
              Thank you. Your CompareX package payment was received.
              {details?.amountTotal && (
                <span className="block mt-2 font-semibold text-[#203b72]">
                  Amount: €{(details.amountTotal / 100).toFixed(2)}
                </span>
              )}
            </p>
            <a href="/" className="mt-8 inline-block rounded-xl bg-[#203b72] px-6 py-3 font-semibold text-white">
              Back to CompareX
            </a>
          </>
        )}
        {status === "unpaid" && (
          <>
            <h1 className="text-3xl font-bold">Payment not completed</h1>
            <p className="mt-4 text-slate-600">The payment was not completed. No charge was made.</p>
            <a href="/checkout" className="mt-8 inline-block rounded-xl bg-[#203b72] px-6 py-3 font-semibold text-white">
              Try again
            </a>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="text-3xl font-bold">Could not verify payment</h1>
            <p className="mt-4 text-slate-600">Please contact support if you believe a payment was made.</p>
            <a href="/" className="mt-8 inline-block rounded-xl bg-[#203b72] px-6 py-3 font-semibold text-white">
              Home
            </a>
          </>
        )}
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<main className="p-10 text-center">Loading…</main>}>
      <SuccessContent />
    </Suspense>
  );
}
