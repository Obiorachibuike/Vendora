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
 * AliExpress adapter — integration skeleton.
 *
 * AliExpress does not provide a public, unrestricted dropshipping product
 * sourcing + automatic fulfillment API to all developers. Access is granted
 * via the AliExpress Affiliate / Open Platform partner program with approval.
 * Until approved credentials are available, this adapter reports itself as
 * not production-ready and returns empty results. Manual supplier linking is
 * supported via the UI.
 */
export class AliExpressAdapter implements SupplierAdapter {
  readonly marketplace = "AliExpress";
  readonly supportsApi = false;

  async connect(): Promise<ConnectionTestResult> {
    return {
      success: false,
      message:
        "AliExpress requires an approved Open Platform / Affiliate API partnership. Manual supplier linking is available in the UI.",
    };
  }

  async disconnect(): Promise<void> {
    // no-op
  }

  async testConnection(): Promise<ConnectionTestResult> {
    return {
      success: false,
      message:
        "AliExpress API access requires an approved partner account; not connected.",
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
