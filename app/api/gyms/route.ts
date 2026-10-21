
const lastVerified = "2026-10-21";

const offers = [
  {
    id: "fitinn-premium-austria",
    country: "Austria",
    city: "Austria-wide",
    name: "PREMIUM Membership",
    provider: "FITINN",
    priceValue: 19.9,
    pricePeriod: "month",
    priceLabel: "€19.90/month until 31 Dec 2026",
    details:
      "Promotion for new contracts signed from 1 September to 29 October 2026. From 1 January 2027 the monthly fee becomes €39.90. Minimum contract duration: 12 months. Check the official terms before joining.",
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
    priceLabel: "From €34.90/month after promotion",
    details:
      "For eligible new members joining by 4 November 2026, the current promotion offers the first two months free, followed by the regular monthly fee of €34.90 or €39.90 depending on the studio. Minimum contract duration: 12 months. A €39 activation fee applies. Check the conditions on the official site.",
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
