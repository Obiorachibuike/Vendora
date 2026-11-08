"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Settings, Shield, CreditCard, BarChart3, Bot, Bell } from "lucide-react";

const tabs = [
  { name: "Profile", href: "#profile", icon: Shield },
  { name: "Store", href: "#store", icon: Settings },
  { name: "Payments", href: "#payments", icon: CreditCard },
  { name: "Pricing", href: "#pricing", icon: BarChart3 },
  { name: "Automation", href: "#automation", icon: Bot },
  { name: "Notifications", href: "#notifications", icon: Bell },
];

export default function SettingsPage() {
  const user = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("store");

  if (!user?.name) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-text">Settings</h1>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-text">Complete onboarding to access settings.</p>
            <Button onClick={() => router.push("/dashboard/settings/store")}>Set up store</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">Settings</h1>
      <div className="flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name.toLowerCase())}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors border",
              activeTab === tab.name.toLowerCase()
                ? "bg-brand text-brand-contrast border-brand"
                : "border-input text-muted hover:bg-card",
            )}
          >
            <tab.icon className="h-4 w-4" /> {tab.name}
          </button>
        ))}
      </div>

      {activeTab === "store" && <StoreSettings user={user} />}
      {activeTab === "profile" && <ProfileSettings user={user} />}
      {activeTab === "payments" && <PaymentSettings />}
      {activeTab === "pricing" && <PricingSettings />}
      {activeTab === "automation" && <AutomationSettings />}
      {activeTab === "notifications" && <NotificationSettings />}
    </div>
  );
}

function cn(...inputs: any[]): string {
  return inputs.filter(Boolean).join(" ");
}

function StoreSettings({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [minMargin, setMinMargin] = useState("0.2");
  const [markupValue, setMarkupValue] = useState("50");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch("/api/settings?storeId=default");
      if (!res.ok) return;
      const data = await res.json();
      setSettings(data.settings);
      setMinMargin(String(data.settings?.minProfitMargin ?? 0.2));
      setMarkupValue(String(data.settings?.defaultMarkupValue ?? 50));
    } catch {
      // ignore
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: "default",
          minProfitMargin: parseFloat(minMargin),
          defaultMarkupValue: parseFloat(markupValue),
        }),
      });
      alert("Settings saved");
    } catch {
      alert("Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Store settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={save} className="grid gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-text">Min profit margin</label>
            <Input
              value={minMargin}
              onChange={(e) => setMinMargin(e.target.value)}
              placeholder="0.2"
            />
            <p className="text-xs text-muted-text">e.g. 0.2 = 20% minimum margin</p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-text">Default markup (%)</label>
            <Input
              value={markupValue}
              onChange={(e) => setMarkupValue(e.target.value)}
              placeholder="50"
            />
            <p className="text-xs text-muted-text">Applied to landed cost when importing products.</p>
          </div>
          <div className="col-span-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save settings"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ProfileSettings({ user }: { user: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-brand flex items-center justify-center text-brand-contrast font-bold">
            {(user.name ?? "U").toUpperCase()[0]}
          </div>
          <div>
            <p className="font-medium text-text">{user.name ?? "Store Owner"}</p>
            <p className="text-sm text-muted-text">{user.email}</p>
            <p className="text-xs text-muted-text">Role: {user.role}</p>
          </div>
        </div>
        <p className="text-sm text-muted-text">
          Profile details are set during onboarding and can be updated from your
          account page.
        </p>
      </CardContent>
    </Card>
  );
}

function PaymentSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment settings</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-text">
          Connect Paystack, Flutterwave or Stripe to accept payments. Webhook
          endpoints are configured at /api/webhooks/paystack, /api/webhooks/flutterwave and /api/webhooks/stripe.
        </p>
      </CardContent>
    </Card>
  );
}

function PricingSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing rules</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-text">
          Pricing rules use a deterministic markup engine: selling price = landed
          cost + markup, with optional psychological pricing (.99 endings) and
          minimum margin enforcement.
        </p>
        <Button asChild>
          <a href="/dashboard/settings/store">Configure store pricing</a>
        </Button>
      </CardContent>
    </Card>
  );
}

function AutomationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Automation</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-text">
          Background jobs (product discovery, price sync, fulfillment, tracking)
          run via pg-boss on PostgreSQL as a separate persistent worker process.
        </p>
      </CardContent>
    </Card>
  );
}

function NotificationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-text">
          In-app notifications are stored and surfaced here. Email and WhatsApp
          preferences can be toggled per store.
        </p>
      </CardContent>
    </Card>
  );
}
