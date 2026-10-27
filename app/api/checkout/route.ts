import { NextResponse } from "next/server";

// CompareX currently compares offers and redirects customers to providers.
// Keep payment disabled until subscription terms, service delivery,
// cancellation flow, and production billing are ready.
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Il checkout CompareX non è ancora attivo. Puoi confrontare le offerte e continuare sui siti ufficiali dei fornitori.",
      checkoutAvailable: false,
    },
    { status: 503 },
  );
}
