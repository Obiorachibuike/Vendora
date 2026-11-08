"use client";

import * as React from "react";

export interface UserContextType {
  user: { name?: string | null; email: string; role: string };
}

const UserContext = React.createContext<UserContextType | null>(null);

export function UserProvider({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name?: string | null; email: string; role: string };
}) {
  return <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = React.useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx.user;
}
