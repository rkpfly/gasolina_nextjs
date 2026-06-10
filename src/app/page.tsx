"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MediaAsset } from "@/lib/media"; 
import MediaSlot from "@/lib/media"; 
import LeadForm from "@/components/LeadForm";
import VIPForm from "@/components/Home/VipForm";
import FadeUp from "@/components/FadeUp"; 
import VipModal from "@/components/Events/VIPModal"; 

// Import the Server Action
import { fetchActiveThemes } from "@/app/actions/themes";

// Define a type for your theme data
interface Theme {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  hero_image: string;
  thumbnail_url?: string;
}

export default function HomePage() {
  const router = useRouter();

  const [media, setMedia] = useState<Record<string, MediaAsset>>({});
  // Add state for themes
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [vipModal, setVipModal] = useState(false); 
  const [vipModalEvent, setVipModalEvent] = useState<any | null>(null); 
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setVipModalEvent(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Lock body scroll when VIP modal is open
  useEffect(() => {
    if (vipModalEvent) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [vipModalEvent]);

  // Fetch Media AND Themes simultaneously
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Run both fetches in parallel for better performance
        const [mediaRes, themesData] = await Promise.all([
          fetch('/api/media?page=/home'),
          fetchActiveThemes()
        ]);

        if (mediaRes.ok) {
          const mediaData = await mediaRes.json();
          setMedia(mediaData);
        }
        
        setThemes(themesData);
      } catch (error) {
        console.error("Failed to fetch page data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Load animations 
  useEffect(() => {
    if (isLoading) return; 

    const reveals = document.querySelectorAll(".img-reveal");
    const timer = setTimeout(() => {
      reveals.forEach((r) => r.classList.add("active"));
    }, 100);

    return () => clearTimeout(timer);
  }, [isLoading]); 

  return (
    <>
      {vipModalEvent && (
        <VipModal
          event={vipModalEvent}
          onClose={() => setVipModalEvent(null)}
        />
      )}

      <VIPForm vipModal={vipModal} setVipModal={setVipModal} />

      {/* ── Hero ── */}
      <section className="relative h-[88svh] w-full flex flex-col justify-end px-3 sm:px-4 md:px-6 lg:px-12 pb-6 sm:pb-8 md:pb-12 pt-20 sm:pt-24 md:pt-36">
        <div className="absolute inset-0 top-[60px] md:top-[108px] bottom-6 left-3 sm:left-4 md:left-6 right-3 sm:right-4 md:right-6 rounded-t-[1rem] sm:rounded-[2rem] overflow-hidden bg-brand-offwhite img-reveal -z-10">
          <MediaSlot 
            id="hero-video" 
            mediaMap={media} 
            className="w-full h-full object-cover opacity-100 mix-blend-multiply"
            autoPlayVideo={true} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-black/20 to-black/30" />
        </div>

        <FadeUp className="relative z-10 w-full max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-end gap-4 sm:gap-6 md:gap-10">
          <div className="pl-4 max-w-3xl w-full">
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl xl:text-[6vw] 
            font-display font-extrabold tracking-tighter 
            leading-[1.15] sm:leading-[1.05] lg:leading-[0.9] 
            text-brand-white uppercase mb-2 sm:mb-3 md:mb-4 lg:mb-6">
              <span className='flex-grow'>Redefine</span><br />
              <span>The</span><br />
              <span className="text-outline">Ultimate</span><br />
              <span className="text-gray-900">Celebration.</span>
            </h1>
            <p className="text-[9px] sm:text-xs md:text-sm lg:text-base font-semibold tracking-[0.2em] uppercase text-brand-black/80">
              Crafting Global Bollywood Nightlife for the Elite.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 w-full md:w-auto mt-3 md:mt-0 px-2 pb-2 md:pb-0">
            <button 
              onClick={() => setVipModal(true)}
              className="bg-white border-1 sm:border-1 sm:bg-transparent sm:border-0  px-4 sm:px-6 md:px-10 py-2 sm:py-3 md:py-4 rounded-lg sm:rounded-full text-[12px] sm:text-[9px] md:text-xs lg:text-sm font-bold tracking-[0.15em] uppercase w-full sm:w-auto text-center cursor-pointer"
            >
              <span className="">Reserve VIP</span>
            </button>
            <Link href="#themes" className="btn-monumental px-4 sm:px-6 md:px-10 py-2 sm:py-3 md:py-4 rounded-lg sm:rounded-full text-[12px] sm:text-[9px] md:text-xs lg:text-sm font-bold tracking-[0.15em] uppercase w-full sm:w-auto text-center">
              <span>Discover Themes</span>
            </Link>
          </div>
        </FadeUp>
      </section>

      {/* ── Signature Themes (Single Full-Width) ── */}
      <section id="themes" className="w-full bg-brand-black">
        {themes.length === 0 && !isLoading ? (
          <div className="w-full py-24 flex items-center justify-center text-white">
            <p className="tracking-widest uppercase text-sm font-bold opacity-50">No themes currently active.</p>
          </div>
        ) : themes.length > 0 && (
          <FadeUp className="w-full">
            <div className="group relative w-full h-[60vh] md:h-[75vh] lg:h-[85vh] flex flex-col justify-end overflow-hidden cursor-pointer border-y border-white/5">
              
              {/* Background Image with slow, cinematic zoom */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[2s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
                style={{ backgroundImage: `url(${themes[0].hero_image})` }}
              />
              
              {/* Layered Overlays for depth and text legibility */}
              <div className="absolute inset-0 bg-brand-black/40 group-hover:bg-brand-black/20 transition-colors duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/60 md:via-brand-black/40 to-transparent opacity-90" />
              
              {/* Content Container */}
              <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 pb-12 md:pb-24 flex flex-col items-start text-left">
                
                {/* Micro-interaction: Text slides slightly right on hover */}
                <div className="transform transition-transform duration-1000 ease-out group-hover:translate-x-2 md:group-hover:translate-x-4">
                  <p className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-brand-accent mb-4 md:mb-6">
                    Featured Experience
                  </p>
                  
                  <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-[7vw] font-display font-extrabold tracking-tighter leading-[0.9] uppercase text-white mb-4 sm:mb-6">
                    {themes[0].title}
                  </h2>
                  
                  <p className="text-sm md:text-base lg:text-lg font-medium text-white/80 max-w-2xl mb-8 md:mb-12 line-clamp-3">
                    {themes[0].short_description}
                  </p>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <Link 
                      href="/book" 
                      className="bg-white text-brand-black px-6 md:px-12 py-3 md:py-4 rounded-full text-xs md:text-sm font-bold tracking-[0.15em] uppercase w-full sm:w-auto text-center hover:bg-white/90 transition-colors"
                    >
                      Book Tickets
                    </Link>
                    
                    <button 
                      onClick={(e) => {
                        e.preventDefault(); // Prevent Link wrapper from hijacking if they click the button
                        setVipModal(true);
                      }}
                      className="bg-transparent border border-white text-white px-6 md:px-12 py-3 md:py-4 rounded-full text-xs md:text-sm font-bold tracking-[0.15em] uppercase w-full sm:w-auto text-center hover:bg-white/10 transition-colors"
                    >
                      Request VIP
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </FadeUp>
        )}
      </section>
      
      {/* ── Remaining Sections (Cinematic, Luxury, Subscribe) Remain Identical ── */}
      <section className="py-12 sm:py-16 md:py-24 bg-brand-black text-white px-3 sm:px-4 md:px-6 lg:px-12 overflow-hidden">
        <FadeUp className="max-w-[1600px] mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold tracking-tighter uppercase mb-6 sm:mb-8 md:mb-12">
            Cinematic Highlights
          </h2>
        </FadeUp>
        
        <FadeUp className="max-w-[1600px] mx-auto flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory hide-scroll">
          {['cinematic-1', 'cinematic-2'].map((id) => (
            <div key={id} className="snap-center shrink-0 w-[calc(90vw-1.5rem)] sm:w-[calc(90vw-2rem)] md:w-[60vw] lg:w-[45vw] aspect-video relative group cursor-pointer overflow-hidden bg-brand-offwhite/10 rounded-lg">
              <MediaSlot id={id} mediaMap={media} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 pointer-events-none" />
            </div>
          ))}
        </FadeUp>
      </section>

      <section className="py-12 sm:py-16 md:py-32 bg-brand-white px-3 sm:px-4 md:px-6 lg:px-12 border-b border-brand-border">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 md:gap-10 lg:gap-8">
          <FadeUp className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-display font-extrabold tracking-tighter uppercase leading-[0.9] text-brand-black mb-2 sm:mb-3 md:mb-4 lg:mb-6">
                Redefining<br />
                <span className="text-outline">Luxury</span>
              </h2>
              <p className="text-[8px] sm:text-[9px] md:text-sm lg:text-base font-bold tracking-[0.2em] uppercase text-brand-gray mb-6 sm:mb-8 md:mb-10">
                The definitive Southeast Asian experience, reimagined globally.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={200} className="lg:col-span-6 lg:col-start-7 flex flex-col gap-6 sm:gap-8 md:gap-12">
             <div>
              <h3 className="text-base sm:text-lg md:text-2xl lg:text-2xl font-display font-bold uppercase tracking-tighter mb-2 sm:mb-3 md:mb-4 border-b border-brand-border pb-2 sm:pb-3 md:pb-4">The Phenomenon</h3>
              <p className="text-xs sm:text-sm md:text-base text-brand-gray leading-relaxed font-medium">Step into the premier world of Bollywood Club—the ultimate destination for luxury Bollywood nightlife...</p>
            </div>
          </FadeUp>
        </div>
      </section>

      <section className="py-0 flex flex-col lg:flex-row bg-brand-white border-b border-brand-border">
        <div className="w-full lg:w-1/2 aspect-square lg:aspect-auto relative img-reveal">
          <img
            src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop"
            className="w-full h-full object-cover filter grayscale-[20%]"
            alt="Subscribe"
          />
        </div>
        
        <FadeUp className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-12 lg:p-24">
          <div className="w-full max-w-md">
            <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-display font-bold tracking-tighter uppercase text-brand-black mb-2 sm:mb-3 md:mb-4">
              Join the Inner Circle
            </h2>
            <p className="text-brand-gray font-medium text-[9px] sm:text-xs md:text-sm mb-6 sm:mb-8 md:mb-12">
              Receive priority access to ticket drops, exclusive VIP offers, and secret venue reveals delivered directly to your inbox.
            </p>

            {formStatus === 'success' ? (
              <div className="bg-brand-black text-white p-4 sm:p-6 md:p-8 text-center rounded-xl animate-in fade-in zoom-in duration-500">
                <h3 className="text-lg sm:text-xl md:text-2xl font-display font-bold tracking-tighter uppercase mb-1 sm:mb-2">Welcome to the Club</h3>
                <p className="text-[8px] sm:text-xs md:text-sm tracking-[0.1em] uppercase text-brand-gray">We'll be in touch soon.</p>
              </div>
            ) : (
              <LeadForm
                formType="home_newsletter" 
                fields={['f_name', 'l_name', 'email', 'phone', 'city']} 
                buttonText="Subscribe" 
              />
            )}
          </div>
        </FadeUp>
      </section>
    </>
  );
}