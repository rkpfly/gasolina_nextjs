"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import FadeUp from "@/components/FadeUp";
import VipModal from "@/components/Events/VIPModal";
import JsonRenderer from "@/components/JSONRenderer";
import { fetchThemeDetailsAction } from "@/app/actions/themes";

export default function ThemePage() {
  const params = useParams();
  const themeSlug = params.slug as string;

  const [themeData, setThemeData] = useState<any | null>(null);
  const [themeEvents, setThemeEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // New state for handling the event selection and VIP modal
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [isVipFormOpen, setIsVipFormOpen] = useState(false);

  useEffect(() => {
    const slug = themeSlug || "dami-club";

    const loadPageData = async () => {
      setIsLoading(true);

      try {
        const [theme, eventsRes] = await Promise.all([
          fetchThemeDetailsAction(slug),
          fetch('/api/v1/events?limit=4').catch(() => null)
        ]);

        setThemeData(theme);

        if (eventsRes && eventsRes.ok) {
          const data = await eventsRes.json();
          const eventsArray = Array.isArray(data)
            ? data
            : (data.events || data.data || []);

          setThemeEvents(eventsArray);
        }
      } catch (error) {
        console.error("Failed to load theme page data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPageData();
  }, [themeSlug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-black text-white">
        <p className="font-bold tracking-[0.15em] uppercase text-sm">Loading Theme...</p>
      </div>
    );
  }

  if (!themeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-black text-white">
        <p className="font-bold tracking-[0.15em] uppercase text-sm">Theme Not Found</p>
      </div>
    );
  }

  // Derive the active event and its flyer based on user selection
  const selectedEvent = themeEvents.find(e => e._id === selectedEventId);
  const displayFlyer = selectedEvent?.media?.coverImage 
    ? `https://www.tixmojo.com/${selectedEvent.media.coverImage}`
    : themeEvents.length > 0 && themeEvents[0].media?.coverImage
      ? `https://www.tixmojo.com/${themeEvents[0].media.coverImage}`
      : themeData.hero_image;

  return (
    <div className="min-h-screen bg-brand-white pt-16 md:pt-24">
      {/* ── Theme Hero ── */}
      <section className="relative h-[60vh] md:h-[70vh] w-full flex flex-col justify-end">
        <div className="absolute inset-0 z-0">
          <img 
            src={themeData.hero_image} 
            alt={themeData.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/40 to-transparent" />
        </div>

        <FadeUp className="relative z-10 px-4 md:px-12 pb-12 max-w-[1600px] mx-auto w-full">
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-display font-extrabold tracking-tighter uppercase text-white mb-4">
            {themeData.title}
          </h1>
          <p className="text-white/80 max-w-2xl text-sm md:text-lg font-medium leading-relaxed">
            {themeData.short_description}
          </p>
        </FadeUp>
      </section>

      {/* ── Booking Section (Refactored) ── */}
      <section className="py-12 md:py-24 px-4 md:px-12 bg-brand-black text-white">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
          
          {/* Flyer Presentation */}
          <div className="relative aspect-[4/5] w-full max-w-md mx-auto md:mx-0 overflow-hidden rounded-sm shadow-2xl border border-white/10">
            <img 
              src={displayFlyer} 
              alt="Event Flyer" 
              className="object-cover w-full h-full transition-opacity duration-500"
            />
          </div>

          {/* Date Selection & Actions */}
          <div className="flex flex-col justify-center space-y-10">
            <div>
              <h2 className="text-3xl md:text-5xl font-display font-bold uppercase tracking-tighter mb-2">
                Secure Your Spot
              </h2>
              <p className="text-white/60 text-sm tracking-wide">Select an upcoming date to reserve tickets or request a VIP table.</p>
            </div>

            {themeEvents.length === 0 ? (
              <p className="text-white/50 tracking-widest text-sm uppercase p-4 border border-white/10 text-center">
                No upcoming events scheduled yet.
              </p>
            ) : (
              <div className="space-y-8">
                {/* Custom Styled Dropdown */}
                <div className="flex flex-col space-y-3">
                <label htmlFor="date-selector" className="text-xs font-bold tracking-[0.2em] uppercase text-white/50">
                    Select Date
                </label>
                <div className="relative">
                    <select
                    id="date-selector"
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="w-full bg-transparent border-b border-white/30 text-white py-4 pl-0 pr-8 focus:outline-none focus:border-white uppercase tracking-wider appearance-none cursor-pointer text-lg font-medium transition-colors"
                    >
                    <option value="" disabled className="bg-brand-black text-white/50">
                        Choose a date...
                    </option>
                    {themeEvents.map((event) => {
                        // Accessing date from basicInfo
                        const dateString = event.basicInfo?.date;
                        const formattedDate = dateString 
                        ? new Date(dateString).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                            })
                        : 'TBA';

                        return (
                        <option key={event._id} value={event._id} className="bg-brand-black text-white py-2">
                            {formattedDate}
                        </option>
                        );
                    })}
                    </select>
                    
                    {/* Custom Arrow */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    </div>
                </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  {/* Next.js Link needs pointer-events-none to actually disable clicks when wrapped */}
                  <Link 
                    href={selectedEventId ? `/events/${selectedEventId}` : "#"}
                    className={`block w-full text-center py-4 px-6 border border-white uppercase tracking-widest text-xs md:text-sm font-bold transition-all duration-300
                      ${!selectedEventId 
                        ? 'opacity-30 cursor-not-allowed pointer-events-none' 
                        : 'hover:bg-white hover:text-brand-black bg-transparent text-white'
                      }`}
                  >
                    Reserve Tickets
                  </Link>

                  <button
                    disabled={!selectedEventId}
                    onClick={() => setIsVipFormOpen(true)}
                    className={`w-full py-4 px-6 bg-white text-brand-black border border-white uppercase tracking-widest text-xs md:text-sm font-bold transition-all duration-300
                      ${!selectedEventId 
                        ? 'opacity-30 cursor-not-allowed' 
                        : 'hover:bg-transparent hover:text-white'
                      }`}
                  >
                    VIP Tables
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Theme Details & Content ── */}
      <section className="py-12 md:py-24 px-4 md:px-12 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-8">
            <h2 className="text-2xl md:text-4xl font-display font-bold uppercase tracking-tighter mb-6 border-b border-brand-border pb-4">
              The Experience
            </h2>
            <JsonRenderer content={themeData.description} tone="light" />
          </div>
        </div>
      </section>


      {/* VIP Form Modal */}
      {isVipFormOpen && selectedEvent && (
        <VipModal
          event={selectedEvent}
          onClose={() => setIsVipFormOpen(false)}
        />
      )}
    </div>
  );
}