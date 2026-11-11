"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/ui";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const NAV = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
  { name: "Product Research", href: "/dashboard/research", icon: SearchIcon },
  { name: "Supplier Discovery", href: "/dashboard/suppliers", icon: PackageIcon },
  {
    name: "Supplier Comparison",
    href: "/dashboard/suppliers/compare",
    icon: ShieldAlertIcon,
  },
  {
    name: "Supplier Integrations",
    href: "/dashboard/suppliers/connections",
    icon: SettingsIcon,
  },
  { name: "My Products", href: "/dashboard/products", icon: PackageIcon },
  { name: "My Stores", href: "/dashboard/stores", icon: StoreIcon },
  { name: "Orders", href: "/dashboard/orders", icon: ShoppingBagIcon },
  { name: "Fulfillment", href: "/dashboard/fulfillment", icon: TruckIcon },
  { name: "Customers", href: "/dashboard/customers", icon: UsersIcon },
  { name: "Marketing", href: "/dashboard/marketing", icon: MailIcon },
  { name: "AI Assistant", href: "/dashboard/ai", icon: BotIcon },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3Icon },
] as const;

const SETTINGS_NAV = [
  { name: "Profile", href: "/dashboard/settings/profile", icon: MailIcon },
  { name: "Store Settings", href: "/dashboard/settings/store", icon: StoreIcon },
  { name: "Supplier Connections", href: "/dashboard/settings/suppliers", icon: SettingsIcon },
  { name: "Payment Settings", href: "/dashboard/settings/payments", icon: ShoppingBagIcon },
  { name: "Pricing Rules", href: "/dashboard/settings/pricing", icon: BarChart3Icon },
  { name: "Automation", href: "/dashboard/settings/automation", icon: BotIcon },
  { name: "Notifications", href: "/dashboard/settings/notifications", icon: BellIcon },
  { name: "Billing", href: "/dashboard/settings/billing", icon: ShoppingBagIcon },
  { name: "Security", href: "/dashboard/settings/security", icon: ShieldAlertIcon },
] as const;

interface IconProps {
  className?: string;
}

function LayoutDashboardIcon({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="3"/></svg>
  );
}
function SearchIcon({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
  );
}
function PackageIcon({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 6v11.5a1 1 0 0 1-1 1H10v-6a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1z"/><path d="M8.5 11h7"/><path d="M12 14v7"/><path d="M19.5 6.5L12 2L4.5 6.5"/><path d="M12 2v20"/></svg>
  );
}
function ShieldAlertIcon({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="8" r="1"/></svg>
  );
}
function SettingsIcon({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82-.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
  );
}
function StoreIcon({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="3 15 12 4 21 15"/></svg>
  );
}
function ShoppingBagIcon({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M16 21V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v16"/></svg>
  );
}
function TruckIcon({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="17" width="15" height="5" rx="1" ry="1"/><path d="M7 21V9a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v12"/><circle cx="5.5" cy="18.5" r="1.5"/><circle cx="18.5" cy="18.5" r="1.5"/></svg>
  );
}
function UsersIcon({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  );
}
function MailIcon({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>
  );
}
function BotIcon({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="12" x="4" y="6" rx="2" ry="2"/><path d="M10 10v3M14 10v3"/><line x1="9" y1="17" x2="15" y2="17"/><path d="M7 18v-1a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1"/></svg>
  );
}
function BarChart3Icon({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
  );
}
function BellIcon({ className }: IconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
  );
}

interface SidebarProps {
  user: { name?: string | null; email: string; role: string };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) toast.success("Signed out.");
      else toast.error("Couldn't sign out cleanly — redirecting anyway.");
    } catch {
      toast.error("Network error — signing out locally.");
    }
    window.location.href = "/login";
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 border-r border-border bg-secondary-bg text-text flex flex-col z-40">
      <div className="flex items-center justify-between h-16 px-6 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-brand flex items-center justify-center text-brand-contrast font-bold text-lg">V</div>
          <span className="font-bold text-xl tracking-tight">Vendora<span className="text-brand">AI</span></span>
        </Link>
        <button className="lg:hidden p-1 text-muted-text" onClick={() => setOpen(!open)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <nav className="space-y-0.5">
          {NAV.map((item) => {
            const Active = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.name} href={item.href} className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive ? "bg-brand text-brand-contrast" : "text-muted-text hover:bg-card",
              )}>
                <span className="h-5 w-5"><Active /></span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="my-3 h-px bg-border"></div>

        <h6 className="px-3 text-xs font-semibold text-muted-text uppercase tracking-wider">Settings</h6>
        <nav className="space-y-0.5">
          {SETTINGS_NAV.map((item) => {
            const Active = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive ? "bg-brand text-brand-contrast" : "text-muted-text hover:bg-card",
              )}>
                <span className="h-5 w-5"><Active /></span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-border">
        <div className="px-3 pb-2">
          <p className="text-sm font-medium text-text">{user.name ?? "Store Owner"}</p>
          <p className="text-xs text-muted-text truncate max-w-[140px]">{user.email}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-left"
          onClick={handleLogout}
        >
          Log out
        </Button>
      </div>
    </aside>
  );
}
