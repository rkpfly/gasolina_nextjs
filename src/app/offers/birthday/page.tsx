import { Metadata } from "next";
import Link from "next/link";
import HtmlFlyer from "@/components/HtmlFlyer";
import BirthdayOfferForm from "./BirthdayOfferForm";

export const metadata: Metadata = {
  title: "Birthday Offer | Louder.",
  description:
    "Birthdays made memorable — entry for you + 4 friends, complimentary. Upgrade to VIP booths for the ultimate experience.",
  openGraph: {
    title: "Birthdays Made Memorable | Louder.",
    description:
      "Celebrate in style — entry for you + 4 friends, complimentary. Upgrade to VIP booths for the ultimate experience.",
  },
};

export default function BirthdayOfferPage() {
  return (
    <main className="bg-brand-black min-h-screen pt-24 sm:pt-32 pb-16 px-4 sm:px-6 flex justify-center items-start">
      <div className="w-full max-w-5xl bg-brand-black border border-white/10 rounded-xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative mt-8">

        {/* FLYER */}
        <div className="w-full md:w-5/12 relative order-2 md:order-1 border-t md:border-t-0 md:border-r border-white/10 bg-[#0b0b10] flex items-center">
          {/* The flyer document is A4 at 96dpi: ~794 x 1123px */}
          <HtmlFlyer
            src="/offers/birthday-flyer.html"
            baseWidth={794}
            baseHeight={1123}
            title="Birthday offer — entry for you + 4 friends complimentary"
          />
        </div>

        {/* CONTENT + FORM */}
        <div className="w-full md:w-7/12 flex flex-col order-1 md:order-2">

          {/* Header */}
          <div className="bg-brand-black/90 backdrop-blur-md z-10 p-6 sm:p-8 border-b border-white/10 flex flex-col gap-4">
            <Link
              href="/offers"
              className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-white/40 hover:text-brand-white flex items-center gap-2 w-fit transition-colors"
            >
              &larr; Back to Offers
            </Link>

            <div>
              <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-brand-white/50 mb-3">
                Celebrate In Style
              </p>
              <h1 className="text-2xl sm:text-4xl font-display font-bold uppercase tracking-tighter text-brand-white leading-tight">
                Birthdays Made Memorable
              </h1>
              <p className="text-[10px] sm:text-xs text-brand-gray leading-relaxed font-medium mt-3 max-w-md">
                <span className="text-brand-white font-bold">Entry for you + 4 friends, complimentary</span> — and
                upgrade to VIP booths for the ultimate experience. Fill in your details below and
                we&apos;ll take care of the rest.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8">
            <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-white/40 mb-6 border-b border-white/10 pb-2">
              Claim Your Pass
            </h2>
            <BirthdayOfferForm />
          </div>
        </div>
      </div>
    </main>
  );
}
