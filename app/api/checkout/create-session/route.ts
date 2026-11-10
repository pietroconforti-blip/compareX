import { NextResponse } from "next/server";
import Stripe from "stripe";
import { offers as catalogue } from "@/lib/home-data";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: "Stripe is not configured. Set STRIPE_SECRET_KEY in environment variables." },
      { status: 503 }
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const offerIds: number[] = Array.isArray(body?.offerIds) ? body.offerIds.filter((id: unknown) => Number.isInteger(id)) : [];
  const customerEmail = typeof body?.email === "string" ? body.email.trim() : undefined;
  const destination = typeof body?.destination === "string" ? body.destination : "Vienna";

  if (offerIds.length < 1 || offerIds.length > 10) {
    return NextResponse.json({ error: "Select between 1 and 10 offers." }, { status: 400 });
  }

  const selected = offerIds.map((id) => catalogue.find((o) => o.id === id)).filter(Boolean);
  if (selected.length !== offerIds.length) {
    return NextResponse.json({ error: "One or more offers are not available in the catalogue." }, { status: 400 });
  }

  const lineItems = selected.map((offer) => ({
    quantity: 1,
    price_data: {
      currency: "eur",
      unit_amount: Math.round(offer!.price * 100),
      product_data: {
        name: offer!.name,
        description: `${offer!.category} · ${offer!.location} · monthly estimate`,
      },
    },
  }));

  const totalCents = lineItems.reduce((sum, item) => sum + item.price_data.unit_amount, 0);
  if (totalCents <= 0 || totalCents > 1000000) {
    return NextResponse.json({ error: "Invalid package total." }, { status: 400 });
  }

  try {
    const stripe = new Stripe(secretKey);
    const origin = new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: customerEmail || undefined,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?cancelled=1`,
      metadata: {
        destination,
        offer_ids: offerIds.join(","),
        source: "comparex_package",
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("Stripe session creation failed", error);
    return NextResponse.json(
      { error: "Could not create payment session. Check Stripe configuration." },
      { status: 502 }
    );
  }
}
