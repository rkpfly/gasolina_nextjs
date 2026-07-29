import { Metadata } from "next";
import HensOfferForm from "./HensOfferForm";

export const metadata: Metadata = {
  title: "Hens Offer | Louder.",
  description:
    "Celebrate her last night of freedom — hen + 4 complimentary entry for the bride and her crew. Upgrade to VIP booths for the ultimate hens night.",
  openGraph: {
    title: "Hens Night Made Memorable | Louder.",
    description:
      "Hen + 4 complimentary entry for the bride and her crew. Enquire about VIP booths for the ultimate hens night.",
  },
};

export default function HensOfferPage() {
  return (
    <main className="bg-brand-black min-h-screen pt-24 sm:pt-32 pb-16 px-4 sm:px-6 flex justify-center items-start">
      <div className="w-full max-w-4xl bg-brand-black border border-white/10 rounded-xl shadow-2xl overflow-hidden relative mt-8">
        <HensOfferForm />
      </div>
    </main>
  );
}
