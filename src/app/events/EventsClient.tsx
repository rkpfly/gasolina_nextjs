"use client";

import { useEffect, useState, useCallback } from 'react';
import type { Event, EventQueryParams, EventsApiResponse } from '@/types/events';
import { EventCard } from '@/components/Events/EventCard'; 
import VipModal from '@/components/Events/VIPModal';

// ---------------------------------------------------------------------------
// Hook: fetch events from our Next.js API route → ticketing backend
// ---------------------------------------------------------------------------
function useEvents(params: EventQueryParams) {
  const [events, setEvents] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams();
      (Object.entries(params) as [string, unknown][]).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.set(key, String(value));
        }
      });

      const res = await fetch(`/api/v1/events?${query.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error || `Request failed with status ${res.status}`);
      }

      const data: EventsApiResponse = await res.json();
      console.log("Fetched events data:", data);
      setEvents(data.data ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, total, totalPages, loading, error, refetch: fetchEvents };
}

// ---------------------------------------------------------------------------
// Helper: build a usable image URL from whatever the backend returns
// ---------------------------------------------------------------------------
function resolveImage(event: Event, fallbackIndex: number): string {
  const unsplashFallbacks = [
    '1541532713292-06987254f9f7',
    '1514525253361-bee8a19740c1',
    '1533174072545-7a4b6ad7a6c3',
    '1470225620780-dba8ba36b745',
    '1516450360452-9312f5e86fc7',
    '1504608524841-42fe6f032b4b',
    '1549213713-52caee0428d6',
    '1492684223066-81342ee5ff30',
  ];
  const img = event.media?.coverImage?.startsWith("http") ? event.media.coverImage : `https://147.79.70.30.nip.io:8444/${event.media?.coverImage}`;
  if (img) return img;
  const id = unsplashFallbacks[fallbackIndex % unsplashFallbacks.length];
  return `https://images.unsplash.com/photo-${id}?q=80&w=800&auto=format&fit=crop`;
}

// ---------------------------------------------------------------------------
// Ticket Modal
// ---------------------------------------------------------------------------
function TicketModal({ eventId, onClose }: { eventId: string; onClose: () => void }) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="Reserve Tickets"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div
        className="relative z-10 w-full max-w-3xl bg-brand-white rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        style={{ height: 'min(85vh, 720px)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border shrink-0">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-brand-black">
            Reserve Tickets
          </span>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-brand-gray hover:text-brand-black hover:bg-brand-offwhite transition-colors"
            aria-label="Close modal"
          >
            <i className="fa-solid fa-xmark text-base" />
          </button>
        </div>

        {/* iFrame */}
        <div className="flex-1 relative bg-brand-offwhite">
          {/* Spinner shown behind the iframe while it loads */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-brand-gray">
              <div className="w-8 h-8 border-2 border-brand-gray/30 border-t-brand-black rounded-full animate-spin" />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Loading</span>
            </div>
          </div>
          <iframe
            src={`https://147.79.70.30.nip.io:8444/events/frame/detail/${eventId}`}
            title="Reserve Tickets"
            className="relative z-10 w-full h-full border-0"
            allow="payment"
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-brand-border shrink-0 flex items-center gap-2">
          <i className="fa-solid fa-lock text-[10px] text-brand-gray" />
          <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-brand-gray">
            Secure checkout powered by Tixmojo
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

const CITY_TABS = ['All Cities', 'Melbourne', 'Sydney', 'Singapore', 'Brisbane', 'Auckland'];

export default function EventsClient() {
  // ---------------------------------------------------------------------------
  // UI state
  // ---------------------------------------------------------------------------
  const [activeTab, setActiveTab] = useState('All Cities');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [page, setPage] = useState(1);
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  // Modal state — null = closed, string = event ID to show
  const [ticketModalEventId, setTicketModalEventId] = useState<string | null>(null);
  // const [vipModalEventId, setVipModalEventId] = useState<string | null>(null);
  const [vipModalEvent, setVipModalEvent] = useState<any | null>(null);

  // ---------------------------------------------------------------------------
  // Query params
  // ---------------------------------------------------------------------------
  const queryParams: EventQueryParams = {
    page,
    limit: 12,
    sortBy: 'basicInfo.date',
    status: 'published',
    excludePast: 'true',
    upcoming: 'false',
    publicOnly: 'false',
    ...(activeTab !== 'All Cities' && { location: activeTab }),
  };

  const { events, totalPages, loading, error } = useEvents(queryParams);

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const revealTimer = setTimeout(() => setIsRevealed(true), 100);

    const fadeElements = document.querySelectorAll('.fade-up');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    fadeElements.forEach(el => observer.observe(el));

    return () => {
      clearTimeout(revealTimer);
      fadeElements.forEach(el => observer.unobserve(el));
    };
  }, [events]);

  useEffect(() => {
    // Don't start the interval until the slides have actually been fetched
    if (heroSlides.length === 0) return;

    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    
    // Add heroSlides.length as a dependency so it updates when data arrives
    return () => clearInterval(slideInterval);
  }, [heroSlides.length]);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        // Hit our new local proxy route
        const res = await fetch('/api/v1/events/hero');
        
        if (res.ok) {
          const data = await res.json();
          console.log("Fetched hero events data:", data);
          setHeroSlides(data);
        } else {
          console.error("Failed to load hero slides");
        }
      } catch (error) {
        console.error("Failed to fetch dynamic events:", error);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchUpcomingEvents();
  }, []);

  const goToSlide = (index: number) => setCurrentSlide(index);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  const isEventActive = (event: Event) => {
    const hasActiveStatus = event.status === 'published' || event.status === 'active';
    const hasValidPublishDate = !!event.publishedAt && !isNaN(Date.parse(event.publishedAt));
    return hasActiveStatus || hasValidPublishDate;
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <main className="w-full selection:bg-brand-black selection:text-white">

      {/* Ticket Modal — rendered at root level so it overlays everything */}
      {ticketModalEventId && (
        <TicketModal
          eventId={ticketModalEventId}
          onClose={() => setTicketModalEventId(null)}
        />
      )}

      {vipModalEvent && (
        <VipModal
          event={vipModalEvent}
          onClose={() => setVipModalEvent(null)}
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* HERO SLIDER SECTION                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative h-[85svh] min-h-[500px] md:min-h-[600px] w-full px-3 sm:px-6 md:px-12 pt-24 md:pt-28 pb-6 md:pb-12 flex flex-col">
        <div
          className={`relative w-full h-full rounded-[1.25rem] md:rounded-[2rem] overflow-hidden bg-brand-black shadow-2xl transition-[clip-path] duration-[1200ms] ease-custom ${
            isRevealed
              ? '[clip-path:polygon(0_0,_100%_0,_100%_100%,_0_100%)]'
              : '[clip-path:polygon(0_100%,_100%_100%,_100%_100%,_0_100%)]'
          }`}
        >
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ease-custom ${
                currentSlide === index ? 'opacity-100 visible z-10' : 'opacity-0 invisible z-0'
              }`}
            >
              <img
                src={slide.img}
                alt={slide.title1}
                className={`absolute inset-0 w-full h-full object-cover filter grayscale-[30%] opacity-80 transition-transform duration-[7000ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${
                  currentSlide === index ? 'scale-100' : 'scale-[1.15]'
                }`}
              />
              {/* Slightly stronger bottom gradient on mobile to ensure text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-black/95 via-brand-black/50 md:via-brand-black/40 to-transparent" />

              <div
                className={`absolute inset-0 flex flex-col justify-end pb-20 md:pb-24 px-5 sm:px-8 md:px-16 lg:px-24 z-20 transition-all duration-1000 ease-custom delay-200 ${
                  currentSlide === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'
                }`}
              > 
                {/* 1. Conditionally render the line break and title2 ONLY if title2 exists */}
                <h2 className="w-full break-words text-3xl sm:text-5xl md:text-7xl lg:text-[7vw] leading-[1] md:leading-[0.9] font-display font-extrabold uppercase tracking-tighter text-brand-white mb-6 md:mb-8">
                  {slide.title1}
                  {slide.title2 && (
                    <>
                      <br />
                      <span className="text-brand-accent text-transparent [-webkit-text-stroke:1px_#FFFFFF] break-words inline-block max-w-full">
                        {slide.title2}
                      </span>
                    </>
                  )}
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <button
                    className="group relative overflow-hidden inline-flex items-center justify-center px-6 py-3 md:px-10 md:py-4 rounded-full text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase w-fit bg-brand-white text-brand-black transition-colors duration-300"
                    onClick={() => setTicketModalEventId(slide.id)}
                  >
                    <span className="relative z-10">Get Tickets</span>
                    <span className="absolute inset-0 bg-brand-black translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300 ease-custom" />
                    <span className="absolute inset-0 flex items-center justify-center text-brand-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase">
                      Get Tickets
                    </span>
                  </button>
                  <div className="overflow-hidden">
                    <span className="inline-block text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-brand-black bg-brand-white px-3 md:px-4 py-1.5 md:py-2 rounded-full">
                      {slide.date}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Slider Controls */}
          <div className="absolute bottom-5 md:bottom-8 left-5 sm:left-8 md:left-16 lg:left-24 right-5 sm:right-8 md:right-16 lg:right-24 flex justify-between items-end z-30 pointer-events-none">
            <div className="flex space-x-2 pointer-events-auto pb-1.5 md:pb-2">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  className={`h-1.5 rounded-full cursor-pointer transition-all duration-500 ease-custom ${
                    currentSlide === i ? 'bg-white w-6 md:w-8' : 'bg-white/30 w-2 md:w-3'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
            
            {/* Slightly smaller buttons on mobile to save space */}
            <div className="flex gap-2 pointer-events-auto">
              <button onClick={prevSlide} className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-brand-black transition-all">
                <i className="fa-solid fa-arrow-left text-sm md:text-base" />
              </button>
              <button onClick={nextSlide} className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-brand-black transition-all">
                <i className="fa-solid fa-arrow-right text-sm md:text-base" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* EVENT GRID SECTION                                                */}
      {/* ------------------------------------------------------------------ */}
      <section id="event-grid" className="pt-12 pb-32 bg-brand-white px-6 md:px-12">
        <div className="max-w-[1600px] mx-auto">

          {/* Filters */}
          <div className="flex flex-col xl:flex-row justify-between items-start md:items-end mb-16 fade-up">
            <div className="mb-8 xl:mb-0">
              <p className="text-sm font-bold tracking-[0.2em] uppercase text-brand-gray mb-2">Discover</p>
              <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tighter uppercase text-brand-black">
                All Events
              </h2>
            </div>

            <div className="flex space-x-8 overflow-x-auto w-full xl:w-auto pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden text-[11px] font-bold tracking-[0.15em] uppercase text-brand-gray border-b border-brand-border">
              {CITY_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 whitespace-nowrap transition-colors hover:text-brand-black ${
                    activeTab === tab ? 'text-brand-black border-b-2 border-brand-black' : 'border-b-2 border-transparent'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col animate-pulse">
                  <div className="w-full aspect-[3/4] bg-brand-offwhite mb-6 rounded" />
                  <div className="h-6 bg-brand-offwhite rounded mb-2 w-3/4" />
                  <div className="h-4 bg-brand-offwhite rounded mb-1 w-1/2" />
                  <div className="h-4 bg-brand-offwhite rounded mb-4 w-1/3" />
                  <div className="h-10 bg-brand-offwhite rounded-full mt-auto" />
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="py-24 text-center fade-up">
              <p className="text-brand-gray text-sm font-bold tracking-[0.1em] uppercase mb-2">Something went wrong</p>
              <p className="text-brand-black text-lg font-display font-bold">{error}</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && events.length === 0 && (
            <div className="py-24 text-center fade-up">
              <p className="text-brand-gray text-sm font-bold tracking-[0.1em] uppercase mb-2">No events found</p>
              <p className="text-brand-black text-lg font-display font-bold">Check back soon for upcoming events.</p>
            </div>
          )}

          {/* Grid */}
          {!loading && !error && events.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
              {events.map((event, i) => {
                const active = isEventActive(event);
                const imgSrc = resolveImage(event, i);
                const animationDelays = ['0ms', '100ms', '200ms', '300ms'];
                const delay = animationDelays[i % animationDelays.length];

                return (
                  <EventCard
                    key={event._id}
                    event={event}
                    isActive={active}
                    imgSrc={imgSrc}
                    delay={delay}
                    onReserve={() => setTicketModalEventId(event._id)}
                    onBookVIP={() => setVipModalEvent(event)}
                  />
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="mt-24 text-center fade-up flex items-center justify-center gap-4">
              {page > 1 && (
                <button
                  onClick={() => setPage((p) => p - 1)}
                  className="relative inline-flex items-center justify-center px-8 py-4 rounded-full text-xs font-bold tracking-[0.15em] uppercase bg-transparent text-brand-black border border-brand-black hover:bg-brand-black hover:text-white transition-all duration-300"
                >
                  Previous
                </button>
              )}
              <span className="text-xs font-bold tracking-[0.1em] uppercase text-brand-gray">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="relative inline-flex items-center justify-center px-8 py-4 rounded-full text-xs font-bold tracking-[0.15em] uppercase bg-transparent text-brand-black border border-brand-black hover:bg-brand-black hover:text-white transition-all duration-300"
                >
                  Load More Events
                </button>
              )}
            </div>
          )}

        </div>
      </section>
    </main>
  );
}