"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import FadeUp from "@/components/FadeUp";
import { EventCard } from "@/components/Events/EventCard"; 
import { fetchThemeDetailsAction } from "@/app/actions/themes";

export default function ThemePage() {
  const params = useParams();
  const themeSlug = params.slug as string;

  const [themeData, setThemeData] = useState<any | null>(null);
  const [themeEvents, setThemeEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

      {/* ── Theme Details & Content ── */}
      <section className="py-12 md:py-24 px-4 md:px-12 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-8">
            <h2 className="text-2xl md:text-4xl font-display font-bold uppercase tracking-tighter mb-6 border-b border-brand-border pb-4">
              The Experience
            </h2>
            <p className="text-brand-gray leading-relaxed text-sm md:text-base font-medium whitespace-pre-line">
              {/* Handles line breaks stored in your detailed_content JSON correctly */}
              {themeData.description}
            </p>
          </div>
        </div>
      </section>

      {/* ── Upcoming Events For Theme ── */}
      <section className="py-12 md:py-24 px-4 md:px-12 bg-brand-black text-white">
        <div className="max-w-[1600px] mx-auto">
          <h2 className="text-2xl md:text-5xl font-display font-bold uppercase tracking-tighter mb-12">
            Upcoming Dates
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {themeEvents.length === 0 ? (
              <p className="col-span-full text-white/50 tracking-widest text-sm uppercase">No upcoming events scheduled yet.</p>
            ) : (
              themeEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  isActive={true}
                  imgSrc={`https://www.tixmojo.com/${event.media.coverImage}`}
                  delay={'0'} 
                  onReserve={() => console.log('Reserve', event._id)}
                  onBookVIP={() => console.log('VIP', event._id)}
                />
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}