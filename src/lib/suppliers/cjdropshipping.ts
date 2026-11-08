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
 * CJdropshipping adapter.
 *
 * NOTE: This is a STUB / integration skeleton. CJdropshipping does offer an
 * official API (developer program), but real credentials and API access are
 * required to make live calls. Until real credentials are configured and
 * verified, all product discovery/order operations return empty results with
 * a clear "not connected" status — we never fabricate supplier data, prices,
 * or stock levels (per Vendora AI business rule #1).
 *
 * To wire the real integration:
 *   1. Obtain CJdropshipping API key/secret from their developer portal.
 *   2. Implement authenticate() against https://developers.cjdropshipping.com/
 *   3. Replace the stub methods below with real HTTP calls.
 *   4. Add webhook signature verification for order/tracking callbacks.
 */
export class CJdropshippingAdapter implements SupplierAdapter {
  readonly marketplace = "CJdropshipping";
  readonly supportsApi = true;

  private credential?: { token?: string; secret?: string; refresh?: string };

  async connect(credential: {
    token?: string;
    secret?: string;
    refresh?: string;
  }): Promise<ConnectionTestResult> {
    this.credential = credential;
    if (!credential.token && !credential.secret) {
      return { success: false, message: "No CJdropshipping API credentials provided" };
    }
    // Real implementation: call CJ auth/profile endpoint to validate credentials.
    return {
      success: true,
      message: "Connected (stub — no live API call made). Configure real credentials for live sync.",
      accountId: undefined,
    };
  }

  async disconnect(): Promise<void> {
    this.credential = undefined;
  }

  async testConnection(credential: {
    token?: string;
    secret?: string;
  }): Promise<ConnectionTestResult> {
    if (!credential.token && !credential.secret) {
      return { success: false, message: "No CJdropshipping API credentials provided" };
    }
    return { success: true, message: "Reachable (stub)" };
  }

  async getProducts(params: ProductSearchParams): Promise<SupplierProduct[]> {
    // No live API call — return empty so UI shows "connect a supplier" state.
    return [];
  }

  async getProduct(supplierProductId: string): Promise<SupplierProduct | null> {
    return null;
  }

  async getVariants(supplierProductId: string): Promise<SupplierVariant[]> {
    return [];
  }

  async getInventory(supplierProductId: string): Promise<InventoryResult[]> {
    return [];
  }

  async getShippingOptions(params: {
    destinationCountry: string;
    items: Array<{ productId: string; variantId?: string; quantity: number }>;
  }): Promise<ShippingOption[]> {
    return [];
  }

  async createOrder(order: SupplierOrderInput): Promise<SupplierOrderResult> {
    throw new AdapterNotSupportedError("createOrder", this.marketplace);
  }

  async getOrderStatus(supplierOrderId: string): Promise<SupplierOrderStatus> {
    throw new AdapterNotSupportedError("getOrderStatus", this.marketplace);
  }

  async getTracking(supplierOrderId: string): Promise<TrackingResult> {
    throw new AdapterNotSupportedError("getTracking", this.marketplace);
  }
}
