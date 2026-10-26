import Stripe from "stripe";
import { NextResponse } from "next/server";
import { offers } from "@/lib/home-data";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return NextResponse.json({ error: "Pagamenti non configurati: aggiungi STRIPE_SECRET_KEY nelle variabili ambiente di Vercel." }, { status: 503 });
  try {
    const body = await request.json();
    const ids = Array.isArray(body.ids) ? [...new Set(body.ids.map(Number).filter((id: number) => Number.isInteger(id)))] : [];
    const selected = offers.filter((offer) => ids.includes(offer.id));
    if (selected.length < 2 || selected.length !== ids.length) return NextResponse.json({ error: "Pacchetto non valido. Seleziona almeno due servizi." }, { status: 400 });
    const stripe = new Stripe(secretKey);
    const origin = new URL(request.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        { price_data: { currency: "eur", product_data: { name: "Attivazione pacchetto CompareX", description: "Tariffa una tantum. I servizi sono pagati separatamente ai fornitori." }, unit_amount: 500 }, quantity: 1 },
        { price_data: { currency: "eur", product_data: { name: "Abbonamento CompareX", description: "Canone mensile per mantenere attivo il pacchetto CompareX." }, unit_amount: 200, recurring: { interval: "month" } }, quantity: 1 },
      ],
      subscription_data: { metadata: { product: "comparex_package_subscription", offer_ids: selected.map((o) => o.id).join(",") } },
      metadata: { product: "comparex_package_subscription", offer_ids: selected.map((o) => o.id).join(","), supplier_monthly_total_eur: selected.reduce((sum, o) => sum + o.price, 0).toFixed(2) },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?ids=${selected.map((o) => o.id).join(",")}&cancelled=1`,
    });
    if (!session.url) throw new Error("Stripe non ha restituito un URL di pagamento.");
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Impossibile avviare il pagamento. Riprova più tardi." }, { status: 500 });
  }
}