
import { NextResponse } from "next/server";

const lastVerified = "2026-10-21";

const offers = [
  {
    id: "yesss-simple-m",
    country: "Austria",
    provider: "yesss!",
    plan: "SIMple M",
    monthlyPrice: 9.99,
    dataGB: 100,
    maxSpeed: "200 Mbit/s · 4G",
    callsSms: "1,500 minutes/SMS units",
    euRoamingGB: 15.2,
    activationFee: 0,
    contract: "Monthly option without minimum term",
    officialUrl: "https://www.yesss.at/tarife/simple-m",
    lastVerified,
  },
  {
    id: "yesss-simple-l-5g",
    country: "Austria",
    provider: "yesss!",
    plan: "SIMple L 5G",
    monthlyPrice: 14.99,
    dataGB: 150,
    maxSpeed: "300 Mbit/s · 5G",
    callsSms: "1,500 minutes/SMS units",
    euRoamingGB: 22.8,
    activationFee: 0,
    contract: "Monthly option without minimum term",
    officialUrl: "https://www.yesss.at/tarife/simple-l-5g",
    lastVerified,
  },
  {
    id: "spusu-legendar-100",
    country: "Austria",
    provider: "spusu",
    plan: "spusu legendär",
    monthlyPrice: 9.9,
    dataGB: 100,
    maxSpeed: null,
    callsSms: "2,000 minutes · 1,000 SMS",
    euRoamingGB: null,
    activationFee: null,
    contract: "No minimum contract duration",
    officialUrl: "https://www.spusu.at/",
    lastVerified,
  },
  {
    id: "spusu-5g-legendar-150",
    country: "Austria",
    provider: "spusu",
    plan: "spusu 5G legendär",
    monthlyPrice: 14.9,
    dataGB: 150,
    maxSpeed: null,
    callsSms: "2,000 minutes · 1,000 SMS",
    euRoamingGB: null,
    activationFee: null,
    contract: "Check current contract conditions",
    officialUrl: "https://www.spusu.at/",
    lastVerified,
  },
  {
    id: "iliad-giga-150",
    country: "Italy",
    provider: "iliad",
    plan: "GIGA 150",
    monthlyPrice: 7.99,
    dataGB: 150,
    maxSpeed: null,
    callsSms: "Unlimited minutes and SMS",
    euRoamingGB: 12,
    activationFee: 9.99,
    contract: "Unlimited duration; no cancellation fee for termination or portability",
    officialUrl:
      "https://fibra.iliad.it/docs/prezzi/prezzi-giga150-799_dal_19_05_2026.pdf",
    lastVerified,
  },
  {
    id: "iliad-top-230",
    country: "Italy",
    provider: "iliad",
    plan: "TOP 230",
    monthlyPrice: 9.99,
    dataGB: 230,
    maxSpeed: null,
    callsSms: "Unlimited minutes and SMS",
    euRoamingGB: 18,
    activationFee: 9.99,
    contract: "Unlimited duration; no cancellation fee for termination or portability",
    officialUrl: "https://www.iliad.it/offerta-iliad-top230-999.html",
    lastVerified,
  },
];

export async function GET() {
  return NextResponse.json(
    {
      offers,
      lastVerified,
      note: "Prices were checked against official provider information on the stated date. This is not a live price feed.",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

