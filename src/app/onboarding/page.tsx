"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { onboardingSchema } from "@/lib/validations";
import { cn } from "@/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { readError, networkError } from "@/lib/http";

const SUPPLIERS = ["CJdropshipping", "AliExpress", "Alibaba", "Zendrop", "Spocket"];
const CATEGORIES = ["Fashion", "Electronics", "Home & Living", "Beauty", "Baby", "Fitness"];

type FormValues = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      businessName: "",
      storeName: "",
      country: "NG",
      currency: "NGN",
      targetMarket: "",
      preferredCategories: [],
      preferredSuppliers: [],
      businessModel: "dropshipping",
      sellingPlatform: "vendora-storefront",
      expectedProfitMargin: "",
      shippingPreferences: "",
      acceptTerms: false,
    },
  });

  const onSubmit = async (values: unknown) => {
    setSubmitting(true);
    try {
      const data = values as FormValues;
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        toast.error(await readError(res, "Onboarding failed"));
        setSubmitting(false);
        return;
      }
      toast.success("Your store is ready — welcome to Vendora AI!");
      router.push("/dashboard");
    } catch {
      toast.error(networkError);
      setSubmitting(false);
    }
  };

  const togglePill = (key: "preferredCategories" | "preferredSuppliers", value: string) => {
    const cur = (form.getValues(key) ?? []) as string[];
    const next = cur.includes(value) ? cur.filter((c) => c !== value) : [...cur, value];
    form.setValue(key, next);
  };

  const selectedCategories = (form.getValues("preferredCategories") ?? []) as string[];
  const selectedSuppliers = (form.getValues("preferredSuppliers") ?? []) as string[];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Set up your store</CardTitle>
          <CardDescription>
            Tell us about your business so Vendora AI can surface the right
            products and suppliers for you. All fields are optional unless
            marked.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit as (v: unknown) => void)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business name <span className="text-destructive">*</span></Label>
                <Input
                  id="businessName"
                  placeholder="Vendora Store"
                  {...form.register("businessName")}
                  className={cn(
                    "text-text",
                    form.formState.errors.businessName ? "border-destructive" : "",
                  )}
                />
                {form.formState.errors.businessName && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.businessName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeName">Store name <span className="text-destructive">*</span></Label>
                <Input
                  id="storeName"
                  placeholder="My Store"
                  {...form.register("storeName")}
                  className={cn(
                    "text-text",
                    form.formState.errors.storeName ? "border-destructive" : "",
                  )}
                />
                {form.formState.errors.storeName && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.storeName.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country <span className="text-destructive">*</span></Label>
                <Input id="country" placeholder="NG" {...form.register("country")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency <span className="text-destructive">*</span></Label>
                <Input id="currency" placeholder="NGN" {...form.register("currency")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetMarket">Target market</Label>
              <Input
                id="targetMarket"
                placeholder="e.g. Lagos, Nigeria"
                {...form.register("targetMarket")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferredCategories">Preferred product categories</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => togglePill("preferredCategories", cat)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm border transition-colors",
                      selectedCategories.includes(cat)
                        ? "bg-brand text-brand-contrast border-transparent"
                        : "border-input text-muted hover:bg-card",
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <input
                name="preferredCategories"
                value={JSON.stringify(selectedCategories)}
                hidden
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferredSuppliers">Preferred suppliers</Label>
              <div className="flex flex-wrap gap-2">
                {SUPPLIERS.map((sup) => (
                  <button
                    key={sup}
                    type="button"
                    onClick={() => togglePill("preferredSuppliers", sup)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm border transition-colors",
                      selectedSuppliers.includes(sup)
                        ? "bg-brand text-brand-contrast border-transparent"
                        : "border-input text-muted hover:bg-card",
                    )}
                  >
                    {sup}
                  </button>
                ))}
              </div>
              <input
                name="preferredSuppliers"
                value={JSON.stringify(selectedSuppliers)}
                hidden
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessModel">Business model</Label>
                <Input
                  id="businessModel"
                  placeholder="dropshipping"
                  {...form.register("businessModel")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellingPlatform">Selling platform</Label>
                <Input
                  id="sellingPlatform"
                  placeholder="vendora-storefront"
                  {...form.register("sellingPlatform")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedProfitMargin">Expected profit margin (%)</Label>
              <Input
                id="expectedProfitMargin"
                type="number"
                placeholder="30"
                {...form.register("expectedProfitMargin")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shippingPreferences">Shipping preferences</Label>
              <Input
                id="shippingPreferences"
                placeholder="e.g. nationwide express"
                {...form.register("shippingPreferences")}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.getValues("acceptTerms") ?? false}
                onCheckedChange={(v) => form.setValue("acceptTerms", v)}
              />
              <Label className="text-sm text-muted-text leading-none">
                I accept the Terms of Service and Privacy Policy
              </Label>
            </div>
            <Button type="submit" className="w-full bg-brand text-brand-contrast" disabled={submitting}>
              Finish setup
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <a href="/login" className="text-sm text-muted hover:underline">
            Already have an account? Sign in
          </a>
        </CardFooter>
      </Card>
    </div>
  );
}
