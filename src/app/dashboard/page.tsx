"use client";

import { useUser } from "@/contexts/UserContext";
import { DashboardOverview } from "@/components/dashboard/overview";

export default function DashboardPage() {
  const user = useUser();
  return <DashboardOverview storeId={null} user={user} />;
}
