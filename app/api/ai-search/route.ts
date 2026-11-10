import { NextRequest, NextResponse } from "next/server";
import {
  offers,
  detectCategories,
  detectBudgets,
  detectPreferences,
  calculateScore,
  categoryLabels,
  type Category,
  type Offer,
} from "@/lib/home-data";

export const dynamic = "force-dynamic";

type Ranked = {
  id: number;
  name: string;
  category: Category;
  priceLabel: string;
  price: number;
  location: string;
  description: string;
  score: number;
  reasons: string[];
  searchUrl: string;
};

function toRanked(o: Offer, score: number, reasons: string[]): Ranked {
  return {
    id: o.id,
    name: o.name,
    category: o.category,
    priceLabel: o.priceLabel,
    price: o.price,
    location: o.location,
    description: o.description,
    score,
    reasons,
    searchUrl: `/search?q=${encodeURIComponent(
      `${categoryLabels[o.category]} ${o.location}`.trim(),
    )}`,
  };
}

function detectLanguage(text: string): "it" | "de" | "en" {
  const t = text.toLowerCase();
  const it = /\b(camera|stanza|alloggio|appartamento|mobile|telefon|piano|palestra|trasporto|vienna|milano|studente|economico|sotto|meno di)\b/i.test(t);
  const de = /\b(zimmer|wohnung|studentenheim|handy|mobilfunk|fitness|transport|wien|mailand|student|günstig|unter)\b/i.test(t);
  if (it && !de) return "it";
  if (de && !it) return "de";
  if (it) return "it";
  if (de) return "de";
  return "en";
}

function rankLocal(query: string): {
  interpretation: string;
  categories: Category[];
  recommendations: Ranked[];
  mode: "local";
  language: string;
} {
  const lang = detectLanguage(query);
  const categories = detectCategories(query);
  const budgets = detectBudgets(
    query,
    categories.length ? categories : (["housing", "mobile"] as Category[]),
  );
  const preferences = detectPreferences(query);
  const cats = categories.length
    ? categories
    : (["housing", "mobile", "transport"] as Category[]);

  const ranked: Ranked[] = [];
  for (const cat of cats) {
    const budget = budgets[cat];
    const list = offers
      .filter((o) => o.category === cat)
      .map((o) => calculateScore(o, preferences, budget))
      .sort((a, b) => b.score - a.score || a.price - b.price)
      .slice(0, 3);
    for (const o of list) {
      ranked.push(toRanked(o, o.score, o.reasons));
    }
  }
  ranked.sort((a, b) => b.score - a.score || a.price - b.price);

  let interpretation = "";
  if (lang === "it") {
    const parts: string[] = [];
    if (cats.length) parts.push(`Cerco ${cats.map((c) => categoryLabels[c].toLowerCase()).join(", ")}`);
    if (preferences.vienna) parts.push("a Vienna");
    if (preferences.milan) parts.push("a Milano");
    if (preferences.student) parts.push("per studenti");
    if (preferences.cheap) parts.push("al prezzo più basso");
    interpretation = parts.length ? parts.join(" · ") + "." : "Ecco le migliori offerte per studenti.";
  } else if (lang === "de") {
    const parts: string[] = [];
    if (cats.length) parts.push(`Suche nach ${cats.map((c) => categoryLabels[c].toLowerCase()).join(", ")}`);
    if (preferences.vienna) parts.push("in Wien");
    if (preferences.milan) parts.push("in Mailand");
    if (preferences.student) parts.push("für Studierende");
    if (preferences.cheap) parts.push("günstig");
    interpretation = parts.length ? parts.join(" · ") + "." : "Hier sind die besten Angebote für Studierende.";
  } else {
    const parts: string[] = [];
    if (cats.length) parts.push(`Looking for ${cats.map((c) => categoryLabels[c].toLowerCase()).join(", ")}`);
    if (preferences.vienna) parts.push("in Vienna");
    if (preferences.milan) parts.push("in Milan");
    if (preferences.student) parts.push("for students");
    if (preferences.cheap) parts.push("prioritizing lower prices");
    interpretation = parts.length ? parts.join(" · ") + "." : "Showing top student-friendly offers.";
  }

  return {
    interpretation,
    categories: cats,
    recommendations: ranked.slice(0, 6),
    mode: "local",
    language: lang,
  };
}

function catalogForPrompt() {
  return offers.map((o) => ({
    id: o.id,
    name: o.name,
    category: o.category,
    price: o.price,
    priceLabel: o.priceLabel,
    location: o.location,
    studentFriendly: o.studentFriendly,
    quality: o.quality,
    description: o.description,
    tags: o.tags,
  }));
}

async function rankWithLlm(query: string): Promise<{
  interpretation: string;
  categories: Category[];
  recommendations: Ranked[];
  mode: "llm";
  provider: string;
  language: string;
} | null> {
  const xaiKey = process.env.XAI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  let baseUrl = "";
  let apiKey = "";
  let model = "";
  let provider = "";

  if (xaiKey) {
    baseUrl = "https://api.x.ai/v1";
    apiKey = xaiKey;
    model = process.env.XAI_MODEL || "grok-2-latest";
    provider = "xAI";
  } else if (openaiKey) {
    baseUrl = "https://api.openai.com/v1";
    apiKey = openaiKey;
    model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    provider = "OpenAI";
  } else {
    return null;
  }

  const lang = detectLanguage(query);
  const catalog = catalogForPrompt();
  const system = `You are CompareX AI, a helpful multilingual assistant for students comparing housing, mobile plans, transport, gyms and streaming in Austria and Italy (Vienna & Milan focus).

RULES:
- Understand the user's request in ANY language (Italian, German, English, Spanish, French, etc.). Reply in the SAME language as the user.
- Recommend ONLY offers from the provided catalog. Never invent products or prices.
- Reply with valid JSON only, no markdown.
- JSON shape:
{
  "interpretation": "short friendly sentence in the user's language explaining what they want",
  "categories": ["housing"|"mobile"|"transport"|"gym"|"streaming"],
  "recommendations": [
    { "id": number, "reasons": ["short reason in user's language"], "score": number }
  ]
}
- Pick at most 6 offers, best first. score from 1 to 10.
- Prefer student-friendly and budget-fit when relevant.
- If vague, suggest solid student defaults for Vienna/Milan.`;

  const user = `User request: ${query}

Catalog:
${JSON.stringify(catalog)}`;

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("LLM API error", res.status, errText.slice(0, 300));
    return null;
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") return null;

  let parsed: {
    interpretation?: string;
    categories?: string[];
    recommendations?: { id: number; reasons?: string[]; score?: number }[];
  };
  try {
    const cleaned = content.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("LLM JSON parse failed", content.slice(0, 200));
    return null;
  }

  const byId = new Map(offers.map((o) => [o.id, o]));
  const recommendations: Ranked[] = [];
  for (const item of parsed.recommendations ?? []) {
    const offer = byId.get(Number(item.id));
    if (!offer) continue;
    const score = Number(item.score);
    recommendations.push(
      toRanked(
        offer,
        Number.isFinite(score) ? Math.max(1, Math.min(10, score)) : 8,
        Array.isArray(item.reasons) ? item.reasons.slice(0, 4).map(String) : [],
      ),
    );
  }

  if (recommendations.length === 0) return null;

  const validCats = new Set(["housing", "mobile", "transport", "gym", "streaming"]);
  const categories = (parsed.categories ?? [])
    .map(String)
    .filter((c): c is Category => validCats.has(c));

  return {
    interpretation:
      parsed.interpretation?.trim() ||
      "Here are the best matching offers from CompareX.",
    categories,
    recommendations: recommendations.slice(0, 6),
    mode: "llm",
    provider,
    language: lang,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = String(body?.query ?? "").trim();
    if (!query) {
      return NextResponse.json(
        { error: "Write what you need, e.g. a room under €500 in Vienna / una stanza sotto 500 a Vienna" },
        { status: 400 },
      );
    }

    const llm = await rankWithLlm(query);
    if (llm) {
      return NextResponse.json({
        query,
        assistant: "CompareX AI",
        interpretation: llm.interpretation,
        categories: llm.categories,
        recommendations: llm.recommendations,
        mode: llm.mode,
        provider: llm.provider,
        language: llm.language,
        tip: `Powered by ${llm.provider}. Recommendations only use offers on CompareX.`,
      });
    }

    const local = rankLocal(query);
    return NextResponse.json({
      query,
      assistant: "CompareX AI",
      ...local,
      tip: "Local multilingual ranking (add XAI_API_KEY on Vercel for full Grok).",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Could not process your request." },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q") ?? "";
  if (!query.trim()) {
    const hasLlm = !!(process.env.XAI_API_KEY || process.env.OPENAI_API_KEY);
    return NextResponse.json({
      assistant: "CompareX AI",
      llmReady: hasLlm,
      examples: [
        "I need a student room under €450 in Vienna",
        "Cerco una stanza per studenti a Milano sotto 500",
        "Günstiges Handy und Fitness in Wien",
      ],
    });
  }

  const llm = await rankWithLlm(query.trim());
  if (llm) {
    return NextResponse.json({
      query,
      assistant: "CompareX AI",
      ...llm,
    });
  }
  return NextResponse.json({
    query,
    assistant: "CompareX AI",
    ...rankLocal(query.trim()),
  });
}
