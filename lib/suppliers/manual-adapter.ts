import type {
  SupplierAdapter,
  SupplierAvailability,
  SupplierOrderItem,
  SupplierReservation,
} from "./types";

/**
 * Safe placeholder for suppliers that have not provided an authorised API.
 * It never claims that inventory is available, an order was submitted, or a
 * cancellation succeeded. Operations staff must confirm the supplier action.
 */
export class ManualSupplierAdapter implements SupplierAdapter {
  readonly integrationMethod = "manual" as const;

  constructor(readonly supplierId: string) {}

  async checkAvailability(_item: SupplierOrderItem): Promise<SupplierAvailability> {
    return {
      status: "manual_confirmation_required",
      checkedAt: new Date().toISOString(),
      message: "Supplier availability has not been checked. Manual confirmation is required.",
    };
  }

  async createReservation(_item: SupplierOrderItem, _idempotencyKey: string): Promise<SupplierReservation> {
    return {
      status: "requires_manual_action",
      message: "No reservation was sent. An authorised CompareX operator must contact the supplier.",
    };
  }

  async getReservationStatus(_supplierReference: string): Promise<SupplierReservation> {
    return {
      status: "requires_manual_action",
      message: "The supplier status must be confirmed manually.",
    };
  }

  async cancelReservation(_supplierReference: string, _idempotencyKey: string) {
    return {
      status: "requires_manual_action" as const,
      message: "No cancellation was sent. An authorised CompareX operator must confirm cancellation with the supplier.",
    };
  }
}
