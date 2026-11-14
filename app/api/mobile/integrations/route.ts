import { NextResponse } from "next/server";
import { mobileProviderRegistry } from "@/lib/providers/mobile/registry";

export async function GET() {
  return NextResponse.json({
    providers: mobileProviderRegistry.map(({ slug, name, integrationStatus, capabilities }) => ({ slug, name, integrationStatus, capabilities })),
    note: "Provider application and activation APIs are not connected. These entries are integration readiness records, not a claim of partnership.",
  }, { headers: { "Cache-Control": "no-store" } });
}
