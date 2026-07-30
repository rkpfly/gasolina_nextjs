import { Metadata } from "next";
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
    <main className="bg-brand-black min-h-screen pt-24 sm:pt-32 md:pt-24 pb-16 px-4 sm:px-6 flex justify-center items-start">
      <div className="w-full max-w-4xl bg-brand-black border border-white/10 rounded-xl shadow-2xl overflow-hidden relative mt-8">
        <BirthdayOfferForm />
      </div>
    </main>
  );
}
