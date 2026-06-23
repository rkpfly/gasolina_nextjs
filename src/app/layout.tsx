import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import HeaderWrapper from "@/components/HeaderWrapper"; // Note the new import
import Footer from "../components/Footer";
import FooterGate from "@/components/FooterGate";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-syne",
});

// Because this is a Server Component again, we can safely export metadata!
export const metadata: Metadata = {
  title: "Louder Club | Elevate Your Nightlife Experience",
  description: "Curating Premium Clubbing Experiences Worldwide.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body
        className={`${inter.variable} ${syne.variable} font-sans selection:bg-brand-blue selection:text-brand-white bg-white text-brand-black antialiased`}
      >
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