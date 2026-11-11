"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Sun,
  Moon,
  Bell,
  HelpCircle,
  Layout,
} from "lucide-react";
import { cn } from "@/ui";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const THEME_KEY = "vendora-theme";
const isBrowser = typeof window !== "undefined";

export function Topbar({ user }: { user: { name?: string | null; email: string; role: string } }) {
  const [dark, setDark] = useState(() => {
    if (!isBrowser) return true;
    const stored = localStorage.getItem(THEME_KEY);
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return stored ? stored === "dark" : systemDark;
  });
  const pathname = usePathname();
  const router = useRouter();

  // Apply theme class on mount (browser only). Reading/writing the DOM here is
  // intentional for theme synchronisation and does not update React state.
  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) toast.success("Signed out.");
      else toast.error("Couldn't sign out cleanly — redirecting anyway.");
    } catch {
      toast.error("Network error — signing out locally.");
    }
    router.push("/login");
  };

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem(THEME_KEY, next ? "dark" : "light");
  };

  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Research", href: "/dashboard/research" },
    { name: "Suppliers", href: "/dashboard/suppliers" },
    { name: "Products", href: "/dashboard/products" },
    { name: "Orders", href: "/dashboard/orders" },
    { name: "Analytics", href: "/dashboard/analytics" },
  ];

  return (
    <div className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="flex items-center justify-between h-14 px-6">
        <div className="flex items-center gap-8">
          <button
            onClick={toggleTheme}
            className="p-1 text-muted-text hover:text-text transition-colors"
            aria-label="Toggle theme"
          >
            {dark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>

          <Sheet>
            <SheetTrigger asChild>
              <button className="hidden md:flex items-center gap-2 border border-input bg-card px-3 py-2 rounded-lg text-sm">
                <Layout className="h-4 w-4" />
                <span>Navigation</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[260px] p-0">
              <div className="pb-3">
                <SheetTitle>Navigate</SheetTitle>
                <SheetDescription>Jump to a section</SheetDescription>
              </div>
              <div className="p-3 space-y-1">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(link.href);
                    }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors block",
                      pathname === link.href ? "bg-brand text-brand-contrast" : "text-muted-text hover:bg-card",
                    )}
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          {isBrowser && (
            <HelpCircle className="md:block h-5 w-5 text-muted-text cursor-pointer hover:text-text" />
          )}
        </div>

        <div className="flex items-center gap-3">
          <button className="p-1 text-muted-text hover:text-text relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-brand"></span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-input bg-card text-sm font-medium hover:bg-card/80">
              <span className="hidden sm:inline">{user.name ?? user.email}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15V20c0 1.1-0.9 2-2 2H4c-1.1 0-2-0.9-2-2v-5"/><polyline points="7 10 12 13 17 10"/></svg>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push("/dashboard/settings/profile")}>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/dashboard/settings/security")}>Security</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-400" onClick={handleLogout}>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
