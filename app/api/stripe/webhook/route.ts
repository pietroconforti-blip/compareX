import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    console.error("Stripe webhook is missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET.");
    return NextResponse.json({ error: "Webhook Stripe non configurato." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Header stripe-signature mancante." }, { status: 400 });
  }

  const stripe = new Stripe(secretKey);
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.warn("Stripe webhook signature verification failed:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "Firma webhook non valida." }, { status: 400 });
  }

  // Stripe retries events when it does not receive a 2xx response. Keep this handler
  // fast and acknowledge only verified events. Connect durable entitlement changes
  // to the application's subscription/customer store before using subscription state
  // to grant or revoke access.
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.info("CompareX checkout completed", {
        eventId: event.id,
        sessionId: session.id,
        customerId: typeof session.customer === "string" ? session.customer : session.customer?.id,
        subscriptionId: typeof session.subscription === "string" ? session.subscription : session.subscription?.id,
        paymentStatus: session.payment_status,
      });
      break;
    }
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      console.info("CompareX invoice paid", {
        eventId: event.id,
        invoiceId: invoice.id,
        customerId: typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id,
        subscriptionId: typeof invoice.parent?.subscription_details?.subscription === "string"
          ? invoice.parent.subscription_details.subscription
          : invoice.parent?.subscription_details?.subscription?.id,
      });
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      console.warn("CompareX subscription invoice payment failed", {
        eventId: event.id,
        invoiceId: invoice.id,
        customerId: typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id,
      });
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      console.info("CompareX subscription lifecycle update", {
        eventId: event.id,
        subscriptionId: subscription.id,
        customerId: typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        eventType: event.type,
      });
      break;
    }
    default:
      console.info("Stripe webhook event received", { eventId: event.id, type: event.type });
  }

  return NextResponse.json({ received: true });
}
