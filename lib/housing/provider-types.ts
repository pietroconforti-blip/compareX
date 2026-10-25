/**
 * CompareX supplier integration contract.
 *
 * This is an interface only: it does not connect to a supplier, fetch inventory,
 * quote prices, create bookings, or take payments. A real adapter must be added
 * only after the provider grants access and its API/contract has been verified.
 */

export type ProviderId =
  | "booking-demand"
  | "expedia-rapid"
  | "housinganywhere"
  | "spotahome"
  | "hostelworld"
  | "amadeus-hotels"
  | "homestay"
  | "oead"
  | "stuwo"
  | "home4students"
  | "oejab"
  | "wihast"
  | "akademikerhilfe";

export type CapabilityStatus =
  | "unavailable"
  | "not-requested"
  | "pending-approval"
  | "sandbox-only"
  | "verified";

export type SupplierCapabilities = {
  liveSearch: CapabilityStatus;
  liveQuote: CapabilityStatus;
  createBooking: CapabilityStatus;
  cancelBooking: CapabilityStatus;
  amendBooking: CapabilityStatus;
  embeddedCheckout: CapabilityStatus;
  comparexCollectsPayment: CapabilityStatus;
  bundleResale: CapabilityStatus;
};

export type StaySearchInput = {
  city: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  currency: string;
};

export type SupplierOffer = {
  providerId: ProviderId;
  providerOfferId: string;
  name: string;
  city: string;
  price: number;
  currency: string;
  pricePeriod: "night" | "month" | "stay";
  available: boolean;
  checkedAt: string;
  expiresAt?: string;
  bookingUrl?: string;
  source: "live-provider-api" | "partner-feed" | "curated-static";
};

export type SupplierQuote = {
  providerId: ProviderId;
  providerQuoteId: string;
  total: number;
  currency: string;
  expiresAt: string;
  cancellationTerms: string;
  paymentTiming: "now" | "deposit" | "pay-at-property" | "provider-defined";
};

export type CreateSupplierBookingInput = {
  idempotencyKey: string;
  providerQuoteId: string;
  customerReference: string;
};

export type SupplierBooking = {
  providerId: ProviderId;
  providerBookingId: string;
  status: "pending" | "confirmed" | "failed" | "cancelled";
};

export type SupplierAdapter = {
  providerId: ProviderId;
  capabilities: SupplierCapabilities;
  search(input: StaySearchInput): Promise<SupplierOffer[]>;
  quote(offer: SupplierOffer): Promise<SupplierQuote>;
  createBooking(input: CreateSupplierBookingInput): Promise<SupplierBooking>;
  cancelBooking(providerBookingId: string): Promise<SupplierBooking>;
};

/**
 * Important: no live adapters are registered until partner access and tests
 * are complete. Callers must treat an empty registry as "not connected".
 */
export const supplierAdapters: Partial<Record<ProviderId, SupplierAdapter>> = {};

export function getSupplierAdapter(providerId: ProviderId): SupplierAdapter | undefined {
  return supplierAdapters[providerId];
}
