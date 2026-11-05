import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { offers as catalogue } from "@/lib/home-data";

export const runtime = "nodejs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  // This second gate is enabled only after the Supabase migration has been applied.
  // Real charges remain disabled: this route accepts Stripe test keys only.
  if (
    process.env.COMPAREX_TEST_CHECKOUT_ENABLED !== "true" ||
    process.env.COMPAREX_ORDER_LINKED_CHECKOUT_ENABLED !== "true" ||
    process.env.COMPAREX_ORDERS_ENABLED !== "true"
  ) {
    return NextResponse.json({ error: "Il checkout collegato agli ordini non è ancora abilitato. Verifica prima la migrazione Supabase e la configurazione test." }, { status: 503 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secretKey || !secretKey.startsWith("sk_test_")) {
    return NextResponse.json({ error: "Il checkout richiede una chiave Stripe test. I pagamenti reali sono disattivati." }, { status: 503 });
  }
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Database ordini non configurato. Nessun pagamento è stato avviato." }, { status: 503 });
  }

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 }); }

  const customer = body?.customer;
  const offerIds = body?.offerIds;
  const destination = body?.destination;
  const checkoutRequestId = typeof body?.checkoutRequestId === "string" ? body.checkoutRequestId : "";
  const privacyConsent = body?.privacyConsent;

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(checkoutRequestId)) {
    return NextResponse.json({ error: "Identificativo checkout non valido. Ricarica la pagina e riprova." }, { status: 400 });
  }
  if (!customer || typeof customer.name !== "string" || customer.name.trim().length < 2 || customer.name.length > 120) {
    return NextResponse.json({ error: "Inserisci nome e cognome validi." }, { status: 400 });
  }
  if (typeof customer.email !== "string" || customer.email.length > 254 || !emailPattern.test(customer.email)) {
    return NextResponse.json({ error: "Inserisci un indirizzo email valido." }, { status: 400 });
  }
  if (typeof customer.phone === "string" && customer.phone.length > 40) {
    return NextResponse.json({ error: "Numero di telefono troppo lungo." }, { status: 400 });
  }
  if (privacyConsent !== true) return NextResponse.json({ error: "È necessario confermare la nota privacy." }, { status: 400 });
  if (!Array.isArray(offerIds) || offerIds.length < 2 || offerIds.length > 10 || offerIds.some((id: unknown) => !Number.isInteger(id))) {
    return NextResponse.json({ error: "Seleziona da 2 a 10 offerte valide." }, { status: 400 });
  }
  if (new Set(offerIds).size !== offerIds.length) return NextResponse.json({ error: "Il pacchetto contiene offerte duplicate." }, { status: 400 });
  if (typeof destination !== "string" || !["Vienna", "Milan"].includes(destination)) {
    return NextResponse.json({ error: "Destinazione non valida." }, { status: 400 });
  }

  // Resolve all product details and prices from the server-owned catalogue.
  const selectedOffers = offerIds.map((id: number) => catalogue.find((offer) => offer.id === id));
  if (selectedOffers.some((offer) => !offer)) {
    return NextResponse.json({ error: "Una o più offerte richiedono verifica del catalogo prima del checkout." }, { status: 400 });
  }
  const verifiedOffers = selectedOffers as (typeof catalogue)[number][];
  const cleanItems = verifiedOffers.map((offer) => ({
    id: offer.id,
    category: offer.category,
    name: offer.name,
    price: Math.round(offer.price * 100) / 100,
    location: offer.location,
  }));
  const totalCents = cleanItems.reduce((sum, item) => sum + Math.round(item.price * 100), 0);
  if (cleanItems.some((item) => item.price <= 0) || totalCents > 5000000) {
    return NextResponse.json({ error: "Il totale del pacchetto non rientra nei limiti del checkout di prova." }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const stripe = new Stripe(secretKey);
  const estimatedMonthlyTotal = totalCents / 100;
  const orderDraft = {
    checkout_request_id: checkoutRequestId,
    customer_name: customer.name.trim(),
    customer_email: customer.email.trim().toLowerCase(),
    customer_phone: typeof customer.phone === "string" && customer.phone.trim() ? customer.phone.trim() : null,
    destination,
    items: cleanItems,
    estimated_monthly_total: estimatedMonthlyTotal,
    currency: "EUR",
    quote_snapshot: {
      country_code: destination === "Vienna" ? "AT" : "IT",
      items: cleanItems,
      total_eur: estimatedMonthlyTotal,
      billing_note: "Monthly estimate charged once for test demonstration only",
      catalogue_source: "server",
    },
    privacy_consent: true,
    status: "draft",
    order_status: "draft",
    payment_status: "not_started",
  };

  try {
    // The unique request ID prevents double-clicks and network retries creating duplicate orders.
    const { data: inserted, error: insertError } = await supabase
      .from("package_order_drafts")
      .upsert(orderDraft, { onConflict: "checkout_request_id", ignoreDuplicates: true })
      .select("id,stripe_checkout_session_id,order_status")
      .maybeSingle();

    let order = inserted;
    if (insertError) {
      console.error("CompareX order draft insert failed", insertError.message);
      return NextResponse.json({ error: "Non è stato possibile creare l'ordine. Nessun pagamento è stato avviato." }, { status: 500 });
    }
    if (!order) {
      const { data: existing, error: lookupError } = await supabase
        .from("package_order_drafts")
        .select("id,stripe_checkout_session_id,order_status")
        .eq("checkout_request_id", checkoutRequestId)
        .single();
      if (lookupError || !existing) {
        return NextResponse.json({ error: "Non è stato possibile recuperare la richiesta esistente. Nessun pagamento è stato avviato." }, { status: 500 });
      }
      order = existing;
    }

    // A retry for the same request reuses an existing open Stripe session.
    if (order.stripe_checkout_session_id) {
      const existingSession = await stripe.checkout.sessions.retrieve(order.stripe_checkout_session_id);
      if (existingSession.status === "open" && existingSession.client_secret) {
        return NextResponse.json({ clientSecret: existingSession.client_secret, testMode: true, orderId: order.id, estimatedMonthlyTotal });
      }
      return NextResponse.json({ error: "Questa richiesta ha già una sessione di pagamento. Ricarica il checkout per iniziare una nuova richiesta." }, { status: 409 });
    }

    const origin = new URL(request.url).origin;
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "payment",
      payment_method_types: ["card"],
      line_items: cleanItems.map((item) => ({
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: Math.round(item.price * 100),
          product_data: {
            name: item.name,
            description: item.category + " · stima mensile, checkout dimostrativo",
          },
        },
      })),
      customer_email: customer.email.trim().toLowerCase(),
      client_reference_id: order.id,
      metadata: {
        environment: "test",
        checkout_kind: "package_demo",
        comparex_order_id: order.id,
        offer_ids: offerIds.join(","),
        monthly_estimate_eur: estimatedMonthlyTotal.toFixed(2),
      },
      return_url: origin + "/checkout/result?status=success&session_id={CHECKOUT_SESSION_ID}",
      submit_type: "pay",
    }, { idempotencyKey: "comparex-checkout-" + order.id });

    if (!session.client_secret) {
      await stripe.checkout.sessions.expire(session.id).catch(() => undefined);
      await supabase.from("package_order_drafts").update({ order_status: "failed", payment_status: "failed" }).eq("id", order.id);
      return NextResponse.json({ error: "Stripe non ha restituito il client secret del checkout embedded." }, { status: 502 });
    }

    const { error: linkError } = await supabase
      .from("package_order_drafts")
      .update({
        stripe_checkout_session_id: session.id,
        order_status: "awaiting_payment",
        payment_status: "pending",
      })
      .eq("id", order.id);
    if (linkError) {
      await stripe.checkout.sessions.expire(session.id).catch(() => undefined);
      await supabase.from("package_order_drafts").update({ order_status: "failed", payment_status: "failed" }).eq("id", order.id);
      console.error("CompareX order-to-Stripe link failed", linkError.message);
      return NextResponse.json({ error: "Non è stato possibile collegare il pagamento all'ordine. La sessione è stata annullata." }, { status: 500 });
    }

    return NextResponse.json({
      clientSecret: session.client_secret,
      testMode: true,
      orderId: order.id,
      estimatedMonthlyTotal,
    });
  } catch (error) {
    console.error("CompareX linked test checkout failed", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "Impossibile avviare il checkout di prova. Nessun ordine è stato attivato." }, { status: 502 });
  }
}
