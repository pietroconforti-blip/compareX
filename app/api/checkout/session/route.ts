import { NextResponse } from "next/server";
import Stripe from "stripe";
import { offers as catalogue } from "@/lib/home-data";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // Test-only. Real charges remain disabled until CompareX has seller agreements,
  // verified catalogue data, fulfilment, legal terms and production payment controls.
  if (process.env.COMPAREX_TEST_CHECKOUT_ENABLED !== "true") {
    return NextResponse.json({ error: "Il checkout di prova non è abilitato su questo deployment." }, { status: 503 });
  }
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || !secretKey.startsWith("sk_test_")) {
    return NextResponse.json({ error: "Il checkout di prova richiede una chiave Stripe test (sk_test_). I pagamenti reali sono disattivati." }, { status: 503 });
  }

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 }); }
  const offerIds = body?.offerIds;
  const email = typeof body?.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) ? body.email.slice(0, 254) : undefined;
  if (!Array.isArray(offerIds) || offerIds.length < 2 || offerIds.length > 10 || offerIds.some((id: unknown) => !Number.isInteger(id))) {
    return NextResponse.json({ error: "Seleziona da 2 a 10 offerte valide." }, { status: 400 });
  }
  if (new Set(offerIds).size !== offerIds.length) return NextResponse.json({ error: "Il pacchetto contiene offerte duplicate." }, { status: 400 });

  // Resolve IDs and prices on the server. Never accept price, name or currency from the browser.
  const selectedOffers = offerIds.map((id: number) => catalogue.find((offer) => offer.id === id));
  if (selectedOffers.some((offer) => !offer)) {
    return NextResponse.json({ error: "Una o più offerte richiedono verifica del catalogo prima del checkout. Torna al builder e scegli offerte abilitate." }, { status: 400 });
  }
  const verifiedOffers = selectedOffers as (typeof catalogue)[number][];
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = verifiedOffers.map((offer) => ({
    quantity: 1,
    price_data: {
      currency: "eur",
      unit_amount: Math.round(offer.price * 100),
      product_data: {
        name: offer.name,
        description: offer.category + " · stima mensile, checkout dimostrativo",
      },
    },
  }));
  const total = lineItems.reduce((sum, item) => sum + (item.price_data?.unit_amount ?? 0), 0);
  if (lineItems.some((item) => (item.price_data?.unit_amount ?? 0) < 1) || total > 5000000) {
    return NextResponse.json({ error: "Il totale del pacchetto non rientra nei limiti del checkout di prova." }, { status: 400 });
  }

  try {
    const stripe = new Stripe(secretKey);
    const origin = new URL(request.url).origin;
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: email,
      client_reference_id: "comparex-test-" + crypto.randomUUID(),
      metadata: { environment: "test", checkout_kind: "package_demo", offer_ids: offerIds.join(","), monthly_estimate_eur: (total / 100).toFixed(2) },
      return_url: origin + "/checkout/result?status=success&session_id={CHECKOUT_SESSION_ID}",
      submit_type: "pay",
    });
    if (!session.client_secret) return NextResponse.json({ error: "Stripe non ha restituito il client secret del checkout embedded." }, { status: 502 });
    return NextResponse.json({ clientSecret: session.client_secret, testMode: true, estimatedMonthlyTotal: total / 100 });
  } catch (error) {
    console.error("CompareX embedded test checkout creation failed", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "Impossibile avviare il checkout embedded di prova. Verifica la configurazione Stripe test." }, { status: 502 });
  }
}
