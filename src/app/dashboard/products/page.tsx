"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/utils";
import { Package, Plus, AlertTriangle, Truck } from "lucide-react";

export default function ProductsPage() {
  const user = useUser();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products?storeId=default");
      if (!res.ok) return;
      const data = await res.json();
      setProducts(data.products ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (!user?.name) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-text">My Products</h1>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-text">
              Complete onboarding to create your first store, then import
              products.
            </p>
            <Button onClick={() => router.push("/dashboard/settings/store")}>
              Set up store
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">My Products</h1>
          <p className="text-muted-text">
            Import products from connected suppliers, set pricing rules and
            publish them to your store.
          </p>
        </div>
        <div className="flex gap-2">
          <Input placeholder="Search products…" className="w-64" />
          <Button onClick={() => router.push("/dashboard/suppliers")}>
            <Plus className="h-4 w-4 mr-2" />
            Import from supplier
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-text">Loading…</p>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-muted-text">
              <Package className="h-10 w-10 mx-auto mb-2 text-muted" />
              <p>No products yet.</p>
              <Button onClick={() => router.push("/dashboard/suppliers")}>
                Import your first product
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-muted-text">Product</th>
                    <th className="pb-3 text-muted-text">Price</th>
                    <th className="pb-3 text-muted-text">Status</th>
                    <th className="pb-3 text-muted-text text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-border/50">
                      <td className="py-3 text-text">{p.title}</td>
                      <td className="py-3 text-muted-text">
                        {formatMoney(p.basePrice)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                            p.status === "ACTIVE"
                              ? "border-emerald/10 bg-emerald/10 text-emerald-700"
                              : "border-muted/20 bg-muted/50 text-muted"
                          }`
                        }>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Button size="sm" variant="outline">
                          Manage
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing rules</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-3">
              <Truck className="h-4 w-4 text-muted" />
              <h5 className="font-semibold text-sm text-text">Automatic markup pricing</h5>
            </div>
            <p className="text-sm text-muted-text mb-4">
              Set a default markup (e.g. 50%) so imported products are priced
              automatically with a healthy margin. Pricing is deterministic —
              never arbitrary AI guesses.
            </p>
            <Button onClick={() => router.push("/dashboard/settings/pricing")}>
              Manage pricing rules
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
