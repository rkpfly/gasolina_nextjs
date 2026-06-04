"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MediaAsset } from "@/lib/media";
import MediaSlot from "@/lib/media"; // Kept your imports exactly as they were
import LeadForm from "@/components/LeadForm";

export default function BirthdayClient() {
  // 1. Media State
  const [media, setMedia] = useState<Record<string, MediaAsset>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Media
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const res = await fetch('/api/media?page=/birthday');
        if (res.ok) {
          const data = await res.json();
          setMedia(data);
          console.log("Fetched media:", data);
        }
      } catch (error) {
        console.error("Failed to fetch media:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedia();
  }, []);

  // Scroll Animations
  useEffect(() => {
    if (isLoading) return; 

    const reveals = document.querySelectorAll(".img-reveal");
    const timer = setTimeout(() => {
      reveals.forEach((r) => r.classList.add("active"));
    }, 100);

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
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [isLoading]);

  const features = [
      {
          id: "card-1",
          num: "01",
          title: "The VIP Experience",
          desc: "Lights, Camera, BOLLYWOOD – where every birthday is a blockbuster! Elevate your celebration. Skip the lines, dance in the VIP lounge, and enjoy top-shelf drinks.",
          delay: "0ms"
      },
      {
          id: "card-2",
          num: "02",
          title: "Hottest Beats & Glamour",
          desc: "Dance to the hottest Bollywood beats, sip on exotic cocktails, and capture the glamour with our professional in-house photographers to remember the night forever.",
          delay: "100ms"
      },
      {
          id: "card-3",
          num: "03",
          title: "Exclusive Offers",
          desc: "Book now for exclusive birthday offers and make your special day a true sensation! Limited slots available.",
          delay: "200ms"
      }
  ];

  return (
    <>
      {/* HERO SECTION */}
      <section className="relative w-full h-[85svh] min-h-[500px] sm:min-h-[600px] flex flex-col justify-center items-center text-center px-3 sm:px-4 md:px-8 pt-16 sm:pt-20 md:pt-24 overflow-hidden">
          {/* Dynamic Hero Media Rendering */}
          {media['hero-video']?.media_type === 'video' ? (
            <video 
              src={media['hero-video'].media_url} 
              className="absolute inset-0 w-full h-full object-cover opacity-40 filter grayscale-[30%]"
              autoPlay 
              loop 
              muted 
              playsInline
            />
          ) : (
            <img 
              src={media['hero-video']?.media_url || "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1600&auto=format&fit=crop"} 
              className="absolute inset-0 w-full h-full object-cover opacity-40 filter grayscale-[30%]" 
              alt={media['hero-video']?.alt_text || "Birthday Celebration"}
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-b from-brand-black/80 via-brand-black/60 to-brand-black"></div>
          
          <div className="relative z-10 fade-up max-w-4xl mx-auto px-3 sm:px-4 w-full flex flex-col items-center text-center">
            
            <span className="inline-block text-[9px] sm:text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-brand-black bg-brand-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-lg mb-4 sm:mb-6">
                Celebrate With Us
            </span>
            
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[7vw] leading-[1.1] md:leading-[1] font-display font-extrabold uppercase tracking-tighter text-brand-white mb-4 sm:mb-6 text-center w-max shrink-0">
                <span className="block md:inline md:mr-3 lg:mr-4">Your</span> <br />
                <span className="text-transparent [-webkit-text-stroke:1px_#FFFFFF] inline-block pb-1 md:pb-0">Birthday</span>
                <span className="text-2xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[7vw] block md:mt-2">Masterpiece</span>
            </h1>
            
            <p className="text-[10px] sm:text-xs md:text-base font-medium text-brand-white/80 max-w-xl mx-auto leading-relaxed mb-6 sm:mb-10 text-center">
                Transform your special day into a cinematic Bollywood experience. Premium VIP treatment, exclusive booths, and unforgettable memories.
            </p>
            
            <Link href="#inquire" className="btn-monumental px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-5 rounded-full text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-bold tracking-[0.15em] uppercase inline-block">
                <span>Plan Your Night</span>
            </Link>
          </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-16 sm:py-20 md:py-32 bg-brand-black px-3 sm:px-4 md:px-6 lg:px-12 border-t border-white/10">
          <div className="max-w-[1600px] mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12 lg:gap-16">
                  {features.map((feature) => (
                      <div key={feature.id} className="fade-up flex flex-col group" style={{ transitionDelay: feature.delay }}>
                          <span className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.3)] group-hover:[-webkit-text-stroke:1px_#FFFFFF] transition-all duration-300 mb-4 sm:mb-6 block">
                              {feature.num}
                          </span>
                          <h3 className="text-base sm:text-lg md:text-2xl font-display font-bold uppercase tracking-tighter text-brand-white mb-2 sm:mb-3 md:mb-4">
                              {feature.title}
                          </h3>
                          <p className="text-[9px] sm:text-xs md:text-sm text-brand-gray leading-relaxed font-medium">
                              {feature.desc}
                          </p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* CALL TO ACTION / FORM SECTION */}
      <section id="inquire" className="py-12 sm:py-16 md:py-24 lg:py-32 bg-brand-white px-3 sm:px-4 md:px-6 lg:px-12 relative overflow-hidden">
        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-8 sm:gap-12 md:gap-16 lg:gap-24 items-center">
          
          <div className="w-full lg:w-1/2 fade-up">
            <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-display font-extrabold uppercase tracking-tighter leading-[0.9] text-brand-black mb-3 sm:mb-4 md:mb-6">
              Let's Make It <br />
              <span className="text-outline text-transparent [-webkit-text-stroke:1px_#0A0A0A]">Happen</span>
            </h2>
            <p className="text-[9px] sm:text-xs md:text-sm lg:text-base font-medium text-brand-gray mb-6 sm:mb-8 md:mb-12 max-w-md leading-relaxed">
              Fill out the form below and our VIP concierge team will get back to you within 24 hours to plan your perfect celebration.
            </p>

            <LeadForm 
              formType="birthday_lead"
              fields={['f_name', 'l_name', 'email', 'phone', 'city']}
              buttonText="Request Reservation"
            />
          </div>

          <div className="w-full lg:w-1/2 aspect-square lg:aspect-[4/5] rounded-xl md:rounded-2xl overflow-hidden relative img-reveal img-wrapper">
            {/* Dynamic Form Media Rendering */}
            {media['form-media']?.media_type === 'video' ? (
              <video 
                src={media['form-media'].media_url} 
                className="w-full h-full object-cover filter grayscale-[20%]"
                autoPlay 
                loop 
                muted 
                playsInline
              />
            ) : (
              <img 
                src={media['form-media']?.media_url || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop"} 
                className="w-full h-full object-cover filter grayscale-[20%]"
                alt={media['form-media']?.alt_text || "VIP Experience"}
              />
            )}
          </div>

        </div>
      </section>

    </>
  );
}