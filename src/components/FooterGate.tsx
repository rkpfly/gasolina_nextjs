"use client";

import { usePathname } from "next/navigation";

/**
 * Hides the public footer on immersive routes (mirrors HeaderWrapper).
 * The Footer is an async server component, so it's rendered on the server and
 * passed in as children — this client gate just decides whether to show it.
 */
export default function FooterGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isRegistration = pathname.startsWith("/registration");

  if (isRegistration) return null;

  return <>{children}</>;
}
