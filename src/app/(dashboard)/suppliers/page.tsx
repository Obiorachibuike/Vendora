"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/utils";
import { Package, AlertTriangle, CheckCircle2, Link, BarChart3 } from "lucide-react";

export default function SuppliersPage() {
  const user = useUser();
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const [sRes, cRes] = await Promise.all([
        fetch("/api/suppliers"),
        fetch("/api/suppliers?storeId=default"),
      ]);
      const sData = await sRes.json();
      setSuppliers(sData.suppliers ?? []);
      setConnections(sData.suppliers ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const connectSupplier = async (id: string) => {
    try {
      const res = await fetch("/api/suppliers/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplierId: id }),
      });
      const data = await res.json();
      if (res.ok) {
        await loadSuppliers();
      } else {
        alert(data.error ?? "Connect failed");
      }
    } catch {
      alert("Connect failed");
    }
  };

  if (!user?.name) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-text">Suppliers</h1>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-text">
              Complete onboarding to create your first store, then connect
              suppliers.
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
          <h1 className="text-2xl font-bold text-text">Suppliers</h1>
          <p className="text-muted-text">
            Discover products across CJdropshipping, AliExpress, Alibaba, Zendrop
            and Spocket. Connect a supplier to import offers into your store.
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Button onClick={() => router.push("/dashboard/settings/store")}>
            Connect supplier
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available suppliers</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-text">Loading…</p>
          ) : suppliers.length === 0 ? (
            <p className="text-muted-text">No suppliers found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-muted-text">Supplier</th>
                    <th className="pb-3 text-muted-text">Marketplace</th>
                    <th className="pb-3 text-muted-text">API</th>
                    <th className="pb-3 text-muted-text">Status</th>
                    <th className="pb-3 text-muted-text text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s) => (
                    <tr key={s.id} className="border-b border-border/50">
                      <td className="py-3 text-text">{s.name}</td>
                      <td className="py-3 text-muted-text">{s.marketplace}</td>
                      <td className="py-3 text-muted-text">
                        {s.supportsApi ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Yes
                          </span>
                        ) : (
                          "Manual only"
                        )}
                      </td>
                      <td className="py-3 text-muted-text">{s.connected ? "Connected" : "Not connected"}</td>
                      <td className="py-3 text-right">
                        <Button
                          size="sm"
                          onClick={() => connectSupplier(s.id)}
                          disabled={s.connected}
                        >
                          {s.connected ? "Connected" : "Connect"}
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
          <CardTitle>Supplier search</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 border-t border-border">
            <p className="text-sm text-muted-text mb-3">
              Search connected supplier catalogs for products to import. Results
              appear once a supplier is connected with valid credentials.
            </p>
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <Input
                placeholder="Keyword (e.g. bluetooth speaker)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button
                onClick={async () => {
                  try {
                    const res = await fetch("/api/suppliers/search", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ keyword: search }),
                    });
                    const data = await res.json();
                    alert(
                      data.note ?? `Found ${data.total ?? 0} products (${data.results?.length ?? 0} shown).`,
                    );
                  } catch {
                    alert("Search failed");
                  }
                }}
              >
                Search catalogs
              </Button>
            </div>
            <p className="text-xs text-muted-text mt-2">
              Until supplier credentials are connected and verified, discovery
              returns empty results. No supplier data is fabricated.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
