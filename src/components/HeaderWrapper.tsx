"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function HeaderWrapper() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isCheckin = pathname.startsWith("/checkin");
  const isRegistration = pathname.startsWith("/registration");

  // Admin, the kiosk check-in flow, and the immersive registration page render
  // without the public header.
  if (isAdmin || isCheckin || isRegistration) return null;

  // Otherwise, render the normal Header
  return <Header />;
}