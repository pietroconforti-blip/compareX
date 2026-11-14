import { NextResponse } from "next/server";

// CompareX is currently a comparison and referral platform, not the seller
// of the services listed. Do not accept customer data or charge for estimates.
export async function POST() {
  return NextResponse.json(
    {
      error: "CompareX checkout is not available. Complete purchases directly with the official provider.",
      checkoutAvailable: false,
    },
    { status: 503 },
  );
}
