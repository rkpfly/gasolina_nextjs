import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import HeaderWrapper from "@/components/HeaderWrapper"; // Note the new import
import IntroLoader from "@/components/IntroLoader";
import Footer from "../components/Footer";
import FooterGate from "@/components/FooterGate";
import { GoogleTagManager } from "@next/third-parties/google";

// GTM container id. Overridable via env; falls back to the marketing-provided id.
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "GTM-KSX32K55";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
});

// Montserrat — free geometric sans standing in for Gotham Bold (display/headings)
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-syne",
});

// Because this is a Server Component again, we can safely export metadata!
export const metadata: Metadata = {
  title: "Gasolina | Elevate Your Nightlife Experience",
  description: "Gasolina — premium Latin nightlife, VIP tables, and the loudest Saturdays.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <GoogleTagManager gtmId={GTM_ID} />
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body
        className={`${inter.variable} ${montserrat.variable} font-sans selection:bg-club-red selection:text-brand-white bg-white text-brand-black antialiased`}
      >
        {/* Google Tag Manager (noscript) — fallback for JS-disabled visitors.
            The <GoogleTagManager> above injects the JS; this covers no-JS. */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        {/* First-visit splash (once per session); route changes use app/loading.tsx */}
        <IntroLoader />

        {/* The Client Wrapper handles the logic of showing/hiding the header */}
        <HeaderWrapper />
        
        <main className="">{children}</main>
        
        {/* The Footer stays here, safely querying the DB on the server.
            FooterGate hides it on immersive routes (e.g. /registration). */}
        <FooterGate>
          <Footer />
        </FooterGate>
      </body>
    </html>
  );
}