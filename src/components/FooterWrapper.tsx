"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function FooterWrapper() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  // If we are on an admin page, don't render the footer at all
  if (isAdmin) return null;
    
  // Otherwise, render the normal Footer
  return <Footer />;
}