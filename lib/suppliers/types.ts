import type { Category } from "@/lib/home-data";

export type SupplierIntegrationMethod =
  | "manual"
  | "csv"
  | "partner_portal"
  | "rest_api"
  | "webhook"
  | "aggregator";

export type SupplierLifecycle =
  | "research"
  | "contacted"
  | "negotiating"
  | "contracted"
  | "sandbox"
  | "live"
  | "paused"
  | "rejected";

export type SupplierProduct = {
  id: string;
  supplierId: string;
  supplierProductRef?: string;
  category: Category;
  countryCode: string;
  title: string;
  currency: string;
  retailPrice: number;
  billingPeriod: "one_time" | "day" | "week" | "month" | "year" | "term" | "night";
  lastPriceVerifiedAt?: string;
  saleStatus: "comparison_only" | "pending_partner_approval" | "sellable" | "paused" | "retired";
};

export type CustomerSelection = {
  customerId?: string;
  destination: string;
  requestedStartDate?: string;
  requestedDuration?: string;
  answers: Record<string, string | number | boolean | null>;
};

export type SupplierOrderItem = {
  orderId: string;
  orderItemIndex: number;
  product: SupplierProduct;
  customerSelection: CustomerSelection;
};

export type SupplierAvailability =
  | { status: "available"; checkedAt: string; expiresAt?: string; supplierReference?: string }
  | { status: "unavailable"; checkedAt: string; reason: string }
  | { status: "manual_confirmation_required"; checkedAt: string; message: string };

export type SupplierReservation =
  | { status: "submitted"; supplierReference: string; submittedAt: string }
  | { status: "confirmed"; supplierReference: string; confirmedAt: string }
  | { status: "requires_manual_action"; message: string }
  | { status: "rejected"; reason: string };

export interface SupplierAdapter {
  readonly supplierId: string;
  readonly integrationMethod: SupplierIntegrationMethod;
  checkAvailability(item: SupplierOrderItem): Promise<SupplierAvailability>;
  createReservation(item: SupplierOrderItem, idempotencyKey: string): Promise<SupplierReservation>;
  getReservationStatus(supplierReference: string): Promise<SupplierReservation>;
  cancelReservation(supplierReference: string, idempotencyKey: string): Promise<{ status: "cancelled" | "requires_manual_action" | "rejected"; message?: string }>;
}
