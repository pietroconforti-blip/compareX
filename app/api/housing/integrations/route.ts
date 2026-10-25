import { NextResponse } from "next/server";
import { supplierAdapters } from "@/lib/housing/provider-types";

/**
 * Read-only integration status. This endpoint deliberately does not make
 * supplier API calls and never reports a provider as live just because it is
 * listed in the directory.
 */
export async function GET() {
  const connectedProviders = Object.keys(supplierAdapters);

  return NextResponse.json(
    {
      status: connectedProviders.length > 0 ? "adapter-registered" : "no-live-integrations",
      connectedProviders,
      counts: {
        registeredAdapters: connectedProviders.length,
        liveInventoryProviders: 0,
        bookingEnabledProviders: 0,
        singleCheckoutApprovedProviders: 0,
      },
      nextStep:
        "Obtain written partner approval and credentials, implement one provider adapter, then verify live search/quote/booking in its approved test environment before enabling production capabilities.",
      safety:
        "This is a software-readiness status only. It does not check supplier credentials, real-time availability, reservation status, or payment approval.",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
