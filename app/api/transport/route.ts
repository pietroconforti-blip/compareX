
const lastVerified = "2026-10-21";

const offers = [
  {
    id: "vienna-31-days",
    country: "Austria",
    city: "Vienna",
    name: "31 Tage Digital WIEN",
    provider: "Wiener Linien",
    priceValue: 65.2,
    pricePeriod: "month",
    priceLabel: "€65.20 / 31 days",
    details:
      "Unlimited public transport in Vienna's core zone for 31 days. Digital ticket.",
    url: "https://www.wienerlinien.at/zeitkarten",
  },
  {
    id: "vienna-youth-year",
    country: "Austria",
    city: "Vienna",
    name: "Jahreskarte Jugend Digital",
    provider: "Wiener Linien",
    priceValue: 294,
    pricePeriod: "year",
    priceLabel: "€294 / year",
    details:
      "Annual digital pass for eligible people under 26. Valid on public transport in Vienna's core zone.",
    url: "https://tramwm.wienerlinien.at/en/web/guest/jahreskarte",
  },
  {
    id: "austria-klimaticket-youth",
    country: "Austria",
    city: "All Austria",
    name: "KlimaTicket Ö Jugend",
    provider: "KlimaTicket Österreich",
    priceValue: 1050,
    pricePeriod: "year",
    priceLabel: "€1,050 / year",
    details:
      "Annual ticket for eligible travellers under 26, covering participating public transport across Austria.",
    url: "https://www.klimaticket.at/",
  },
  {
    id: "milan-under27-monthly",
    country: "Italy",
    city: "Milan",
    name: "ATM Urban Youth Pass · Under 27",
    provider: "ATM Milano",
    priceValue: 22,
    pricePeriod: "month",
    priceLabel: "€22 / month",
    details:
      "Urban monthly pass for travellers under 27, with no income limit. Valid within the Municipality of Milan. Check the official eligibility and purchase requirements.",
    url: "https://www.atm.it/it/ViaggiaConNoi/Abbonamenti/Pagine/Tipologie.aspx",
    lastVerified: "2026-11-14",
  },
  {
    id: "milan-under27-annual",
    country: "Italy",
    city: "Milan",
    name: "ATM Urban Youth Pass · Under 27 (annual)",
    provider: "ATM Milano",
    priceValue: 200,
    pricePeriod: "year",
    priceLabel: "€200 / year",
    details:
      "Annual urban pass for travellers under 27, with no income limit. Valid for 12 consecutive calendar months within the Municipality of Milan.",
    url: "https://www.atm.it/it/ViaggiaConNoi/Abbonamenti/Pagine/Tipologie.aspx",
    lastVerified: "2026-11-14",
  },
  {
    id: "milan-standard-monthly",
    country: "Italy",
    city: "Milan",
    name: "ATM Urban Pass · Standard",
    provider: "ATM Milano",
    priceValue: 39,
    pricePeriod: "month",
    priceLabel: "€39 / month",
    details:
      "Ordinary urban monthly pass valid within the Municipality of Milan. The under-27 youth pass is €22/month for eligible travellers.",
    url: "https://www.atm.it/it/ViaggiaConNoi/Abbonamenti/Pagine/Tipologie.aspx",
    lastVerified: "2026-11-14",
  },
  {
    id: "milan-standard-annual",
    country: "Italy",
    city: "Milan",
    name: "ATM Urban Pass · Standard (annual)",
    provider: "ATM Milano",
    priceValue: 330,
    pricePeriod: "year",
    priceLabel: "€330 / year",
    details:
      "Ordinary annual urban pass valid for 12 consecutive calendar months within the Municipality of Milan. Youth and other reduced fares may apply.",
    url: "https://www.atm.it/it/ViaggiaConNoi/Abbonamenti/Pagine/Tipologie.aspx",
    lastVerified: "2026-11-14",
  },
  {
    id: "rome-monthly",
    country: "Italy",
    city: "Rome",
    name: "Monthly Roma Personal Pass",
    provider: "ATAC",
    priceValue: 35,
    pricePeriod: "month",
    priceLabel: "€35 / month",
    details:
      "Unlimited journeys within Rome's territory during the calendar month. Personal pass.",
    url: "https://www.atac.roma.it/en/tickets-and-passes/monthly-roma",
  },
  {
    id: "rome-annual",
    country: "Italy",
    city: "Rome",
    name: "Annual Metrebus Roma Pass",
    provider: "ATAC",
    priceValue: 250,
    pricePeriod: "year",
    priceLabel: "€250 / year",
    details:
      "Annual public transport pass for travel within Rome. Check eligibility and conditions with ATAC.",
    url: "https://www.atac.roma.it/en/tickets-and-passes/cards",
  },
];

export async function GET() {
  return Response.json({
    lastVerified,
    liveAvailability: false,
    offers,
  });
}
