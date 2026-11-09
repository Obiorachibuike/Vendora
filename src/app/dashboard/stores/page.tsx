"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Store, Plus, AlertTriangle } from "lucide-react";

export default function StoresPage() {
  const user = useUser();
  const router = useRouter();
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [country, setCountry] = useState("NG");
  const [currency, setCurrency] = useState("NGN");

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stores");
      if (!res.ok) return;
      const data = await res.json();
      setStores(data.stores ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const createStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, country, currency }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Create store failed");
        return;
      }
      await loadStores();
      setName("");
      setSlug("");
    } catch {
      alert("Create store failed");
    }
  };

  if (!user?.name) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-text">My Stores</h1>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-text">Complete onboarding to create your first store.</p>
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
          <h1 className="text-2xl font-bold text-text">My Stores</h1>
          <p className="text-muted-text">
            Manage your dropshipping stores. Each store has its own catalog,
            pricing and orders.
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/settings/store")}>
          <Store className="h-4 w-4 mr-2" />
          New store
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your stores</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-text">Loading…</p>
          ) : stores.length === 0 ? (
            <div className="p-8 text-center text-muted-text">
              <Store className="h-10 w-10 mx-auto mb-2 text-muted" />
              <p>No stores yet.</p>
              <Button onClick={() => router.push("/dashboard/settings/store")}>
                Create your first store
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {stores.map((s) => (
                <Card key={s.id} className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-text">{s.name}</h4>
                      <p className="text-sm text-muted-text">
                        {s.slug} • {s.country} • {s.currency}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => router.push(`/dashboard/stores/${s.id}`)}>
                        View
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create a new store</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <form onSubmit={createStore} className="p-4 grid gap-3 md:grid-cols-4 items-end border-t border-border">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-text">Store name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Boutique" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-text">Slug</label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="my-boutique" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-text">Country</label>
              <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="NG" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-text">Currency</label>
              <Input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="NGN" />
            </div>
            <Button type="submit">Create store</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
