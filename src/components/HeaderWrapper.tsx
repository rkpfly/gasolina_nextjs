"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function HeaderWrapper() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isCheckin = pathname.startsWith("/checkin");

  // Admin and the kiosk check-in flow render without the public header.
  if (isAdmin || isCheckin) return null;

  // Otherwise, render the normal Header
  return <Header />;
}