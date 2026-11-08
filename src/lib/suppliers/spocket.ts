import {
  SupplierAdapter,
  ProductSearchParams,
  SupplierProduct,
  SupplierVariant,
  InventoryResult,
  ShippingOption,
  SupplierOrderInput,
  SupplierOrderResult,
  SupplierOrderStatus,
  TrackingResult,
  ConnectionTestResult,
  AdapterNotSupportedError,
} from "./adapter";

/**
 * Spocket adapter — integration skeleton.
 *
 * Spocket provides API access to approved partners. Until credentials are
 * configured and verified, this adapter reports the limitation.
 */
export class SpocketAdapter implements SupplierAdapter {
  readonly marketplace = "Spocket";
  readonly supportsApi = false;

  async connect(): Promise<ConnectionTestResult> {
    return {
      success: false,
      message:
        "Spocket requires an approved API partnership. Manual supplier linking is available in the UI.",
    };
  }

  async disconnect(): Promise<void> {
    // no-op
  }

  async testConnection(): Promise<ConnectionTestResult> {
    return {
      success: false,
      message: "Spocket not connected (approved API required).",
    };
  }

  async getProducts(): Promise<SupplierProduct[]> {
    return [];
  }

  async getProduct(): Promise<SupplierProduct | null> {
    return null;
  }

  async getVariants(): Promise<SupplierVariant[]> {
    return [];
  }

  async getInventory(): Promise<InventoryResult[]> {
    return [];
  }

  async getShippingOptions(): Promise<ShippingOption[]> {
    return [];
  }

  async createOrder(): Promise<SupplierOrderResult> {
    throw new AdapterNotSupportedError("createOrder", this.marketplace);
  }

  async getOrderStatus(): Promise<SupplierOrderStatus> {
    throw new AdapterNotSupportedError("getOrderStatus", this.marketplace);
  }

  async getTracking(): Promise<TrackingResult> {
    throw new AdapterNotSupportedError("getTracking", this.marketplace);
  }
}
