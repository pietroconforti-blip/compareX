import { NextResponse } from "next/server";

const lastVerified = "2026-10-21";

const housingOffers = [
  {
    id: "oead-brigittenauer-laende",
    country: "Austria",
    provider: "OeAD Student Housing",
    property: "Brigittenauer Lände",
    city: "Vienna",
    roomType: "Bed in a double room in a shared living community",
    priceValue: 372,
    pricePeriod: "month",
    priceLabel: "From €372/month",
    availability: "Fully booked for winter semester 2026",
    details: [
      "Shared bathroom/toilet",
      "Common kitchen facilities",
      "Application fee: €35",
      "Booking fee: €21 per booked month",
      "Deposit: two months of accommodation fees",
      "Final cleaning fee: €90",
    ],
    officialUrl:
      "https://www.oeadstudenthousing.at/en/accommodation/vienna/brigittenauer-laende/",
    lastVerified,
  },
  {
    id: "unimi-student-residences",
    country: "Italy",
    provider: "Università degli Studi di Milano",
    property: "University student residences",
    city: "Milan",
    roomType: "Single or double room, depending on residence",
    priceValue: 2799,
    pricePeriod: "year",
    priceLabel: "Up to €2,799/year",
    availability:
      "Competitive allocation; current availability must be checked",
    details: [
      "Places assigned through an application and ranking process",
      "Eligibility depends on the official call requirements",
      "The published maximum annual fee applies to eligible assigned students",
      "Services vary by residence",
    ],
    officialUrl:
      "https://www.unimi.it/en/study/financial-support/accommodation/how-request-accommodation",
    lastVerified,
  },
  {
    id: "bocconi-tariffa-media-ridotta",
    country: "Italy",
    provider: "Bocconi University",
    property: "Tariffa Media Ridotta residence",
    city: "Milan",
    roomType: "Bed in a double room with internal bathroom",
    priceValue: 615,
    pricePeriod: "month",
    priceLabel: "€615/month",
    availability:
      "Published tariff for academic year 2026/27; check current availability",
    details: [
      "Utilities and internet included",
      "Weekly cleaning with linen change",
      "Study, activity and relaxation areas",
      "Published assignment period: 24 August 2026 to 23 July 2027",
      "Security deposit: two months of rent",
    ],
    officialUrl:
      "https://www.unibocconi.it/en/current-students/housing/tariffa-media-ridotta-international-students",
    lastVerified,
  },
];

export async function GET() {
  return NextResponse.json(
    {
      offers: housingOffers,
      lastVerified,
      note:
        "Published prices and conditions checked against official housing provider pages on the stated date. Availability is not a live feed.",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
