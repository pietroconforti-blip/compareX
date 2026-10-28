import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || !secretKey.startsWith("sk_test_")) {
    return NextResponse.json({ error: "Verifica disponibile solo in modalità test." }, { status: 503 });
  }
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId || !sessionId.startsWith("cs_test_")) return NextResponse.json({ error: "Sessione test non valida." }, { status: 400 });
  try {
    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return NextResponse.json({
      status: session.payment_status === "paid" ? "paid_test" : session.status === "expired" ? "expired" : "not_paid",
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total,
      currency: session.currency,
      testMode: true,
      fulfillment: "not_started",
    });
  } catch {
    return NextResponse.json({ error: "Non è stato possibile verificare la sessione." }, { status: 404 });
  }
}
