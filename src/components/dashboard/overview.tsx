"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils";
import {
  DollarSign,
  ShoppingCart,
  Truck,
  Users,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

interface DashboardOverviewProps {
  storeId: string | null;
  user: { name?: string | null; email: string; role: string };
}

const baseStatCards = [
  {
    title: "Total Revenue",
    value: "--",
    sub: "This month",
    icon: DollarSign,
    trend: "+12.4%",
    trendPositive: true,
  },
  {
    title: "Total Orders",
    value: "--",
    sub: "This month",
    icon: ShoppingCart,
    trend: "+8.1%",
    trendPositive: true,
  },
  {
    title: "Gross Profit",
    value: "--",
    sub: "Realised profit",
    icon: TrendingUp,
    trend: "+5.2%",
    trendPositive: true,
  },
  {
    title: "Awaiting Fulfillment",
    value: "--",
    sub: "Needs attention",
    icon: Truck,
    trend: undefined,
  },
];

export function DashboardOverview({ storeId, user }: DashboardOverviewProps) {
  const stats = useMemo(() => {
    if (!storeId) {
      return baseStatCards.map((s) => ({ ...s, value: "0", sub: "No store yet" }));
    }
    // Placeholder: real values come from /api/analytics/overview once a store exists.
    return baseStatCards;
  }, [storeId]);

  return (
    <div className="space-y-6 entry-animation">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Dashboard</h1>
          <p className="text-muted-text">
            Welcome back, {user.name ?? user.email}. Here is how your business
            is performing.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg border border-input bg-card text-sm font-medium text-muted hover:bg-card/80">Export report</button>
          <button className="px-4 py-2 rounded-lg bg-brand text-brand-contrast text-sm font-medium hover:bg-brand/90">New order</button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text">{stat.value}</div>
              <p className="text-xs text-muted-text">{stat.sub}</p>
              {stat.trend && (
                <div className="mt-1 flex items-center gap-1">
                  <Badge variant={stat.trendPositive ? "success" : "warning"} className="text-xs">
                    {stat.trendPositive ? "▲" : "▼"} {stat.trend}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Getting started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-text">
            Complete setup to start using Vendora AI:
          </p>
          {!user?.name ? (
            <p className="text-sm text-muted-text">• Finish your onboarding to create your first store.</p>
          ) : null}
          <p className="text-sm text-muted-text">
            • Connect a supplier (CJdropshipping, AliExpress, Alibaba, Zendrop,
            Spocket) to discover products.
          </p>
          <p className="text-sm text-muted-text">
            • Import products, set pricing rules and enable automated
            fulfillment.
          </p>
          <AlertTriangle className="h-4 w-4 text-warning mr-2 inline" />
          <span className="text-sm text-muted-text">
            Background jobs run through pg-boss on PostgreSQL — navigate freely
            while discovery and fulfillment continue.
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
