"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/utils";
import { Search, AlertTriangle, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { readError, networkError } from "@/lib/http";

export default function ResearchPage() {
  const user = useUser();
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [country, setCountry] = useState("NG");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const storeId = null; // set after store selection

  const runResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) {
      toast.error("Enter a keyword to research.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/research/products?keyword=${encodeURIComponent(keyword)}&category=${encodeURIComponent(category)}&country=${encodeURIComponent(country)}`,
        { method: "POST" },
      );
      if (!res.ok) {
        toast.error(await readError(res, "Research failed"));
        return;
      }
      const data = await res.json();
      const opp = data.opportunity ? [data.opportunity] : [];
      setResults(opp);
      if (opp.length > 0) {
        toast.success("Research complete — opportunity found.");
      } else {
        toast.info("Research complete — no strong opportunity found for that keyword.");
      }
    } catch {
      toast.error(networkError);
    } finally {
      setLoading(false);
    }
  };

  if (!user?.name) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-text">Product Research</h1>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-text">
              Complete onboarding to create your first store, then research
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
          <h1 className="text-2xl font-bold text-text">Product Research</h1>
          <p className="text-muted-text">
            Find winning products with transparent, evidence-based scoring. No
            fabricated sales figures.
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/settings/store")}>
          Set up store
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New research</CardTitle>
          <CardDescription>
            Research a keyword to score its opportunity across demand,
            competition, profit, supplier availability and shipping.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={runResearch} className="grid gap-3 md:grid-cols-4 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted-text">Keyword</label>
              <input
                className="border border-input rounded-lg px-3 py-2 text-sm"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. wireless earbuds"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted-text">Category</label>
              <input
                className="border border-input rounded-lg px-3 py-2 text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Electronics"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted-text">Country</label>
              <input
                className="border border-input rounded-lg px-3 py-2 text-sm"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="NG"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Researching…" : "Run research"}
            </Button>
          </form>

          {results.length > 0 && (
            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-text mb-3">Opportunity</h3>
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4 items-start">
                    <div className="flex-1">
                      <h4 className="font-bold text-text">{results[0].title}</h4>
                      <p className="text-sm text-muted-text">
                        Category: {results[0].category ?? "—"}{" "}
                        <span className="ml-2 flex items-center gap-1">
                          <Search className="h-3 w-3" />
                          Demand {results[0].demandScore}/100
                        </span>
                      </p>
                      <div className="mt-3 grid gap-3 grid-cols-3">
                        <div>
                          <div className="text-xs text-muted-text">Suggested price</div>
                          <div className="font-mono font-bold">
                            {formatMoney(results[0].suggestedSellingPrice)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-text">Est. profit</div>
                          <div className="font-mono font-bold">
                            {formatMoney(results[0].estimatedProfit)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-text">Suppliers</div>
                          <div className="font-mono font-bold">
                            {results[0].supplierCount}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted" />
                        <span className="font-bold">Opportunity score</span>
                      </div>
                      <div className="text-3xl font-bold text-text">
                        {results[0].opportunityScore}/100
                      </div>
                      <p className="text-xs text-muted-text">
                        Confidence:{" "}
                        <span className="capitalize">{results[0].confidence ?? "low"}</span>
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-text mt-3">
                    Scores are transparent and evidence-based. Search interest,
                    advertising activity and social engagement are blended into a
                    demand score; no sales figures are fabricated.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How scoring works</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 grid-cols-2 md:grid-cols-3 text-sm">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-text uppercase font-semibold">Demand (30%)</div>
            <div className="text-sm text-text">Search interest × ads × social engagement.</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-text uppercase font-semibold">Competition (25%)</div>
            <div className="text-sm text-text">Less competition = higher score.</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-text uppercase font-semibold">Profit (20%)</div>
            <div className="text-sm text-text">Margin and estimated absolute profit.</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-text uppercase font-semibold">Supplier (15%)</div>
            <div className="text-sm text-text">Availability and supplier count.</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-text uppercase font-semibold">Shipping (10%)</div>
            <div className="text-sm text-text">Whether shipping is offered.</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
