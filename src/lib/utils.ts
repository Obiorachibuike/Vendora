import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatMoney(
  amount: number | null | undefined,
  currency = "NGN",
): string {
  if (amount == null) return "-";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null) return "-";
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
