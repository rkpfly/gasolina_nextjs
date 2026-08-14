import type { Metadata } from "next";
import LeadForm from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Guestlist | Gasolina",
  description: "Join the Gasolina Saturday guestlist.",
};

export default function GuestlistPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-brand-black text-brand-white pt-16 md:pt-20">
      <section className="relative px-4 py-14 sm:px-6 sm:py-20 md:px-12 md:py-28">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -right-32 top-8 h-80 w-80 rounded-full bg-brand-blue/25 blur-[110px] md:h-[32rem] md:w-[32rem]" />
          <div className="absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-brand-accent/15 blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:48px_48px]" />
        </div>

        <div className="relative mx-auto w-full max-w-3xl">
          <div className="border border-white/10 bg-white/[0.035] p-5 shadow-2xl backdrop-blur-sm sm:p-8 md:p-12">
            <div className="mb-10 border-b border-white/10 pb-8">
              <h1 className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">Join the guestlist</h1>
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
              tone="dark"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
