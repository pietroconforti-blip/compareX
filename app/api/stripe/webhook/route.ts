import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    console.error("Stripe webhook is missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET.");
    return NextResponse.json({ error: "Webhook Stripe non configurato." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Header stripe-signature mancante." }, { status: 400 });

  const stripe = new Stripe(secretKey);
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.warn("Stripe webhook signature verification failed:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "Firma webhook non valida." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      // Durable order reconciliation is opt-in and must remain off until the
      // matching Supabase migration and webhook signing secret are verified.
      if (process.env.COMPAREX_PAYMENT_EVENT_PERSISTENCE_ENABLED === "true") {
        if (!secretKey.startsWith("sk_test_") || event.livemode) {
          return NextResponse.json({ error: "La persistenza CompareX è configurata solo per eventi Stripe test." }, { status: 400 });
        }
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceRoleKey) {
          return NextResponse.json({ error: "Supabase non configurato per la riconciliazione." }, { status: 503 });
        }

        const supabase = createClient(supabaseUrl, serviceRoleKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const rawOrderId = session.metadata?.comparex_order_id ?? "";
        const orderId = uuidPattern.test(rawOrderId) ? rawOrderId : null;
        const paymentIntentId = typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null;

        const { data: insertedEvent, error: insertError } = await supabase
          .from("comparex_payment_events")
          .insert({
            provider: "stripe",
            provider_event_id: event.id,
            event_type: event.type,
            order_id: orderId,
            safe_metadata: {
              checkout_session_id: session.id,
              payment_status: session.payment_status,
              livemode: event.livemode,
            },
            processing_status: "received",
          })
          .select("id")
          .maybeSingle();

        let paymentEventId = insertedEvent?.id as string | undefined;
        if (insertError?.code === "23505") {
          const { data: existingEvent, error: existingError } = await supabase
            .from("comparex_payment_events")
            .select("id,processing_status")
            .eq("provider", "stripe")
            .eq("provider_event_id", event.id)
            .single();
          if (existingError || !existingEvent) {
            console.error("CompareX duplicate Stripe event lookup failed", existingError?.message);
            return NextResponse.json({ error: "Impossibile verificare l'evento Stripe duplicato." }, { status: 500 });
          }
          if (existingEvent.processing_status === "processed" || existingEvent.processing_status === "ignored") {
            return NextResponse.json({ received: true, duplicate: true });
          }
          paymentEventId = existingEvent.id;
        } else if (insertError || !paymentEventId) {
          console.error("CompareX Stripe event persistence failed", insertError?.message ?? "missing event row");
          return NextResponse.json({ error: "Impossibile registrare l'evento di pagamento." }, { status: 500 });
        }

        if (!orderId || session.payment_status !== "paid") {
          const { error: ignoredError } = await supabase
            .from("comparex_payment_events")
            .update({ processing_status: "ignored", processed_at: new Date().toISOString() })
            .eq("id", paymentEventId);
          if (ignoredError) return NextResponse.json({ error: "Impossibile aggiornare lo stato dell'evento." }, { status: 500 });
          console.info("CompareX verified checkout event ignored", { eventId: event.id, sessionId: session.id, reason: !orderId ? "missing_order_reference" : "payment_not_paid" });
          break;
        }

        const { data: updatedOrder, error: orderError } = await supabase
          .from("package_order_drafts")
          .update({
            order_status: "paid",
            payment_status: "paid",
            stripe_payment_intent_id: paymentIntentId,
            paid_at: new Date().toISOString(),
          })
          .eq("id", orderId)
          .eq("stripe_checkout_session_id", session.id)
          .select("id")
          .maybeSingle();

        if (orderError || !updatedOrder) {
          await supabase.from("comparex_payment_events")
            .update({ processing_status: "failed" })
            .eq("id", paymentEventId);
          console.error("CompareX paid checkout did not match an order", {
            eventId: event.id,
            sessionId: session.id,
            orderId,
            error: orderError?.message ?? "order/session link not found",
          });
          return NextResponse.json({ error: "Pagamento verificato ma ordine non riconciliato. Stripe riproverà l'evento." }, { status: 500 });
        }

        const { error: processedError } = await supabase
          .from("comparex_payment_events")
          .update({ processing_status: "processed", processed_at: new Date().toISOString() })
          .eq("id", paymentEventId);
        if (processedError) {
          console.error("CompareX event processed marker failed", processedError.message);
          return NextResponse.json({ error: "Ordine aggiornato; completamento del registro eventi in attesa di retry." }, { status: 500 });
        }
      }

      console.info("CompareX checkout completed", {
        eventId: event.id,
        sessionId: session.id,
        orderId: session.metadata?.comparex_order_id ?? null,
        customerId: typeof session.customer === "string" ? session.customer : session.customer?.id,
        paymentStatus: session.payment_status,
        livemode: event.livemode,
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
