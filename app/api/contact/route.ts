import { NextResponse } from "next/server";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim().slice(0,120) : "";
    const email = typeof body.email === "string" ? body.email.trim().slice(0,254) : "";
    const message = typeof body.message === "string" ? body.message.trim().slice(0,3000) : "";
    const audience = body.audience === "seller" ? "seller" : "agency";
    const topic = typeof body.topic === "string" ? body.topic.slice(0,80) : "other";
    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10) return NextResponse.json({ error: "Controlla nome, email e messaggio (almeno 10 caratteri)." }, { status: 400 });
    const apiKey = process.env.RESEND_API_KEY;
    const agencyEmail = process.env.COMPAREX_SUPPORT_EMAIL;
    const sellerEmail = process.env.COMPAREX_SELLER_EMAIL;
    const to = audience === "seller" ? sellerEmail : agencyEmail;
    if (!apiKey || !to) return NextResponse.json({ error: audience === "seller" ? "Il contatto venditore non è ancora configurato. Configura COMPAREX_SELLER_EMAIL e RESEND_API_KEY su Vercel." : "L'assistenza non è ancora configurata. Configura COMPAREX_SUPPORT_EMAIL e RESEND_API_KEY su Vercel." }, { status: 503 });
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.COMPAREX_EMAIL_FROM || "CompareX <onboarding@resend.dev>", to: [to], reply_to: email, subject: `CompareX · ${audience === "seller" ? "Richiesta al venditore" : "Assistenza"} · ${topic}`, text: `Nome: ${name}\nEmail: ${email}\nDestinatario: ${audience}\nArgomento: ${topic}\n\nMessaggio:\n${message}` }),
    });
    if (!response.ok) {
      const detail = await response.text();
      console.error("Resend error:", detail);
      return NextResponse.json({ error: "Non siamo riusciti a inoltrare la richiesta. Riprova più tardi." }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 });
  }
}