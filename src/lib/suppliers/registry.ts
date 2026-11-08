import { SupplierAdapter } from "./adapter";
import { CJdropshippingAdapter } from "./cjdropshipping";
import { AliExpressAdapter } from "./aliexpress";
import { AlibabaAdapter } from "./alibaba";
import { ZendropAdapter } from "./zendrop";
import { SpocketAdapter } from "./spocket";

export interface RegisteredSupplier {
  id: string;
  name: string;
  marketplace: string;
  supportsApi: boolean;
  adapter: SupplierAdapter;
  enabled: boolean;
}

/**
 * Supplier integration registry. Additional suppliers can be registered here
 * without rewriting the core application.
 */
export class SupplierRegistry {
  private adapters = new Map<string, RegisteredSupplier>();

  constructor() {
    // Built-in adapters (instantiated lazily with no credentials — connection
    // status is PENDING until a store connects and supplies credentials).
    this.register({
      id: "cjdropshipping",
      name: "CJdropshipping",
      marketplace: "CJdropshipping",
      supportsApi: true,
      adapter: new CJdropshippingAdapter(),
      enabled: true,
    });
    this.register({
      id: "aliexpress",
      name: "AliExpress",
      marketplace: "AliExpress",
      supportsApi: true,
      adapter: new AliExpressAdapter(),
      enabled: true,
    });
    this.register({
      id: "alibaba",
      name: "Alibaba",
      marketplace: "Alibaba",
      supportsApi: true,
      adapter: new AlibabaAdapter(),
      enabled: true,
    });
    this.register({
      id: "zendrop",
      name: "Zendrop",
      marketplace: "Zendrop",
      supportsApi: true,
      adapter: new ZendropAdapter(),
      enabled: true,
    });
    this.register({
      id: "spocket",
      name: "Spocket",
      marketplace: "Spocket",
      supportsApi: true,
      adapter: new SpocketAdapter(),
      enabled: true,
    });
  }

  register(supplier: RegisteredSupplier): void {
    this.adapters.set(supplier.id, supplier);
  }

  get(id: string): RegisteredSupplier | undefined {
    return this.adapters.get(id);
  }

  list(): RegisteredSupplier[] {
    return Array.from(this.adapters.values());
  }

  getAdapter(marketplace: string): SupplierAdapter | undefined {
    for (const s of this.adapters.values()) {
      if (s.marketplace.toLowerCase() === marketplace.toLowerCase()) return s.adapter;
    }
    return undefined;
  }

  setEnabled(id: string, enabled: boolean): boolean {
    const s = this.adapters.get(id);
    if (!s) return false;
    s.enabled = enabled;
    return true;
  }
}

export const supplierRegistry = new SupplierRegistry();
