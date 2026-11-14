
const lastVerified = "2026-11-14";

const offers = [
  {
    id: "fitinn-premium-austria",
    country: "Austria",
    city: "Austria-wide",
    name: "PREMIUM Membership",
    provider: "FITINN",
    priceValue: 39.9,
    pricePeriod: "month",
    priceLabel: "€39.90/month (regular rate)",
    details:
      "The €19.90 promotion ended for new contracts on 29 October 2026. The current regular PREMIUM fee is €39.90/month. Minimum contract duration: 12 months. Confirm any studio-specific terms with FITINN.",
    url: "https://fitinn.at/mitgliedschaft/",
  },
  {
    id: "fitinn-standard-austria",
    country: "Austria",
    city: "Austria-wide",
    name: "STANDARD Membership",
    provider: "FITINN",
    priceValue: 29.9,
    pricePeriod: "month",
    priceLabel: "€29.90/month",
    details:
      "Access to one selected studio. The published plan has a 12-month minimum contract duration. Check the official website for current terms and any additional fees.",
    url: "https://fitinn.at/mitgliedschaft/",
  },
  {
    id: "mcfit-standard-austria",
    country: "Austria",
    city: "Austria-wide",
    name: "STANDARD BASIC",
    provider: "McFIT",
    priceValue: 24.9,
    pricePeriod: "month",
    priceLabel: "€24.90/month",
    details:
      "Published standard tariff with a 12-month minimum contract duration. A €30 starter package is listed separately. Availability and conditions can vary by studio.",
    url: "https://www.mcfit.com/at/",
  },
  {
    id: "mcfit-standard-italy",
    country: "Italy",
    city: "Italy-wide",
    name: "STANDARD Membership",
    provider: "McFIT",
    priceValue: 34.9,
    pricePeriod: "month",
    priceLabel: "€34.90–€39.90/month + €39 activation fee",
    details:
      "The two-month-free promotion ended on 4 November 2026. The current STANDARD monthly fee is €34.90 or €39.90 depending on the studio. Minimum contract duration: 12 months; a €39 Membercard activation fee applies. Confirm the exact studio price and contract terms before joining.",
    url: "https://www.mcfit.com/it/abbonamento",
  },
];

export async function GET() {
  return Response.json({
    lastVerified,
    liveAvailability: false,
    offers,
  });
}
