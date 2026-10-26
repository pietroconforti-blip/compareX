import Stripe from "stripe";
import Link from "next/link";
export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<{ session_id?: string }> };
export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id: sessionId } = await searchParams;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  let paid = false;
  let subscriptionId: string | null = null;
  if (secretKey && sessionId) {
    try {
      const session = await new Stripe(secretKey).checkout.sessions.retrieve(sessionId, { expand: ["subscription"] });
      paid = session.payment_status === "paid" && session.metadata?.product === "comparex_package_subscription";
      subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null;
    } catch { paid = false; }
  }
  return <main className="min-h-screen bg-[#f7f9fd] px-5 py-16 text-[#0c1222]"><section className="mx-auto max-w-xl rounded-3xl border border-[#d5dceb] bg-white p-8 text-center shadow-sm"><div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl ${paid ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{paid ? "✓" : "!"}</div><h1 className="mt-5 text-3xl font-bold">{paid ? "Abbonamento attivato" : "Pagamento non verificato"}</h1><p className="mt-3 leading-7 text-slate-600">{paid ? "Pagamento confermato: 5 € di attivazione una tantum e 2 € al mese. I servizi selezionati si pagano separatamente ai fornitori." : "Non è stato possibile verificare il pagamento. Se hai pagato, contatta l'assistenza prima di riprovare."}</p>{paid && subscriptionId && <p className="mt-3 text-sm text-slate-500">Abbonamento Stripe: {subscriptionId}</p>}<div className="mt-6 flex flex-wrap justify-center gap-3"><Link href="/contact" className="rounded-xl border border-[#1a3470] px-5 py-3 font-semibold text-[#1a3470]">Assistenza</Link><Link href="/" className="rounded-xl bg-[#1a3470] px-5 py-3 font-semibold text-white">Torna a CompareX</Link></div></section></main>;
}