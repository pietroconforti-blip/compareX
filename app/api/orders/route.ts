import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { offers as catalogue } from "@/lib/home-data";

export async function POST(request: Request) {
  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 }); }

  const customer = body?.customer;
  const offerIds = body?.offerIds;
  const destination = body?.destination;
  const privacyConsent = body?.privacyConsent;

  if (!customer || typeof customer.name !== "string" || customer.name.trim().length < 2 || customer.name.length > 120) {
    return NextResponse.json({ error: "Inserisci nome e cognome validi." }, { status: 400 });
  }
  if (typeof customer.email !== "string" || customer.email.length > 254 || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(customer.email)) {
    return NextResponse.json({ error: "Inserisci un indirizzo email valido." }, { status: 400 });
  }
  if (typeof customer.phone === "string" && customer.phone.length > 40) return NextResponse.json({ error: "Numero di telefono troppo lungo." }, { status: 400 });
  if (!privacyConsent) return NextResponse.json({ error: "È necessario confermare il consenso richiesto." }, { status: 400 });
  if (!Array.isArray(offerIds) || offerIds.length < 2 || offerIds.length > 10 || offerIds.some((id: unknown) => !Number.isInteger(id))) {
    return NextResponse.json({ error: "Il pacchetto deve contenere da 2 a 10 offerte valide." }, { status: 400 });
  }
  if (new Set(offerIds).size !== offerIds.length) return NextResponse.json({ error: "Il pacchetto contiene offerte duplicate." }, { status: 400 });
  if (typeof destination !== "string" || !["Vienna", "Milan"].includes(destination)) return NextResponse.json({ error: "Destinazione non valida." }, { status: 400 });

  // The server owns the product catalogue and all prices; never persist browser-supplied amounts.
  const selectedOffers = offerIds.map((id: number) => catalogue.find((offer) => offer.id === id));
  if (selectedOffers.some((offer) => !offer)) {
    return NextResponse.json({ error: "Una o più offerte richiedono verifica del catalogo prima di poter creare una richiesta." }, { status: 400 });
  }
  const cleanItems = (selectedOffers as (typeof catalogue)[number][]).map((offer) => ({
    id: offer.id,
    category: offer.category,
    name: offer.name,
    price: Math.round(offer.price * 100) / 100,
    location: offer.location,
  }));

  if (process.env.COMPAREX_ORDERS_ENABLED !== "true") {
    return NextResponse.json({ error: "La raccolta degli ordini è ancora in fase di preparazione. Nessun dato è stato salvato e nessun pagamento è stato avviato." }, { status: 503 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "La registrazione degli ordini non è ancora configurata. Nessun dato è stato salvato: riprova quando CompareX avrà completato la configurazione sicura del database." }, { status: 503 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const estimatedMonthlyTotal = Math.round(cleanItems.reduce((sum, item) => sum + item.price, 0) * 100) / 100;
  const { data, error } = await supabase.from("package_order_drafts").insert({
    customer_name: customer.name.trim(),
    customer_email: customer.email.trim().toLowerCase(),
    customer_phone: typeof customer.phone === "string" && customer.phone.trim() ? customer.phone.trim() : null,
    destination,
    items: cleanItems,
    estimated_monthly_total: estimatedMonthlyTotal,
    privacy_consent: true,
    status: "draft",
    payment_status: "not_started",
  }).select("id").single();

  if (error || !data) {
    return NextResponse.json({ error: "Non è stato possibile salvare il pacchetto. Nessun pagamento è stato avviato." }, { status: 500 });
  }
  return NextResponse.json({ success: true, orderId: data.id, estimatedMonthlyTotal, paymentAvailable: false, status: "draft" }, { status: 201 });
}
