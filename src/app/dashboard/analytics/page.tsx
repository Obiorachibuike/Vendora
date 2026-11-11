"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/utils";
import { DollarSign, ShoppingCart, AlertTriangle, TrendingUp, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { readError, networkError } from "@/lib/http";

export default function AnalyticsPage() {
  const user = useUser();
  const router = useRouter();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics/overview?storeId=default");
      if (!res.ok) {
        toast.error(await readError(res, "Couldn't load analytics"));
        return;
      }
      const data = await res.json();
      setMetrics(data);
    } catch {
      toast.error(networkError);
    } finally {
      setLoading(false);
    }
  };

  if (!user?.name) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-text">Analytics</h1>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-text">Complete onboarding to create your first store, then view analytics.</p>
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
          <h1 className="text-2xl font-bold text-text">Analytics</h1>
          <p className="text-muted-text">
            Realised revenue and profit from actual persisted transaction data —
            estimated vs realised profit are distinguished at the order level.
          </p>
        </div>
        <Button onClick={loadMetrics}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-text">Loading…</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total revenue"
            value={metrics ? formatMoney(metrics.totalRevenue) : "--"}
            sub="Realised (successful payments)"
            icon={DollarSign}
          />
          <StatCard
            title="Net revenue"
            value={metrics ? formatMoney(metrics.netRevenue) : "--"}
            sub="After refunds"
            icon={TrendingUp}
          />
          <StatCard
            title="Total orders"
            value={metrics ? metrics.totalOrders : "--"}
            sub="This period"
            icon={ShoppingCart}
          />
          <StatCard
            title="Gross profit"
            value={metrics ? formatMoney(metrics.grossProfit) : "--"}
            sub="Revenue minus COGS"
            icon={DollarSign}
          />
        </div>
      )}

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Margin Margin &amp; costs costs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-4 grid-cols-2">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-xs text-muted-text uppercase font-semibold">COGS</div>
                <div className="text-sm font-bold text-text">
                  {formatMoney(metrics.cogs)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-xs text-muted-text uppercase font-semibold">Margin</div>
                <div className="text-sm font-bold text-text">
                  {metrics.margin != null ? ((metrics.margin as number) * 100).toFixed(1) + "%" : "--"}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-xs text-muted-text uppercase font-semibold">Refunds</div>
                <div className="text-sm font-bold text-text">
                  {formatMoney(metrics.totalRefunds)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-xs text-muted-text uppercase font-semibold">Avg order value</div>
                <div className="text-sm font-bold text-text">
                  {formatMoney(metrics.averageOrderValue)}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-text">
              {metrics.note}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Estimated vs realised</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 border-t border-border">
            <AlertTriangle className="h-4 w-4 text-muted mr-2 inline" />
            <p className="text-sm text-muted-text">
              Estimated profit (pricing engine projection) is shown at product
              import time; realised profit is calculated here from actual
              payments, refunds and supplier costs.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, sub, icon: Icon }: { title: string; value: string; sub: string; icon: any }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-text">{value}</div>
        <p className="text-xs text-muted-text">{sub}</p>
      </CardContent>
    </Card>
  );
}
