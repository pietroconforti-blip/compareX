import { NextResponse } from "next/server";

const providers = [
  { id: "booking-demand", name: "Booking.com Demand API", category: "hotel-and-short-stay", integration: "official-api", access: "partner-approval-required", liveInventory: false, liveBooking: false, singleCheckout: "unverified", officialUrl: "https://developers.booking.com/demand/docs" },
  { id: "expedia-rapid", name: "Expedia Group Rapid", category: "hotel-and-short-stay", integration: "official-api", access: "partner-application-and-site-review-required", liveInventory: false, liveBooking: false, singleCheckout: "unverified", officialUrl: "https://developers.expediagroup.com/rapid/setup" },
  { id: "housinganywhere", name: "HousingAnywhere", category: "student-and-mid-term-rentals", integration: "partner-feed-or-affiliate", access: "partner-contact-required", liveInventory: false, liveBooking: false, singleCheckout: "unverified", officialUrl: "https://info.housinganywhere.com/partners" },
  { id: "spotahome", name: "Spotahome", category: "student-and-mid-term-rentals", integration: "partner-widget-or-api-subject-to-eligibility", access: "partner-approval-required", liveInventory: false, liveBooking: false, singleCheckout: "unverified", officialUrl: "https://www.spotahome.com/become-a-partner-of-spotahome" },
  { id: "hostelworld", name: "Hostelworld", category: "hostels-and-short-stay", integration: "affiliate-feed-or-case-by-case-api", access: "case-by-case", liveInventory: false, liveBooking: false, singleCheckout: "unverified", officialUrl: "https://partners.hostelworld.com/solutions/" },
  { id: "amadeus-hotels", name: "Amadeus Hotels", category: "hotel-and-short-stay", integration: "api", access: "product-dependent", liveInventory: false, liveBooking: false, singleCheckout: "unverified", officialUrl: "https://developers.amadeus.com/enterprise/category/hotel" },
  { id: "homestay", name: "Homestay.com", category: "homestays-and-mid-term", integration: "affiliate-links-or-api-feed", access: "affiliate-application", liveInventory: false, liveBooking: false, singleCheckout: "unverified", officialUrl: "https://www.homestay.com/it/affiliates" },
  { id: "oead", name: "OeAD Student Housing", category: "student-residences-long-stay", integration: "direct-partnership", access: "commercial-contact-required-no-public-api-verified", liveInventory: false, liveBooking: false, singleCheckout: "unverified", officialUrl: "https://www.oeadstudenthousing.at/" },
  { id: "stuwo", name: "STUWO", category: "student-residences-long-stay", integration: "direct-partnership", access: "commercial-contact-required-no-public-api-verified", liveInventory: false, liveBooking: false, singleCheckout: "unverified", officialUrl: "https://www.stuwo.at/en/" },
  { id: "home4students", name: "home4students", category: "student-residences-long-stay", integration: "direct-partnership", access: "commercial-contact-required-no-public-api-verified", liveInventory: false, liveBooking: false, singleCheckout: "unverified", officialUrl: "https://www.home4students.at/" },
  { id: "oejab", name: "ÖJAB", category: "student-residences-long-stay", integration: "direct-partnership", access: "commercial-contact-required-no-public-api-verified", liveInventory: false, liveBooking: false, singleCheckout: "unverified", officialUrl: "https://www.oejab.at/" },
  { id: "wihast", name: "WIHAST", category: "student-residences-long-stay", integration: "direct-partnership", access: "commercial-contact-required-no-public-api-verified", liveInventory: false, liveBooking: false, singleCheckout: "unverified", officialUrl: "https://www.wihast.at/" },
];

export async function GET() {
  return NextResponse.json({
    status: "provider-directory-only",
    warning: "These are potential integration partners, not connected providers. This endpoint does not retrieve live availability, make reservations, or process payments.",
    counts: { listed: providers.length, liveInventory: 0, liveBookings: 0, verifiedSingleCheckout: 0 },
    providers,
  });
}
