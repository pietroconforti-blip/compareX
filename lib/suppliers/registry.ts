import type { Category, SupplierIntegrationMethod, SupplierLifecycle } from "./types";

export type SupplierProspect = {
  id: string;
  name: string;
  category: Category;
  countryCode: "AT";
  lifecycle: SupplierLifecycle;
  integrationMethod: SupplierIntegrationMethod;
  contactEmail?: string;
  contactUrl: string;
  evidenceNote: string;
};

/**
 * Research-only Austrian supplier prospects. This is not a list of approved
 * merchants. Do not change lifecycle to contracted/live without signed terms,
 * resale rights, tested fulfilment and approved compliance checks.
 */
export const supplierProspects: SupplierProspect[] = [
  {
    id: "wiener-linien",
    name: "Wiener Linien",
    category: "transport",
    countryCode: "AT",
    lifecycle: "research",
    integrationMethod: "rest_api",
    contactEmail: "business@wienerlinien.at",
    contactUrl: "https://www.wienerlinien.at/b2b/ticketvertriebsschnittstelle",
    evidenceNote: "Public B2B ticket distribution interface; technical review and contract required.",
  },
  {
    id: "drei-wholesale",
    name: "Drei Wholesale",
    category: "mobile",
    countryCode: "AT",
    lifecycle: "research",
    integrationMethod: "manual",
    contactEmail: "mvno@drei.com",
    contactUrl: "https://www.drei.at/de/business/wholesale/",
    evidenceNote: "Public Full MVNO, Light MVNO and branded-reselling models; commercial approval required.",
  },
  {
    id: "magenta-business-partners",
    name: "Magenta Business Partners",
    category: "mobile",
    countryCode: "AT",
    lifecycle: "research",
    integrationMethod: "manual",
    contactEmail: "sales.businesspartner@magenta.at",
    contactUrl: "https://www.magenta.at/business/unternehmen/partner",
    evidenceNote: "Public business partner programme; online retail and principal-seller rights need confirmation.",
  },
  {
    id: "yesss-retail",
    name: "yesss!",
    category: "mobile",
    countryCode: "AT",
    lifecycle: "research",
    integrationMethod: "manual",
    contactUrl: "https://www.yesss.at/handelspartner",
    evidenceNote: "Public physical retail distribution network; digital reseller/API rights not established.",
  },
  {
    id: "spusu",
    name: "spusu",
    category: "mobile",
    countryCode: "AT",
    lifecycle: "research",
    integrationMethod: "manual",
    contactUrl: "https://www.spusu.at/",
    evidenceNote: "Direct business-development enquiry required; no public reseller programme confirmed.",
  },
  {
    id: "home4students",
    name: "Home4students",
    category: "housing",
    countryCode: "AT",
    lifecycle: "research",
    integrationMethod: "manual",
    contactEmail: "marketing@home4students.at",
    contactUrl: "https://www.home4students.at/kontakt/",
    evidenceNote: "Public contact for cooperation/marketing; reseller and payment-collection rights need negotiation.",
  },
  {
    id: "stuwo",
    name: "STUWO",
    category: "housing",
    countryCode: "AT",
    lifecycle: "research",
    integrationMethod: "manual",
    contactEmail: "info@stuwo.at",
    contactUrl: "https://www.stuwo.at/kontakt/",
    evidenceNote: "Central public contact; no public resale API or reseller scheme confirmed.",
  },
  {
    id: "oead-student-housing",
    name: "OeAD Student Housing",
    category: "housing",
    countryCode: "AT",
    lifecycle: "research",
    integrationMethod: "manual",
    contactUrl: "https://www.oeadstudenthousing.at/en/oead-student-housing/about-us/",
    evidenceNote: "Publicly describes accommodation-provider partnerships; third-party resale rights remain unconfirmed.",
  },
  {
    id: "rsg-group",
    name: "RSG Group / McFIT",
    category: "gym",
    countryCode: "AT",
    lifecycle: "research",
    integrationMethod: "manual",
    contactUrl: "https://rsggroup.com/en/contact/",
    evidenceNote: "Public Corporate Fitness and Brand & Strategic Partnerships contact routes; membership resale rights need approval.",
  },
  {
    id: "fitinn",
    name: "FITINN",
    category: "gym",
    countryCode: "AT",
    lifecycle: "research",
    integrationMethod: "manual",
    contactUrl: "https://fitinn.at/",
    evidenceNote: "Direct commercial enquiry required; no public membership reseller API confirmed.",
  },
  {
    id: "a1-select",
    name: "A1 Select / digital service distribution",
    category: "streaming",
    countryCode: "AT",
    lifecycle: "research",
    integrationMethod: "manual",
    contactUrl: "https://www.a1.net/",
    evidenceNote: "Public streaming/digital-service bundle precedent; CompareX distribution rights are not implied.",
  },
];
