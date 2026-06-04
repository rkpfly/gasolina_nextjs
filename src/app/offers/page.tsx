import { Metadata } from "next";
import { getPageMetadata, getSectionsForPage } from "@/lib/database/db"; 
import LeadForm from "@/components/LeadForm"; 
import OffersClient from "./OffersClient";

// 1. Generate Metadata dynamically from your SEO DB
export async function generateMetadata(): Promise<Metadata> {
  // Assuming 'offers' is the slug in your seo_pages table
  return await getPageMetadata("offers");
}

export default async function OffersPage() {
  // 2. Fetch layout sections from the database via your fixed map
  const sections = await getSectionsForPage("offers");
  
  const preOffersSection = sections.find((s) => s.section_id === "pre-offers-section");
  const postOffersSection = sections.find((s) => s.section_id === "post-offers-section");

  // 3. Fetch the initial lightweight offers server-side
  // Adjust this absolute URL based on your environment if needed
  let initialOffers = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/offers`, { 
      next: { revalidate: 60 } // Optional: caches the offers for 60s
    });
    if (res.ok) {
      initialOffers = await res.json();
      console.log("Fetched initial offers:", initialOffers);
    }
  } catch (error) {
    console.error("Failed to fetch initial offers:", error);
  }

  return (
    <main className="bg-brand-black min-h-screen mt-22 relative">

      {/* HEADER */}
      <section className="py-6 text-center border-b border-white/10">
        <h1 className="text-3xl font-display font-extrabold uppercase tracking-tighter text-brand-white">
          Offers
        </h1>
      </section>

      {/* PRE-OFFERS SECTION */}
      {preOffersSection && (
        <section className="py-12 px-4 sm:px-8 max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-brand-white mb-4">
            {preOffersSection.title}
          </h2>
          {preOffersSection.content && (
            <p className="text-brand-gray text-sm leading-relaxed">
              {preOffersSection.content}
            </p>
          )}
        </section>
      )}

      {/* INTERACTIVE OFFERS CAROUSEL */}
      <OffersClient initialOffers={initialOffers} />

      {/* POST-OFFERS SECTION */}
      {postOffersSection && (
        <section className="py-12 px-4 sm:px-8 max-w-4xl mx-auto text-center border-t border-white/10">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-brand-white mb-4">
            {postOffersSection.title}
          </h2>
          {postOffersSection.content && (
            <p className="text-brand-gray text-sm leading-relaxed">
              {postOffersSection.content}
            </p>
          )}
        </section>
      )}

      {/* CALL TO ACTION / FORM SECTION (Kept as a server component chunk) */}
      <section className="py-16 sm:py-24 lg:py-32 bg-brand-white px-4 sm:px-8 lg:px-12 relative overflow-hidden">
        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
          
          <div className="w-full lg:w-1/2 fade-up">
            <h2 className="text-3xl sm:text-5xl lg:text-7xl font-display font-extrabold uppercase tracking-tighter leading-[0.9] text-brand-black mb-4 sm:mb-6">
              Never Miss <br />
              <span className="text-outline text-transparent [-webkit-text-stroke:1px_#0A0A0A]">An Offer</span>
            </h2>
            <p className="text-[10px] sm:text-xs md:text-sm lg:text-base font-medium text-brand-gray mb-8 sm:mb-12 max-w-md leading-relaxed">
              Sign up for our exclusive VIP list. Be the first to know about private events, table discounts, and complimentary guestlist drops.
            </p>

            <div className="max-w-md">
              <LeadForm 
                fields={['f_name', 'l_name', 'email', 'phone', 'city']} 
                formType="offer_signup"
                buttonText="Join the List"
              />
            </div>
          </div>

          <div className="w-full lg:w-1/2 aspect-square lg:aspect-[4/5] rounded-xl md:rounded-2xl overflow-hidden relative fade-up">
              <img 
                src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop" 
                className="w-full h-full object-cover filter grayscale-[20%]"
                alt="VIP Experience"
              />
              <div className="absolute inset-0 bg-brand-black/20 mix-blend-multiply"></div>
          </div>
        </div>
      </section>

    </main>
  );
}