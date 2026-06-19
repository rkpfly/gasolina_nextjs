import { Metadata } from "next";
import Link from "next/link";
import HensOfferForm from "./HensOfferForm";

export const metadata: Metadata = {
  title: "Hens Offer | Bollywood Club",
  description:
    "Celebrate her last night of freedom — free 1 + 2 entry for the bride and her girls. Upgrade to VIP booths for the ultimate hens night.",
  openGraph: {
    title: "Hens Night Made Memorable | Bollywood Club",
    description:
      "Free 1 + 2 entry for the bride and her girls. Enquire about VIP booths for the ultimate hens night.",
  },
};

export default function HensOfferPage() {
  return (
    <main className="bg-brand-black min-h-screen pt-24 sm:pt-32 pb-16 px-4 sm:px-6 flex justify-center items-start">
      <div className="w-full max-w-5xl bg-brand-black border border-white/10 rounded-xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative mt-8">

        {/* FLYER */}
        <div className="w-full md:w-5/12 relative order-2 md:order-1 border-t md:border-t-0 md:border-r border-white/10 bg-[#0b0b10] flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/offers/hens-dami.png"
            alt="Hens offer — free 1 + 2 entry"
            className="w-full h-auto object-contain"
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
                Her Last Night Of Freedom
              </p>
              <h1 className="text-2xl sm:text-4xl font-display font-bold uppercase tracking-tighter text-brand-white leading-tight">
                Hens Night Made Memorable
              </h1>
              <p className="text-[10px] sm:text-xs text-brand-gray leading-relaxed font-medium mt-3 max-w-md">
                The bride and her girls get <span className="text-brand-white font-bold">free 1 + 2 entry</span>{" "}
                <span className="text-brand-white/60">(females only)</span> — and you can enquire about a
                VIP booth for the ultimate hens night. Fill in your details below and we&apos;ll take care
                of the rest.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8">
            <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-white/40 mb-6 border-b border-white/10 pb-2">
              Claim Your Free Entry
            </h2>
            <HensOfferForm />
          </div>
        </div>
      </div>
    </main>
  );
}
