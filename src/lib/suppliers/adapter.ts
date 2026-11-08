/**
 * Universal Supplier Integration Engine — adapter interface.
 *
 * Each supplier marketplace gets its own adapter implementing this interface.
 * Only operations actually supported by the provider's real API are implemented;
 * unsupported operations throw AdapterNotSupportedError so the caller can
 * degrade gracefully (manual workflow, clear limitation notice).
 */

export interface ProductSearchParams {
  keyword?: string;
  category?: string;
  country?: string;
  minMargin?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

export interface SupplierProduct {
  id: string; // internal supplier-product id used by this adapter
  externalProductId: string;
  externalUrl?: string;
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  sku?: string;
  images: string[];
  minOrderQty: number;
  isActive: boolean;
}

export interface SupplierVariant {
  id: string;
  externalVariantId: string;
  sku?: string;
  name?: string;
  options?: Record<string, string>; // { color: "Red", size: "M" }
  weight?: number; // grams
  dimensions?: Record<string, number>;
}

export interface InventoryResult {
  variantId: string;
  quantity: number;
  available: boolean;
  warehouses?: Array<{ location: string; quantity: number }>;
  lastCheckedAt: Date;
}

export interface ShippingOption {
  id: string;
  name: string;
  price: number;
  currency: string;
  destinationCountry?: string;
  estimatedMinDays: number;
  estimatedMaxDays: number;
}

export interface SupplierOrderInput {
  customerAddress: {
    name?: string;
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  items: Array<{
    supplierProductId: string;
    supplierVariantId?: string;
    quantity: number;
  }>;
  idempotencyKey: string;
}

export interface SupplierOrderResult {
  supplierOrderId: string;
  externalOrderId?: string;
  status: string;
  total: number;
  currency: string;
  shippingTotal?: number;
  trackingNumber?: string;
  trackingUrl?: string;
}

export interface SupplierOrderStatus {
  supplierOrderId: string;
  status: string; // PENDING|SUBMITTED|CONFIRMED|REJECTED|CANCELLED|SHIPPED|DELIVERED|FAILED
  trackingNumber?: string;
  trackingUrl?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  error?: string;
}

export interface TrackingResult {
  trackingNumber: string;
  status: string;
  events: Array<{ status: string; location?: string; occurredAt: Date; description?: string }>;
}

export interface ConnectionTestResult {
  success: boolean;
  message?: string;
  accountId?: string;
}

export class AdapterNotSupportedError extends Error {
  constructor(operation: string, marketplace: string) {
    super(`${operation} is not supported by ${marketplace}`);
    this.name = "AdapterNotSupportedError";
  }
}

/**
 * Common supplier adapter interface.
 */
export interface SupplierAdapter {
  readonly marketplace: string;
  readonly supportsApi: boolean;

  connect(credential: { token?: string; secret?: string; refresh?: string }): Promise<ConnectionTestResult>;
  disconnect(): Promise<void>;
  testConnection(credential: { token?: string; secret?: string }): Promise<ConnectionTestResult>;

  getProducts(params: ProductSearchParams): Promise<SupplierProduct[]>;
  getProduct(supplierProductId: string): Promise<SupplierProduct | null>;
  getVariants(supplierProductId: string): Promise<SupplierVariant[]>;
  getInventory(supplierProductId: string): Promise<InventoryResult[]>;
  getShippingOptions(params: { destinationCountry: string; items: Array<{ productId: string; variantId?: string; quantity: number }> }): Promise<ShippingOption[]>;
  createOrder(order: SupplierOrderInput): Promise<SupplierOrderResult>;
  getOrderStatus(supplierOrderId: string): Promise<SupplierOrderStatus>;
  getTracking(supplierOrderId: string): Promise<TrackingResult>;
}
