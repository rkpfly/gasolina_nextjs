"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { MediaAsset } from "@/lib/media"; 
import MediaSlot from "@/lib/media"; 
import LeadForm from "@/components/LeadForm";
import VIPForm from "@/components/Home/VipForm";
import FadeUp from "@/components/FadeUp"; // Import the FadeUp component

// Import your new reusable components
import { EventCard } from "@/components/Events/EventCard";
import VipModal from "@/components/Events/VIPModal"; 

export default function HomePage() {
  const [media, setMedia] = useState<Record<string, MediaAsset>>({});
  const [isLoading, setIsLoading] = useState(true);

  const [events, setEvents] = useState<any[]>([]);
  const [isEventsLoading, setIsEventsLoading] = useState(true);

  const discoRef = useRef<HTMLDivElement>(null);

  const [ticketModalEventId, setTicketModalEventId] = useState<string | null>(null);
  const [vipModal, setVipModal] = useState(false); 
  const [vipModalEvent, setVipModalEvent] = useState<any | null>(null); 

  // Form State
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setTicketModalEventId(null);
        setVipModalEvent(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (ticketModalEventId || vipModalEvent) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [ticketModalEventId, vipModalEvent]);

  // 1. Fetch Media from your GET Route
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const res = await fetch('/api/media?page=/home');
        if (res.ok) {
          const data = await res.json();
          setMedia(data);
        }
      } catch (error) {
        console.error("Failed to fetch media:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedia();
  }, []);

  // 2. Load animations (Removed IntersectionObserver, kept img-reveal timeout)
  useEffect(() => {
    if (isLoading) return; 

    const reveals = document.querySelectorAll(".img-reveal");
    const timer = setTimeout(() => {
      reveals.forEach((r) => r.classList.add("active"));
    }, 100);

    return () => clearTimeout(timer);
  }, [isLoading]); 

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/v1/events?limit=4');
        if (res.ok) {
          const data = await res.json();
          const eventsArray = Array.isArray(data) ? data : (data.events || data.data || []);
          setEvents(eventsArray);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setIsEventsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Helpers for EventCard
  const isEventActive = (event: any) => {
    if (event.basicInfo?.status !== "published") return false;
    if (event.basicInfo?.date && new Date(event.basicInfo.date) < new Date()) return false;
    return true;
  };

  const resolveImage = (event: any) => {
    const image = event.media?.coverImage || event.img;
    if (!image) return "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800&auto=format&fit=crop";
    return image.startsWith("http") ? image : `https://147.79.70.30.nip.io:8444/${image}`;
  };

  return (
    <>
      {/* ── Ticket Modal ── */}
      {ticketModalEventId && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Reserve Tickets"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm"
            onClick={() => setTicketModalEventId(null)}
          />

          {/* Modal Panel */}
          <div className="relative z-10 w-full max-w-3xl bg-brand-white rounded-2xl overflow-hidden shadow-2xl flex flex-col"
               style={{ height: "min(85vh, 720px)" }}>

            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-brand-border shrink-0">
              <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-brand-black">
                Reserve Tickets
              </span>
              <button
                onClick={() => setTicketModalEventId(null)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-brand-gray hover:text-brand-black hover:bg-brand-offwhite transition-colors"
                aria-label="Close modal"
              >
                <i className="fa-solid fa-xmark text-base" />
              </button>
            </div>

            {/* iFrame */}
            <div className="flex-1 relative bg-brand-offwhite">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-brand-gray">
                  <div className="w-8 h-8 border-2 border-brand-gray/30 border-t-brand-black rounded-full animate-spin" />
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Loading</span>
                </div>
              </div>
              <iframe
                src={`https://147.79.70.30.nip.io:8444/events/frame/detail/${ticketModalEventId}`}
                title="Reserve Tickets"
                className="relative z-10 w-full h-full border-0"
                allow="payment"
              />
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-6 py-3 border-t border-brand-border shrink-0 flex items-center gap-2">
              <i className="fa-solid fa-lock text-[10px] text-brand-gray" />
              <span className="text-[8px] sm:text-[10px] font-bold tracking-[0.15em] uppercase text-brand-gray">
                Secure checkout powered by Tixmojo
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Specific Event VIP Modal ── */}
      {vipModalEvent && (
        <VipModal
          event={vipModalEvent}
          onClose={() => setVipModalEvent(null)}
        />
      )}

      {/* Generic VIPForm */}
      <VIPForm vipModal={vipModal} setVipModal={setVipModal} />

      {/* ── Hero ── */}
      <section className="relative h-[100svh] w-full flex flex-col justify-end px-3 sm:px-4 md:px-6 lg:px-12 pb-6 sm:pb-8 md:pb-12 pt-20 sm:pt-24 md:pt-32">
        <div className="absolute inset-0 top-[88px] bottom-6 left-3 sm:left-4 md:left-6 right-3 sm:right-4 md:right-6 rounded-t-[1rem] sm:rounded-[2rem] overflow-hidden bg-brand-offwhite img-reveal -z-10">
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
              <span className='flex-grow'>Elevate</span><br />
              <span>Your</span><br />
              <span className="text-outline">Nightlife</span><br />
              <span className="text-gray-900">Experience.</span>
            </h1>
            <p className="text-[9px] sm:text-xs md:text-sm lg:text-base font-semibold tracking-[0.2em] uppercase text-brand-black/80">
              Curating Premium Bollywood Experiences Worldwide.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 w-full md:w-auto mt-3 md:mt-0 px-2 pb-2 md:pb-0">
            <button 
              onClick={() => setVipModal(true)}
              className="bg-white border-1 sm:border-1 sm:bg-transparent sm:border-0  px-4 sm:px-6 md:px-10 py-2 sm:py-3 md:py-4 rounded-lg sm:rounded-full text-[12px] sm:text-[9px] md:text-xs lg:text-sm font-bold tracking-[0.15em] uppercase w-full sm:w-auto text-center cursor-pointer"
            >
              <span className="">VIP Access</span>
            </button>
            <Link href="#events" className="btn-monumental px-4 sm:px-6 md:px-10 py-2 sm:py-3 md:py-4 rounded-lg sm:rounded-full text-[12px] sm:text-[9px] md:text-xs lg:text-sm font-bold tracking-[0.15em] uppercase w-full sm:w-auto text-center">
              <span>Reserve Tickets</span>
            </Link>
          </div>
        </FadeUp>
      </section>

      {/* ── Events ── */}
      <section id="events" className="pt-12 sm:pt-16 md:pt-24 pb-16 sm:pb-20 md:pb-32 px-3 sm:px-4 md:px-6 lg:px-12">
        <div className="max-w-[1600px] mx-auto">
          <FadeUp className="flex justify-between items-end mb-6 sm:mb-10 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-display font-bold tracking-tighter uppercase">
              Upcoming Events
            </h2>
          </FadeUp>

          <div className="flex flex-nowrap sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4 md:gap-6 lg:gap-x-6 lg:gap-y-12 border-t border-brand-border pt-2 sm:pt-8 md:pt-10 overflow-x-auto overflow-y-hidden snap-x snap-mandatory pb-6 px-6 sm:pb-0 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {isEventsLoading ? (
              <div className="col-span-full w-full text-center text-brand-gray font-bold tracking-[0.15em] uppercase text-xs sm:text-sm">
                Loading events...
              </div>
            ) : (
              events.map((event, index) => {
                const active = isEventActive(event);
                const imgSrc = resolveImage(event);

                return (
                  <div 
                    key={event._id || index}
                    className="w-[85vw] max-w-[350px] sm:max-w-none sm:w-auto shrink-0 sm:shrink snap-center flex flex-col"
                  >
                    <EventCard
                      event={event}
                      isActive={active}
                      imgSrc={imgSrc}
                      delay={`${index * 100}ms`}
                      onReserve={() => setTicketModalEventId(event._id)}
                      onBookVIP={() => setVipModalEvent(event)} 
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
      
      {/* ── Cinematic Highlights ── */}
      <section className="md:mt-12 py-12 sm:py-16 md:py-24 bg-brand-black text-white px-3 sm:px-4 md:px-6 lg:px-12 overflow-hidden">
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

      {/* ── Redefining Luxury ── */}
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

          {/* Note: Passed delay as a prop to FadeUp instead of inline styles */}
          <FadeUp delay={200} className="lg:col-span-6 lg:col-start-7 flex flex-col gap-6 sm:gap-8 md:gap-12">
            {[
              {
                heading: "The Phenomenon",
                body: "Step into the premier world of Bollywood Club—the ultimate destination for luxury Bollywood nightlife. We are more than a party destination; we are a cultural phenomenon bringing the vibrant heartbeat of South Asia to elite venues across Australia, New Zealand, and Singapore. Prepare to elevate your evening with an unparalleled fusion of sophisticated aesthetics, premium hospitality, and electrifying energy.",
              },
              {
                heading: "The Rhythm",
                body: "Every event at Bollywood Club is meticulously curated to transform the dance floor into a canvas of rhythm and culture. Our signature nights across major metropolitan hubs have achieved legendary status, seamlessly blending authentic Indian vibrancy with the high-octane atmosphere of elite global nightlife. Experience the rhythm as our resident and international guest DJs spin exclusive mixes, keeping the energy at its absolute peak until dawn.",
              },
            ].map((section) => (
              <div key={section.heading}>
                <h3 className="text-base sm:text-lg md:text-2xl lg:text-2xl font-display font-bold uppercase tracking-tighter mb-2 sm:mb-3 md:mb-4 border-b border-brand-border pb-2 sm:pb-3 md:pb-4">{section.heading}</h3>
                <p className="text-xs sm:text-sm md:text-base text-brand-gray leading-relaxed font-medium">{section.body}</p>
              </div>
            ))}
            <div>
              <h3 className="text-base sm:text-lg md:text-2xl font-display font-bold uppercase tracking-tighter mb-2 sm:mb-3 md:mb-4 border-b border-brand-border pb-2 sm:pb-3 md:pb-4">The Spectacle</h3>
              <p className="text-xs sm:text-sm md:text-base text-brand-gray leading-relaxed font-medium mb-3">Our distinction lies in the immersive experiences we craft. Beyond the music, Bollywood Club delivers a visual spectacle featuring captivating live performances, state-of-the-art production, and bespoke VIP services. It is an elevated sensory journey designed for the discerning individual.</p>
              <p className="text-xs sm:text-sm md:text-base text-brand-gray leading-relaxed font-medium">Join us at iconic global venues where the cinematic glamour of Bollywood meets the sophistication of premier entertainment destinations. Secure your access and become part of an exclusive community—your vibrant home away from home.</p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Join the Inner Circle (Subscribe) ── */}
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