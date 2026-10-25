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

function rankLocal(query: string): {
  interpretation: string;
  categories: Category[];
  recommendations: Ranked[];
  mode: "local";
} {
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

  const parts: string[] = [];
  if (cats.length) {
    parts.push(
      `Looking for ${cats.map((c) => categoryLabels[c].toLowerCase()).join(", ")}`,
    );
  }
  const budgetVals = Object.entries(budgets);
  if (budgetVals.length) {
    parts.push(
      `with budget hints: ${budgetVals
        .map(([c, v]) => `${categoryLabels[c as Category]} ≤ €${v}`)
        .join(", ")}`,
    );
  }
  if (preferences.student) parts.push("preferring student-friendly options");
  if (preferences.vienna) parts.push("focused on Vienna");
  if (preferences.cheap) parts.push("prioritizing lower prices");
  if (preferences.quality) parts.push("prioritizing quality");

  return {
    interpretation:
      parts.length > 0
        ? parts.join(" · ") + "."
        : "Showing top student-friendly offers across categories.",
    categories: cats,
    recommendations: ranked.slice(0, 6),
    mode: "local",
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

  const catalog = catalogForPrompt();
  const system = `You are CompareX AI, a helpful assistant for students comparing housing, mobile plans, transport, gyms and streaming in Austria and Italy.

RULES:
- Recommend ONLY offers from the provided catalog. Never invent products or prices.
- Reply with valid JSON only, no markdown.
- JSON shape:
{
  "interpretation": "short friendly sentence explaining what the user wants",
  "categories": ["housing"|"mobile"|"transport"|"gym"|"streaming"],
  "recommendations": [
    { "id": number, "reasons": ["short reason", "..."], "score": number }
  ]
}
- Pick at most 6 offers, best first. score from 1 to 10.
- Prefer student-friendly and budget-fit when the user mentions students or price limits.
- If the query is vague, still suggest solid student defaults.`;

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

  const validCats = new Set([
    "housing",
    "mobile",
    "transport",
    "gym",
    "streaming",
  ]);
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
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = String(body?.query ?? "").trim();
    if (!query) {
      return NextResponse.json(
        { error: "Write what you need, e.g. a room under €500 in Vienna" },
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
        tip: `Powered by ${llm.provider}. Recommendations only use offers on CompareX.`,
      });
    }

    const local = rankLocal(query);
    return NextResponse.json({
      query,
      assistant: "CompareX AI",
      ...local,
      tip: "Local ranking (add XAI_API_KEY or OPENAI_API_KEY on Vercel for full LLM).",
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
        "Cheap mobile plan with lots of data in Austria",
        "Gym and transport for a student budget",
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
