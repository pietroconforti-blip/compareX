import { NextResponse } from "next/server";

/**
 * Readiness probe only. This endpoint does not search inventory, create bookings,
 * collect payment, or claim that Booking.com has approved the integration.
 */
export async function GET() {
  const featureEnabled = process.env.BOOKING_DEMAND_API_ENABLED === "true";
  const hasApiKey = Boolean(process.env.BOOKING_DEMAND_API_KEY);
  const hasAffiliateId = Boolean(process.env.BOOKING_AFFILIATE_ID);
  const credentialsConfigured = hasApiKey && hasAffiliateId;

  const readyForTechnicalValidation = featureEnabled && credentialsConfigured;

  return NextResponse.json(
    {
      provider: "booking.com-demand-api",
      integration: "accommodations-search-look-book",
      status: readyForTechnicalValidation
        ? "credentials_configured_not_validated"
        : "blocked_pending_partner_access_or_configuration",
      checks: {
        featureEnabled,
        apiKeyConfigured: hasApiKey,
        affiliateIdConfigured: hasAffiliateId,
        partnerApprovalVerified: false,
        liveInventoryEnabled: false,
        liveBookingEnabled: false,
        checkoutEnabled: false,
      },
      message: readyForTechnicalValidation
        ? "Credentials are present, but partner approval, API calls, booking flow, and payment compatibility still require validation. Live booking remains disabled."
        : "No live Booking.com operation is available. Obtain the required partner agreement and configure server-side credentials before implementing and validating live calls.",
    },
    { status: readyForTechnicalValidation ? 200 : 503 },
  );
}
