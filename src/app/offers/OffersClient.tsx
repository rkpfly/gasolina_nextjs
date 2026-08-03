"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Offer {
  id: string;
  slug: string; // <-- Ensure slug is in your interface
  offer_title: string;
  short_description: string;
  thumbnail_url: string;
  category: string;
  expiry_date: string;
  description?: any; 
  how_to_redeem?: any;
  terms_and_conditions?: any;
  offer_code?: string;
  offer_type?: string;
}

interface OffersClientProps {
  initialOffers: Offer[];
}

export default function OffersClient({ initialOffers }: OffersClientProps) {
  const [offers, setOffers] = useState<Offer[]>(initialOffers);
  const router = useRouter();

  // Scroll Animations
  useEffect(() => {
    if (offers.length === 0) return; 

    const fadeElements = document.querySelectorAll(".fade-up");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    
    fadeElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [offers]);

  // Navigate to the individual offer page
  const handleOfferClick = (offer: Offer) => {
    if (offer.slug) {
      router.push(`/offers/${offer.slug}`);
    } else {
      console.error("Offer does not have a slug");
    }
  };

  return (
    <section className="py-16 pb-0 sm:py-8 pl-4 sm:pl-8 md:pl-12 lg:pl-16 relative overflow-hidden">
      {offers.length === 0 ? (
        <div className="text-center py-20 pr-4 sm:pr-8 md:pr-12 lg:pr-16">
          <p className="text-brand-gray text-xs sm:text-sm tracking-widest uppercase font-bold">No active offers at the moment.</p>
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-6 sm:gap-8 pb-12 pr-4 sm:pr-8 md:pr-12 lg:pr-16 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {offers.map((offer, index) => (
            <div 
              key={offer.id} 
              onClick={() => handleOfferClick(offer)}
              className="snap-start shrink-0 w-[280px] sm:w-[320px] md:w-[400px] flex flex-col group fade-up cursor-pointer"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Image Card */}
              <div className="aspect-[4/5] w-full rounded-xl overflow-hidden relative mb-4 sm:mb-6 bg-brand-white/5">
                <img 
                  src={offer.thumbnail_url} 
                  alt={offer.offer_title}
                  className="absolute inset-0 w-full h-full object-cover filter grayscale-[40%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                />
                {offer.category && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-brand-black/80 backdrop-blur-sm text-brand-white text-[8px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-sm">
                      {offer.category}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-transparent to-transparent opacity-80"></div>
              </div>

              {/* Text Content */}
              <div className="pr-4">
                <h3 className="text-lg sm:text-xl md:text-2xl font-display font-bold uppercase tracking-tighter lining-nums proportional-nums text-brand-white mb-2 group-hover:text-transparent group-hover:[-webkit-text-stroke:1px_#FFFFFF] transition-colors duration-300">
                  {offer.offer_title}
                </h3>
                <p className="text-[10px] sm:text-xs text-brand-gray leading-relaxed font-medium mb-4 line-clamp-2">
                  {offer.short_description}
                </p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-brand-white/50 font-bold">
                    Expires: {new Date(offer.expiry_date).toLocaleDateString()}
                  </span>
                  <button className="text-[9px] font-bold tracking-widest uppercase text-brand-white hover:text-brand-gray transition-colors">
                    View Details &rarr;
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}