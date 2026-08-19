import type { Metadata } from "next";
import LeadForm from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Guestlist | Gasolina",
  description: "Join the Gasolina Saturday guestlist.",
};

export default function GuestlistPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fffaf5] pt-16 text-brand-black md:pt-20">
      <section className="relative px-4 py-12 sm:px-6 sm:py-16 md:px-12 md:py-24">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-blue/15 blur-3xl sm:h-[28rem] sm:w-[28rem]" />
          <div className="absolute -left-32 top-1/3 h-80 w-80 rounded-full bg-brand-accent/15 blur-3xl" />
          <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-brand-lime/20 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.055] [background-image:radial-gradient(#0a0a0a_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>

        <div className="relative mx-auto w-full max-w-4xl">
          <div className="relative border border-brand-black/10 bg-white/95 p-5 shadow-[10px_10px_0_0_#723CF4] backdrop-blur-sm sm:p-8 sm:shadow-[14px_14px_0_0_#723CF4] md:p-12">
            <div className="relative mb-10 overflow-hidden border-2 border-brand-black bg-gradient-to-br from-brand-coral to-[#ff3b1f] px-4 py-6 text-center shadow-[6px_6px_0_0_#0a0a0a] sm:px-8 sm:py-8 sm:shadow-[8px_8px_0_0_#0a0a0a]">
              <div
                className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full border-[18px] border-white/25"
                aria-hidden="true"
              />
              <p className="relative mb-2 text-[10px] font-extrabold uppercase tracking-[0.24em] text-brand-black/70 sm:text-xs">
                Guestlist perk
              </p>
              <p className="relative font-display text-3xl font-black uppercase leading-none tracking-tight sm:text-5xl md:text-6xl">
                Free Entry{" "}
                <span className="inline-block whitespace-nowrap bg-brand-black px-2 py-1 text-brand-white">
                  Before 11 PM
                </span>
              </p>
              <p className="relative mt-3 text-xs font-bold uppercase tracking-[0.1em] sm:mt-4 sm:text-sm">
                Discounted entry after 11 PM on guestlist
              </p>
            </div>
            <div className="mb-10 border-b border-brand-black/10 pb-6 sm:pb-8">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-accent sm:text-xs">Save your spot</p>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight sm:text-3xl">Join the guestlist</h2>
            </div>

            <LeadForm
              formType="guestlist_request"
              fields={[
                "full_name",
                "email",
                "phone",
                "booking_date",
                "guest_names",
                "total_guests",
                "additional_info",
                "vip",
                "newsletter_consent",
              ]}
              buttonText="Join Guestlist"
              tone="light"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
