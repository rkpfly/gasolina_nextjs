import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import JsonRenderer from "@/components/JSONRenderer";
import { getOfferBySlug } from "@/lib/database/db"; 

// 1. Define the props type to expect a Promise for params (Next.js 15)
type Props = {
  params: Promise<{ slug: string }>;
};

// 2. Generate SEO Metadata dynamically
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Await the params before using them!
  const resolvedParams = await params;
  const offer = await getOfferBySlug(resolvedParams.slug);

  if (!offer) {
    return { title: "Offer Not Found" };
  }

  // Parse the SEO JSON (handles cases where it might be a string or object)
  const seoData = typeof offer.seo === 'string' ? JSON.parse(offer.seo) : (offer.seo || {});

  // Fallback to the offer title/description if SEO specific fields aren't set
  return {
    title: seoData.title || `${offer.offer_title} | Bollywood Club`,
    description: seoData.description || offer.short_description,
    openGraph: {
      title: seoData.title || offer.offer_title,
      description: seoData.description || offer.short_description,
      images: seoData.og_image ? [seoData.og_image] : [offer.thumbnail_url],
    },
    robots: seoData.noindex ? "noindex, nofollow" : "index, follow",
  };
}

// 3. Render the Page
export default async function SingleOfferPage({ params }: Props) {
  // Await the params here too!
  const resolvedParams = await params;
  const offer = await getOfferBySlug(resolvedParams.slug);

  if (!offer) {
    notFound();
  }

  return (
    <main className="bg-brand-black min-h-screen pt-24 sm:pt-32 md:pt-24 pb-16 px-4 sm:px-6 flex justify-center items-start">
      
      {/* Expanded max-width for side-by-side layout.
        Uses flex-col on mobile, flex-row on desktop.
      */}
      <div className="w-full max-w-5xl bg-brand-black border border-white/10 rounded-xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative animate-in zoom-in-95 duration-300 mt-8">
        
        {/* IMAGE SECTION 
          order-2 on mobile (bottom), order-1 on desktop (left)
        */}
        <div className="w-full md:w-5/12 relative order-2 md:order-1 min-h-[300px] sm:min-h-[400px] border-t md:border-t-0 md:border-r border-white/10 bg-brand-white/5">
          <img 
            src={offer.thumbnail_url} 
            alt={offer.offer_title}
            className="absolute inset-0 w-full h-full object-cover filter grayscale-[20%]"
          />
          {/* Subtle gradient overlay to blend with the dark theme */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-transparent to-brand-black/10 md:bg-gradient-to-r md:from-transparent md:to-brand-black/50"></div>
        </div>

        {/* CONTENT SECTION 
          order-1 on mobile (top), order-2 on desktop (right)
        */}
        <div className="w-full md:w-7/12 flex flex-col order-1 md:order-2">
          
          {/* Header Section */}
          <div className="bg-brand-black/90 backdrop-blur-md z-10 p-6 sm:p-8 border-b border-white/10 flex flex-col gap-4">
            <Link 
              href="/offers" 
              className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-white/40 hover:text-brand-white flex items-center gap-2 w-fit transition-colors"
            >
              &larr; Back to Offers
            </Link>

            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  {offer.category && (
                    <span className="text-[9px] font-bold tracking-widest uppercase text-brand-black bg-brand-white px-2.5 py-1 rounded-sm">
                      {offer.category}
                    </span>
                  )}
                  {offer.offer_type && (
                    <span className="text-[9px] font-bold tracking-widest uppercase text-brand-white/50 border border-white/20 px-2.5 py-1 rounded-sm">
                      {offer.offer_type}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-4xl font-display font-bold uppercase tracking-tighter text-brand-white leading-tight">
                  {offer.offer_title}
                </h1>
              </div>
            </div>
          </div>

          {/* Body Section (Allows internal scrolling on desktop if content is too long) */}
          <div className="p-6 sm:p-8 flex flex-col gap-8 max-h-[none] md:max-h-[70vh] overflow-y-auto">
            
            {/* Details */}
            <div>
              <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-white/40 mb-3 border-b border-white/10 pb-2">
                Details
              </h2>
              <JsonRenderer content={offer.description || offer.short_description} />
            </div>

            {/* Expiry & Promo Code Row */}
            <div className="flex flex-col sm:flex-row gap-8">
              <div className="flex-1">
                <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-white/40 mb-3 border-b border-white/10 pb-2">
                  Valid Until
                </h2>
                <p className="text-sm font-mono text-brand-white/80">
                  {new Date(offer.expiry_date)
                    .toISOString()
                    .replace('T', ' ')
                    .replace('.000Z', ' UTC')}
                </p>
              </div>

              {offer.offer_code && (
                <div className="flex-1">
                  <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-white/40 mb-3 border-b border-white/10 pb-2">
                    Promo Code
                  </h2>
                  <div className="inline-block border border-dashed border-white/30 bg-white/5 px-4 py-2 rounded-sm text-lg font-mono text-brand-white tracking-wider">
                    {offer.offer_code}
                  </div>
                </div>
              )}
            </div>

            {/* How to Redeem */}
            {offer.how_to_redeem && (
              <div>
                <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-white/40 mb-3 border-b border-white/10 pb-2">
                  How to Redeem
                </h2>
                <JsonRenderer content={offer.how_to_redeem} />
              </div>
            )}
            
            {/* Terms and Conditions */}
            {offer.terms_and_conditions && (
              <div>
                <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-white/40 mb-3 border-b border-white/10 pb-2">
                  Terms & Conditions
                </h2>
                <JsonRenderer content={offer.terms_and_conditions} />
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}