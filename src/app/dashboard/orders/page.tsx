"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/utils";
import { ShoppingBag, Truck, AlertTriangle, RefreshCw } from "lucide-react";

export default function OrdersPage() {
  const user = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders?storeId=default");
      if (!res.ok) return;
      const data = await res.json();
      setOrders(data.orders ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const fulfillOrder = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}/fulfill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id }),
      });
      const data = await res.json();
      if (res.ok) {
        await loadOrders();
      } else {
        alert(data.error ?? "Fulfillment failed");
      }
    } catch {
      alert("Fulfillment failed");
    }
  };

  const retryOrder = async (supplierOrderId: string) => {
    try {
      const res = await fetch(`/api/orders/${supplierOrderId}/retry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplierOrderId }),
      });
      if (res.ok) await loadOrders();
    } catch {
      // ignore
    }
  };

  if (!user?.name) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-text">Orders</h1>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-text">Complete onboarding to create your first store, then manage orders.</p>
            <Button onClick={() => router.push("/dashboard/settings/store")}>Set up store</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Orders</h1>
          <p className="text-muted-text">Track orders from payment through supplier fulfillment and delivery.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadOrders}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-text">Loading…</p>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-muted-text">
              <ShoppingBag className="h-10 w-10 mx-auto mb-2 text-muted" />
              <p>No orders yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-muted-text">Order #</th>
                    <th className="pb-3 text-muted-text">Total</th>
                    <th className="pb-3 text-muted-text">Payment</th>
                    <th className="pb-3 text-muted-text">Fulfillment</th>
                    <th className="pb-3 text-muted-text text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b border-border/50">
                      <td className="py-3 text-text">{o.orderNumber}</td>
                      <td className="py-3 text-muted-text">{formatMoney(o.total)}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                            o.paymentStatus === "PAID"
                              ? "border-emerald/10 bg-emerald/10 text-emerald-700"
                              : "border-muted/20 bg-muted/50 text-muted"
                          }`
                        }>
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                            o.fulfillmentStatus === "FULFILLED"
                              ? "border-emerald/10 bg-emerald/10 text-emerald-700"
                              : "border-amber/10 bg-amber/10 text-amber-700"
                          }`
                        }>
                          {o.fulfillmentStatus}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Button size="sm" onClick={() => fulfillOrder(o.id)} disabled={o.paymentStatus !== "PAID"}>
                          Fulfill
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
          <CardTitle>How fulfillment works</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 border-t border-border space-y-3">
            <div className="flex items-start gap-3">
              <Truck className="h-4 w-4 text-muted mt-0.5" />
              <div>
                <h5 className="font-semibold text-sm text-text">Supplier fulfillment</h5>
                <p className="text-sm text-muted-text">
                  Once an order is paid, click Fulfill to send it to your
                  selected supplier. The order is routed to the supplier with
                  idempotency so it is never submitted twice.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-muted mt-0.5" />
              <div>
                <h5 className="font-semibold text-sm text-text">Exception handling</h5>
                <p className="text-sm text-muted-text">
                  If no eligible supplier is available, the order is routed to an
                  exception queue for manual review instead of silently failing.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
