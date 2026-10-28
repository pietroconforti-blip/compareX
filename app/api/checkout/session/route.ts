import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const allowedCategories = new Set(["housing", "mobile", "transport", "gym", "streaming"]);

export async function POST(request: Request) {
  // This is a test-only checkout prototype. Real charges stay disabled until
  // provider agreements, trusted pricing, fulfillment, legal terms and webhooks are ready.
  if (process.env.COMPAREX_TEST_CHECKOUT_ENABLED !== "true") {
    return NextResponse.json({ error: "Il checkout di prova non è abilitato su questo deployment." }, { status: 503 });
  }
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || !secretKey.startsWith("sk_test_")) {
    return NextResponse.json({ error: "Il checkout di prova richiede una chiave Stripe test (sk_test_). I pagamenti reali sono disattivati." }, { status: 503 });
  }

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 }); }
  const items = body?.items;
  const email = typeof body?.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) ? body.email.slice(0, 254) : undefined;
  if (!Array.isArray(items) || items.length < 2 || items.length > 10) return NextResponse.json({ error: "Seleziona da 2 a 10 servizi." }, { status: 400 });

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  for (const item of items) {
    if (!item || !allowedCategories.has(item.category) || typeof item.name !== "string" || item.name.trim().length < 1 || item.name.length > 200 || !Number.isFinite(item.price) || item.price < 0 || item.price > 100000) {
      return NextResponse.json({ error: "Una delle offerte non è valida." }, { status: 400 });
    }
    const unitAmount = Math.round(item.price * 100);
    if (unitAmount < 1) continue;
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "eur",
        unit_amount: unitAmount,
        product_data: {
          name: item.name.trim(),
          description: item.category + " · stima mensile, checkout dimostrativo",
        },
      },
    });
  }
  if (lineItems.length < 2) return NextResponse.json({ error: "Il totale del pacchetto deve includere almeno due offerte con prezzo maggiore di zero." }, { status: 400 });
  const total = lineItems.reduce((sum, item) => sum + (item.price_data?.unit_amount ?? 0), 0);
  if (total > 5000000) return NextResponse.json({ error: "Il totale supera il limite consentito per il checkout di prova." }, { status: 400 });

  try {
    const stripe = new Stripe(secretKey);
    const origin = new URL(request.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: email,
      client_reference_id: "comparex-test-" + crypto.randomUUID(),
      metadata: { environment: "test", checkout_kind: "package_demo", monthly_estimate_eur: (total / 100).toFixed(2) },
      success_url: origin + "/checkout/result?status=success&session_id={CHECKOUT_SESSION_ID}",
      cancel_url: origin + "/checkout/result?status=cancelled",
      submit_type: "pay",
    });
    if (!session.url) return NextResponse.json({ error: "Stripe non ha restituito un link di checkout." }, { status: 502 });
    return NextResponse.json({ url: session.url, testMode: true, estimatedMonthlyTotal: total / 100 });
  } catch (error) {
    console.error("CompareX test checkout session creation failed", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "Impossibile avviare il checkout di prova. Verifica la configurazione Stripe test." }, { status: 502 });
  }
}
