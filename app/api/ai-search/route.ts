import { NextRequest, NextResponse } from "next/server";
import {
  offers,
  detectCategories,
  detectBudgets,
  detectPreferences,
  calculateScore,
  categoryLabels,
  type Category,
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

function rankFromQuery(query: string): {
  interpretation: string;
  categories: Category[];
  recommendations: Ranked[];
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
      ranked.push({
        id: o.id,
        name: o.name,
        category: o.category,
        priceLabel: o.priceLabel,
        price: o.price,
        location: o.location,
        description: o.description,
        score: o.score,
        reasons: o.reasons,
        searchUrl: `/search?q=${encodeURIComponent(
          `${categoryLabels[o.category]} ${o.location}`.trim(),
        )}`,
      });
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

  const interpretation =
    parts.length > 0
      ? parts.join(" · ") + "."
      : "Showing top student-friendly offers across categories.";

  return {
    interpretation,
    categories: cats,
    recommendations: ranked.slice(0, 6),
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

    const result = rankFromQuery(query);

    return NextResponse.json({
      query,
      assistant: "CompareX AI",
      ...result,
      tip: "Recommendations are ranked from offers already on CompareX.",
    });
  } catch {
    return NextResponse.json(
      { error: "Could not process your request." },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q") ?? "";
  if (!query.trim()) {
    return NextResponse.json({
      assistant: "CompareX AI",
      examples: [
        "I need a student room under €450 in Vienna",
        "Cheap mobile plan with lots of data in Austria",
        "Gym and transport for a student budget",
      ],
    });
  }
  const result = rankFromQuery(query.trim());
  return NextResponse.json({ query, assistant: "CompareX AI", ...result });
}
