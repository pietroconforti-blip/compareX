import Stripe from "stripe";
import Link from "next/link";
export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<{ session_id?: string }> };
export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id: sessionId } = await searchParams;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  let paid = false;
  if (secretKey && sessionId) {
    try {
      const session = await new Stripe(secretKey).checkout.sessions.retrieve(sessionId);
      paid = session.payment_status === "paid" && session.metadata?.product === "comparex_package_activation";
    } catch { paid = false; }
  }
  return <main className="min-h-screen bg-[#f7f9fd] px-5 py-16 text-[#0c1222]"><section className="mx-auto max-w-xl rounded-3xl border border-[#d5dceb] bg-white p-8 text-center shadow-sm"><div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl ${paid ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{paid ? "✓" : "!"}</div><h1 className="mt-5 text-3xl font-bold">{paid ? "Payment confirmed" : "Payment not verified"}</h1><p className="mt-3 leading-7 text-slate-600">{paid ? "The €5 one-time CompareX activation fee has been paid successfully. Service prices remain separate and are paid directly to providers." : "We could not verify a completed payment. If you paid, contact CompareX support before trying again."}</p>{paid && <p className="mt-3 text-sm text-slate-500">Payment reference: {sessionId}</p>}<Link href="/" className="mt-6 inline-flex rounded-xl bg-[#1a3470] px-6 py-3 font-semibold text-white hover:bg-[#12254f]">Back to CompareX</Link></section></main>;
}