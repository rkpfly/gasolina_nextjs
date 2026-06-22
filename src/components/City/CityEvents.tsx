"use client";

import { useEffect, useState } from "react";
import { EventCard } from "@/components/Events/EventCard";
import VipModal from "@/components/Events/VIPModal";
import { EqLoader } from "@/components/Loader";

// Updated to match your exact API response structure
interface EventData {
  _id: string;
  basicInfo: {
    name: string;
    date: string;
    status: string;
    city?: string;
    location?: string;
    venue?: string;
  };
  location: {
    type: string;
    customVenue?: {
      address: string;
      country: string;
    };
  };
  media: {
    coverImage: string;
    thumbnailImage?: string;
  };
  badge?: string; 
}

export default function CityEvents({ cityName }: { cityName: string }) {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Modal States
  const [ticketModalEventId, setTicketModalEventId] = useState<string | null>(null);
  const [vipModalEvent, setVipModalEvent] = useState<EventData | null>(null);

  // Helper: Check if event is published and in the future
  const isEventActive = (event: EventData) => {
    if (event.basicInfo?.status !== "published") return false;
    if (event.basicInfo?.date && new Date(event.basicInfo.date) < new Date()) return false;
    return true;
  };

  // Helper: Grab the cover image safely
  const resolveImage = (event: EventData) => {
    const img = event.media?.coverImage;
    if (!img) return "https://via.placeholder.com/400x500?text=Event";
    return img.startsWith("http") ? img : `https://147.79.70.30.nip.io:8444/${img}`;
  };

  // Prevent background scrolling when either modal is open
  useEffect(() => {
    if (ticketModalEventId || vipModalEvent) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [ticketModalEventId, vipModalEvent]);

  useEffect(() => {
    async function fetchCityEvents() {
      try {
        const params = new URLSearchParams({
          location: cityName,
          upcoming: 'true',
          sortBy: 'basicInfo.date',
          limit: '8'
        });

        const res = await fetch(`/api/v1/events?${params.toString()}`);
        
        if (!res.ok) throw new Error("Failed to fetch events");
        
        const responseData = await res.json();
        const eventArray = responseData.data || [];
        
        setEvents(eventArray);
      } catch (err) {
        console.error("Error fetching city events:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchCityEvents();
  }, [cityName]);

  if (loading) return <div className="py-12 flex items-center justify-center gap-2 text-brand-gray tracking-widest uppercase text-sm font-bold"><EqLoader tone="black" bars={4} /> Loading Events...</div>;
  if (error) return null; 
  if (events.length === 0) return null; 

  return (
    <div className="w-full mt-24">

      {/* ─── TICKET IFRAME MODAL ─── */}
      {ticketModalEventId && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col overflow-hidden relative animate-[fade-in-up_0.3s_ease-out_forwards]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white relative z-20">
              <h3 className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-brand-black">
                Complete Reservation
              </h3>
              <button 
                onClick={() => setTicketModalEventId(null)} 
                className="text-gray-400 hover:text-black transition-colors p-1"
                aria-label="Close modal"
              >
                <i className="fa-solid fa-xmark text-lg" />
              </button>
            </div>

            {/* iFrame Content */}
            <div className="flex-1 relative bg-brand-offwhite">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-brand-gray">
                  <EqLoader tone="black" bars={4} />
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
            <div className="px-6 py-3 border-t border-brand-border shrink-0 flex items-center gap-2 bg-white">
              <i className="fa-solid fa-lock text-[10px] text-brand-gray" />
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-brand-gray">
                Secure checkout powered by Tixmojo
              </span>
            </div>

          </div>
        </div>
      )}

      {/* ─── VIP BOOKING MODAL ─── */}
      {vipModalEvent && (
        <VipModal
          event={vipModalEvent}
          onClose={() => setVipModalEvent(null)}
        />
      )}

      {/* ─── HEADER SECTION ─── */}
      <div className="flex flex-col items-center mb-12 fade-up">
        <h2 className="text-3xl md:text-5xl font-extrabold text-brand-black uppercase tracking-tight text-center">
          Upcoming in {cityName}
        </h2>
        <div className="w-12 h-1 bg-brand-accent mt-4" />
      </div>

      {/* ─── EVENTS GRID ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
        {events.map((event, i) => {
          const active = isEventActive(event);
          const imgSrc = resolveImage(event);
          
          const animationDelays = ["0ms", "100ms", "200ms", "300ms"];
          const delay = animationDelays[i % animationDelays.length];

          // Use 'as any' to bypass strict TS checking if EventCard expects a slightly different Event type
          return (
            <EventCard
              key={event._id}
              event={event as any}
              isActive={active}
              imgSrc={imgSrc}
              delay={delay}
              onReserve={() => setTicketModalEventId(event._id)}
              onBookVIP={() => setVipModalEvent(event)} 
            />
          );
        })}
      </div>
    </div>
  );
}