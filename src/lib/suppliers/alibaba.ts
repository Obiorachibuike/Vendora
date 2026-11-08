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
 * Alibaba adapter — integration skeleton.
 *
 * Alibaba.com offers APIs via their developer program (Open Platform), but
 * dropshipping-specific automatic fulfillment is not universally available.
 * Until real, verified credentials are integrated, this adapter reports the
 * limitation and returns empty results.
 */
export class AlibabaAdapter implements SupplierAdapter {
  readonly marketplace = "Alibaba";
  readonly supportsApi = false;

  async connect(): Promise<ConnectionTestResult> {
    return {
      success: false,
      message:
        "Alibaba API access requires an approved developer application. Manual supplier linking is available in the UI.",
    };
  }

  async disconnect(): Promise<void> {
    // no-op
  }

  async testConnection(): Promise<ConnectionTestResult> {
    return {
      success: false,
      message: "Alibaba not connected (approved developer API required).",
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
