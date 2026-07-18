"use client";

import { AppTopbar } from "@/components/app-topbar";
import { TripsProvider } from "@/components/logistics/trips-provider";

type BoardShellProps = {
  user: {
    name?: string | null;
    image?: string | null;
    email?: string | null;
  };
  basePath?: "/home" | "/preview";
  banner?: React.ReactNode;
  children: React.ReactNode;
};

/** Shared trip state + top bar for Trips and Stats routes. */
export function BoardShell({
  user,
  basePath = "/home",
  banner,
  children,
}: BoardShellProps) {
  return (
    <TripsProvider>
      {banner}
      <AppTopbar user={user} basePath={basePath} />
      {children}
    </TripsProvider>
  );
}
